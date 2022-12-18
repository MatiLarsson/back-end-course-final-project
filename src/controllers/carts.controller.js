import services from '../services/index.js'
import sendMail from '../utils/mailService.js'
import config from '../config/config.js'

const { cartsService, productsService } = services

const getProductsInCart = async (req, res, next) => {
  try {
    if (!req.session && (req.body.testCart != config.app.TEST_CART_ID)) return res.status(400).send({status: 'error', message: 'Unauthorized'})
    const cid = req.session?.user?.cart || req.body.testCart
    let cart = await cartsService.getCartById(cid)
    const cartoToPlainObject = JSON.parse(JSON.stringify(cart))
    const products = []
    cartoToPlainObject.products.forEach(p => {
      const code = p.code
      const quantity = p.quantity
      const obj = { code, quantity }
      products.push(obj)
    })
    if (products.length === 0) return res.send({status: 'success', message: `Cart with id: ${cid} is empty` })
    for (let i = 0; i < products.length; i++) {
      const productCode = products[i].code
      const productQuantity = products[i].quantity
      const product = JSON.parse(JSON.stringify(await productsService.getProductByCode(productCode)))
      product.quantity = productQuantity
      delete product.stock
      products[i] = product
    }
    cartoToPlainObject.products = products
    res.send({status: 'success', payload: cartoToPlainObject})
  } catch (error) {
    console.log(error)
    req.apiError = error
    next()
  }
}

const addProductToCart = async (req, res, next) => {
  try {
    if (!req.session) return res.status(400).send({status: 'error', message: 'Unauthorized'})
    const cid = req.session.user.cart
    const cart = JSON.parse(JSON.stringify(await cartsService.getCartById(cid)))
    if (!req.body.code || !req.body.quantity) return res.status(400).send({status: 'error', message: 'Product code and quantity are mandatory'})
    const code = req.body.code
    let quantity = req.body.quantity
    if (isNaN(quantity)) return res.status(400).send({status: 'error', message: 'Quantity must be a number'})
    if (quantity < 1) return res.status(400).send({status: 'error', message: 'Quantity must be a positive integer'})
    quantity = parseInt(quantity)
    const product = await productsService.getProductByCode(code)
    if (!product) return res.status(400).send({status: 'error', message: `Product with code: ${code} does not exist`})
    const isProductInCart = cart.products.find(p => (p.code == product.code))
    const productIndexInCart = cart.products.findIndex(p => (p.code == product.code))
    if (isProductInCart) {
      if (product.stock < cart.products[productIndexInCart].quantity + quantity) {
        return res.status(400).send({status: 'error', message: 'Not enough stock to keep adding this product in these quantities to cart'})
      }
    } else {
      if (product.stock < quantity) {
        return res.status(400).send({status: 'error', message: 'Not enough stock to add this product in these quantities to cart'})
      }
    }
    if (isProductInCart) {
      cart.products = cart.products.map(p => p.code == code ? {...p, quantity: p.quantity + quantity} : p)
    } else {
      cart.products.push({
        code: code,
        quantity: quantity
      })
    }
    const updatedCartId = await cartsService.updateCartById(cid, cart)
    if (!updatedCartId) return res.status(500).json({status: 'error', message: 'Error while updating cart' })
    res.send({status: 'success', message: `${quantity} ${product.name} succesfuly added to cart!`})
  } catch (error) {
    req.apiError = error
    next()
  }
}

const addOrSubstractOneUnit = async(req, res, next) => {
  try {
    if (!req.session) return res.status(400).send({status: 'error', message: 'Unauthorized'})
    const code = req.body.prodCode
    const sign = req.body.symbol
    const cid = req.session.user.cart
    const cart = await cartsService.getCartById(cid)
    const productIndexInCart = cart.products.findIndex((obj) => obj.code === code)
    const productInCart = cart.products[productIndexInCart]
    const product = await productsService.getProductByCode(code)
    if (sign == 'minus' && productInCart.quantity > 1) {
      cart.products = cart.products.map(p => p.code == code ? {...p, quantity: p.quantity - 1} : p)
      await cartsService.updateCartById(cid, cart)
      res.send({status: 'success', message: `Succesfully substracted a unit of product ${product.name} from cart`})
    }
    if (sign == 'minus' && productInCart.quantity == 1) {
     cart.products.splice(productIndexInCart, 1)
     await cartsService.updateCartById(cid, cart)
     res.send({status: 'success', message: `Succesfully deleted product ${product.name} from cart`})
    }
    if (sign == 'plus' && (product.stock > productInCart.quantity)) {
      cart.products = cart.products.map(p => p.code == code ? {...p, quantity: p.quantity + 1} : p)
      await cartsService.updateCartById(cid, cart)
      res.send({status: 'success', message: `Succesfully added a unit of product ${product.name} to cart`})
    }
    if (sign == 'plus' && (product.stock == productInCart.quantity)) {
      res.status(400).send({status: 'error', message: `Cannot keep on adding ${product.name} to cart, not enough stock.`})
    }
    res.send({status: 'error', message: 'Could not perform add/substract operation on quantity'})
  } catch (error) {
    req.apiError = error
    next()
  }
}

const deleteFromCartOrEmpty = async (req, res, next) => {
  try {
    if (!req.session) return res.status(400).send({status: 'error', message: 'Unauthorized'})
    const cid = req.session.user.cart
    const cart = await cartsService.getCartById(cid)
    const code = req.body.prodCode
    if (!code) {
      cart.products = []
      await cartsService.updateCartById(cid, cart)
      res.send({status: 'success', message: `Succesfully deleted all products from cart`})
    }
    const isInCart = cart.products.find(p => p.code == code)
    if (isInCart) {
      const productIndexInCart = cart.products.findIndex((obj) => obj.code == code)
      cart.products.splice(productIndexInCart, 1)
      await cartsService.updateCartById(cid, cart)
      const product = await productsService.getProductByCode(code)
      res.send({status: 'success', message: `Succesfully deleted all ${product.name} from cart`})
    }
    return res.status(500).send({status: 'error', message: `Product with code: ${code} not found in cart` })
  } catch (error) {
    req.apiError = error
    next()
  }
}

const confirmOrder = async(req, res, next) => {
  try {
    if (!req.session) return res.status(400).send({status: 'error', message: 'Unauthorized'})
    const cid = req.session.user.cart
    const cart = await cartsService.getCartById(cid)
    for(let i = 0; i < cart.products.length; i++) {
      const product = await productsService.getProductByCode(cart.products[i].code)
      if (cart.products[i].quantity > product.stock) {
        return res.status(400).send({status: 'error', message: `Not enough stock of product ${product.name}. Available units: ${product.stock}`})
      }
    }
    const order = []
    for (let i = 0; i < cart.products.length; i++) {
      const product = await productsService.getProductByCode(cart.products[i].code)
      order.push({name: product.name, code: cart.products[i].code, thumbnail: product.thumbnail, quantity: cart.products[i].quantity, price: product.price})
      product.stock -= cart.products[i].quantity
      await productsService.updateProductByCode(cart.products[i].code, product)
    }
    cart.products = []
    await cartsService.updateCartById(cid, cart)
    const io = req.app.get('socketio')
    io.emit('fetchProducts')
    const attachedImages = []
    let template = `
      <tr>
        <th>Item</th>
        <th>Code</th>
        <th></th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Subtotal</th>
      </tr>
    `
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    let total = 0
    for (let i = 0; i < order.length; i++) {
      const obj = {}
      obj.filename = `${order[i].name}.jpg`,
      obj.path = `./src/public/images/${order[i].thumbnail}`,
      obj.cid = `${order[i].name.split(" ").join("")}`
      attachedImages.push(obj)
      template += `
      <tr>
        <td>${order[i].name}</td>
        <td>${order[i].code}</td>
        <td><img style="width: 40px;" src="cid:${order[i].name.split(" ").join("")}"></td>
        <td>${order[i].quantity}</td>
        <td>${formatter.format(order[i].price)}</td>
        <td>${formatter.format(order[i].quantity * order[i].price)}</td>
      </tr>
      `
      total += order[i].price * order[i].quantity
    }
    await sendMail(
      'The Beer Store',
      req.session.user.email || 'larssonmts@gmail.com',
      'Order confirmation',
      `
        <div>
          <h2>Thanks ${req.session.user.name} for purchasing at The Beer Store!</h2>
          <p>Here is your order:</p>
          <div><table>${template}</table></div>
          <div><b>Total: ${formatter.format(total)}</b></div>
        </div>
      `,
      attachedImages
    )
    res.send({status: 'success', message: `Order confirmed`, })
  } catch (error) {
    req.apiError = error
    next()
  }
}

export default {
  getProductsInCart,
  addProductToCart,
  addOrSubstractOneUnit,
  deleteFromCartOrEmpty,
  confirmOrder
}
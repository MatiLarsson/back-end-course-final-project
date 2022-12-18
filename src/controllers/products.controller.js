import services from '../services/index.js'
import { ProductsDTONewInsert, ProductsDTOUpdateInsert } from '../dto/products.dto.js'

const { productsService } = services

const getProducts = async(req, res, next) => {
  try {
    const code = req.query.code
    if (code) {
      const product = await productsService.getProductByCode(code)
      if (!product) return res.status(400).send({status: 'error', message: 'Product not found in database'})
      return res.send(product)
    }
    const products = await productsService.getAllProducts()
    if (!products) return res.status(500).send({status: 'error', message: 'Error while getting products from database'})
    res.send(products)
  } catch (error) {
    req.apiError = error
    next()
  }
}

const saveNewProduct = async (req, res, next) => {
  try {
    let newProduct = req.body
    newProduct.thumbnail = req.file?.filename || 'test-image.png'
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.stock) return res.status(400).send({ status: 'error', error: 'Product name, price, description and stock are required' })
    if (!req.body.name || !req.body.description || !req.body.thumbnail || !req.body.price || !req.body.stock) return res.status(400).send({ message: 'Product name, description, code, thumbnail, price, and stock are required' })
    if (!Number(req.body.price) || !Number(req.body.stock)) return res.status(400).send({ status: error, message: 'Product price and stock must be numbers' })
    const existingProducts = await productsService.getAllProducts()
    if (existingProducts.find(p => p.name == req.body.name.trim())) {
      return res.status(400).send({ message: 'A product with such name already exists. Cannot save two products with the same name.' })
    }
    const formattedProduct = new ProductsDTONewInsert(req.body)
    const savedProductId = await productsService.saveProduct(formattedProduct)
    const savedProduct = await productsService.getProductById(savedProductId)
    const io = req.app.get('socketio')
    io.emit('fetchProducts')
    io.emit('newProduct')
    res.send({ status: 'success', message: `Product added with id: ${savedProductId}`, product: savedProduct })
  } catch (error) {
    req.apiError = error
    next()
  }
}

const updateProductByCode = async (req, res, next) => {
  try {
    const code = req.body.code
    if (!code) return res.status(400).send({ message: 'Product code is mandatory' })
    const product = await productsService.getProductByCode(code)
    if (!product) return res.status(400).send({ message: `Product with code: ${code} does not exist` })
    if (req.body.price) {
      if (!Number(req.body.price)) {
        return res.status(400).send({ message: 'Product price must be a number' })
      }
    }
    if (req.body.stock) {
      if (!Number(req.body.stock)) {
        return res.status(400).send({ message: 'Product stock must be a number' })
      }
    }
    const formattedProduct = new ProductsDTOUpdateInsert(req.body, product, req.file)
    const updatedProductCode = await productsService.updateProductByCode(code, formattedProduct)
    if (!updatedProductCode) return res.status(500).send({ status: 'error', message: `Error while updating product` })
    const io = req.app.get('socketio')
    io.emit('fetchProducts')
    io.emit('editedProduct')
    res.send({ status: 'success', message: `Product with Code: ${updatedProductCode} successfully updated`, product: formattedProduct })
  } catch (error) {
    req.apiError = error
    next()
  }
}

const deleteProductByCode = async (req, res, next) => {
  try {
    const code = req.query.code
    if (!code) return res.status(400).send({ status: "error", message: "Product's code is mandatory" })
    const product = await productsService.getProductByCode(code)
    if (!product) return res.status(400).send({ status: "error", message: `Product with code: ${code} does not exist` })
    const deleted = await productsService.deleteProductByCode(code)
    if (!deleted) return res.status(500).send({ status: "error", message: `There was an error while deleting the product with code: ${code}` })
    const io = req.app.get('socketio')
    io.emit('fetchProducts')
    io.emit('deletedProduct')
    res.send({ status: "success", message: `Product with code: ${code} successfully deleted` })
  } catch (error) {
    req.apiError = error
    next()
  }
}

const getProductByCode = async (req, res, next) => {
  try {
    const pid = req.params.pid
    if (!pid) return res.status(400).send({ message: 'Product id is mandatory' })
    const product = await productsService.getProductById(pid)
    if (!product) return res.status(400).send({ message: `Product with id: ${pid} does not exist` })
    res.send(product)
  } catch (error) {
    req.apiError = error
    next()
  }
}

export default {
  getProducts,
  saveNewProduct,
  updateProductByCode,
  deleteProductByCode,
  getProductByCode
}
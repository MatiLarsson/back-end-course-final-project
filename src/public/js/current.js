const socket = io({
  autoConnect:true
})

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

/* Orden de hacer fetch de productos */
socket.on('fetchProducts', () => {
  fetch('/api/products', {
    method: 'GET'
  })
  .then(res => res.json())
  .then(products => {
    let productListContainer = document.querySelector('#productListContainer')
    productListContainer.innerHTML = ""
    if (products.length) {
      products.forEach(product => {
        const card = `
          <div class="card d-flex flex-column align-items-center p-2">
            <img src="images/${product.thumbnail}" alt="product">
            <div class="d-flex flex-grow-1 flex-column justify-content-end w-100 m-2 align-items-center">
              <p class="text-center">${product.name}</p>
              <p class="text-center">${formatter.format(product.price)}</p>
              <p class="text-center">Stock: ${product.stock}</p>
              <p class="hidden-product-code">${product.code}</p>
              <div class="w-100 d-flex flex-wrap justify-content-center align-items-center mb-2">
                <label class="px-2" for="quantity">Quantity</label>
                <input min="1" max="${product.stock}" style="width:25%;" type="number" class="form-control px-2" id="quantity-${product.code}" value="1" name="quantity" required>
              </div>
              <div class="w-100 d-flex flex-row justify-content-between align-items-center">
                <button class="card-button add-button btn btn-primary btn-sm">Add to Cart</button>
                <button type="button" class="card-button detail-button btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#product-detail-modal">Product Details</button>
              </div>
            </div>
          </div>
        `
        productListContainer.innerHTML += card
      })
      document.querySelectorAll('.detail-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const code = e.target.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.innerText
          fetch('/api/products?' + new URLSearchParams({code}), {
            method: 'GET'
          })
          .then(res => res.json())
          .then(product => {
            document.getElementById('det-prod-img').src = `images/${product.thumbnail}`
            document.getElementById('det-prod-name').innerText = product.name
            document.getElementById('det-prod-desc').innerText = product.description
            document.getElementById('det-prod-price').innerText = `${formatter.format(product.price)}`
            document.getElementById('det-prod-stock').innerText = `Stock: ${product.stock}`
            document.getElementById('det-prod-code').innerText = `Product code: ${product.code}`
          })
        })
      })
      document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', (e) => {
          button.setAttribute("disabled", "")
          button.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`
          const code = e.target.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.innerText
          const quantity = document.querySelector(`#quantity-${code}`).value
          const order = {code, quantity}
          fetch(`/api/carts/products`, {
            method: 'POST',
            body: JSON.stringify(order),
            headers: {
              "Content-Type": "application/json"
            }
          })
          .then(res => res.json())
          .then(json => {
            button.removeAttribute("disabled")
            button.innerHTML = 'Add to Cart'
            updateCart()
            Swal.fire({
              icon: (json.status == 'error') ? 'error' : 'success',
              text: json.message,
              toast: true,
              position: "top-right",
              timer: 2000
            })
          })
        })
      })
    } else {
      productListContainer.innerHTML = '<h1>NO PRODUCTS FOUND</h1>'
    }
  })
})

const confirmOrderButton = document.getElementById('confirm-order-button')

confirmOrderButton.addEventListener('click', () => {
  confirmOrderButton.setAttribute("disabled", "")
  confirmOrderButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`
  fetch(`/api/carts/products/confirm`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(json => {
    confirmOrderButton.removeAttribute("disabled")
    confirmOrderButton.innerHTML = 'Confirm Order'
    if (json.status == 'success') {
      updateCart()
    }
    Swal.fire({
      icon: (json.status == 'error') ? 'error' : 'success',
      text: json.message,
      toast: true,
      position: "top-right",
      timer: 2000
    })
  })
})

const emptyCartButton = document.getElementById('empty-cart-button')

emptyCartButton.addEventListener('click', () => {
  emptyCartButton.setAttribute("disabled", "")
  emptyCartButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`
  fetch(`/api/carts/products`, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(json => {
    emptyCartButton.removeAttribute("disabled")
    emptyCartButton.innerHTML = "Empty Cart"
    if (json.status == 'success') {
      return updateCart()
    }
    Swal.fire({
      icon: 'error',
      text: json.message,
      toast: true,
      position: "top-right",
      timer: 2000
    })
  })
})

function updateCart() {
  fetch('/api/carts/products', {
    method: 'GET'
  })
  .then(res => res.json())
  .then(json => {
    const table = document.getElementById('cart-table')
    table.innerHTML = ''
    const cartTotal = document.getElementById('cart-total')
    cartTotal.innerHTML = ''
    if (!json.payload?.products) {
      table.innerHTML = `<h1>Cart is empty</h1>`
      confirmOrderButton.className = 'btn btn-warning d-none'
      emptyCartButton.className = 'btn btn-primary d-none'
      return
    }
    confirmOrderButton.className = 'btn btn-warning'
    emptyCartButton.className = 'btn btn-primary'
    table.innerHTML = `
      <tr>
        <th>Item</th>
        <th></th>
        <th>Unitary price</th>
        <th></th>
        <th>Quantity</th>
        <th></th>
        <th>Subtotal</th>
        <th></th>
      </tr>
    `
    json.payload.products.forEach(product => {
      table.innerHTML += `
      <tr>
        <td>${product.name}</td>
        <td class="cart-product-img-container d-flex justify-content-center align-items-center"><img class="cart-product-img" src="images/${product.thumbnail}"></td>
        <td>${formatter.format(product.price)}</td>
        <td class='quantity-control' id="minus-${product.code}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-square-fill" viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm2.5 7.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1z"/>
          </svg>
        </td>
        <td class='text-center'>
        ${product.quantity}
        </td>
        <td class='quantity-control' id="plus-${product.code}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square-fill" viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0z"/>
          </svg>
        </td>
        <td>${formatter.format(parseInt(product.price) * parseInt(product.quantity))}</td>
        <td class='trash' id="trash-${product.code}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
          </svg>
        </td>
      </tr>
      `
    })
    let total = 0
    json.payload.products.forEach(product => total += parseInt(product.price) * parseInt(product.quantity))
    cartTotal.innerHTML = `Cart Total: ${formatter.format(total)}`
    const signs = document.querySelectorAll('.quantity-control')
    signs.forEach(sign => {
      sign.addEventListener('click', () => {
        sign.setAttribute("disabled", "")
        sign.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`
        const prodCode = sign.id.split('-')[1]
        const symbol = sign.id.split('-')[0]
        const order = {prodCode, symbol}
        fetch(`/api/carts/products`, {
          method: 'PUT',
          body: JSON.stringify(order),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(res => res.json())
        .then(json => {
          sign.removeAttribute("disabled")
          sign.innerHTML = (symbol == 'plus')
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0z"/>
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash-square-fill" viewBox="0 0 16 16">
                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm2.5 7.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1z"/>
              </svg>`
          if (json.status == 'success') {
            updateCart()
          } else {
            Swal.fire({
              icon: 'error',
              text: json.message,
              toast: true,
              position: "top-right",
              timer: 2000
            })
          }
        })
      })
    })
    const trashIcons = document.querySelectorAll('.trash')
    trashIcons.forEach(bin => {
      bin.addEventListener('click', () => {
        bin.setAttribute("disabled", "")
        bin.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`
        const prodCode = bin.id.split('-')[1]
        const order = {prodCode}
        fetch(`/api/carts/products`, {
          method: 'DELETE',
          body: JSON.stringify(order),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(res => res.json())
        .then(json => {
          bin.removeAttribute("disabled")
          bin.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
                          </svg>`
          if (json.status == 'success') {
            return updateCart()
          }
          Swal.fire({
            icon: 'error',
            text: json.message,
            toast: true,
            position: "top-right",
            timer: 2000
          })
        })
      })
    })
  })
}

/* Orden de hacer fetch de carrito */
socket.on('fetchCart', () => {
  updateCart()
})
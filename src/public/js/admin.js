const socket = io({
  autoConnect:true
});

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})


/* Form para agregar un nuevo producto a la base de datos */

const newProductForm = document.getElementById('newProductForm');

newProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(newProductForm);
  fetch('/api/products', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === 'success') {
      Swal.fire({
        icon: 'success',
        text: "Product saved successfully",
        toast: true,
        position: "top-right",
        timer: 2000
      })
      newProductForm.reset()
    }
    if (res.status === 'error') {
      Swal.fire({
        icon: 'error',
        text: "Failed to save product",
        toast: true,
        position: "top-right",
        timer: 2000
      })
    }
  })
});

/* Form para editar un producto existente en la base de datos */

const updateProductForm = document.getElementById('updateProductForm');

updateProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(updateProductForm);
  fetch('/api/products', {
    method: 'PUT',
    body: formData
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === 'success') {
      Swal.fire({
        icon: 'success',
        text: "Product edited successfully",
        toast: true,
        position: "top-right",
        timer: 2000
      })
      updateProductForm.reset()
    }
    if (res.status === 'error') {
      Swal.fire({
        icon: 'error',
        text: "Failed to edit product",
        toast: true,
        position: "top-right",
        timer: 2000
      })
    }
  })
});

/* Listener del socket para actualizar lista de productos */

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
      productListContainer.innerHTML += '<h2 class="w-100 text-center">Current Products in Store</h2>'
      products.forEach(product => {
        const card = `
          <div class="card card-admin d-flex flex-column align-items-center p-2">
            <img src="images/${product.thumbnail}" alt="product">
            <div class="d-flex flex-grow-1 flex-column justify-content-end w-75 align-items-center">
              <p class="text-center">${product.name}</p>
              <p class="text-center">${product.description}</p>
              <p class="text-center">${formatter.format(product.price)}</p>
              <p class="text-center">Stock: ${product.stock}</p>
              <p class="text-center">Code: ${product.code}</p>
              <button class="btn btn-warning btn-sm w-75 remove">Remove</button>
            </div>
          </div>
        `
        productListContainer.innerHTML += card
      })
      document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', (e) => {
          const code = e.target.previousSibling.previousSibling.innerText.split(' ')[1]
          fetch('/api/products?' + new URLSearchParams({code}), {
            method: 'DELETE'
          })
          .then(res => res.json())
          .then(res => {
            if (res.status === 'success') {
              Swal.fire({
                icon: 'success',
                text: "Product removed successfully",
                toast: true,
                position: "top-right",
                timer: 2000
              })
            }
            if (res.status === 'error') {
              Swal.fire({
                icon: 'error',
                text: "Failed to remove product",
                toast: true,
                position: "top-right",
                timer: 2000
              })
            }
          })
        })
      })
    } else {
      productListContainer.innerHTML = '<h1>NO PRODUCTS FOUND</h1>'
    }
  })
})

/* Handler para los botones remove */



/* Informacion de que otro usuario ha agregado un nuevo producto */
socket.on('newProduct', () => {
  Swal.fire({
    icon: 'info',
    text: 'New product has been added',
    toast: true,
    position: "top-right",
    timer: 2000
  });
})

/* Informacion de que otro usuario ha editado un producto */
socket.on('editedProduct', () => {
  Swal.fire({
    icon: 'info',
    text: 'A product has just been edited',
    toast: true,
    position: "top-right",
    timer: 2000
  });
})

/* Informacion de que otro usuario ha elimminado un producto */
socket.on('deletedProduct', () => {
  Swal.fire({
    icon: 'info',
    text: 'A product has just been deleted',
    toast: true,
    position: "top-right",
    timer: 2000
  });
})

/* Listeners del socket para el chat */

/* Informacion de que un nuevo usuario esta en linea */
socket.on('newUser', (userId) => {
  if (email) {
    Swal.fire({
      text: 'User ' + userId + ' is online',
      toast: true,
      position: "top-right",
      timer: 2000
    });
  }
});

const chatBox = document.getElementById('chatBox');

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');
}

/* Event Listeners del chatBox */
chatBox.addEventListener('keyup',evt => {
  if (evt.key === "Enter") {
    if (chatBox.value.trim().length > 0) {
      socket.emit('message', {
        author: {
            email: email,
            first_name: firstName,
            last_name: lastName,
            age: age,
            alias: alias,
            avatar: avatarURL
        },
        message: chatBox.value,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      });
      chatBox.value = '';
    }
  }
});

/*Listeners del socket */
socket.on('log', (data) => {
  const author = new normalizr.schema.Entity('authors', {}, {idAttribute: "email"})
  const message = new normalizr.schema.Entity('messages', {
    author: author
  }, {idAttribute: "_id"})
  const chat = new normalizr.schema.Entity('chats', {
    chats: [message]
  })
  const denormalizedData = normalizr.denormalize(data.result, chat, data.entities)
  const chatsArray = denormalizedData.chats
  let log = document.getElementById('log');
  let messages = "";
  chatsArray?.forEach(entry => {
    const message = entry._doc
    const author = message.author
    const messageToAdd = (email == author.email)
    ? `<div class="border border-1 rounded border-primary bg-primary m-1 p-2 align-self-end" style="width: 200px;"><span><img style="border-radius: 50%; width: 30px; height: 30px; object-fit: contain; background-color: white" src='${author.avatar}' alt='user avatar'></span><br><span style="width: 200px;"><b>${author.alias}:</b> <i>${message.message}</i><br><small style="color: brown;">${message.date}</small><br><small style="color: brown;">${message.time}</small></span></div>`
    : `<div class="border border-1 rounded border-success bg-success m-1 p-2 align-self-start" style="width: 200px;"><span><img style="border-radius: 50%; width: 30px; height: 30px; object-fit: contain; background-color: white" src='${author.avatar}' alt='user avatar'></span><br><span style="width: 200px;"><b>${author.alias}:</b> <i>${message.message}</i><br><small style="color: brown;">${message.date}</small><br><small style="color: brown;">${message.time}</small></span></div>`;
    messages += messageToAdd;
  });
  log.innerHTML = messages;
})





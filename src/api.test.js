import Supertest from 'supertest'
import Chai from 'chai'
import { faker } from '@faker-js/faker'

const expect = Chai.expect
const requester = Supertest(`http://localhost:8080`)
const test = 'SuP3RC0d3RTe5TP@sSW0rD' // Test password to allow for admin route testing
const testCart = '6363f54e1371c83429c878a4' // Test cart from larssonmts@gmail.com account

describe('Sessions/Users api testing', () => {
  it('Register a user and create an empty cart for it', async() => {
    let user = {
      name: `${faker.name.fullName()}`,
      email: `${Math.ceil(Math.random() * 100)}${faker.internet.email()}`,
      address: `${faker.address.streetAddress()}`,
      age: '30',
      phone: `${faker.phone.number('+54935115#######')}`,
      password: '123',
      role: 'user',
      avatar: 'avatar1.jpg'
    }
    const response = await requester.post('/api/sessions/register').send(user)
    const {_body} = response
    expect(_body.payload).to.include.keys("name", "email", "address", "age", "phone", "password", "role", "avatar", "_id", "cart")
  })
  it('Login a user', async() => {
    const user = {
      email: 'larssonmts@gmail.com',
      password: '123',
    }
    const response = await requester.post('/api/sessions/login').send(user)
    expect(response.headers.location).to.be.oneOf(['/current', '/admin'])
  })
  it('Logout a user', async() => {
    const response = await requester.get('/api/sessions/logout')
    expect(response.headers.location).to.equal('/login')
  })
})

describe('Products api testing', () => {
  it('Get all products', async() => { // Pide todos los productos de la tienda
    const response = await requester.get('/api/products')
    const {_body} = response
    expect(_body).to.be.an('array')
  })
  let code = ''
  it('Save a product', async() => { // Crea un producto nuevo llamado Homer Simpson
    const product = {
      test: test,
      name: 'Homer Simpson',
      description: 'Bored Homer Simpson',
      price: '1',
      stock: '999'
    }
    const response = await requester.post('/api/products').send(product)
    const {_body} = response
    code = _body.product.code
    expect(_body.status).to.equal('success')
  })
  it('Update a product', async() => { // Le cambia el stock a Homer Simpson de 999 a 101
    const product = {
      test: test,
      code: code, // Codigo de Homer Simpson
      stock: '101'
    }
    const response = await requester.put('/api/products').send(product)
  })
  it('Get a product by code', async() => {
    const response = await requester.get(`/api/products?code=${code}`)
    const {_body} = response
    expect(_body).to.include.keys("_id", "timestamp", 'name', "description", "code", "thumbnail", "price", "stock")
  })
  it('Delete a product', async() => { // Borra el producto Homer Simpson
    const body = {
      test: test
    }
    const response = await requester.delete(`/api/products?code=${code}`).send(body)
    const {_body} = response
    expect(_body.status).to.equal('success')
  })
})

describe('Carts api testing', () => {
  it('Get products in cart', async() => {
    const body = {
      testCart: testCart
    }
    const response = await requester.get(`/api/carts/products`).send(body)
    const {_body} = response
    expect(_body.status).to.equal('success')
  })
//   it('Add products to cart', async() => {})
//   it('Add one more unit of a product already in cart', async() => {})
//   it('Substract one unit of a product already in cart', async() => {})
//   it('Delete a product from cart (all the units of the product)', async() => {})
//   it('Empty entire cart', async() => {})
//   it('Confirm an order', async() => {})
})



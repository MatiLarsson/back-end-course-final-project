import { createHash } from '../utils/bcrypt.js'

export class UsersDTOInsert {
  constructor(user, cartId) {
    this.name = user.name,
    this.email = user.email,
    this.password = createHash(user.password),
    this.role = user.role,
    this.address = user.address,
    this.age = user.age,
    this.phone = user.phone,
    this.avatar = user.avatar,
    this.cart = cartId
  }
}

export class UsersDTOInsertGithub {
  constructor(user, cartId) {
    this.name = user.name,
    this.email = user.email,
    this.password = '',
    this.role = 'user',
    this.cart = cartId
  }
}


export class UsersDTOPresenter {
  constructor(user) {
    this.name = user.name,
    this.email = user.email,
    this.role = user.role,
    this.avatar = `images/${user.avatar}`,
    this.cart = user.cart
  }
}

export class UsersDTOPresenterGithub {
  constructor(user) {
    this.name = user.name,
    this.email = user.email,
    this.role = user.role,
    this.avatar = 'images/github.svg',
    this.cart = user.cart
  }
}
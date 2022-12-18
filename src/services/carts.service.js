export default class CartsService {
  constructor(dao) {
    this.dao = dao
  }
  createCart = (cart) => {
    return this.dao.save(cart)
  }
  getCartById = (cartId) => {
    return this.dao.getById(cartId)
  }
  updateCartById = (cartId, cart) => {
    return this.dao.updateById(cartId, cart)
  }
}
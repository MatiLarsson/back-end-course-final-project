export default class ProductsService {
  constructor(dao) {
    this.dao = dao
  }
  getProductByCode = (code) => {
    return this.dao.getByCode(code)
  }
  getAllProducts = () => {
    return this.dao.getAll()
  }
  saveProduct = (product) => {
    return this.dao.save(product)
  }
  getProductById = (id) => {
    return this.dao.getById(id)
  }
  updateProductByCode = (code, updatedProduct) => {
    return this.dao.updateByCode(code, updatedProduct)
  }
  deleteProductByCode = (code) => {
    return this.dao.deleteByCode(code)
  }
}
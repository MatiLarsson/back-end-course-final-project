import services from '../services/index.js'

const { productsService } = services

const resolvers = {
  Query: {
    getAllProducts: async() => {
      try {
        const products = await productsService.getAllProducts()
        return products
      } catch (error) {
        return error
      }
    }
  }
}

export default resolvers
import productsModel from './models/products.model.js'
import config from '../config/config.js'
import mongoose from 'mongoose'

export default class ProductsDao {
  constructor() {
    mongoose.connect(`mongodb+srv://${config.mongo.USER}:${config.mongo.PWD}@cluster0.t6ufdcy.mongodb.net/${config.mongo.DATABASE}?retryWrites=true&w=majority`, error => {
      if (error) {
        console.log(error)
      } else {
        console.log('Atlas DB connected on Products Dao')
      }
    })
  }
  getByCode = async(code) => {
    let result = await productsModel.find({code: code})
    return result[0]
  }
  getAll = async() => {
    return await productsModel.find()
  }
  save = async(product) => {
    let result = await productsModel.create(product)
    return result._id
  }
  getById = async(id) => {
    let result = await productsModel.find({_id: id}).lean()
    return result[0]
  }
  updateByCode = async(code, updatedProduct) => {
    let result = await productsModel.replaceOne({'code': code}, updatedProduct)
    return code
  }
  deleteByCode = async(code) => {
    await productsModel.deleteOne({'code': code})
    return true
  }
}
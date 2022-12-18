import cartsModel from './models/carts.model.js'
import config from '../config/config.js'
import mongoose from 'mongoose'

export default class CartsDao {
  constructor() {
    mongoose.connect(`mongodb+srv://${config.mongo.USER}:${config.mongo.PWD}@cluster0.t6ufdcy.mongodb.net/${config.mongo.DATABASE}?retryWrites=true&w=majority`, error => {
      if (error) {
        console.log(error)
      } else {
        console.log('Atlas DB connected on Carts Dao')
      }
    })
  }
  getById = async(id) => {
    let result = await cartsModel.find({_id: id}).lean()
    return result[0]
  }
  updateById = async(id, cart) => {
    let result = await cartsModel.replaceOne({'_id': id}, cart)
    //  return cartsModel.findByIdAndUpdate(id, {$set: {cart}})
    return id
  }
  save = async(cart) => {
    let result = await cartsModel.create(cart)
    return result._id
  }
}
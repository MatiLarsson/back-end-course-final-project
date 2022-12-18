import mongoose from 'mongoose'

const collection = 'carts'

const cartsSchema = mongoose.Schema({
  timestamp: Number,
  products: []
}, {versionKey: false})


const cartsModel = mongoose.model(collection, cartsSchema)

export default cartsModel
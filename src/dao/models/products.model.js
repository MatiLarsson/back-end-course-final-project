import mongoose from 'mongoose'

const collection = 'products'

const productsSchema = mongoose.Schema({
  timestamp: Number,
  name: String,
  description: String,
  code: String,
  thumbnail: String,
  price: Number,
  stock: Number
}, {versionKey: false})

const productsModel = mongoose.model(collection, productsSchema)

export default productsModel
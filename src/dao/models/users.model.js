import mongoose from 'mongoose'

const collection = 'users'

const usersSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default:'user'
  },
  address: String,
  age: Number,
  phone: String,
  avatar: String,
  cart: String
  /*
  cart: {
    type: mongoose.SchemaType.ObjectId,
    ref: 'Carts'
  }
  */
}, {versionKey: false})

const usersModel = mongoose.model(collection, usersSchema)

export default usersModel
import mongoose from 'mongoose'
import MongoDBContainer from './MongoDBContainer.js.js'

const collection = 'chats'

const chatsSchema = new mongoose.Schema({
  author: {
      email: String,
      first_name: String,
      last_name: String,
      age: Number,
      alias: String,
      avatar: String
  },
  message: String,
  date: String,
  time: String
}, {versionKey: false})

const chatsModel = mongoose.model(collection, chatsSchema)

export default chatsModel
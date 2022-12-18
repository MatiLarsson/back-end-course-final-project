import chatsModel from './models/users.model.js'
import config from '../config/config.js'
import mongoose from 'mongoose'

export default class ChatsDao {
  constructor() {
    mongoose.connect(`mongodb+srv://${config.mongo.USER}:${config.mongo.PWD}@cluster0.t6ufdcy.mongodb.net/${config.mongo.DATABASE}?retryWrites=true&w=majority`, error => {
      if (error) {
        console.log(error)
      } else {
        console.log('Atlas DB connected on Chats Dao')
      }
    })
  }
  getAll = async() => {
    return await chatsModel.find()
  }
  save = async(chat) => {
    let result = await chatsModel.create(chat)
    return result._id
  }
}
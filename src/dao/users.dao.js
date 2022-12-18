import usersModel from './models/users.model.js'
import config from '../config/config.js'
import mongoose from 'mongoose'

export default class UsersDao {
  constructor() {
    mongoose.connect(`mongodb+srv://${config.mongo.USER}:${config.mongo.PWD}@cluster0.t6ufdcy.mongodb.net/${config.mongo.DATABASE}?retryWrites=true&w=majority`, error => {
      if (error) {
        console.log(error)
      } else {
        console.log('Atlas DB connected on Users Dao')
      }
    })
  }
  getById = async(id) => {
    let result = await usersModel.find({_id: id}).lean()
    return result[0]
  }
  getByEmail = async(email) => {
    return await usersModel.findOne({email: email})
  }
  save = async(user) => {
    return await usersModel.create(user)
  }
}
import config from './config.js'
import MongoStore from 'connect-mongo'

const sessionsConfig = {
  store: MongoStore.create({
    mongoUrl: `mongodb+srv://${config.mongo.USER}:${config.mongo.PWD}@cluster0.t6ufdcy.mongodb.net/${config.mongo.DATABASE}?retryWrites=true&w=majority`,
    ttl: 600 // ttl va en segundos
  }),
  secret: "C0derSessi0n3000",
  resave: false,
  saveUninitialized: false,
  Cookie: {
    maxAge: 600000 // va en milisegundos
  }
}

export default sessionsConfig
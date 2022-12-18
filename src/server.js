import express from 'express'
import handlebars from 'express-handlebars'
import __dirname from './__dirname.js'
import viewsRouter from './routes/views.router.js'
import sessionsRouter from './routes/sessions.router.js'
import productsRouter from './routes/products.router.js'
import cartsRouter from './routes/carts.router.js'
import session from 'express-session'
import initializePassport from './config/passport.config.js'
import passport from 'passport'
import { Server } from 'socket.io'
import { normalize, schema } from 'normalizr'
import services from "./services/index.js"
import compression from 'compression'
import { reqLogger, noRouteLogger } from './middlewares/logger.middleware.js'
import sessionsConfig from './config/sessions.config.js'
import config from './config/config.js'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUiExpress from 'swagger-ui-express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/typeDefs.js'
import resolvers from './graphql/resolvers.js'

const app = express()

const PORT = config.app.PORT
const server = app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
})

// Apollo server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
})
await apolloServer.start();
apolloServer.applyMiddleware({app})

// Swagger docs
const swaggerOptions = {
  definition:{
      openapi:'3.0.1',
      info: {
          title: "The Beer Store API",
          description: "🍺 Public & free API to democratize access to every happy developer around the world to the products available at The Beer Store"
      }
  },
  apis:[`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJsdoc(swaggerOptions);

// Schema definition for chat normalization:
const author = new schema.Entity('authors', {}, {idAttribute: "email"})
const message = new schema.Entity('messages', {
  author: author
}, {idAttribute: "_id"})
const chat = new schema.Entity('chats', {
  chats: [message]
})

const { chatsService } = services

// io server for websockets
const io = new Server(server)
app.set('socketio', io)
io.on('connection', async (socket) => {
  console.log('a user connected')
  socket.emit('fetchProducts')
  socket.emit('fetchCart')
  socket.emit('log', normalize({ id: 1, chats: await chatsService.getAllChats() }, chat))
  socket.broadcast.emit('newUser', socket.id)
  socket.on('message', async (message) => {
    await chatsService.saveChat(message) // Reemplazamos con el metodo de mongoose
    io.emit('log', normalize({ id: 1, chats: await chatsService.getAllChats() }, chat))
  })
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(express.static(__dirname + '/public'))
app.use(session(sessionsConfig))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine','handlebars');

app.use(reqLogger)

app.use('/', viewsRouter)
app.use('/apidocs',swaggerUiExpress.serve,swaggerUiExpress.setup(specs))
app.use('/api/sessions', sessionsRouter)
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.use(noRouteLogger)



/*

Pendientes:

=> implementar las vistas de fail para register y login. (Tiene mas que ver con como passport entrega los errores), al menos poner un sweet alert.
=> En la vista de carrito al clickear en enviar pedido disparar un watsapp:
    Será enviado una vez finalizada la elección para la realizar la compra de productos.
    El watsapp contendrá en su cuerpo la lista completa de productos a comprar y en el asunto la frase 'nuevo pedido de ' y el nombre y email del usuario que los solicitó.
    El usuario recibirá un mensaje de texto al número que haya registrado, indicando que su pedido ha sido recibido y se encuentra en proceso.
=> Habilitar el modo cluster para el servidor, como opcional a través de una constante global, y desde el front.
=> Arreglar el store chat en vista admin usando normalizr.
=> Implementar algun metodo de pago.
=> Implementar reestablecimiento de contrasenas con jwt vista en el after.
=> Desinstalar node y npm, instalar nvm, y mediante este ultimo reinstalar node en la version que estaba corriendo.

*/

/*

Recordatorios:

=> Para usar launch.json de la debug console:
    F5 para encender el server.
    Ctrl Shft F5 para refrescar el server.

*/
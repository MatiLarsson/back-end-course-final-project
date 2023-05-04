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

// io server for websockets
const io = new Server(server)
app.set('socketio', io)
io.on('connection', async (socket) => {
  console.log('a user connected')
  socket.emit('fetchProducts')
  socket.emit('fetchCart')
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

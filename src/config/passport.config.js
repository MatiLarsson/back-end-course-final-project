import passport from 'passport'
import local from 'passport-local'
import { isValidPassword } from '../utils/bcrypt.js'
import GithubStrategy from 'passport-github2'
import config from './config.js'
import services from '../services/index.js'
import { UsersDTOInsert, UsersDTOInsertGithub } from '../dto/users.dto.js'
import { CartsDTOInsert } from '../dto/carts.dto.js'

const { usersService, cartsService } = services

// Utilizamos passport para migrar toda la estructura de registro y login a un solo archivo.
const LocalStrategy = local.Strategy

const initializePassport = () => {
  passport.use('register', new LocalStrategy({passReqToCallback: true, usernameField: 'email'},
  async(req, email, password, done) => { // Si no especifiqué el usernameField, entonces dejo en lugar de 'email' a 'username'
    try {
      const {name, role, address, age, phone, avatar} = req.body
      if (!name || !email || !password || !address || !age || !phone || !avatar) return done(null, false, {message: 'incomplete form fields'})
      if (!Number(age)) return done(null, false, {message: 'age value must be a number'})
      // El usuario es mayor de edad?
      if (age < 18) return done(null, false, {message: 'user must be at least 18 years old to register'})
      // El usuario ya esta en la base de datos?
      const exists = await usersService.getUserByEmail(email) // Este es el campo unico que estoy solicitando.
      if (exists) return done(null, false, {message: 'user already exists'})
      // Creamos un cart vacío para el nuevo usuario
      const cart = new CartsDTOInsert()
      // Guardamos el cart vacío en nuestra base de datos
      const savedCartId = await cartsService.createCart(cart)
      if (!savedCartId) return done(null, false, {message: 'error while saving cart'})
      // Creamos el usuario y le asignamos su cart id
      const newUser = new UsersDTOInsert(req.body, savedCartId)
      // Una vez comprobado que el usuario no existe en nuestra base de datos lo insertamos
      await usersService.saveUser(newUser)
      let user = await usersService.getUserByEmail(email)
      return done(null, user)
    } catch (error) {
      done(error)
    }
  }))

  passport.use('login', new LocalStrategy({usernameField: 'email'}, async(email, password, done) => {
    try {
      if (!email || !password) return done(null, false, {message: 'incomplete login fields'})
      let user = await usersService.getUserByEmail(email)
      if (!user) return done(null, false, {message: 'incorrect credentials'})
      if (!isValidPassword(user, password)) return done(null, false, {message: 'incorrect password'})
      return done(null, user)
    } catch (error) {
      done(error)
    }
  }))

  passport.use('github', new GithubStrategy({
    clientID: config.github.CLIENT_ID,
    clientSecret: config.github.CLIENT_SECRET,
    callbackURL: `${config.app.DOMAIN}/api/sessions/githubcallback`
  }, async(accessToken, refreshToken, profile, done) => {
    // Extraer datos del profile
    const {name, email} = profile._json
    // Esiste en la base?
    let user = await usersService.getUserByEmail(email)
    if (!user) { // Debo crearlo
      // Creamos un cart vacío para el nuevo usuario
      const cart = new CartsDTOInsert()
      // Guardamos el cart vacío en nuestra base de datos
      const savedCartId = await cartsService.createCart(cart)
      if (!savedCartId) return done(null, false, {message: 'error while saving cart'})
      let newUser = new UsersDTOInsertGithub(req.body, savedCartId)
      let result = await usersService.saveUser(newUser)
      return done(null, result)
    } else { // Si entro a este else es porque si encontro al usuario
      return done(null, user)
    }
  }))

  passport.serializeUser((user, done) => { // La serializacion es convertirlo a un id para tener una referencia del usuario
    done(null, user._id)
  })

  passport.deserializeUser(async(id, done) => {
    let result = await usersService.getUserById(id)
    return done(null, result)
  })
}

export default initializePassport
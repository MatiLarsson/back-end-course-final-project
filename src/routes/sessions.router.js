import { Router } from 'express'
import passport from 'passport'
import sessionsController from '../controllers/sessions.controller.js'

const router = Router()

router.post('/register',
  passport.authenticate('register', {failureRedirect: '/api/sessions/registerfail'}),
  sessionsController.register
)

router.get('/registerfail', sessionsController.registerfail)

router.post('/login',
  passport.authenticate('login', {failureRedirect: '/api/sessions/loginfail'}),
  sessionsController.login
)

router.get('/loginfail',
  sessionsController.loginfail
)

router.get('/github',
  passport.authenticate('github', {scope: []})
)

router.get('/githubcallback',
  passport.authenticate('github'),
  sessionsController.githubCallback
)

router.get('/logout',
  sessionsController.logout
)

export default router
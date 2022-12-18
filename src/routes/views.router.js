import { Router } from 'express'
import viewsController from '../controllers/views.controller.js'

const router = Router()

router.get('/', viewsController.login)

router.get('/register', viewsController.register)

router.get('/login', viewsController.login)

router.get('/current', viewsController.current)

router.get('/admin', viewsController.admin)

export default router
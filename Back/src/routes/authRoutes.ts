import { Router } from 'express'
import { authController } from '../controllers/authController'

const routes = Router()

routes.post('/login', authController.login)

export default routes
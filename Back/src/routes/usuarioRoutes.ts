import { Router } from 'express'
import { usuarioController } from '../controllers/usuarioController'

const routes = Router()

routes.post('/', usuarioController.save)
routes.get('/', usuarioController.findAll)
routes.get('/:pk', usuarioController.findById)
routes.put('/:pk', usuarioController.update)
routes.delete('/:pk', usuarioController.delete)

export default routes
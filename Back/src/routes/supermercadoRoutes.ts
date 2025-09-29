import { Router } from 'express'
import { supermercadoController } from '../controllers/supermercadoController'

const routes = Router()

routes.post('/', supermercadoController.save)
routes.get('/', supermercadoController.findAll)
routes.get('/:pk', supermercadoController.findById)
routes.put('/:pk', supermercadoController.update)
routes.delete('/:pk', supermercadoController.delete)

export default routes
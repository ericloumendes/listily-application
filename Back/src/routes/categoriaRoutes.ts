import { Router } from 'express'
import { categoriaController } from '../controllers/categoriaController'

const routes = Router()

routes.post('/', categoriaController.save)
routes.get('/', categoriaController.findAll)
routes.get('/:pk', categoriaController.findById)
routes.put('/:pk', categoriaController.update)
routes.delete('/:pk', categoriaController.delete)

export default routes
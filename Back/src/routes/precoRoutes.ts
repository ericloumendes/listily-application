import { Router } from 'express'
import { precoController } from '../controllers/precoController'

const routes = Router()

routes.post('/', precoController.save)
routes.get('/', precoController.findAll)
routes.get('/:pk', precoController.findById)
routes.put('/:pk', precoController.update)
routes.delete('/:pk', precoController.delete)

export default routes
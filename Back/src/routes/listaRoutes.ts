import { Router } from 'express'
import { listaController } from '../controllers/listaController'

const routes = Router()

routes.post('/', listaController.save)
routes.get('/', listaController.findAll)
routes.get('/usuario/:usuario_pk', listaController.findByUsuario)
routes.get('/:pk', listaController.findById)
routes.put('/:pk', listaController.update)
routes.delete('/:pk', listaController.delete)

export default routes
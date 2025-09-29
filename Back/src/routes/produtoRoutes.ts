import { Router } from 'express'
import { produtoController } from '../controllers/produtoController'

const routes = Router()

routes.post('/', produtoController.save)
routes.get('/', produtoController.findAll)
routes.get('/:pk', produtoController.findById)
routes.put('/:pk', produtoController.update)
routes.delete('/:pk', produtoController.delete)
routes.post('/lista', produtoController.addToList)
routes.post('/lista/remover', produtoController.removeFromList)
routes.post('/codigo-barras', produtoController.findByCodigoBarras);

export default routes
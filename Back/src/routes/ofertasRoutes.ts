import { Router } from 'express'
import { ofertasController } from '../controllers/ofertasController'

const routes = Router()

routes.post('/', ofertasController.save)
routes.get('/', ofertasController.findAll)
routes.get('/:pk', ofertasController.findByProduto)



export default routes
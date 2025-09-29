import { Router } from 'express'
import usuarioRoutes from './usuarioRoutes'
import listaRoutes from './listaRoutes'
import produtoRoutes from './produtoRoutes'
import supermercadoRoutes from './supermercadoRoutes'
import precoRoutes from './precoRoutes'
import categoriaRoutes from './categoriaRoutes'
import authRoutes from './authRoutes'

const router = Router();

router.use('/usuario', usuarioRoutes)
router.use('/lista', listaRoutes)
router.use('/produto', produtoRoutes)
router.use('/supermercado', supermercadoRoutes)
router.use('/preco', precoRoutes)
router.use('/categoria', categoriaRoutes)
router.use('/auth', authRoutes)

export default router;
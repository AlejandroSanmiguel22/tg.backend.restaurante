import { Router } from 'express'
import { productController } from '../controllers/ProductController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

// Crear productos (solo admin)
router.post('/', requireAuth(['admin']), async (req, res) => productController.create(req, res))

// Obtener productos activos (admin y meseros)
router.get('/active', requireAuth(['admin', 'mesero']), async (req, res) => productController.findAllActive(req, res))

// Buscar productos por nombre (admin y meseros)
router.get('/search', requireAuth(['admin', 'mesero']), async (req, res) => productController.findByName(req, res))

// Obtener productos por categoría (admin y meseros)
router.get('/category/:categoryId', requireAuth(['admin', 'mesero']), async (req, res) => productController.findByCategoryId(req, res))

// Obtener todos los productos (admin y meseros)
router.get('/', requireAuth(['admin', 'mesero']), async (req, res) => productController.findAll(req, res))

// Obtener producto por ID (admin y meseros) - DEBE IR AL FINAL
router.get('/:id', requireAuth(['admin', 'mesero']), async (req, res) => productController.findById(req, res))

// Actualizar producto (solo admin)
router.put('/:id', requireAuth(['admin']), async (req, res) => productController.update(req, res))

// Eliminar producto (solo admin)
router.delete('/:id', requireAuth(['admin']), async (req, res) => productController.delete(req, res))

export default router

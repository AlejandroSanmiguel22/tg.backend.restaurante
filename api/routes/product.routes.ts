import { Router } from 'express'
import { productController } from '../controllers/ProductController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

// Crear productos (solo admin)
router.post('/', requireAuth(['admin']), async (req, res) => productController.create(req, res))

// Obtener productos activos
router.get('/active', async (req, res) => productController.findAllActive(req, res))

// Buscar productos por nombre
router.get('/search', async (req, res) => productController.findByName(req, res))

// Obtener productos por categoría
router.get('/category/:categoryId', async (req, res) => productController.findByCategoryId(req, res))

// Obtener todos los productos
router.get('/', async (req, res) => productController.findAll(req, res))

// Obtener producto por ID (DEBE IR AL FINAL)
router.get('/:id', async (req, res) => productController.findById(req, res))

// Actualizar producto (solo admin)
router.put('/:id', requireAuth(['admin']), async (req, res) => productController.update(req, res))

// Eliminar producto (solo admin)
router.delete('/:id', requireAuth(['admin']), async (req, res) => productController.delete(req, res))

export default router

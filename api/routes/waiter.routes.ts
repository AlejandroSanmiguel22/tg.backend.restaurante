import { Router } from 'express';
import { WaiterController } from '../controllers/WaiterController';
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

const waiterRepository = new WaiterRepositoryMongo();
const waiterController = new WaiterController(waiterRepository);

// Todas las operaciones de meseros solo pueden ser realizadas por admins
router.post('/', requireAuth(['admin']), waiterController.create.bind(waiterController));
router.get('/', requireAuth(['admin']), waiterController.findAll.bind(waiterController));
router.get('/:id', requireAuth(['admin']), waiterController.findById.bind(waiterController));
router.put('/:id', requireAuth(['admin']), waiterController.update.bind(waiterController));
router.delete('/:id', requireAuth(['admin']), waiterController.delete.bind(waiterController));

export default router; 
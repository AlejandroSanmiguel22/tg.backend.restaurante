import { Router } from 'express';
import { WaiterController } from '../controllers/WaiterController';
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo';
import { isAdmin } from '../middlewares/authMiddleware';

const router = Router();

const waiterRepository = new WaiterRepositoryMongo();
const waiterController = new WaiterController(waiterRepository);

router.post('/', isAdmin, waiterController.create.bind(waiterController));
router.get('/', isAdmin, waiterController.findAll.bind(waiterController));
router.get('/:id', isAdmin, waiterController.findById.bind(waiterController));
router.put('/:id', isAdmin, waiterController.update.bind(waiterController));
router.delete('/:id', isAdmin, waiterController.delete.bind(waiterController));

export default router; 
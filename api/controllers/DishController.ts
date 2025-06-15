import { Request, Response } from 'express'
import { DishRepositoryMongo } from '../../infrastructure/repositories/DishRepositoryMongo'
import { CategoryRepositoryMongo } from '../../infrastructure/repositories/CategoryRepositoryMongo'
import { CreateDishUseCase } from '../../domain/useCases/CreateDishUseCase'
import { CreateDishDTO } from '../../application/dtos/CreateDishDTO'

const dishRepo = new DishRepositoryMongo()
const categoryRepo = new CategoryRepositoryMongo()
const createDishUseCase = new CreateDishUseCase(dishRepo, categoryRepo)

export class DishController {
    
    static async create(req: Request, res: Response) {
        try {
            const data = req.body as CreateDishDTO
            const newDish = await createDishUseCase.execute(data)
            res.status(201).json(newDish)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findById(req: Request, res: Response) {
        try {
            const dishId = req.params.id
            const dish = await dishRepo.findById(dishId)
            if (!dish) {
                return res.status(404).json({ message: 'Dish not found' })
            }
            res.json(dish)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findAll(req: Request, res: Response) {
        try {
            const dishes = await dishRepo.findAll()
            res.json(dishes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async update(req: Request, res: Response) {
        try {
            const dishId = req.params.id
            const data = req.body as CreateDishDTO
            const existingDish = await dishRepo.findById(dishId)
            if (!existingDish) {
                return res.status(404).json({ message: 'Dish not found' })
            }
            const updatedDish = await dishRepo.update({ ...existingDish, ...data })
            res.json(updatedDish)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async delete(req: Request, res: Response) {
        try {
            const dishId = req.params.id
            await dishRepo.delete(dishId)
            res.status(204).send()
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findByCategoryId(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId
            const dishes = await dishRepo.findByCategoryId(categoryId)
            res.json(dishes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findActiveDishes(req: Request, res: Response) {
        try {
            const dishes = await dishRepo.findActiveDishes()
            res.json(dishes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findByName(req: Request, res: Response) {
        try {
            const name = req.query.name as string
            if (!name) {
                return res.status(400).json({ message: 'Name query parameter is required' })
            }
            const dish = await dishRepo.findByName(name)
            if (!dish) {
                return res.status(404).json({ message: 'Dish not found' })
            }
            res.json(dish)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findAllActive(req: Request, res: Response) {
        try {
            const dishes = await dishRepo.findActiveDishes()
            res.json(dishes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
}


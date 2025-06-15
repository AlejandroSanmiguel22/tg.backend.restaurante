import { Request, Response } from 'express'
import { CategoryRepositoryMongo } from '../../infrastructure/repositories/CategoryRepositoryMongo'

const categoryRepo = new CategoryRepositoryMongo()

export class CategoryController {
  static async findAll(req: Request, res: Response) {
    try {
      const categories = await categoryRepo.findAll()
      res.json(categories)
    } catch (error) {
      res.status(500).json({ message: (error as Error).message })
    }
  }
}

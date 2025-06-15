import { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import { Category } from '../../domain/entities/Category'
import { CategoryModel } from '../database/models/CategoryModel'

export class CategoryRepositoryMongo implements CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const doc = await CategoryModel.findById(id)
    if (!doc) return null

    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }
  }

  async findAll(): Promise<Category[]> {
    const docs = await CategoryModel.find()
    return docs.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }))
  }
}

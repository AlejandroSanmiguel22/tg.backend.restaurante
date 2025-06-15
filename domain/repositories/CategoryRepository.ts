import { Category } from '../entities/Category'

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>
  findAll(): Promise<Category[]>

}

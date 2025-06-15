import { CreateDishDTO } from '../../application/dtos/CreateDishDTO'
import { DishRepository } from '../repositories/DishRepository'
import { CategoryRepository } from '../repositories/CategoryRepository'
import { CloudinaryAdapter } from '../../infrastructure/adapters/CloudinaryAdapter'
import { Dish } from '../entities/Dish'

export class CreateDishUseCase {
  constructor(
    private readonly dishRepo: DishRepository,
    private readonly categoryRepo: CategoryRepository
  ) {}

  async execute(input: CreateDishDTO): Promise<Dish> {
    const { name, description, categoryId, variants, imageBase64 } = input

    const category = await this.categoryRepo.findById(categoryId)
    if (!category) {
      throw new Error('La categoría especificada no existe')
    }

    const imageUrl = await CloudinaryAdapter.uploadImage(imageBase64)

    const newDish = await this.dishRepo.create({
      name,
      description,
      imageUrl,
      categoryId,
      isActive: true,
      variants
    })

    return newDish
  }
}

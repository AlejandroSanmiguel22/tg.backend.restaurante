import { CreateproductDTO } from '../../application/dtos/ProductDTO'
import { productRepository } from '../repositories/ProductRepository'
import { CategoryRepository } from '../repositories/CategoryRepository'
import { CloudinaryAdapter } from '../../infrastructure/adapters/CloudinaryAdapter'
import { Product } from '../entities/Product'

export class CreateproductUseCase {
  constructor(
    private readonly productRepo: productRepository,
    private readonly categoryRepo: CategoryRepository
  ) {}

  async execute(input: CreateproductDTO): Promise<Product> {
    const { name, description, categoryId, imageBase64 } = input

    const category = await this.categoryRepo.findById(categoryId)
    if (!category) {
      throw new Error('La categoría especificada no existe')
    }

    const imageUrl = await CloudinaryAdapter.uploadImage(imageBase64)

    const newproduct = await this.productRepo.create({
      name,
      description,
      imageUrl,
      categoryId,
      isActive: true,
    })

    return newproduct
  }
}

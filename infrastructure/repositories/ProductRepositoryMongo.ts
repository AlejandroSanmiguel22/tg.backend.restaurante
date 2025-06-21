import { Product } from '../../domain/entities/Product'
import { productRepository } from '../../domain/repositories/ProductRepository'
import { productModel } from '../database/models/ProductModel'

export class productRepositoryMongo implements productRepository {
    async create(product: Omit<Product, 'id'>): Promise<Product> {
        const created = await productModel.create(product)
        return {
            id: created._id.toString(),
            name: created.name,
            description: created.description ?? '',
            imageUrl: created.imageUrl,
            categoryId: created.categoryId.toString(),
            price: created.price,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt
        }
    }

    async findById(id: string): Promise<Product | null> {
        const product = await productModel.findById(id)
        if (!product) return null
        return {
            id: product._id.toString(),
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl,
            categoryId: product.categoryId.toString(),
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }
    }
    async findAll(): Promise<Product[]> {
        const productes = await productModel.find()
        return productes.map(product => ({
            id: product._id.toString(),
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl,
            categoryId: product.categoryId.toString(),
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }))
    }
    async update(product: Product): Promise<Product> {
        const updated = await productModel.findByIdAndUpdate(
            product.id,
            {
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                categoryId: product.categoryId,
                price: product.price,
                isActive: product.isActive
            },
            { new: true }
        )
        if (!updated) throw new Error('product not found')
        return {
            id: updated._id.toString(),
            name: updated.name,
            description: updated.description ?? '',
            imageUrl: updated.imageUrl,
            categoryId: updated.categoryId.toString(),
            price: updated.price,
            isActive: updated.isActive,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        }
    }
    async delete(id: string): Promise<void> {
        const result = await productModel.findByIdAndDelete(id)
        if (!result) throw new Error('product not found')
    }
    async findByCategoryId(categoryId: string): Promise<Product[]> {
        const productes = await productModel.find({ categoryId })
        return productes.map(product => ({
            id: product._id.toString(),
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl ?? '',
            categoryId: product.categoryId.toString(),
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }))
    }
    async findActiveproductes(): Promise<Product[]> {
        const productes = await productModel.find({ isActive: true })
        return productes.map(product => ({
            id: product._id.toString(),
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl ?? '',
            categoryId: product.categoryId.toString(),
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }))
    }
    async findByName(name: string): Promise<Product | null> {
        const product = await productModel.findOne({ name: new RegExp(`^${name}$`, 'i') })
        if (!product) return null
        return {
            id: product._id.toString(),
            name: product.name,
            description: product.description ?? '',
            imageUrl: product.imageUrl ?? '',
            categoryId: product.categoryId.toString(),
            price: product.price,
            isActive: product.isActive,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt

        }
    }
}
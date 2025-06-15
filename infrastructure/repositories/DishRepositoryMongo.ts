import { Dish } from '../../domain/entities/Dish'
import { DishRepository } from '../../domain/repositories/DishRepository'
import { DishModel } from '../database/models/DishModel'

export class DishRepositoryMongo implements DishRepository {
    async create(dish: Omit<Dish, 'id'>): Promise<Dish> {
        const created = await DishModel.create(dish)
        return {
            id: created._id.toString(),
            name: created.name,
            description: created.description ?? '',
            imageUrl: created.imageUrl,
            categoryId: created.categoryId.toString(),
            isActive: created.isActive,
            variants: created.variants,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt
        }
    }

    async findById(id: string): Promise<Dish | null> {
        const dish = await DishModel.findById(id)
        if (!dish) return null
        return {
            id: dish._id.toString(),
            name: dish.name,
            description: dish.description ?? '',
            imageUrl: dish.imageUrl,
            categoryId: dish.categoryId.toString(),
            isActive: dish.isActive,
            variants: dish.variants,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt
        }
    }
    async findAll(): Promise<Dish[]> {
        const dishes = await DishModel.find()
        return dishes.map(dish => ({
            id: dish._id.toString(),
            name: dish.name,
            description: dish.description ?? '',
            imageUrl: dish.imageUrl,
            categoryId: dish.categoryId.toString(),
            isActive: dish.isActive,
            variants: dish.variants,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt
        }))
    }
    async update(dish: Dish): Promise<Dish> {
        const updated = await DishModel.findByIdAndUpdate(
            dish.id,
            {
                name: dish.name,
                description: dish.description,
                imageUrl: dish.imageUrl,
                categoryId: dish.categoryId,
                isActive: dish.isActive,
                variants: dish.variants
            },
            { new: true }
        )
        if (!updated) throw new Error('Dish not found')
        return {
            id: updated._id.toString(),
            name: updated.name,
            description: updated.description ?? '',
            imageUrl: updated.imageUrl,
            categoryId: updated.categoryId.toString(),
            isActive: updated.isActive,
            variants: updated.variants,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt
        }
    }
    async delete(id: string): Promise<void> {
        const result = await DishModel.findByIdAndDelete(id)
        if (!result) throw new Error('Dish not found')
    }
    async findByCategoryId(categoryId: string): Promise<Dish[]> {
        const dishes = await DishModel.find({ categoryId })
        return dishes.map(dish => ({
            id: dish._id.toString(),
            name: dish.name,
            description: dish.description ?? '',
            imageUrl: dish.imageUrl ?? '',
            categoryId: dish.categoryId.toString(),
            isActive: dish.isActive,
            variants: dish.variants,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt
        }))
    }
    async findActiveDishes(): Promise<Dish[]> {
        const dishes = await DishModel.find({ isActive: true })
        return dishes.map(dish => ({
            id: dish._id.toString(),
            name: dish.name,
            description: dish.description ?? '',
            imageUrl: dish.imageUrl ?? '',
            categoryId: dish.categoryId.toString(),
            isActive: dish.isActive,
            variants: dish.variants,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt
        }))
    }
    async findByName(name: string): Promise<Dish | null> {
        const dish = await DishModel.findOne({ name: new RegExp(`^${name}$`, 'i') })
        if (!dish) return null
        return {
            id: dish._id.toString(),
            name: dish.name,
            description: dish.description ?? '',
            imageUrl: dish.imageUrl ?? '',
            categoryId: dish.categoryId.toString(),
            isActive: dish.isActive,
            variants: dish.variants,
            createdAt: dish.createdAt,
            updatedAt: dish.updatedAt

        }
    }
}
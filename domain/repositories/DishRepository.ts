import { Dish } from '../entities/Dish'

export interface DishRepository {
    create(dish: Omit<Dish, 'id'>): Promise<Dish>
    findById(id: string): Promise<Dish | null>
    findAll(): Promise<Dish[]>
    update(dish: Dish): Promise<Dish>
    delete(id: string): Promise<void>
    findByCategoryId(categoryId: string): Promise<Dish[]>
    findActiveDishes(): Promise<Dish[]>
    findByName(name: string): Promise<Dish | null>
}

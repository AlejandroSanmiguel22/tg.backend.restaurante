import { product } from '../entities/product'

export interface productRepository {
    create(product: Omit<product, 'id'>): Promise<product>
    findById(id: string): Promise<product | null>
    findAll(): Promise<product[]>
    update(product: product): Promise<product>
    delete(id: string): Promise<void>
    findByCategoryId(categoryId: string): Promise<product[]>
    findActiveproductes(): Promise<product[]>
    findByName(name: string): Promise<product | null>
}

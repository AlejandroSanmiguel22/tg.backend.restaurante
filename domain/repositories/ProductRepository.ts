import { Product } from '../entities/Product'

export interface productRepository {
    create(product: Omit<Product, 'id'>): Promise<Product>
    findById(id: string): Promise<Product | null>
    findAll(): Promise<Product[]>
    update(product: Product): Promise<Product>
    delete(id: string): Promise<void>
    findByCategoryId(categoryId: string): Promise<Product[]>
    findActiveproductes(): Promise<Product[]>
    findByName(name: string): Promise<Product | null>
}

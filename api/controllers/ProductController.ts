import { Request, Response } from 'express'
import { productRepositoryMongo } from '../../infrastructure/repositories/ProductRepositoryMongo'
import { CategoryRepositoryMongo } from '../../infrastructure/repositories/CategoryRepositoryMongo'
import { CreateproductUseCase } from '../../domain/useCases/ProductUseCase'
import { CreateproductDTO } from '../../application/dtos/ProductDTO'
import { CloudinaryAdapter } from '../../infrastructure/adapters/CloudinaryAdapter'

const productRepo = new productRepositoryMongo()
const categoryRepo = new CategoryRepositoryMongo()
const createproductUseCase = new CreateproductUseCase(productRepo, categoryRepo)

export class productController {

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body as CreateproductDTO
            const newproduct = await createproductUseCase.execute(data)
            res.status(201).json(newproduct)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findById(req: Request, res: Response) : Promise<void> {
        try {
            const productId = req.params.id
            const product = await productRepo.findById(productId)
            if (!product) {
                res.status(404).json({ message: 'product not found' })
                return
            }
            res.json(product)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findAll(req: Request, res: Response) : Promise<void> {
        try {
            const productes = await productRepo.findAll()
            res.json(productes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async update(req: Request, res: Response) : Promise<void> {
        try {
            const productId = req.params.id
            const data = req.body as CreateproductDTO & { imageBase64?: string }
            const existingproduct = await productRepo.findById(productId)
            if (!existingproduct) {
                res.status(404).json({ message: 'product not found' })
                return
            }

            // Si se envía una nueva imagen en base64, subirla a Cloudinary
            let imageUrl = existingproduct.imageUrl
            if (data.imageBase64 && data.imageBase64.startsWith('data:image')) {
                imageUrl = await CloudinaryAdapter.uploadImage(data.imageBase64)
            }

            const updatedproduct = await productRepo.update({ 
                ...existingproduct, 
                ...data,
                imageUrl // Usar la nueva URL o mantener la existente
            })
            res.json(updatedproduct)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async delete(req: Request, res: Response) : Promise<void> {
        try {
            const productId = req.params.id
            await productRepo.delete(productId)
            res.status(204).send()
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findByCategoryId(req: Request, res: Response) {
        try {
            const categoryId = req.params.categoryId
            const productes = await productRepo.findByCategoryId(categoryId)
            res.json(productes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findByName(req: Request, res: Response): Promise<void> {

        try {
            const name = req.query.name as string
            if (!name) {
                res.status(400).json({ message: 'Name query parameter is required' })
                return
            }
            const product = await productRepo.findByName(name)
            if (!product) {
                res.status(404).json({ message: 'product not found' })
                return
            } else {
                res.json(product)
                return
            }

        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
    static async findAllActive(req: Request, res: Response): Promise<void> {
        try {
            const productes = await productRepo.findActiveproductes()
            res.json(productes)
        } catch (error) {
            res.status(400).json({ message: (error as Error).message })
        }
    }
}


import { Request, Response } from 'express'
import { UserRepositoryMongo } from '../../infrastructure/repositories/UserRepositoryMongo'
import { LoginUseCase } from '../../domain/useCases/LoginUseCase'

const userRepo = new UserRepositoryMongo()
const loginUseCase = new LoginUseCase(userRepo)

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { userName, password } = req.body
      console.log('Datos recibidos:', { userName, password })
      const token = await loginUseCase.execute({ userName, password })
      res.json({ token })
    } catch (error) {
      console.error('Error login:', error)
      res.status(401).json({ message: (error as Error).message })
    }
  }
}

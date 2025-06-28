import { Request, Response } from 'express'
import { UserRepositoryMongo } from '../../infrastructure/repositories/UserRepositoryMongo'
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo'
import { LoginUseCase } from '../../domain/useCases/LoginUseCase'

const userRepo = new UserRepositoryMongo()
const waiterRepo = new WaiterRepositoryMongo()
const loginUseCase = new LoginUseCase(userRepo, waiterRepo)

interface Table {
  id: string
  number: number
  status: 'libre' | 'atendida'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { userName, password } = req.body
      console.log('Datos recibidos:', { userName, password })
      
      const token = await loginUseCase.execute({ userName, password })
      
      // Obtener información del usuario para la respuesta
      let user = await userRepo.findByUserName(userName)
      let isWaiter = false
      
      // Si no está en User, buscar en Waiter
      if (!user) {
        const waiter = await waiterRepo.findByUserName(userName)
        if (waiter) {
          user = {
            id: waiter.id,
            userName: waiter.userName,
            password: waiter.password,
            role: 'mesero' as const,
            isActive: true,
            createdAt: waiter.createdAt,
            updatedAt: waiter.updatedAt
          }
          isWaiter = true
        }
      }
      
      res.json({ 
        token,
        user: {
          id: user?.id,
          userName: user?.userName,
          role: user?.role,
          isActive: user?.isActive,
          isWaiter
        },
        message: 'Login exitoso'
      })
    } catch (error) {
      console.error('Error login:', error)
      res.status(401).json({ message: (error as Error).message })
    }
  }

  // Endpoint para verificar el perfil del usuario autenticado
  static async profile(req: Request, res: Response): Promise<void> {
    try {
      // req.user debería estar disponible gracias al middleware requireAuth
      const user = req.user as any
      
      if (!user) {
        res.status(401).json({ message: 'Usuario no autenticado' })
        return
      }

      res.json({
        message: 'Perfil del usuario',
        user: {
          id: user.id,
          userName: user.userName,
          role: user.role,
          isWaiter: user.isWaiter || false
        }
      })
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}

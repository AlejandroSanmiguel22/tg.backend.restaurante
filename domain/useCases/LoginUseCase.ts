import { UserRepository } from '../repositories/UserRepository'
import { WaiterRepository } from '../repositories/WaiterRepository'
import { LoginDTO } from '../../application/dtos/LoginDTO'
import { BcryptAdapter } from '../../infrastructure/adapters/BcryptAdapter'
import { JwtAdapter } from '../../infrastructure/adapters/JwtAdapter'

export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly waiterRepo: WaiterRepository
  ) {}

  async execute(input: LoginDTO): Promise<string> {
    // Primero buscar en la tabla User
    let user = await this.userRepo.findByUserName(input.userName)
    let isWaiter = false

    // Si no se encuentra en User, buscar en Waiter
    if (!user) {
      const waiter = await this.waiterRepo.findByUserName(input.userName)
      if (waiter) {
        // Convertir Waiter a formato User para el login
        user = {
          id: waiter.id,
          userName: waiter.userName,
          password: waiter.password,
          role: 'mesero' as const,
          isActive: true, // Los meseros siempre están activos
          createdAt: waiter.createdAt,
          updatedAt: waiter.updatedAt
        }
        isWaiter = true
      }
    }

    if (!user) throw new Error('Usuario no encontrado')

    const valid = await BcryptAdapter.compare(input.password, user.password)
    if (!valid) throw new Error('Contraseña incorrecta')

    // Permitir login solo a admins y meseros
    if (user.role !== 'admin' && user.role !== 'mesero') {
      throw new Error('Acceso no autorizado. Solo administradores y meseros pueden acceder')
    }

    // Verificar que el usuario esté activo (solo para usuarios de la tabla User)
    if (!isWaiter && !user.isActive) {
      throw new Error('Usuario inactivo. Contacte al administrador')
    }

    const token = JwtAdapter.sign({ 
      id: user.id, 
      role: user.role,
      userName: user.userName,
      isWaiter // Agregar flag para identificar si es de la tabla Waiter
    })

    return token
  }
}

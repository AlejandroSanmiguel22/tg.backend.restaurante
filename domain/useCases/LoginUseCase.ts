import { UserRepository } from '../repositories/UserRepository'
import { LoginDTO } from '../../application/dtos/LoginDTO'
import { BcryptAdapter } from '../../infrastructure/adapters/BcryptAdapter'
import { JwtAdapter } from '../../infrastructure/adapters/JwtAdapter'

export class LoginUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: LoginDTO): Promise<string> {
    const user = await this.userRepo.findByUserName(input.userName)
    if (!user) throw new Error('Usuario no encontrado')

    const valid = await BcryptAdapter.compare(input.password, user.password)
    if (!valid) throw new Error('Contraseña incorrecta')

    if (user.role !== 'admin') throw new Error('Acceso no autorizado')

    const token = JwtAdapter.sign({ id: user.id, role: user.role })

    return token
  }
}

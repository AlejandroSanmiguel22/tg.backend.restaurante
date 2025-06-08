import { UserRepository } from '../../domain/repositories/UserRepository'
import { User } from '../../domain/entities/User'
import { UserModel } from '../database/models/UserModel'

export class UserRepositoryMongo implements UserRepository {
  async findByUserName(userName: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ userName })
    if (!userDoc) return null

    return {
      id: userDoc._id.toString(),
      userName: userDoc.userName,
      password: userDoc.password,
      role: userDoc.role,
      isActive: userDoc.isActive,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    }
  }
}

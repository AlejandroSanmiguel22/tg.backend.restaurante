import { User } from '../entities/User'

export interface UserRepository {
  findByUserName(userName: string): Promise<User | null>
}

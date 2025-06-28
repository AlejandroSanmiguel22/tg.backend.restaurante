import { compare, hash } from 'bcrypt'

export class BcryptAdapter {
  static async hash(text: string): Promise<string> {
    return hash(text, 10)
  }

  static async compare(text: string, hashed: string): Promise<boolean> {
    return compare(text, hashed)
  }
}

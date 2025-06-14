import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../application'

export class JwtAdapter {
  static sign(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
  }

  static verify(token: string): any {
    return jwt.verify(token, JWT_SECRET)
  }
}

import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../application'

export const signToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET)
}

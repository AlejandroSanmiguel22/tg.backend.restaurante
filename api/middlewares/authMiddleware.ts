import { Request, Response, NextFunction } from 'express'
import { JwtAdapter } from '../../infrastructure/adapters/JwtAdapter'

export const requireAuth = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ message: 'Token no proporcionado' })
      return
    }

    const token = authHeader.split(' ')[1]
    try {
      const payload = JwtAdapter.verify(token)
      if (roles.length > 0 && !roles.includes(payload.role)) {
        res.status(403).json({ message: 'Acceso no autorizado' })
        return
      }

      req.user = payload
      next()
    } catch (err) {
      res.status(401).json({ message: 'Token inválido o expirado' })
      return
    }
  }
}

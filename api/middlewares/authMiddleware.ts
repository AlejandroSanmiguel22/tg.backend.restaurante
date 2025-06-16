import { Request, Response, NextFunction } from 'express'
import { JwtAdapter } from '../../infrastructure/adapters/JwtAdapter'
import jwt from 'jsonwebtoken'

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

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        
        if (decoded.role !== 'admin') {
            res.status(403).json({ message: 'Access denied. Admin role required' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

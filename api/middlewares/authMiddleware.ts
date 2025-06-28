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
      
      // Verificar que el usuario tenga un rol válido
      if (!payload.role) {
        res.status(401).json({ message: 'Token inválido: rol no especificado' })
        return
      }

      // Si se especifican roles, verificar que el usuario tenga uno de ellos
      if (roles.length > 0 && !roles.includes(payload.role)) {
        res.status(403).json({ 
          message: `Acceso denegado. Roles permitidos: ${roles.join(', ')}. Tu rol: ${payload.role}` 
        })
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

// Middleware específico para admin (mantener compatibilidad)
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'Token no proporcionado' });
            return;
        }

        const decoded = JwtAdapter.verify(token);
        
        if (decoded.role !== 'admin') {
            res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware específico para meseros
export const isWaiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'Token no proporcionado' });
            return;
        }

        const decoded = JwtAdapter.verify(token);
        
        if (decoded.role !== 'mesero') {
            res.status(403).json({ message: 'Acceso denegado. Se requiere rol de mesero' });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

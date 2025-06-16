import { Express } from 'express'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import waiterRoutes from './routes/waiter.routes'

export const setupRoutes = (app: Express): void => {
  app.use('/api/auth', authRoutes)
  app.use('/api/productes', productRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/waiters', waiterRoutes)
}

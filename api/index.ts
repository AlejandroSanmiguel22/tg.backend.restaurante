import { Express } from 'express'
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'

export const setupRoutes = (app: Express): void => {
  app.use('/api/auth', authRoutes)
  app.use('/api/productes', productRoutes)
  app.use('/api/categories', categoryRoutes)
}

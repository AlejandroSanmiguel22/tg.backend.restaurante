import { Express } from 'express'
import authRoutes from './routes/authRoutes'
import dishRoutes from './routes/dishRoutes'
import categoryRoutes from './routes/categoryRoutes'

export const setupRoutes = (app: Express): void => {
  app.use('/api/auth', authRoutes)
  app.use('/api/dishes', dishRoutes)
  app.use('/api/categories', categoryRoutes)


}

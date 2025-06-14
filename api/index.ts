import { Express } from 'express'
import authRoutes from './routes/authRoutes'

export const setupRoutes = (app: Express): void => {
  app.use('/api/auth', authRoutes)
}

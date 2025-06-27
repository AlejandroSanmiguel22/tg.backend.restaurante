import { Express } from 'express'
import authRoutes from './routes/auth.routes'
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'
import waiterRoutes from './routes/waiter.routes'
import tableRoutes from './routes/table.routes'
import orderRoutes from './routes/order.routes'
import metricsRoutes from './routes/metrics.routes'

export const setupRoutes = (app: Express): void => {
  app.use('/api/auth', authRoutes)
  app.use('/api/productes', productRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/waiters', waiterRoutes)
  app.use('/api/tables', tableRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/metrics', metricsRoutes)
}

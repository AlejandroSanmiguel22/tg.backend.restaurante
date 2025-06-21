import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { connectDB } from './infrastructure/database/mongoConnection'
import { setupRoutes } from './api'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
console.log(`Puerto configurado: ${PORT}`)
// Middleware global
app.use(cors())
app.use(express.json())

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API Restaurante funcionando correctamente ')
})

// Rutas del proyecto (como /api/auth/login)
setupRoutes(app)

// Conexión a la base de datos y arranque del servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`)
    })
  })
  .catch((err: any) => {
    console.error('Error al conectar a MongoDB:', err)
  })

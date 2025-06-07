import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { connectToMongo } from './infrastructure/database/mongoConnection'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('API Restaurante funcionando correctamente')
})

connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
  })
}).catch((err: any) => {
  console.error('Error al conectar a MongoDB:', err)
})

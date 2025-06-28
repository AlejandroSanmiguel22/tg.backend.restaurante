import mongoose from 'mongoose'
import { WaiterModel } from './models/Waiter'
import { BcryptAdapter } from '../adapters/BcryptAdapter'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI
    if (!mongoURI) {
      throw new Error('Falta la variable MONGO_URI en el .env')
    }

    await mongoose.connect(mongoURI)
  console.log('Conectado a MongoDB Atlas')
    
    // Migrar contraseñas de meseros existentes
    await migrateWaiterPasswords()
  } catch (error) {
    console.error('Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

// Función para migrar contraseñas de meseros de texto plano a hash
async function migrateWaiterPasswords(): Promise<void> {
  try {
    // Buscar meseros con contraseñas sin hashear (que no empiecen con $2b$)
    const waitersWithPlainPasswords = await WaiterModel.find({
      password: { $not: /^\$2b\$/ }
    })

    if (waitersWithPlainPasswords.length > 0) {
      console.log(`Migrando ${waitersWithPlainPasswords.length} contraseñas de meseros...`)
      
      for (const waiter of waitersWithPlainPasswords) {
        const hashedPassword = await BcryptAdapter.hash(waiter.password)
        await WaiterModel.findByIdAndUpdate(waiter._id, {
          password: hashedPassword,
          updatedAt: new Date()
        })
      }
      
      console.log('Migración de contraseñas completada')
    }
  } catch (error) {
    console.error('Error en la migración de contraseñas:', error)
  }
}

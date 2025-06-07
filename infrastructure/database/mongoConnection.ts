import mongoose from 'mongoose'

export const connectToMongo = async (): Promise<void> => {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('Falta la variable MONGO_URI en el .env')

  await mongoose.connect(uri)
  console.log('Conectado a MongoDB Atlas')
}

export interface User {
  id: string
  userName: string
  password: string
  role: 'admin' | 'mesero' | 'cliente'
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

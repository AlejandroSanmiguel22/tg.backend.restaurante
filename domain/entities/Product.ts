export interface productVariant {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  categoryId: string
  price: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

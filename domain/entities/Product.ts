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
  isActive: boolean
  variants: productVariant[]
  createdAt?: Date
  updatedAt?: Date
}

export interface DishVariant {
  name: string
  price: number
}

export interface Dish {
  id: string
  name: string
  description: string
  imageUrl: string
  categoryId: string
  isActive: boolean
  variants: DishVariant[]
  createdAt?: Date
  updatedAt?: Date
}

export interface DishVariantInput {
  name: string
  price: number
}

export interface CreateDishDTO {
  name: string
  description: string
  categoryId: string
  variants: DishVariantInput[]
  imageBase64: string 
}

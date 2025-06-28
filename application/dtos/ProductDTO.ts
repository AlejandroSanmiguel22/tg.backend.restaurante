export interface productVariantInput {
  name: string
  price: number
}

export interface CreateproductDTO {
  name: string
  description: string
  categoryId: string
  price: number
  imageBase64: string 
}

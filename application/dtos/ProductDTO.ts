export interface productVariantInput {
  name: string
  price: number
}

export interface CreateproductDTO {
  name: string
  description: string
  categoryId: string
  variants: productVariantInput[]
  imageBase64: string 
}

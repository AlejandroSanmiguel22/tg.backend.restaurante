export interface CreateTableDTO {
  number: number
}

export interface UpdateTableDTO {
  number?: number
  status?: 'libre' | 'atendida'
  isActive?: boolean
}

export interface TableResponseDTO {
  id: string
  number: number
  status: 'libre' | 'atendida'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
} 
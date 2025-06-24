import { TableRepository } from '../repositories/TableRepository'
import { UpdateTableDTO } from '../../application/dtos/TableDTO'
import { Table, TableStatus } from '../entities/Table'

export class TableUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async findAll(): Promise<Table[]> {
    return await this.tableRepository.findActive()
  }

  async findById(id: string): Promise<Table | null> {
    return await this.tableRepository.findById(id)
  }

  async findByNumber(number: number): Promise<Table | null> {
    return await this.tableRepository.findByNumber(number)
  }

  async findByStatus(status: TableStatus): Promise<Table[]> {
    return await this.tableRepository.findByStatus(status)
  }

  async update(id: string, updateTableDTO: UpdateTableDTO): Promise<Table | null> {
    const existingTable = await this.tableRepository.findById(id)
    if (!existingTable) {
      throw new Error('Mesa no encontrada')
    }

    // Si se está actualizando el número, verificar que no exista
    if (updateTableDTO.number && updateTableDTO.number !== existingTable.number) {
      const tableWithNumber = await this.tableRepository.findByNumber(updateTableDTO.number)
      if (tableWithNumber) {
        throw new Error(`Ya existe una mesa con el número ${updateTableDTO.number}`)
      }
    }

    return await this.tableRepository.update(id, updateTableDTO)
  }

  async updateStatus(id: string, status: TableStatus): Promise<Table | null> {
    const existingTable = await this.tableRepository.findById(id)
    if (!existingTable) {
      throw new Error('Mesa no encontrada')
    }

    return await this.tableRepository.updateStatus(id, status)
  }

  async delete(id: string): Promise<boolean> {
    const existingTable = await this.tableRepository.findById(id)
    if (!existingTable) {
      throw new Error('Mesa no encontrada')
    }

    // Verificar que la mesa esté libre antes de eliminar
    if (existingTable.status === 'atendida') {
      throw new Error('No se puede eliminar una mesa que está siendo atendida')
    }

    return await this.tableRepository.delete(id)
  }

  async getAvailableTables(): Promise<Table[]> {
    return await this.tableRepository.findByStatus('libre')
  }

  async getOccupiedTables(): Promise<Table[]> {
    return await this.tableRepository.findByStatus('atendida')
  }
} 
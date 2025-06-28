import { Table, TableStatus } from '../../domain/entities/Table'
import { TableRepository } from '../../domain/repositories/TableRepository'
import { TableModel } from '../database/models/TableModel'

export class TableRepositoryMongo implements TableRepository {
  async create(table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table> {
    const newTable = new TableModel(table)
    const savedTable = await newTable.save()
    return this.mapToEntity(savedTable)
  }

  async findAll(): Promise<Table[]> {
    const tables = await TableModel.find().sort({ number: 1 })
    return tables.map(this.mapToEntity)
  }

  async findById(id: string): Promise<Table | null> {
    const table = await TableModel.findById(id)
    return table ? this.mapToEntity(table) : null
  }

  async findByNumber(number: number): Promise<Table | null> {
    const table = await TableModel.findOne({ number })
    return table ? this.mapToEntity(table) : null
  }

  async findByStatus(status: TableStatus): Promise<Table[]> {
    const tables = await TableModel.find({ status }).sort({ number: 1 })
    return tables.map(this.mapToEntity)
  }

  async findActive(): Promise<Table[]> {
    const tables = await TableModel.find({ isActive: true }).sort({ number: 1 })
    return tables.map(this.mapToEntity)
  }

  async update(id: string, table: Partial<Table>): Promise<Table | null> {
    const updatedTable = await TableModel.findByIdAndUpdate(
      id,
      { ...table, updatedAt: new Date() },
      { new: true }
    )
    return updatedTable ? this.mapToEntity(updatedTable) : null
  }

  async updateStatus(id: string, status: TableStatus): Promise<Table | null> {
    const updatedTable = await TableModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    )
    return updatedTable ? this.mapToEntity(updatedTable) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await TableModel.findByIdAndDelete(id)
    return !!result
  }

  async existsByNumber(number: number): Promise<boolean> {
    const table = await TableModel.findOne({ number })
    return !!table
  }

  private mapToEntity(table: any): Table {
    return {
      id: table._id.toString(),
      number: table.number,
      status: table.status,
      isActive: table.isActive,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt
    }
  }
} 
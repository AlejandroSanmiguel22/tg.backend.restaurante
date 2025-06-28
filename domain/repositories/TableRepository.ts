import { Table, TableStatus } from '../entities/Table'

export interface TableRepository {
  create(table: Omit<Table, 'id' | 'createdAt' | 'updatedAt'>): Promise<Table>
  findAll(): Promise<Table[]>
  findById(id: string): Promise<Table | null>
  findByNumber(number: number): Promise<Table | null>
  findByStatus(status: TableStatus): Promise<Table[]>
  findActive(): Promise<Table[]>
  update(id: string, table: Partial<Table>): Promise<Table | null>
  updateStatus(id: string, status: TableStatus): Promise<Table | null>
  delete(id: string): Promise<boolean>
  existsByNumber(number: number): Promise<boolean>
} 
import { Request, Response } from 'express'
import { TableUseCase } from '../../domain/useCases/TableUseCase'
import { TableRepository } from '../../domain/repositories/TableRepository'
import { UpdateTableDTO } from '../../application/dtos/TableDTO'

export class TableController {
  private tableUseCase: TableUseCase

  constructor(private readonly tableRepository: TableRepository) {
    this.tableUseCase = new TableUseCase(tableRepository)
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const tables = await this.tableUseCase.findAll()
      res.status(200).json({
        data: tables
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las mesas'
      })
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const table = await this.tableUseCase.findById(id)
      
      if (!table) {
        res.status(404).json({
          message: 'Mesa no encontrada'
        })
        return
      }

      res.status(200).json({
        data: table
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener la mesa'
      })
    }
  }

  async findByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { number } = req.params
      const table = await this.tableUseCase.findByNumber(parseInt(number))
      
      if (!table) {
        res.status(404).json({
          message: 'Mesa no encontrada'
        })
        return
      }

      res.status(200).json({
        data: table
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener la mesa'
      })
    }
  }

  async findByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params
      if (status !== 'libre' && status !== 'atendida') {
        res.status(400).json({
          message: 'Estado inválido. Debe ser "libre" o "atendida"'
        })
        return
      }

      const tables = await this.tableUseCase.findByStatus(status)
      res.status(200).json({
        data: tables
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las mesas'
      })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateTableDTO: UpdateTableDTO = req.body
      
      const updatedTable = await this.tableUseCase.update(id, updateTableDTO)
      
      if (!updatedTable) {
        res.status(404).json({
          message: 'Mesa no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Mesa actualizada correctamente',
        data: updatedTable
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar la mesa'
      })
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { status } = req.body
      
      if (status !== 'libre' && status !== 'atendida') {
        res.status(400).json({
          message: 'Estado inválido. Debe ser "libre" o "atendida"'
        })
        return
      }

      const updatedTable = await this.tableUseCase.updateStatus(id, status)
      
      if (!updatedTable) {
        res.status(404).json({
          message: 'Mesa no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Estado de mesa actualizado correctamente',
        data: updatedTable
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar el estado de la mesa'
      })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const success = await this.tableUseCase.delete(id)
      
      if (!success) {
        res.status(404).json({
          message: 'Mesa no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Mesa eliminada correctamente'
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar la mesa'
      })
    }
  }

  async getAvailableTables(req: Request, res: Response): Promise<void> {
    try {
      const tables = await this.tableUseCase.getAvailableTables()
      res.status(200).json({
        data: tables
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las mesas disponibles'
      })
    }
  }

  async getOccupiedTables(req: Request, res: Response): Promise<void> {
    try {
      const tables = await this.tableUseCase.getOccupiedTables()
      res.status(200).json({
        data: tables
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las mesas ocupadas'
      })
    }
  }
} 
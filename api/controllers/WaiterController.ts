import { Request, Response } from 'express';
import { WaiterUseCase } from '../../domain/useCases/WaiterUseCase';
import { WaiterRepository } from '../../domain/repositories/WaiterRepository';
import { WaiterDto } from '../../application/dtos/WaiterDto';

export class WaiterController {
    private createWaiterUseCase: WaiterUseCase;

    constructor(private readonly waiterRepository: WaiterRepository) {
        this.createWaiterUseCase = new WaiterUseCase(waiterRepository);
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const createWaiterDto: WaiterDto = req.body;
            const waiter = await this.createWaiterUseCase.execute(createWaiterDto);
            
            res.status(201).json({
                message: 'Mesero creado correctamente',
                data: {
                    ...waiter,
                    password: waiter.password 
                }
            });
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : 'Error al crear el mesero'
            });
        }
    }

    async findAll(req: Request, res: Response): Promise<void> {
        try {
            const waiters = await this.waiterRepository.findAll();
            res.status(200).json({
                data: waiters.map(waiter => ({
                    ...waiter
                }))
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener los meseros'
            });
        }
    }

    async findById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const waiter = await this.waiterRepository.findById(id);
            
            if (!waiter) {
                res.status(404).json({
                    message: 'Mesero no encontrado'
                });
                return;
            }

            res.status(200).json({
                data: {
                    ...waiter
                }
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener el mesero'
            });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedWaiter = await this.waiterRepository.update(id, updateData);
            
            if (!updatedWaiter) {
                res.status(404).json({
                    message: 'Mesero no encontrado'
                });
                return;
            }

            res.status(200).json({
                message: 'Mesero actualizado correctamente',
                data: {
                    ...updatedWaiter
                }
            });
        } catch (error) {
            res.status(400).json({
                message: error instanceof Error ? error.message : 'Error al actualizar el mesero'
            });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const success = await this.waiterRepository.delete(id);
            
            if (!success) {
                res.status(404).json({
                    message: 'Mesero no encontrado'
                });
                return;
            }

            res.status(200).json({
                message: 'Mesero eliminado correctamente'
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al eliminar el mesero'
            });
        }
    }
} 
import { Waiter } from '../../domain/entities/Waiter';
import { WaiterRepository } from '../../domain/repositories/WaiterRepository';
import { WaiterModel } from '../database/models/Waiter';

export class WaiterRepositoryMongo implements WaiterRepository {
    async create(waiter: Omit<Waiter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Waiter> {
        const newWaiter = new WaiterModel(waiter);
        const savedWaiter = await newWaiter.save();
        return this.mapToEntity(savedWaiter);
    }

    async findAll(): Promise<Waiter[]> {
        const waiters = await WaiterModel.find();
        return waiters.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Waiter | null> {
        const waiter = await WaiterModel.findById(id);
        return waiter ? this.mapToEntity(waiter) : null;
    }

    async update(id: string, waiter: Partial<Waiter>): Promise<Waiter | null> {
        const updatedWaiter = await WaiterModel.findByIdAndUpdate(
            id,
            { ...waiter, updatedAt: new Date() },
            { new: true }
        );
        return updatedWaiter ? this.mapToEntity(updatedWaiter) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await WaiterModel.findByIdAndDelete(id);
        return !!result;
    }

    async findByUserName(userName: string): Promise<Waiter | null> {
        const waiter = await WaiterModel.findOne({ userName });
        return waiter ? this.mapToEntity(waiter) : null;
    }

    async findByIdentificationNumber(identificationNumber: string): Promise<Waiter | null> {
        const waiter = await WaiterModel.findOne({ identificationNumber });
        return waiter ? this.mapToEntity(waiter) : null;
    }

    private mapToEntity(waiter: any): Waiter {
        return {
            id: waiter._id.toString(),
            firstName: waiter.firstName,
            lastName: waiter.lastName,
            identificationNumber: waiter.identificationNumber,
            phoneNumber: waiter.phoneNumber,
            userName: waiter.userName,
            password: waiter.password, // La contraseña se mantiene sin hashear
            createdAt: waiter.createdAt,
            updatedAt: waiter.updatedAt
        };
    }
}
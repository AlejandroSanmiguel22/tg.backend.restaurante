import { Waiter } from '../entities/Waiter';

export interface WaiterRepository {
    create(waiter: Omit<Waiter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Waiter>;
    findAll(): Promise<Waiter[]>;
    findById(id: string): Promise<Waiter | null>;
    update(id: string, waiter: Partial<Waiter>): Promise<Waiter | null>;
    delete(id: string): Promise<boolean>;
    findByUserName(userName: string): Promise<Waiter | null>;
    findByIdentificationNumber(identificationNumber: string): Promise<Waiter | null>;
} 
import { WaiterRepository } from '../repositories/WaiterRepository';
import { WaiterDto } from '../../application/dtos/WaiterDto';
import { Waiter } from '../entities/Waiter';
import { generateRandomPassword, generateUserName } from '../../application/utils/userUtils';

export class WaiterUseCase {
    constructor(private readonly waiterRepository: WaiterRepository) {}

    async execute(createWaiterDto: WaiterDto): Promise<Waiter> {
        const existingWaiter = await this.waiterRepository.findByIdentificationNumber(createWaiterDto.identificationNumber);
        if (existingWaiter) {
            throw new Error('Waiter with this identification number already exists');
        }

        const userName = generateUserName(createWaiterDto.firstName, createWaiterDto.lastName);
        const password = generateRandomPassword();

        const waiter: Omit<Waiter, 'id' | 'createdAt' | 'updatedAt'> = {
            ...createWaiterDto,
            userName,
            password
        };

        return await this.waiterRepository.create(waiter);
    }
} 
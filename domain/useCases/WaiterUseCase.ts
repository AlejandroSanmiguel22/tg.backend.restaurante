import { WaiterRepository } from '../repositories/WaiterRepository';
import { WaiterDto } from '../../application/dtos/WaiterDto';
import { Waiter } from '../entities/Waiter';
import { generateRandomPassword, generateUserName } from '../../application/utils/userUtils';
import { BcryptAdapter } from '../../infrastructure/adapters/BcryptAdapter';

export class WaiterUseCase {
    constructor(private readonly waiterRepository: WaiterRepository) {}

    async execute(createWaiterDto: WaiterDto): Promise<Waiter> {
        const existingWaiter = await this.waiterRepository.findByIdentificationNumber(createWaiterDto.identificationNumber);
        if (existingWaiter) {
            throw new Error('Ya existe un mesero con este número de identificación');
        }

        const userName = generateUserName(createWaiterDto.firstName, createWaiterDto.lastName);
        const plainPassword = generateRandomPassword();
        
        // Hashear la contraseña antes de guardarla
        const hashedPassword = await BcryptAdapter.hash(plainPassword);

        const waiter: Omit<Waiter, 'id' | 'createdAt' | 'updatedAt'> = {
            ...createWaiterDto,
            userName,
            password: hashedPassword
        };

        const savedWaiter = await this.waiterRepository.create(waiter);
        
        // Retornar el mesero con la contraseña en texto plano para que el admin la vea
        return {
            ...savedWaiter,
            password: plainPassword // Mostrar la contraseña original para que el admin la comunique al mesero
        };
    }
} 
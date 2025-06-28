export interface WaiterDto {
    firstName: string;
    lastName: string;
    identificationNumber: string;
    phoneNumber: string;
}

export interface WaiterResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    identificationNumber: string;
    phoneNumber: string;
    userName: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
} 
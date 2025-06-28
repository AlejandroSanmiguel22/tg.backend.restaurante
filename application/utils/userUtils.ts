export const generateUserName = (firstName: string, lastName: string): string => {
    const baseUserName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const randomNumber = Math.floor(Math.random() * 1000);
    return `${baseUserName}${randomNumber}`;
};

export const generateRandomPassword = (): string => {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}; 
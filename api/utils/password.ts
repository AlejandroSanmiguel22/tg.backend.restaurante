import bcrypt from 'bcrypt'

export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, 10)
}

export const comparePasswords = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash)
}

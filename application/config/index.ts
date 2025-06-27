export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

// Redis Configuration
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
export const REDIS_DB = parseInt(process.env.REDIS_DB || '0')

// Metrics Configuration
export const METRICS_CACHE_TTL = parseInt(process.env.METRICS_CACHE_TTL || '300') // 5 minutes
export const REAL_TIME_CACHE_TTL = parseInt(process.env.REAL_TIME_CACHE_TTL || '60') // 1 minute

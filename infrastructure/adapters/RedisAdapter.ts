import { createClient, RedisClientType } from 'redis'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } from '../../application/config'

export class RedisAdapter {
  private client: RedisClientType
  private static instance: RedisAdapter | null = null
  private static isInitializing = false

  private constructor() {
    console.log('Creando nueva instancia de RedisAdapter...')
    console.log(`Configuración Redis - Host: ${REDIS_HOST}, Port: ${REDIS_PORT}, DB: ${REDIS_DB}`)
    
    // Configuración básica de Redis
    const redisConfig: any = {
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      },
      database: REDIS_DB
    }

    // Solo agregar contraseña si está definida y no está vacía
    if (REDIS_PASSWORD && REDIS_PASSWORD.trim() !== '') {
      redisConfig.password = REDIS_PASSWORD
      console.log('Redis configurado con contraseña')
    } else {
      console.log('Redis configurado sin contraseña (modo desarrollo)')
    }

    console.log('Configuración final de Redis:', JSON.stringify(redisConfig, null, 2))

    this.client = createClient(redisConfig)

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
      // No lanzar error para evitar que se detenga la aplicación
    })

    this.client.on('connect', () => {
      console.log('Redis Client Connected')
    })

    this.client.on('ready', () => {
      console.log('Redis Client Ready')
    })

    this.client.on('end', () => {
      console.log('Redis Client Disconnected')
    })
  }

  public static getInstance(): RedisAdapter {
    if (RedisAdapter.isInitializing) {
      console.log('RedisAdapter ya se está inicializando...')
      while (RedisAdapter.isInitializing) {
        // Esperar a que termine la inicialización
      }
      return RedisAdapter.instance!
    }

    if (!RedisAdapter.instance) {
      console.log('Creando primera instancia de RedisAdapter...')
      RedisAdapter.isInitializing = true
      RedisAdapter.instance = new RedisAdapter()
      RedisAdapter.isInitializing = false
      console.log('Instancia de RedisAdapter creada exitosamente')
    } else {
      console.log('Reutilizando instancia existente de RedisAdapter')
    }
    
    return RedisAdapter.instance
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      console.log('Conectando a Redis...')
      try {
        await this.client.connect()
        console.log('Conexión a Redis establecida exitosamente')
      } catch (error) {
        console.error('Error conectando a Redis:', error)
        throw error
      }
    } else {
      console.log('Redis ya está conectado')
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect()
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.connect()
    if (ttl) {
      await this.client.setEx(key, ttl, value)
      console.log(`Cache SET: ${key} (TTL: ${ttl}s)`)
    } else {
      await this.client.set(key, value)
      console.log(`Cache SET: ${key} (sin TTL)`)
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect()
    const value = await this.client.get(key)
    if (value) {
      console.log(`Cache HIT: ${key}`)
    } else {
      console.log(`Cache MISS: ${key}`)
    }
    return value
  }

  async del(key: string): Promise<number> {
    await this.connect()
    const result = await this.client.del(key)
    if (result > 0) {
      console.log(`Cache DELETED: ${key}`)
    } else {
      console.log(`Cache NOT FOUND: ${key}`)
    }
    return result
  }

  async incr(key: string): Promise<number> {
    await this.connect()
    return await this.client.incr(key)
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    await this.connect()
    return await this.client.hSet(key, field, value)
  }

  async hget(key: string, field: string): Promise<string | null> {
    await this.connect()
    return await this.client.hGet(key, field)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    await this.connect()
    return await this.client.hGetAll(key)
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    await this.connect()
    return await this.client.zAdd(key, { score, value: member })
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    await this.connect()
    if (withScores) {
      const result = await this.client.zRangeWithScores(key, start, stop, { REV: true })
      return result.map(item => `${item.value}:${item.score}`)
    } else {
      return await this.client.zRange(key, start, stop, { REV: true })
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    await this.connect()
    const result = await this.client.expire(key, seconds)
    return result === 1
  }

  async exists(key: string): Promise<number> {
    await this.connect()
    return await this.client.exists(key)
  }
} 
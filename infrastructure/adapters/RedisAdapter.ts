import { createClient, RedisClientType } from 'redis'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } from '../../application/config'

export class RedisAdapter {
  private client: RedisClientType
  private static instance: RedisAdapter | null = null
  private static isInitializing = false

  private constructor() {
    console.log('Creando nueva instancia de RedisAdapter...')
    console.log(`Configuración Redis - Host: ${REDIS_HOST}, Port: ${REDIS_PORT}, DB: ${REDIS_DB}`)

    this.client = createClient({
      url: `redis://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
      database: REDIS_DB,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        tls: true,
        reconnectStrategy: () => 1000,
      },
    })

    this.client.on('error', (err) => {
      console.error('Redis error:', err)
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

    // Conexión automática al crear la instancia
    this.client.connect()
      .then(() => console.log('✅ Redis conectado correctamente desde constructor'))
      .catch((err) => console.error('❌ Error conectando a Redis:', err))
  }

  public static getInstance(): RedisAdapter {
    if (RedisAdapter.isInitializing) {
      while (RedisAdapter.isInitializing) {}
      return RedisAdapter.instance!
    }

    if (!RedisAdapter.instance) {
      RedisAdapter.isInitializing = true
      RedisAdapter.instance = new RedisAdapter()
      RedisAdapter.isInitializing = false
    }

    return RedisAdapter.instance
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect()
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key)
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key)
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key)
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hSet(key, field, value)
  }

  async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hGet(key, field)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hGetAll(key)
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zAdd(key, { score, value: member })
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    if (withScores) {
      const result = await this.client.zRangeWithScores(key, start, stop, { REV: true })
      return result.map(item => `${item.value}:${item.score}`)
    } else {
      return await this.client.zRange(key, start, stop, { REV: true })
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds)
    return result === 1
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key)
  }
}

import { createClient, RedisClientType } from 'redis'
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } from '../../application/config'

export class RedisAdapter {
  private client: RedisClientType
  private static instance: RedisAdapter

  private constructor() {
    this.client = createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT
      },
      password: REDIS_PASSWORD,
      database: REDIS_DB
    })

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    this.client.on('connect', () => {
      console.log('Redis Client Connected')
    })
  }

  public static getInstance(): RedisAdapter {
    if (!RedisAdapter.instance) {
      RedisAdapter.instance = new RedisAdapter()
    }
    return RedisAdapter.instance
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect()
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
      console.log(`🔴 Cache SET: ${key} (TTL: ${ttl}s)`)
    } else {
      await this.client.set(key, value)
      console.log(`🔴 Cache SET: ${key} (sin TTL)`)
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect()
    const value = await this.client.get(key)
    if (value) {
      console.log(`🟢 Cache HIT: ${key}`)
    } else {
      console.log(`🟡 Cache MISS: ${key}`)
    }
    return value
  }

  async del(key: string): Promise<number> {
    await this.connect()
    const result = await this.client.del(key)
    if (result > 0) {
      console.log(`🗑️ Cache DELETED: ${key}`)
    } else {
      console.log(`⚠️ Cache NOT FOUND: ${key}`)
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
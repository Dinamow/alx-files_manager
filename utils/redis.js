import { createClient } from "redis"

class RedisClient {
    constructor() {
        this.client = createClient();
        this.isClientConnected = true
        this.client.on('error', (error) => 
                {console.log('could not create redis client')
                this.isClientConnected = false
            })
        this.client.on('connect', () => {
            this.isClientConnected = true
        })
    }

    isAlive() {
        return this.isClientConnected
    }

    async get(key) {
        try {
            const value = new Promise((resolve, reject) => {
                this.client.get(key,  (error, val) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(val)
                    }
                })
            })

            return value
        } catch (error) {
            throw error
        }
    }

    async set(key, value, duration) {
        this.client.set(key, value, 'EX', duration, (error, reply) => {
            if (error) {
                console.error('Error: unable to set key to value')
            } 
            
        })
    }

    async del(key) {
        this.client.del(key, (error, reply) => {
            if (error) {
                console.error('Error: unable to delete value from key')
            } else {
                console.log('Success: value deleted from key')
            }
        })
    }

}

const redisClient = new RedisClient()
export { redisClient }
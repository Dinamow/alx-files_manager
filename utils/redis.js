import { createClient } from 'redis';

/**
 * Interaction with the redis db
 */
class RedisClient {
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (error) => {
      console.log('could not create redis client', error);
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  /**
     *
     * @returns Boolean - true or false
     */
  isAlive() {
    return this.isClientConnected;
  }

  /**
     *
     * @param {*} key - the key argument to which value will be retrived
     * @returns
     */
  async get(key) {
    const value = new Promise((resolve, reject) => {
      this.client.get(key, (error, val) => {
        if (error) {
          reject(error);
        } else {
          resolve(val);
        }
      });
    });

    return value;
  }

  /**
     *
     * @param {key to set the value} key
     * @param {value in which key will be set to} value
     * @param {expiration of the key} duration
     */
  async set(key, value, duration) {
    this.client.set(key, value, 'EX', duration, (error, reply) => {
      if (error) {
        console.error('Error: unable to set key to value', reply);
      }
      console.log('set was successful');
    });
  }

  /**
     *
     * @param {key which value will be deleted} key
     */
  async del(key) {
    this.client.del(key, (error, reply) => {
      if (error) {
        console.error('Error: unable to delete value from key');
      } else {
        console.log('Success: value deleted from key', reply);
      }
    });
  }
}

export const redisClient = new RedisClient();
export default redisClient;

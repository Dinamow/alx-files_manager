import mongodb from 'mongodb';
import { ObjectId } from 'mongodb';


/**
 * Represents a database client for connecting to MongoDB.
 */
class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || '127.0.0.1';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new mongodb.MongoClient(this.url, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
 * Checks if the database connection is alive.
 * @returns {boolean} Returns true if the database connection is alive, otherwise false.
 */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<Number>}
   */
  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<Number>}
   */
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    return this.client.db().collection('users');
  }

  async getUserByEmail(email) {
    try {
      if (email) {
        return this.client.db().collection('users').findOne({ email });
      } 
    } catch (error) {
      console.error('Error while getting user');
      throw error;
    }
  }
  async getUserById(id) {
    try{
      const objectId = new ObjectId(id);
      return this.client.db().collection('users').findOne({ _id: objectId })
    } catch(error) {
      console.log(error)
    }
  }
}

export const dbClient = new DBClient();
export default dbClient;

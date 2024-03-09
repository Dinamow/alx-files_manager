import mongodb from 'mongodb';

/**
 * Represents a database client for connecting to MongoDB.
 */
class DBClient {
/**
 * Represents a database connection.
 * @constructor
 */
  constructor () {
    this.host = process.env.DB_HOST || 'localhost';
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
  isAlive () {
    return this.client.isConnected();
  }

  /**
   * Retrieves the number of users in the database.
   * @returns {Promise<Number>}
   */
  async nbUsers () {
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Retrieves the number of files in the database.
   * @returns {Promise<Number>}
   */
  async nbFiles () {
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection () {
    return this.client.db().collection('users');
  }
}

module.exports = DBClient;

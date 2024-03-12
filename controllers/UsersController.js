import { createHash } from 'crypto';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import { redisClient } from '../utils/redis';

// import { parseConnectionString } from "mongodb/lib/core";
// import sha1 from 'sha1';

const userQueue = new Queue('email sending');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body || {};

    // check if email and password are present
    console.log(req.body);
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    try {
      // check if email already exists
      const user = await (await dbClient.usersCollection()).findOne({ email });
      if (user) {
        res.status(400).json({ error: 'Already exist'})
        return
      }

      const sha1Password = createHash('sha1').update(password).digest('hex');

      const insertionInfo = await (await dbClient.usersCollection()).insertOne({
        email,
        password: sha1Password,
      });

      const userId = insertionInfo.insertedId.toString();
      userQueue.add(userId);
      res.status(201).json({id: userId, email });
    } catch (error) {
      console.error('Error creating user', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  static async getMe(req, res) {
    try {
        const token = req.headers['x-token'];
        console.log(token)
        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const userId = await redisClient.get(`auth_${token}`);
        console.log(userId)
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await dbClient.getUserById(userId);
        console.log(user)
        if (!user || !user._id) {

            res.status(401).json({ error: `Unauthorized` });
            return;
        }

        res.status(200).json({ id: user._id, email: user.email });
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
}

export default UsersController;

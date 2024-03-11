import { createHash } from 'crypto';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
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
        res.status(400).json({ error: 'Already exists'})
        return
      }

      const sha1Password = createHash('sha1').update(password).digest('hex');

      const insertionInfo = await (await dbClient.usersCollection()).insertOne({
        email,
        password: sha1Password,
      });

      const userId = insertionInfo.insertedId.toString();
      userQueue.add(userId);
      res.status(201).json({ email, id: userId });
    } catch (error) {
      console.error('Error creating user', error);
      res.status(500).json({ error: 'internal server error' });
    }
  }
}

export default UsersController;

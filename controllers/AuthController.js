import { getAuthHeader, decodeBase64 } from "../utils/utils";
import { v4 as uuidv4 } from 'uuid';
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import { createHash } from 'crypto';


class AuthController {
    static async getConnect(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Basic ')) {
                console.log('failure on auth header')
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const credentials = decodeBase64(authHeader.replace('Basic ', ''));
            if (!credentials || !credentials.includes(':')) {
                return res.status(401).json({ error: 'Invalid credentials format' });
            }

            const [email, password] = credentials.split(':');
            const user = await dbClient.getUserByEmail(email);

            if (!user || user.password !== createHash('sha1').update(password).digest('hex')) {
                console.log('failed to authenticate')
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = uuidv4();
            const key = `auth_${token}`;

            try {
                await redisClient.set(key, user._id.toString(), 24 * 60 * 60);
                console.log('after saving to redis')
                res.status(200).json({ token } );
                return
            } catch(error) {
                console.log(error)
                console.error(error)

            }
        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }


    static async getDisconnect(req, res) {


        try {
            const token = req.headers['x-token']
            console.log(token)
            if (!token) {
                console.log('token not found')
                res.status(401).json({ error: 'Unauthorized' })
                return
            }
            const userId = await redisClient.get(`auth_${token}`);

            if (!userId) {
                console.log('user not found')
                res.status(400).json({ error: 'Unauthorized'})
                return;
            }
            redisClient.del(`auth_${token}`)
            console.log('User signed out successfully');
            return res.status(204).json({ message: 'User signed out successfully' });
            
        } catch(error) {
            console.log(error)
        }
    }
}

export default AuthController;
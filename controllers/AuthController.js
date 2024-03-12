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
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const credentials = decodeBase64(authHeader.replace('Basic ', ''));
            if (!credentials || !credentials.includes(':')) {
                return res.status(401).json({ error: 'Invalid credentials format' });
            }

            const [email, password] = credentials.split(':');
            const user = await dbClient.getUserByEmail(email);

            if (!user || user.password !== createHash('sha1').update(password).digest('hex')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = uuidv4();
            const key = `auth_${token}`;

            try {
                await redisClient.set(key, user._id.toString(), 86400);
                return res.status(200).json({ token });
            } catch(error) {
                console.error(error)

            }
        } catch(error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }


    static async getDisconnect(req, res) {
        const token = req.headers.authorization

        if (!token) {
            res.status(401).json({ error: 'Unauthorized' })
            return
        }

        try {
            redisClient.get(`auth_${token}`, (error, userId) => {
                if (error) {
                    res.status(500).json({ error: 'Internal server error'})  
                    return  
                }

                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' })
                    return
                }

                redisClient.del(`auth_${token}`, (error) => {
                    if (error) {
                        res.status(401).json({ error: 'Unauthorized'})
                        return
                    }

                    res.status(204).json({ message: 'User signed out successfully'})
                })
            })
        } catch {

        }
    }
}

export default AuthController;
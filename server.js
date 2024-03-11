import injectRoutes from './routes/index.js';
import express from 'express';

const app = express();
injectRoutes(app);

export default app;

import injectRoutes from './routes/index.js';
import express from 'express';

const app = express();
injectRoutes(app);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

export default app;

import express from 'express';
import injectRoutes from './routes/index';

const app = express();
app.use(express.json());

injectRoutes(app);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

export default app;

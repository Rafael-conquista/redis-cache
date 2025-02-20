import express from 'express';
import routes from './routes';
import { connectDB } from './database';

const app = express();
app.use(express.json());
app.use(routes);

const PORT = 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
});

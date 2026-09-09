import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSession } from './lib/session';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(setupSession());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
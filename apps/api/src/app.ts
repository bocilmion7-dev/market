import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { setupSession } from './lib/session';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import adminUserRoutes from './routes/admin/users';
import adminCategoryRoutes from './routes/admin/categories';
import adminBrandRoutes from './routes/admin/brands';
import adminSettingsRoutes from './routes/admin/settings';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(setupSession());

app.use('/api/auth', authRoutes);

app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/brands', adminBrandRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

app.use(errorHandler);

export default app;
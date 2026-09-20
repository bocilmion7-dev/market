import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { setupSession } from './lib/session';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import adminUserRoutes from './routes/admin/users';
import adminCategoryRoutes from './routes/admin/categories';
import adminBrandRoutes from './routes/admin/brands';
import adminSettingsRoutes from './routes/admin/settings';
import adminFormBuilderRoutes from './routes/admin/form-builder';
import adminApprovalRoutes from './routes/admin/approval';
import publisherProductRoutes from './routes/publisher/products';
import publisherOrderRoutes from './routes/publisher/orders';
import publisherProfileRoutes from './routes/publisher/profile';
import publisherReviewDiscussionRoutes from './routes/publisher/reviews-discussions';
import publisherReportRoutes from './routes/publisher/reports';
import storefrontRoutes from './routes/storefront';
import { storefrontLimiter } from './middleware/rateLimiter';
import orderRoutes from './routes/orders';
import paymentRoutes from './routes/payment';
import shippingRoutes from './routes/shipping';
import notificationRoutes from './routes/notifications';
import reviewRoutes from './routes/reviews';
import discussionRoutes from './routes/discussions';
import wishlistRoutes from './routes/wishlist';
import adminReportRoutes from './routes/admin/reports';
import adminBannerRoutes from './routes/admin/banners';
import adminOrderRoutes from './routes/admin/orders';
import shipmentRoutes from './routes/shipments';
import uploadRoutes from './routes/upload';

const app: ReturnType<typeof express> = express();

app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(setupSession());

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);

app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/brands', adminBrandRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin', adminFormBuilderRoutes);
app.use('/api/admin', adminApprovalRoutes);

app.use('/api/publisher/products', publisherProductRoutes);
app.use('/api/publisher/orders', publisherOrderRoutes);
app.use('/api/publisher/profile', publisherProfileRoutes);
app.use('/api/publisher', publisherReviewDiscussionRoutes);
app.use('/api/publisher', publisherReportRoutes);

app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/admin', adminReportRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

app.use('/api', storefrontLimiter, storefrontRoutes);

// Production: serve React frontend (non-Vercel deployments)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const frontendPath = path.join(__dirname, '../../web/dist');
  app.use(express.static(frontendPath, { maxAge: '1y', immutable: true }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
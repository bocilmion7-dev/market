const path = require('path');

// Load .env from apps/api first (has all env vars), then root as fallback
try {
  require('dotenv').config({ path: path.join(__dirname, 'apps', 'api', '.env') });
} catch (e) {}
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (e) {}

process.env.NODE_ENV = 'production';

const app = require('./apps/api/dist/app').default;
const { prisma } = require('./apps/api/dist/lib/prisma');
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  // Pre-warm Prisma connection
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
  console.log(`Marketplace running on port ${PORT}`);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Server stopped.');
    process.exit(0);
  });
  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

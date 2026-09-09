import request from 'supertest';
import app from '../app';

let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  agent = request.agent(app);
  await agent
    .post('/api/auth/login')
    .send({ email: 'admin@marketplace.com', password: 'admin123' });
});

describe('Admin Endpoints', () => {
  it('should list users', async () => {
    const res = await agent.get('/api/admin/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should require auth for admin routes', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('should get dashboard stats', async () => {
    const res = await agent.get('/api/admin/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('should list categories', async () => {
    const res = await agent.get('/api/admin/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

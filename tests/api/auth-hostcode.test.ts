import request from 'supertest';
import app from '@/app';

describe('POST /api/auth/hostcode', () => {
  it('should return 200 for a valid hostcode', async () => {
    const response = await request(app)
      .post('/api/auth/hostcode')
      .send({ hostcode: '919190' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('sessionId');
    expect(response.body.data.business).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      slogan: expect.any(String),
    });
  });

  it('should return 401 for an invalid hostcode', async () => {
    const response = await request(app)
      .post('/api/auth/hostcode')
      .send({ hostcode: 'invalid' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid hostcode');
  });

  it('should return 400 if hostcode is missing', async () => {
    const response = await request(app)
      .post('/api/auth/hostcode')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Hostcode is required');
  });
});
import request from 'supertest';
import app from '../src/app';

jest.setTimeout(15000);

describe('E-Certificate Verifier API Suite', () => {
  describe('1. Authentication Endpoints', () => {
    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@admin.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Public Verification Endpoints', () => {
    it('should return NOT_FOUND for a non-existent certificate number', async () => {
      const res = await request(app).get('/api/verify/number/ECV-9999-999999');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('NOT_FOUND');
    });

    it('should reject PDF verification without a file upload', async () => {
      const res = await request(app).post('/api/verify/pdf');

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('INVALID');
    });
  });

  describe('3. Protected Admin Endpoints', () => {
    it('should reject request without Bearer token', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');

      expect(res.status).toBe(401);
    });
  });
});

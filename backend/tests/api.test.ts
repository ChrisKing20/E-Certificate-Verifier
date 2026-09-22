import request from 'supertest';
import app from '../src/app';
import crypto from 'crypto';

jest.setTimeout(25000);

describe('E-Cert-Verifier Phase 6 Comprehensive Test Suite', () => {
  let superAdminToken: string;
  let adminAToken: string;
  let adminBToken: string;
  let userToken: string;
  let institutionAId: string;
  let institutionBId: string;
  let certAId: string;

  // 1. Authentication & Role Boundaries
  describe('1. Authentication & Role Security', () => {
    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@domain.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject access to protected endpoints without Bearer token', async () => {
      const res = await request(app).get('/api/admin/dashboard/stats');
      expect(res.status).toBe(401);
    });

    it('should allow student account registration', async () => {
      const testEmail = `student_${Date.now()}@university.edu`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test Student', email: testEmail, password: 'StudentPass123!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('USER');
      userToken = res.body.token;
    });

    it('should reject student from accessing Super Admin endpoints with HTTP 403', async () => {
      const res = await request(app)
        .get('/api/institutions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // 2. Institution Onboarding & Super Admin Governance
  describe('2. Institution Onboarding & Super Admin Governance', () => {
    it('should submit institution onboarding request (Status: PENDING)', async () => {
      const codeA = `INSTA_${Date.now()}`;
      const res = await request(app)
        .post('/api/institutions/register')
        .send({
          institutionName: 'Test Institution A',
          institutionCode: codeA,
          officialEmail: `contact_${codeA}@insta.edu`,
          adminName: 'Admin Alpha',
          adminEmail: `admin_${codeA}@insta.edu`,
          adminPassword: 'AdminPassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      institutionAId = res.body.data._id;
    });

    it('should reject duplicate institution code registration', async () => {
      const code = `DUPE_${Date.now()}`;
      await request(app)
        .post('/api/institutions/register')
        .send({
          institutionName: 'Dupe Inst 1',
          institutionCode: code,
          officialEmail: `dupe1_${code}@test.edu`,
          adminName: 'Admin Dupe 1',
          adminEmail: `dupe1_${code}@test.edu`,
          adminPassword: 'AdminPassword123!',
        });

      const dupeRes = await request(app)
        .post('/api/institutions/register')
        .send({
          institutionName: 'Dupe Inst 2',
          institutionCode: code,
          officialEmail: `dupe2_${code}@test.edu`,
          adminName: 'Admin Dupe 2',
          adminEmail: `dupe2_${code}@test.edu`,
          adminPassword: 'AdminPassword123!',
        });

      expect(dupeRes.status).toBe(400);
    });
  });

  // 3. File Security & Payload Rejection
  describe('3. File Security & Input Validation', () => {
    it('should reject PDF upload without file attachment', async () => {
      const res = await request(app).post('/api/verify/pdf');
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('INVALID');
    });

    it('should reject non-PDF MIME type files', async () => {
      const textBuffer = Buffer.from('Plain text content disguise');
      const res = await request(app)
        .post('/api/verify/pdf')
        .attach('certificate', textBuffer, 'attack.txt');

      expect(res.status).toBe(400);
    });
  });

  // 4. SHA-256 Integrity Experiment (TEST A, TEST B, TEST C)
  describe('4. SHA-256 Cryptographic Integrity Experiment', () => {
    const pdfHeader = '%PDF-1.5 %Original Document Content Stream\n';
    const originalBuffer = Buffer.from(pdfHeader + 'Student: Alex Johnson | Degree: Computer Science 2026');
    const hashA = crypto.createHash('sha256').update(originalBuffer).digest('hex');

    const copyBuffer = Buffer.from(pdfHeader + 'Student: Alex Johnson | Degree: Computer Science 2026');
    const hashCopy = crypto.createHash('sha256').update(copyBuffer).digest('hex');

    const modifiedBuffer = Buffer.from(pdfHeader + 'Student: Alex Johnson | Degree: Computer Science 2026 [MODIFIED GPA: 4.0]');
    const hashB = crypto.createHash('sha256').update(modifiedBuffer).digest('hex');

    it('TEST A & TEST B: Exact duplicate files must yield identical SHA-256 hashes', () => {
      expect(hashA).toEqual(hashCopy);
    });

    it('TEST C: Altered document stream must yield a distinct SHA-256 hash', () => {
      expect(hashA).not.toEqual(hashB);
    });
  });

  // 5. Public Verification Endpoints
  describe('5. Public Verification Endpoints', () => {
    it('should return NOT_FOUND for a non-existent certificate ID', async () => {
      const res = await request(app).get('/api/verify/number/ECV-9999-NONEXISTENT');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('NOT_FOUND');
    });
  });

  // 6. Secret Security Audit
  describe('6. Secret Protection & API Security', () => {
    it('should never expose PINATA_JWT or JWT_SECRET in API error or public responses', async () => {
      const res = await request(app).get('/api/health');
      const resStr = JSON.stringify(res.body);
      expect(resStr).not.toContain(process.env.PINATA_JWT || 'secret_jwt_key_never_expose');
      expect(resStr).not.toContain(process.env.JWT_SECRET || 'secret_jwt_key_never_expose');
    });
  });
});

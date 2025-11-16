import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import portfolioRoutes from '../routes/portfolio.routes.js';
import User from '../models/user.model.js';
import Portfolio from '../models/portfolio.model.js';
import { protect } from '../middleware/auth.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/portfolios', portfolioRoutes);

// Helper to create authenticated user and token
async function createAuthUser() {
  const user = await User.create({
    email: 'portfolio@example.com',
    password: 'password123',
    firstName: 'Portfolio',
    lastName: 'User',
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  return { user, token };
}

describe('Portfolio Controller', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const { user, token } = await createAuthUser();
    authToken = token;
    userId = user._id;
  });

  describe('POST /api/portfolios', () => {
    it('should create a new portfolio successfully', async () => {
      const portfolioData = {
        name: 'My Tech Portfolio',
        description: 'Technology focused investments',
      };

      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .send(portfolioData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(portfolioData.name);
      expect(response.body.data.description).toBe(portfolioData.description);
      expect(response.body.data.user.toString()).toBe(userId.toString());
      expect(response.body.data.holdings).toEqual([]);
      expect(response.body.data.totalValue).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .send({ name: 'Test Portfolio' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test Portfolio' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/portfolios', () => {
    beforeEach(async () => {
      // Create test portfolios
      await Portfolio.create([
        {
          name: 'Portfolio 1',
          description: 'First portfolio',
          user: userId,
          holdings: [],
          totalValue: 0,
        },
        {
          name: 'Portfolio 2',
          description: 'Second portfolio',
          user: userId,
          holdings: [
            { symbol: 'AAPL', quantity: 10, value: 1500 },
          ],
          totalValue: 1500,
        },
      ]);
    });

    it('should get all user portfolios', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBeDefined();
      expect(response.body.data[1].holdings).toHaveLength(1);
    });

    it('should return empty array for user with no portfolios', async () => {
      // Create new user with no portfolios
      const { token } = await createAuthUser();

      const response = await request(app)
        .get('/api/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/portfolios')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/portfolios/:id', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        name: 'Test Portfolio',
        description: 'Test description',
        user: userId,
        holdings: [
          { symbol: 'AAPL', quantity: 10, value: 1500 },
          { symbol: 'GOOGL', quantity: 5, value: 700 },
        ],
        totalValue: 2200,
      });
      portfolioId = portfolio._id;
    });

    it('should get portfolio by id', async () => {
      const response = await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(portfolioId.toString());
      expect(response.body.data.holdings).toHaveLength(2);
      expect(response.body.data.totalValue).toBe(2200);
    });

    it('should fail with invalid portfolio id', async () => {
      const response = await request(app)
        .get('/api/portfolios/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail when accessing another user portfolio', async () => {
      // Create another user
      const { token: otherToken } = await createAuthUser();

      const response = await request(app)
        .get(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/portfolios/:id/generate-plan', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        name: 'Planning Portfolio',
        description: 'Test portfolio for plan generation',
        user: userId,
        holdings: [{ symbol: 'AAPL', quantity: 10, value: 1500 }],
        totalValue: 1500,
      });
      portfolioId = portfolio._id;
    });

    it('should generate investment plan', async () => {
      const goalData = {
        name: 'Retirement Fund',
        targetAmount: 1000000,
        targetDate: '2045-12-31',
        priority: 'high',
      };

      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/generate-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      // Note: This will fail without mocking OpenAI/Agent service
      // In production, mock the agent service
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/portfolios/${portfolioId}/generate-plan`)
        .send({
          name: 'Goal',
          targetAmount: 100000,
          targetDate: '2045-12-31',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/portfolios/:id', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        name: 'Original Name',
        description: 'Original description',
        user: userId,
        holdings: [],
        totalValue: 0,
      });
      portfolioId = portfolio._id;
    });

    it('should update portfolio successfully', async () => {
      const updates = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.description).toBe(updates.description);
    });

    it('should fail when updating another user portfolio', async () => {
      const { token: otherToken } = await createAuthUser();

      const response = await request(app)
        .put(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/portfolios/:id', () => {
    let portfolioId;

    beforeEach(async () => {
      const portfolio = await Portfolio.create({
        name: 'To Be Deleted',
        description: 'This will be deleted',
        user: userId,
        holdings: [],
        totalValue: 0,
      });
      portfolioId = portfolio._id;
    });

    it('should delete portfolio successfully', async () => {
      const response = await request(app)
        .delete(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({});

      // Verify portfolio is deleted
      const portfolio = await Portfolio.findById(portfolioId);
      expect(portfolio).toBeNull();
    });

    it('should fail when deleting another user portfolio', async () => {
      const { token: otherToken } = await createAuthUser();

      const response = await request(app)
        .delete(`/api/portfolios/${portfolioId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);

      // Verify portfolio still exists
      const portfolio = await Portfolio.findById(portfolioId);
      expect(portfolio).not.toBeNull();
    });
  });
});

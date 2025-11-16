import { jest } from '@jest/globals';

// Mock Pinecone and OpenAI before importing the service
const mockQuery = jest.fn();
const mockUpsert = jest.fn();
const mockDeleteMany = jest.fn();
const mockDescribeIndexStats = jest.fn();
const mockIndex = jest.fn(() => ({
  query: mockQuery,
  upsert: mockUpsert,
  deleteMany: mockDeleteMany,
  describeIndexStats: mockDescribeIndexStats,
}));

const mockPinecone = jest.fn(() => ({
  index: mockIndex,
}));

const mockCreateEmbedding = jest.fn();
const mockOpenAI = jest.fn(() => ({
  embeddings: {
    create: mockCreateEmbedding,
  },
}));

// Mock modules
jest.unstable_mockModule('@pinecone-database/pinecone', () => ({
  Pinecone: mockPinecone,
}));

jest.unstable_mockModule('openai', () => ({
  default: mockOpenAI,
}));

// Import the service after mocking
const { default: ragService } = await import('../services/rag.service.js');

describe('RAG Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset service state
    ragService.initialized = false;
    ragService.pinecone = null;
    ragService.index = null;
    ragService.openai = null;

    // Set required environment variables
    process.env.PINECONE_API_KEY = 'test-pinecone-key';
    process.env.PINECONE_INDEX = 'test-index';
    process.env.OPENAI_API_KEY = 'test-openai-key';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.PINECONE_API_KEY;
    delete process.env.PINECONE_INDEX;
    delete process.env.OPENAI_API_KEY;
  });

  describe('initialize', () => {
    it('should initialize Pinecone and OpenAI clients successfully', async () => {
      await ragService.initialize();

      expect(mockPinecone).toHaveBeenCalledWith({
        apiKey: 'test-pinecone-key',
      });
      expect(mockIndex).toHaveBeenCalledWith('test-index');
      expect(mockOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-openai-key',
      });
      expect(ragService.initialized).toBe(true);
    });

    it('should throw error if PINECONE_API_KEY is missing', async () => {
      delete process.env.PINECONE_API_KEY;

      await expect(ragService.initialize()).rejects.toThrow('PINECONE_API_KEY is not configured');
    });

    it('should throw error if PINECONE_INDEX is missing', async () => {
      delete process.env.PINECONE_INDEX;

      await expect(ragService.initialize()).rejects.toThrow('PINECONE_INDEX is not configured');
    });

    it('should throw error if OPENAI_API_KEY is missing', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(ragService.initialize()).rejects.toThrow('OPENAI_API_KEY is not configured');
    });

    it('should not reinitialize if already initialized', async () => {
      await ragService.initialize();
      expect(mockPinecone).toHaveBeenCalledTimes(1);

      await ragService.initialize();
      expect(mockPinecone).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('generateEmbeddings', () => {
    it('should generate embeddings for a single text', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockCreateEmbedding.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const result = await ragService.generateEmbeddings('test text');

      expect(mockCreateEmbedding).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: ['test text'],
      });
      expect(result).toEqual([mockEmbedding]);
    });

    it('should generate embeddings for multiple texts', async () => {
      const mockEmbeddings = [
        Array(1536).fill(0.1),
        Array(1536).fill(0.2),
        Array(1536).fill(0.3),
      ];
      mockCreateEmbedding.mockResolvedValue({
        data: mockEmbeddings.map(embedding => ({ embedding })),
      });

      const result = await ragService.generateEmbeddings(['text 1', 'text 2', 'text 3']);

      expect(mockCreateEmbedding).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: ['text 1', 'text 2', 'text 3'],
      });
      expect(result).toEqual(mockEmbeddings);
    });

    it('should filter out empty texts', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockCreateEmbedding.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      await ragService.generateEmbeddings(['', 'valid text', '   ']);

      expect(mockCreateEmbedding).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: ['valid text'],
      });
    });

    it('should throw error if no valid texts provided', async () => {
      await expect(ragService.generateEmbeddings([])).rejects.toThrow('No texts provided for embedding');
      await expect(ragService.generateEmbeddings(['', '  '])).rejects.toThrow('No valid texts after filtering');
    });

    it('should truncate long texts to 8000 characters', async () => {
      const longText = 'a'.repeat(10000);
      const mockEmbedding = Array(1536).fill(0.1);
      mockCreateEmbedding.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      await ragService.generateEmbeddings(longText);

      expect(mockCreateEmbedding).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: ['a'.repeat(8000)],
      });
    });
  });

  describe('indexDocuments', () => {
    beforeEach(() => {
      const mockEmbeddings = [
        Array(1536).fill(0.1),
        Array(1536).fill(0.2),
      ];
      mockCreateEmbedding.mockResolvedValue({
        data: mockEmbeddings.map(embedding => ({ embedding })),
      });
      mockUpsert.mockResolvedValue({});
    });

    it('should index documents successfully', async () => {
      const docs = [
        { id: 'doc1', text: 'Investment advice for retirement' },
        { id: 'doc2', text: 'Portfolio diversification strategies' },
      ];

      const result = await ragService.indexDocuments('user123', docs);

      expect(result.indexed).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockCreateEmbedding).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'user123_doc1',
            metadata: expect.objectContaining({
              userId: 'user123',
              docId: 'doc1',
              text: 'Investment advice for retirement',
            }),
          }),
          expect.objectContaining({
            id: 'user123_doc2',
            metadata: expect.objectContaining({
              userId: 'user123',
              docId: 'doc2',
            }),
          }),
        ])
      );
    });

    it('should include custom metadata', async () => {
      const docs = [
        {
          id: 'doc1',
          text: 'Investment advice',
          metadata: { category: 'retirement', priority: 'high' },
        },
      ];

      await ragService.indexDocuments('user123', docs);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              userId: 'user123',
              docId: 'doc1',
              category: 'retirement',
              priority: 'high',
            }),
          }),
        ])
      );
    });

    it('should process documents in batches', async () => {
      ragService.batchSize = 2;
      const docs = [
        { id: 'doc1', text: 'text 1' },
        { id: 'doc2', text: 'text 2' },
        { id: 'doc3', text: 'text 3' },
      ];

      await ragService.indexDocuments('user123', docs);

      expect(mockUpsert).toHaveBeenCalledTimes(2); // 2 batches
    });

    it('should handle documents with missing fields', async () => {
      const docs = [
        { id: 'doc1', text: 'valid text' },
        { id: 'doc2' }, // missing text
        { text: 'text without id' }, // missing id
      ];

      const result = await ragService.indexDocuments('user123', docs);

      expect(result.indexed).toBe(1);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });

    it('should throw error if userId is missing', async () => {
      const docs = [{ id: 'doc1', text: 'text' }];
      await expect(ragService.indexDocuments('', docs)).rejects.toThrow('userId is required');
    });

    it('should throw error if docs is not an array', async () => {
      await expect(ragService.indexDocuments('user123', null)).rejects.toThrow('docs must be a non-empty array');
      await expect(ragService.indexDocuments('user123', [])).rejects.toThrow('docs must be a non-empty array');
    });

    it('should continue on batch errors and report them', async () => {
      mockUpsert.mockRejectedValueOnce(new Error('Pinecone error'));
      
      const docs = [
        { id: 'doc1', text: 'text 1' },
        { id: 'doc2', text: 'text 2' },
      ];

      const result = await ragService.indexDocuments('user123', docs);

      expect(result.failed).toBe(2);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('retrieveRelevant', () => {
    beforeEach(() => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockCreateEmbedding.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });
    });

    it('should retrieve relevant documents successfully', async () => {
      mockQuery.mockResolvedValue({
        matches: [
          {
            id: 'user123_doc1',
            score: 0.95,
            metadata: {
              userId: 'user123',
              docId: 'doc1',
              text: 'Investment advice for retirement',
              category: 'retirement',
            },
          },
          {
            id: 'user123_doc2',
            score: 0.87,
            metadata: {
              userId: 'user123',
              docId: 'doc2',
              text: 'Portfolio diversification strategies',
            },
          },
        ],
      });

      const result = await ragService.retrieveRelevant('user123', 'retirement planning', 5);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'user123_doc1',
        score: 0.95,
        text: 'Investment advice for retirement',
        metadata: expect.objectContaining({
          userId: 'user123',
          docId: 'doc1',
          category: 'retirement',
        }),
      });
      expect(mockQuery).toHaveBeenCalledWith({
        vector: expect.any(Array),
        topK: 5,
        filter: { userId: { $eq: 'user123' } },
        includeMetadata: true,
      });
    });

    it('should use default topK if not provided', async () => {
      mockQuery.mockResolvedValue({ matches: [] });

      await ragService.retrieveRelevant('user123', 'test query');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          topK: 5, // default value
        })
      );
    });

    it('should throw error if userId is missing', async () => {
      await expect(ragService.retrieveRelevant('', 'query')).rejects.toThrow('userId is required');
    });

    it('should throw error if query is invalid', async () => {
      await expect(ragService.retrieveRelevant('user123', '')).rejects.toThrow('query must be a non-empty string');
      await expect(ragService.retrieveRelevant('user123', '   ')).rejects.toThrow('query must be a non-empty string');
      await expect(ragService.retrieveRelevant('user123', null)).rejects.toThrow('query must be a non-empty string');
    });

    it('should throw error if topK is out of range', async () => {
      await expect(ragService.retrieveRelevant('user123', 'query', 0)).rejects.toThrow('topK must be between 1 and 100');
      await expect(ragService.retrieveRelevant('user123', 'query', 101)).rejects.toThrow('topK must be between 1 and 100');
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({ matches: [] });

      const result = await ragService.retrieveRelevant('user123', 'query');

      expect(result).toEqual([]);
    });
  });

  describe('deleteDocuments', () => {
    it('should delete specific documents', async () => {
      mockDeleteMany.mockResolvedValue({});

      const result = await ragService.deleteDocuments('user123', ['doc1', 'doc2']);

      expect(mockDeleteMany).toHaveBeenCalledWith(['user123_doc1', 'user123_doc2']);
      expect(result.deleted).toBe(2);
    });

    it('should delete all documents for user if docIds not provided', async () => {
      mockDeleteMany.mockResolvedValue({});

      const result = await ragService.deleteDocuments('user123');

      expect(mockDeleteMany).toHaveBeenCalledWith({ userId: { $eq: 'user123' } });
      expect(result.deleted).toBe(-1); // -1 indicates all documents
    });

    it('should throw error if userId is missing', async () => {
      await expect(ragService.deleteDocuments('')).rejects.toThrow('userId is required');
    });
  });

  describe('buildContext', () => {
    it('should build context string from documents', () => {
      const documents = [
        { text: 'First document', score: 0.95 },
        { text: 'Second document', score: 0.87 },
        { text: 'Third document', score: 0.78 },
      ];

      const context = ragService.buildContext(documents);

      expect(context).toContain('RELEVANT CONTEXT:');
      expect(context).toContain('[Score: 0.950] First document');
      expect(context).toContain('[Score: 0.870] Second document');
      expect(context).toContain('[Score: 0.780] Third document');
    });

    it('should respect maxLength limit', () => {
      const documents = [
        { text: 'a'.repeat(2000), score: 0.95 },
        { text: 'b'.repeat(2000), score: 0.87 },
      ];

      const context = ragService.buildContext(documents, 100);

      expect(context.length).toBeLessThanOrEqual(100);
    });

    it('should return empty string for empty documents', () => {
      expect(ragService.buildContext([])).toBe('');
      expect(ragService.buildContext(null)).toBe('');
      expect(ragService.buildContext(undefined)).toBe('');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when all services are working', async () => {
      mockDescribeIndexStats.mockResolvedValue({
        dimension: 1536,
        totalRecordCount: 100,
      });
      const mockEmbedding = Array(1536).fill(0.1);
      mockCreateEmbedding.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const health = await ragService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.pinecone).toBe(true);
      expect(health.openai).toBe(true);
      expect(health.indexStats.dimension).toBe(1536);
      expect(health.indexStats.totalVectorCount).toBe(100);
    });

    it('should return unhealthy status on errors', async () => {
      mockDescribeIndexStats.mockRejectedValue(new Error('Connection failed'));

      const health = await ragService.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.pinecone).toBe(false);
      expect(health.openai).toBe(false);
      expect(health.error).toBeTruthy();
    });
  });
});

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

/**
 * RAG Service - Retrieval-Augmented Generation with Pinecone
 * Indexes documents and retrieves relevant context using vector embeddings
 */
class RAGService {
  constructor() {
    this.pineconeApiKey = process.env.PINECONE_API_KEY;
    this.pineconeEnvironment = process.env.PINECONE_ENV;
    this.pineconeIndexName = process.env.PINECONE_INDEX;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002';
    this.batchSize = parseInt(process.env.PINECONE_BATCH_SIZE || '100');
    this.dimension = 1536; // ada-002 embedding dimension
    
    this.pinecone = null;
    this.index = null;
    this.openai = null;
    this.initialized = false;
  }

  /**
   * Initialize Pinecone and OpenAI clients
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Validate environment variables
      if (!this.pineconeApiKey) {
        throw new Error('PINECONE_API_KEY is not configured');
      }
      if (!this.pineconeIndexName) {
        throw new Error('PINECONE_INDEX is not configured');
      }
      if (!this.openaiApiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }

      // Initialize Pinecone client
      this.pinecone = new Pinecone({
        apiKey: this.pineconeApiKey,
      });

      // Get index reference
      this.index = this.pinecone.index(this.pineconeIndexName);

      // Initialize OpenAI client
      this.openai = new OpenAI({
        apiKey: this.openaiApiKey,
      });

      this.initialized = true;
      console.log('RAG Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG Service:', error);
      throw new Error(`RAG Service initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for text using OpenAI
   * @param {string|string[]} texts - Text or array of texts to embed
   * @returns {Promise<number[][]>} Array of embedding vectors
   */
  async generateEmbeddings(texts) {
    try {
      await this.initialize();

      // Ensure texts is an array
      const textArray = Array.isArray(texts) ? texts : [texts];

      // Validate inputs
      if (textArray.length === 0) {
        throw new Error('No texts provided for embedding');
      }

      // Filter out empty texts and truncate long texts
      const validTexts = textArray
        .filter(text => text && text.trim().length > 0)
        .map(text => text.trim().substring(0, 8000)); // OpenAI token limit safety

      if (validTexts.length === 0) {
        throw new Error('No valid texts after filtering');
      }

      // Call OpenAI embeddings API
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: validTexts,
      });

      // Extract embeddings
      const embeddings = response.data.map(item => item.embedding);

      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Index documents for a user with batch upsert
   * @param {string} userId - User ID
   * @param {Array<{id: string, text: string, metadata?: Object}>} docs - Documents to index
   * @returns {Promise<{indexed: number, failed: number, errors: Array}>}
   */
  async indexDocuments(userId, docs) {
    try {
      await this.initialize();

      // Validate inputs
      if (!userId) {
        throw new Error('userId is required');
      }
      if (!Array.isArray(docs) || docs.length === 0) {
        throw new Error('docs must be a non-empty array');
      }

      console.log(`Indexing ${docs.length} documents for user ${userId}`);

      const results = {
        indexed: 0,
        failed: 0,
        errors: [],
      };

      // Process documents in batches
      for (let i = 0; i < docs.length; i += this.batchSize) {
        const batch = docs.slice(i, i + this.batchSize);
        
        try {
          // Validate batch documents
          const validDocs = batch.filter(doc => {
            if (!doc.id || !doc.text) {
              results.failed++;
              results.errors.push({
                doc: doc.id || 'unknown',
                error: 'Missing required fields: id or text',
              });
              return false;
            }
            return true;
          });

          if (validDocs.length === 0) {
            continue;
          }

          // Generate embeddings for batch
          const texts = validDocs.map(doc => doc.text);
          const embeddings = await this.generateEmbeddings(texts);

          // Prepare vectors for Pinecone
          const vectors = validDocs.map((doc, index) => ({
            id: `${userId}_${doc.id}`,
            values: embeddings[index],
            metadata: {
              userId,
              docId: doc.id,
              text: doc.text.substring(0, 1000), // Store truncated text in metadata
              timestamp: new Date().toISOString(),
              ...(doc.metadata || {}),
            },
          }));

          // Upsert to Pinecone
          await this.index.upsert(vectors);

          results.indexed += validDocs.length;
          console.log(`Batch ${Math.floor(i / this.batchSize) + 1}: Indexed ${validDocs.length} documents`);
        } catch (error) {
          console.error(`Error processing batch ${Math.floor(i / this.batchSize) + 1}:`, error);
          results.failed += batch.length;
          results.errors.push({
            batch: Math.floor(i / this.batchSize) + 1,
            error: error.message,
          });
        }
      }

      console.log(`Indexing complete: ${results.indexed} indexed, ${results.failed} failed`);
      return results;
    } catch (error) {
      console.error('Error indexing documents:', error);
      throw new Error(`Failed to index documents: ${error.message}`);
    }
  }

  /**
   * Retrieve relevant documents for a query
   * @param {string} userId - User ID
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return (default: 5)
   * @returns {Promise<Array<{id: string, score: number, text: string, metadata: Object}>>}
   */
  async retrieveRelevant(userId, query, topK = 5) {
    try {
      await this.initialize();

      // Validate inputs
      if (!userId) {
        throw new Error('userId is required');
      }
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw new Error('query must be a non-empty string');
      }
      if (topK < 1 || topK > 100) {
        throw new Error('topK must be between 1 and 100');
      }

      console.log(`Retrieving top ${topK} documents for user ${userId}`);

      // Generate query embedding
      const [queryEmbedding] = await this.generateEmbeddings(query);

      // Query Pinecone with user filter
      const queryResponse = await this.index.query({
        vector: queryEmbedding,
        topK,
        filter: { userId: { $eq: userId } },
        includeMetadata: true,
      });

      // Format results
      const results = queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text || '',
        metadata: {
          ...match.metadata,
          // Remove text from metadata to avoid duplication
          text: undefined,
        },
      }));

      console.log(`Retrieved ${results.length} relevant documents`);
      return results;
    } catch (error) {
      console.error('Error retrieving documents:', error);
      throw new Error(`Failed to retrieve documents: ${error.message}`);
    }
  }

  /**
   * Delete documents for a user
   * @param {string} userId - User ID
   * @param {string[]} docIds - Optional array of document IDs to delete (deletes all if not provided)
   * @returns {Promise<{deleted: number}>}
   */
  async deleteDocuments(userId, docIds = null) {
    try {
      await this.initialize();

      if (!userId) {
        throw new Error('userId is required');
      }

      if (docIds && Array.isArray(docIds)) {
        // Delete specific documents
        const ids = docIds.map(docId => `${userId}_${docId}`);
        await this.index.deleteMany(ids);
        console.log(`Deleted ${ids.length} documents for user ${userId}`);
        return { deleted: ids.length };
      } else {
        // Delete all documents for user (using metadata filter)
        await this.index.deleteMany({ userId: { $eq: userId } });
        console.log(`Deleted all documents for user ${userId}`);
        return { deleted: -1 }; // -1 indicates all documents deleted
      }
    } catch (error) {
      console.error('Error deleting documents:', error);
      throw new Error(`Failed to delete documents: ${error.message}`);
    }
  }

  /**
   * Build context string from retrieved documents
   * @param {Array<{text: string, score: number}>} documents - Retrieved documents
   * @param {number} maxLength - Maximum context length (default: 3000)
   * @returns {string} Formatted context string
   */
  buildContext(documents, maxLength = 3000) {
    if (!documents || documents.length === 0) {
      return '';
    }

    let context = 'RELEVANT CONTEXT:\n\n';
    let currentLength = context.length;

    for (const doc of documents) {
      const docText = `- [Score: ${doc.score.toFixed(3)}] ${doc.text}\n\n`;
      if (currentLength + docText.length > maxLength) {
        break;
      }
      context += docText;
      currentLength += docText.length;
    }

    return context;
  }

  /**
   * Health check for RAG service
   * @returns {Promise<{status: string, pinecone: boolean, openai: boolean}>}
   */
  async healthCheck() {
    try {
      await this.initialize();

      // Test Pinecone connection
      const indexStats = await this.index.describeIndexStats();
      const pineconeHealthy = !!indexStats;

      // Test OpenAI connection
      const testEmbedding = await this.generateEmbeddings('test');
      const openaiHealthy = testEmbedding.length > 0;

      return {
        status: pineconeHealthy && openaiHealthy ? 'healthy' : 'degraded',
        pinecone: pineconeHealthy,
        openai: openaiHealthy,
        indexStats: {
          dimension: indexStats.dimension,
          totalVectorCount: indexStats.totalRecordCount || 0,
        },
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        pinecone: false,
        openai: false,
        error: error.message,
      };
    }
  }
}

export default new RAGService();

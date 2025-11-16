# RAG Service Documentation

## Overview

The RAG (Retrieval-Augmented Generation) Service integrates Pinecone vector database with OpenAI embeddings to provide context-aware AI responses. It allows you to index financial documents and retrieve relevant context before generating investment plans.

## Features

- **Document Indexing**: Store documents as vector embeddings in Pinecone
- **Semantic Search**: Retrieve relevant documents using vector similarity
- **Batch Processing**: Efficiently process large document sets
- **User Isolation**: Documents are scoped to individual users
- **Error Handling**: Comprehensive error handling and reporting
- **Health Checks**: Monitor service health and connectivity

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@pinecone-database/pinecone`: Pinecone vector database client
- `openai`: OpenAI API client for embeddings

### 2. Configure Pinecone

1. Create a Pinecone account at [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a new index with:
   - **Dimensions**: 1536 (for text-embedding-ada-002)
   - **Metric**: cosine
   - **Name**: investagent-index (or your preferred name)

### 3. Set Environment Variables

Update your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# RAG Configuration
USE_RAG=true  # Enable RAG context retrieval
RAG_TOP_K=5  # Number of documents to retrieve

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENV=your_pinecone_environment  # e.g., us-east-1-aws
PINECONE_INDEX=investagent-index
PINECONE_BATCH_SIZE=100
```

## API Reference

### `indexDocuments(userId, docs[])`

Index documents for a user with batch upsert.

**Parameters:**
- `userId` (string): User ID to scope documents
- `docs` (Array): Array of document objects

**Document Object:**
```javascript
{
  id: string,           // Unique document ID
  text: string,         // Document text content
  metadata?: {          // Optional metadata
    category: string,
    priority: string,
    // ... any custom fields
  }
}
```

**Returns:**
```javascript
{
  indexed: number,      // Number of successfully indexed documents
  failed: number,       // Number of failed documents
  errors: Array<{       // Array of error details
    doc: string,
    error: string
  }>
}
```

**Example:**
```javascript
import ragService from './services/rag.service.js';

const docs = [
  {
    id: 'retirement-101',
    text: 'Retirement planning requires a diversified portfolio with a mix of stocks and bonds...',
    metadata: {
      category: 'retirement',
      priority: 'high',
      source: 'financial-advisor'
    }
  },
  {
    id: 'portfolio-diversification',
    text: 'Portfolio diversification reduces risk by spreading investments across different asset classes...',
    metadata: {
      category: 'investing',
      priority: 'medium'
    }
  }
];

const result = await ragService.indexDocuments('user123', docs);
console.log(`Indexed ${result.indexed} documents, ${result.failed} failed`);
```

### `retrieveRelevant(userId, query, topK)`

Retrieve relevant documents for a query using semantic search.

**Parameters:**
- `userId` (string): User ID to filter documents
- `query` (string): Search query
- `topK` (number, optional): Number of results to return (default: 5, max: 100)

**Returns:**
```javascript
Array<{
  id: string,           // Document ID
  score: number,        // Similarity score (0-1)
  text: string,         // Document text
  metadata: Object      // Document metadata
}>
```

**Example:**
```javascript
const results = await ragService.retrieveRelevant(
  'user123',
  'retirement planning with moderate risk',
  5
);

console.log('Top relevant documents:');
results.forEach(doc => {
  console.log(`- [${doc.score.toFixed(3)}] ${doc.text.substring(0, 100)}...`);
});
```

### `deleteDocuments(userId, docIds?)`

Delete documents for a user.

**Parameters:**
- `userId` (string): User ID
- `docIds` (Array<string>, optional): Document IDs to delete. If not provided, deletes all documents for the user.

**Returns:**
```javascript
{
  deleted: number  // Number of documents deleted (-1 for all)
}
```

**Example:**
```javascript
// Delete specific documents
await ragService.deleteDocuments('user123', ['doc1', 'doc2']);

// Delete all documents for user
await ragService.deleteDocuments('user123');
```

### `buildContext(documents, maxLength?)`

Build a formatted context string from retrieved documents.

**Parameters:**
- `documents` (Array): Retrieved documents
- `maxLength` (number, optional): Maximum context length (default: 3000)

**Returns:** Formatted context string

**Example:**
```javascript
const docs = await ragService.retrieveRelevant('user123', 'query', 5);
const context = ragService.buildContext(docs, 3000);
console.log(context);
```

### `healthCheck()`

Check the health status of the RAG service.

**Returns:**
```javascript
{
  status: string,       // 'healthy', 'degraded', or 'unhealthy'
  pinecone: boolean,    // Pinecone connectivity
  openai: boolean,      // OpenAI connectivity
  indexStats: {
    dimension: number,
    totalVectorCount: number
  }
}
```

## Integration with Agent Service

The RAG service is integrated into `agent.service.js` to provide context before generating investment plans:

```javascript
import ragService from './rag.service.js';

// In agent.service.js
async generateInvestmentPlan(portfolioData, goalData, userData) {
  // Retrieve relevant context if RAG is enabled
  if (this.useRAG && userData.userId) {
    const query = this.buildRAGQuery(portfolioData, goalData, userData);
    const retrievedDocs = await ragService.retrieveRelevant(
      userData.userId,
      query,
      this.ragTopK
    );
    const ragContext = ragService.buildContext(retrievedDocs);
    
    // Include context in prompt
    const prompt = this.buildPrompt(portfolioData, goalData, userData, ragContext);
  }
  
  // ... rest of the logic
}
```

## Usage Example

### 1. Index Financial Documents

```javascript
// Index investment knowledge base
const knowledgeBase = [
  {
    id: 'retirement-strategy-1',
    text: 'For retirement planning with a 10+ year horizon, consider a 60/40 stock/bond allocation...',
    metadata: { category: 'retirement', risk: 'moderate' }
  },
  {
    id: 'emergency-fund',
    text: 'Maintain 3-6 months of expenses in a high-yield savings account for emergencies...',
    metadata: { category: 'savings', risk: 'low' }
  },
  {
    id: 'rebalancing-strategy',
    text: 'Rebalance your portfolio quarterly or when allocations drift by more than 5%...',
    metadata: { category: 'maintenance', risk: 'medium' }
  }
];

await ragService.indexDocuments('user123', knowledgeBase);
```

### 2. Retrieve Context for Investment Planning

```javascript
// When generating an investment plan
const query = 'retirement planning with moderate risk profile';
const relevantDocs = await ragService.retrieveRelevant('user123', query, 5);

console.log('Retrieved context:');
relevantDocs.forEach(doc => {
  console.log(`Score: ${doc.score.toFixed(3)}`);
  console.log(`Text: ${doc.text}`);
  console.log(`Category: ${doc.metadata.category}`);
});
```

### 3. Generate Investment Plan with Context

```javascript
const plan = await agentService.generateInvestmentPlan(
  portfolioData,
  goalData,
  { userId: 'user123', riskProfile: 'moderate' }
);

// Plan now includes RAG context information
if (plan.ragContext) {
  console.log(`Used ${plan.ragContext.documentsUsed} documents for context`);
  console.log(`Top relevance score: ${plan.ragContext.topScore}`);
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test rag.service.test.js
```

The tests mock Pinecone and OpenAI clients to ensure:
- Proper initialization and configuration
- Document indexing with batch processing
- Semantic search and retrieval
- Error handling and edge cases
- Health check functionality

## Best Practices

1. **Document Chunking**: Break large documents into smaller chunks (500-1000 words) for better retrieval
2. **Metadata**: Use rich metadata for filtering and categorization
3. **Batch Size**: Adjust `PINECONE_BATCH_SIZE` based on your document size (default: 100)
4. **Context Length**: Limit context to avoid token limits (default: 3000 chars)
5. **Error Handling**: The service continues on partial failures and reports errors
6. **User Isolation**: Always scope documents to user IDs for data privacy

## Performance Considerations

- **Embedding Generation**: ~0.1s per document (OpenAI API)
- **Batch Upsert**: ~0.5s per 100 documents (Pinecone)
- **Query Latency**: ~50-100ms (Pinecone)
- **Costs**:
  - OpenAI embeddings: $0.0001 per 1K tokens
  - Pinecone: Based on index size and queries

## Troubleshooting

### Service Won't Initialize
- Check environment variables are set correctly
- Verify Pinecone index exists and is active
- Confirm OpenAI API key is valid

### Slow Indexing
- Reduce `PINECONE_BATCH_SIZE`
- Check network latency to Pinecone
- Consider chunking large documents

### Poor Retrieval Quality
- Increase `RAG_TOP_K` for more context
- Review document text quality and chunking
- Add more relevant metadata

### Health Check Fails
```javascript
const health = await ragService.healthCheck();
console.log(health);
```

Check the returned status and specific service failures.

## Security

- **API Keys**: Never commit API keys to version control
- **User Isolation**: Documents are filtered by userId
- **Metadata Sanitization**: Be careful with PII in metadata
- **Access Control**: Implement proper authentication in your API layer

## Future Enhancements

- [ ] Support for different embedding models
- [ ] Hybrid search (keyword + semantic)
- [ ] Document versioning and updates
- [ ] Automatic re-ranking algorithms
- [ ] Cost optimization with caching
- [ ] Multi-language support

## Support

For issues or questions:
1. Check the test suite for usage examples
2. Review Pinecone documentation: https://docs.pinecone.io/
3. Review OpenAI embeddings guide: https://platform.openai.com/docs/guides/embeddings

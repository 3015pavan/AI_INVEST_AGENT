/**
 * Example Usage Script for RAG Service
 * Demonstrates how to use the RAG service to index and retrieve financial documents
 */

import 'dotenv/config';
import ragService from '../src/services/rag.service.js';
import agentService from '../src/services/agent.service.js';

// Sample financial documents to index
const sampleDocuments = [
  {
    id: 'retirement-planning-basics',
    text: `Retirement planning for moderate risk investors should focus on a balanced approach. 
    A typical allocation might include 60% stocks (40% domestic, 20% international), 
    30% bonds (investment-grade), and 10% cash equivalents. This provides growth potential 
    while managing volatility. For investors with 10+ years until retirement, this balance 
    offers good risk-adjusted returns while protecting against market downturns.`,
    metadata: {
      category: 'retirement',
      riskProfile: 'moderate',
      timeHorizon: 'long-term',
      source: 'financial-advisor',
    },
  },
  {
    id: 'diversification-strategy',
    text: `Portfolio diversification is essential for managing investment risk. Spread your 
    investments across different asset classes (stocks, bonds, real estate), sectors 
    (technology, healthcare, finance), and geographies (US, international). Avoid 
    concentration in single stocks - no holding should exceed 5-10% of your portfolio. 
    Regular rebalancing helps maintain your target allocation and manage risk.`,
    metadata: {
      category: 'strategy',
      riskProfile: 'all',
      importance: 'high',
    },
  },
  {
    id: 'emergency-fund-guidance',
    text: `Before investing for long-term goals, establish an emergency fund with 3-6 months 
    of living expenses in a high-yield savings account or money market fund. This provides 
    financial security and prevents you from selling investments at unfavorable times during 
    emergencies. For self-employed individuals or those with variable income, consider 
    6-12 months of expenses.`,
    metadata: {
      category: 'savings',
      riskProfile: 'conservative',
      priority: 'high',
    },
  },
  {
    id: 'tax-advantaged-accounts',
    text: `Maximize contributions to tax-advantaged accounts like 401(k)s and IRAs. For 2024, 
    you can contribute up to $23,000 to a 401(k) ($30,500 if 50+) and $7,000 to an IRA 
    ($8,000 if 50+). Take advantage of employer 401(k) matching - it's free money. Consider 
    Roth accounts if you expect to be in a higher tax bracket in retirement.`,
    metadata: {
      category: 'tax-strategy',
      year: 2024,
      priority: 'high',
    },
  },
  {
    id: 'rebalancing-frequency',
    text: `Portfolio rebalancing should be done quarterly or when any asset class deviates 
    by more than 5% from its target allocation. This disciplined approach forces you to 
    buy low and sell high. Consider tax implications when rebalancing in taxable accounts. 
    Use new contributions to rebalance first before selling holdings. Set calendar reminders 
    to review allocations regularly.`,
    metadata: {
      category: 'maintenance',
      frequency: 'quarterly',
      difficulty: 'intermediate',
    },
  },
  {
    id: 'market-volatility-response',
    text: `During market volatility, resist emotional decisions. Market downturns are normal 
    and temporary. Maintain your investment strategy and continue regular contributions 
    (dollar-cost averaging). Consider rebalancing to take advantage of lower prices. 
    Review but don't abandon your long-term plan. If volatility causes stress, your risk 
    tolerance may be too high and should be adjusted.`,
    metadata: {
      category: 'psychology',
      riskProfile: 'all',
      importance: 'critical',
    },
  },
  {
    id: 'growth-vs-value',
    text: `Growth stocks offer high potential returns but higher volatility. Value stocks 
    provide stability and dividends but slower growth. A balanced portfolio includes both. 
    Younger investors can favor growth (70/30 growth/value), while those nearing retirement 
    should favor value and dividend-paying stocks (40/60 growth/value) for income and stability.`,
    metadata: {
      category: 'investing',
      strategy: 'allocation',
      level: 'intermediate',
    },
  },
  {
    id: 'index-fund-benefits',
    text: `Index funds like VTI (Total Stock Market) and BND (Total Bond Market) offer 
    broad diversification at low cost. They consistently outperform most actively managed 
    funds after fees. For most investors, a simple portfolio of 3-4 index funds covering 
    US stocks, international stocks, and bonds provides excellent diversification. 
    Annual expense ratios should be under 0.20%.`,
    metadata: {
      category: 'investing',
      strategy: 'passive',
      costLevel: 'low',
      recommendation: 'beginner-friendly',
    },
  },
];

async function demonstrateRAGService() {
  console.log('=== RAG Service Demo ===\n');

  try {
    // 1. Index documents
    console.log('Step 1: Indexing sample financial documents...');
    const indexResult = await ragService.indexDocuments('demo-user', sampleDocuments);
    console.log(`✓ Indexed ${indexResult.indexed} documents`);
    if (indexResult.failed > 0) {
      console.log(`✗ Failed to index ${indexResult.failed} documents`);
      indexResult.errors.forEach(err => console.log(`  - ${err.error}`));
    }
    console.log();

    // 2. Retrieve relevant documents for different queries
    const queries = [
      'retirement planning with moderate risk',
      'how to diversify my portfolio',
      'emergency fund savings',
      'best index funds for beginners',
    ];

    for (const query of queries) {
      console.log(`Step 2: Retrieving documents for: "${query}"`);
      const results = await ragService.retrieveRelevant('demo-user', query, 3);
      
      console.log(`✓ Found ${results.length} relevant documents:\n`);
      results.forEach((doc, idx) => {
        console.log(`  ${idx + 1}. [Score: ${doc.score.toFixed(3)}] ${doc.id}`);
        console.log(`     ${doc.text.substring(0, 100)}...`);
        console.log(`     Category: ${doc.metadata.category}\n`);
      });
    }

    // 3. Build context for AI
    console.log('Step 3: Building context string for AI...');
    const query = 'retirement planning strategy';
    const relevantDocs = await ragService.retrieveRelevant('demo-user', query, 5);
    const context = ragService.buildContext(relevantDocs);
    console.log(`✓ Built context (${context.length} characters):`);
    console.log(context.substring(0, 300) + '...\n');

    // 4. Demonstrate integration with agent service
    console.log('Step 4: Generating investment plan with RAG context...');
    console.log('Note: Set USE_RAG=true in .env to enable this feature\n');
    
    // Example portfolio and goal data
    const portfolioData = {
      holdings: [
        { symbol: 'VTI', quantity: 50, value: 10000 },
        { symbol: 'AAPL', quantity: 10, value: 1800 },
      ],
      totalValue: 11800,
    };

    const goalData = {
      name: 'Retirement Savings',
      targetAmount: 1000000,
      currentAmount: 11800,
      targetDate: new Date('2050-01-01'),
      priority: 'high',
    };

    const userData = {
      userId: 'demo-user',
      riskProfile: 'moderate',
    };

    // Enable RAG temporarily for demo
    const originalUseRAG = process.env.USE_RAG;
    process.env.USE_RAG = 'true';

    try {
      const plan = await agentService.generateInvestmentPlan(
        portfolioData,
        goalData,
        userData
      );

      console.log('✓ Generated investment plan:');
      console.log('  Allocations:', plan.allocations);
      console.log('  Trades:', plan.trades.length, 'recommended');
      console.log('  Explanation:', plan.explanation.substring(0, 100) + '...');
      
      if (plan.ragContext) {
        console.log('\n  RAG Context Used:');
        console.log(`    - Documents: ${plan.ragContext.documentsUsed}`);
        console.log(`    - Top Score: ${plan.ragContext.topScore.toFixed(3)}`);
      }
    } catch (error) {
      console.log(`✗ Error generating plan: ${error.message}`);
      console.log('  (This may occur if OpenAI API key is not configured)');
    } finally {
      process.env.USE_RAG = originalUseRAG;
    }

    console.log();

    // 5. Health check
    console.log('Step 5: Running health check...');
    const health = await ragService.healthCheck();
    console.log('✓ Service Status:', health.status);
    console.log('  - Pinecone:', health.pinecone ? '✓ Connected' : '✗ Disconnected');
    console.log('  - OpenAI:', health.openai ? '✓ Connected' : '✗ Disconnected');
    if (health.indexStats) {
      console.log(`  - Index: ${health.indexStats.totalVectorCount} vectors, ${health.indexStats.dimension} dimensions`);
    }
    console.log();

    // 6. Cleanup (optional)
    console.log('Step 6: Cleaning up demo documents...');
    const deleteResult = await ragService.deleteDocuments('demo-user');
    console.log(`✓ Deleted ${deleteResult.deleted === -1 ? 'all' : deleteResult.deleted} documents\n`);

    console.log('=== Demo Complete ===');
  } catch (error) {
    console.error('\n✗ Error during demo:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.message.includes('not configured')) {
      console.log('\nℹ️  Make sure to configure the following in your .env file:');
      console.log('   - PINECONE_API_KEY');
      console.log('   - PINECONE_INDEX');
      console.log('   - OPENAI_API_KEY');
      console.log('\n   See RAG_SERVICE_README.md for setup instructions.');
    }
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRAGService()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { demonstrateRAGService, sampleDocuments };

import axios from 'axios';
import ragService from './rag.service.js';

/**
 * AI Agent Service - Generates investment plans using OpenAI with RAG
 */
class AgentService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseURL = 'https://api.openai.com/v1';
    this.maxRetries = parseInt(process.env.OPENAI_MAX_RETRIES || '3');
    this.timeout = parseInt(process.env.OPENAI_TIMEOUT || '30000');
    this.useRAG = process.env.USE_RAG === 'true';
    this.ragTopK = parseInt(process.env.RAG_TOP_K || '5');
  }

  /**
   * Build prompt for investment plan generation
   * @param {Object} portfolioData - Portfolio information
   * @param {Object} goalData - Goal information
   * @param {Object} userData - User information (risk profile, etc.)
   * @param {string} ragContext - Optional RAG context to include
   * @returns {string} Formatted prompt
   */
  buildPrompt(portfolioData, goalData, userData, ragContext = '') {
    const contextSection = ragContext ? `\n${ragContext}\n` : '';
    
    return `You are an expert financial advisor AI. Analyze the following investment scenario and provide a detailed investment plan.
${contextSection}

PORTFOLIO INFORMATION:
- Current Holdings: ${JSON.stringify(portfolioData.holdings || [])}
- Total Portfolio Value: $${portfolioData.totalValue || 0}
- Number of Holdings: ${portfolioData.holdings?.length || 0}

GOAL INFORMATION:
- Goal Name: ${goalData.name || 'N/A'}
- Target Amount: $${goalData.targetAmount || 0}
- Current Amount: $${goalData.currentAmount || 0}
- Target Date: ${goalData.targetDate || 'N/A'}
- Priority: ${goalData.priority || 'medium'}

USER PROFILE:
- Risk Profile: ${userData.riskProfile || 'moderate'}
- Time Horizon: ${goalData.targetDate ? this.calculateTimeHorizon(goalData.targetDate) : 'N/A'}

INSTRUCTIONS:
1. Analyze the current portfolio allocation
2. Recommend optimal allocation percentages (must sum to 100%)
3. Suggest specific buy/sell trades to rebalance
4. Provide a clear explanation of the strategy
5. Include risk considerations

CRITICAL: You MUST respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no explanations outside JSON):

{
  "allocations": {
    "stocks": 60,
    "bonds": 30,
    "cash": 10,
    "other": 0
  },
  "trades": [
    {
      "action": "buy",
      "symbol": "VTI",
      "quantity": 10,
      "reason": "Increase broad market exposure"
    },
    {
      "action": "sell",
      "symbol": "AAPL",
      "quantity": 5,
      "reason": "Reduce single stock concentration"
    }
  ],
  "explanation": "Based on your moderate risk profile and 10-year time horizon, I recommend a 60/30/10 allocation. This balances growth potential with stability.",
  "riskConsiderations": "Market volatility may impact short-term performance. Consider dollar-cost averaging for large purchases."
}

Remember: Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Calculate time horizon in years
   * @param {Date|string} targetDate - Target date
   * @returns {string} Time horizon description
   */
  calculateTimeHorizon(targetDate) {
    if (!targetDate) return 'N/A';
    const target = new Date(targetDate);
    const now = new Date();
    const years = (target - now) / (1000 * 60 * 60 * 24 * 365);
    
    if (years < 1) return 'Less than 1 year';
    if (years < 3) return '1-3 years';
    if (years < 5) return '3-5 years';
    if (years < 10) return '5-10 years';
    return '10+ years';
  }

  /**
   * Extract JSON from text (handles markdown code blocks)
   * @param {string} text - Text that may contain JSON
   * @returns {Object|null} Parsed JSON or null
   */
  extractJSON(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Try direct JSON parse first
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonBlockMatch) {
        try {
          return JSON.parse(jsonBlockMatch[1]);
        } catch (e) {
          // Continue to next attempt
        }
      }

      // Try to find JSON object in text
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          return JSON.parse(jsonObjectMatch[0]);
        } catch (e) {
          // Continue to next attempt
        }
      }

      // Try to find JSON array (if format is different)
      const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
      if (jsonArrayMatch) {
        try {
          return JSON.parse(jsonArrayMatch[0]);
        } catch (e) {
          // Last attempt failed
        }
      }
    }

    return null;
  }

  /**
   * Validate and sanitize AI response
   * @param {Object} parsed - Parsed JSON object
   * @returns {Object} Validated and sanitized object
   */
  validateAndSanitize(parsed) {
    const result = {
      allocations: {
        stocks: 0,
        bonds: 0,
        cash: 0,
        other: 0,
      },
      trades: [],
      explanation: '',
      riskConsiderations: '',
    };

    // Validate allocations
    if (parsed.allocations && typeof parsed.allocations === 'object') {
      result.allocations = {
        stocks: Math.max(0, Math.min(100, parseFloat(parsed.allocations.stocks) || 0)),
        bonds: Math.max(0, Math.min(100, parseFloat(parsed.allocations.bonds) || 0)),
        cash: Math.max(0, Math.min(100, parseFloat(parsed.allocations.cash) || 0)),
        other: Math.max(0, Math.min(100, parseFloat(parsed.allocations.other) || 0)),
      };

      // Normalize to sum to 100%
      const sum = result.allocations.stocks + result.allocations.bonds + 
                  result.allocations.cash + result.allocations.other;
      if (sum > 0) {
        result.allocations.stocks = (result.allocations.stocks / sum) * 100;
        result.allocations.bonds = (result.allocations.bonds / sum) * 100;
        result.allocations.cash = (result.allocations.cash / sum) * 100;
        result.allocations.other = (result.allocations.other / sum) * 100;
      }
    }

    // Validate trades
    if (Array.isArray(parsed.trades)) {
      result.trades = parsed.trades
        .filter(trade => 
          trade && 
          typeof trade === 'object' &&
          ['buy', 'sell'].includes(trade.action?.toLowerCase()) &&
          trade.symbol &&
          typeof trade.quantity === 'number' &&
          trade.quantity > 0
        )
        .map(trade => ({
          action: trade.action.toLowerCase(),
          symbol: String(trade.symbol).toUpperCase().trim(),
          quantity: Math.max(1, Math.floor(trade.quantity)),
          reason: String(trade.reason || '').trim(),
        }));
    }

    // Validate text fields
    result.explanation = String(parsed.explanation || '').trim().substring(0, 1000);
    result.riskConsiderations = String(parsed.riskConsiderations || '').trim().substring(0, 1000);

    return result;
  }

  /**
   * Call OpenAI API
   * @param {string} prompt - Prompt to send
   * @returns {Promise<string>} Raw response text
   */
  async callOpenAI(prompt) {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const url = `${this.baseURL}/chat/completions`;

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor AI. Always respond with valid JSON only, no markdown formatting, no code blocks, just the raw JSON object.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }, // Request JSON mode (GPT-4o and newer)
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: this.timeout,
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return content;
    } catch (error) {
      if (error.response) {
        throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('OpenAI API request failed: No response received');
      } else {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
    }
  }

  /**
   * Generate investment plan with optional RAG context
   * @param {Object} portfolioData - Portfolio information
   * @param {Object} goalData - Goal information
   * @param {Object} userData - User information (must include userId)
   * @returns {Promise<Object>} Structured investment plan
   */
  async generateInvestmentPlan(portfolioData, goalData, userData) {
    try {
      let ragContext = '';
      let retrievedDocs = [];

      // Retrieve relevant context using RAG if enabled
      if (this.useRAG && userData.userId) {
        try {
          // Build query from goal and portfolio data
          const query = this.buildRAGQuery(portfolioData, goalData, userData);
          
          // Retrieve relevant documents
          retrievedDocs = await ragService.retrieveRelevant(
            userData.userId,
            query,
            this.ragTopK
          );

          // Build context string from retrieved documents
          ragContext = ragService.buildContext(retrievedDocs);
          
          console.log(`RAG: Retrieved ${retrievedDocs.length} relevant documents for context`);
        } catch (ragError) {
          // Log RAG errors but don't fail the entire request
          console.error('RAG retrieval failed, continuing without context:', ragError);
        }
      }

      // Build prompt with RAG context
      const prompt = this.buildPrompt(portfolioData, goalData, userData, ragContext);

      // Call OpenAI
      const rawText = await this.callOpenAI(prompt);

      // Extract and parse JSON
      const parsed = this.extractJSON(rawText);

      if (!parsed) {
        throw new Error('Failed to parse JSON from OpenAI response');
      }

      // Validate and sanitize
      const validated = this.validateAndSanitize(parsed);

      return {
        allocations: validated.allocations,
        trades: validated.trades,
        explanation: validated.explanation,
        riskConsiderations: validated.riskConsiderations,
        rawText, // Include raw text for debugging
        ragContext: retrievedDocs.length > 0 ? {
          documentsUsed: retrievedDocs.length,
          topScore: retrievedDocs[0]?.score || 0,
        } : null,
      };
    } catch (error) {
      console.error('Error generating investment plan:', error);
      throw error;
    }
  }

  /**
   * Build RAG query from investment context
   * @param {Object} portfolioData - Portfolio information
   * @param {Object} goalData - Goal information
   * @param {Object} userData - User information
   * @returns {string} Query string for RAG retrieval
   */
  buildRAGQuery(portfolioData, goalData, userData) {
    const parts = [];

    if (goalData.name) {
      parts.push(`investment goal: ${goalData.name}`);
    }

    if (userData.riskProfile) {
      parts.push(`risk profile: ${userData.riskProfile}`);
    }

    if (goalData.targetAmount) {
      parts.push(`target amount: $${goalData.targetAmount}`);
    }

    if (goalData.targetDate) {
      const timeHorizon = this.calculateTimeHorizon(goalData.targetDate);
      parts.push(`time horizon: ${timeHorizon}`);
    }

    if (portfolioData.holdings && portfolioData.holdings.length > 0) {
      const symbols = portfolioData.holdings.map(h => h.symbol).join(', ');
      parts.push(`current holdings: ${symbols}`);
    }

    return parts.join(', ');
  }
}

export default new AgentService();


import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

function AIChatbot({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI investment advisor. I can help you with:

• Portfolio analysis and recommendations
• Market insights and trends
• Investment strategies
• Risk assessment
• Financial planning

How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { icon: '📊', text: 'Analyze my portfolio', action: 'analyze_portfolio' },
    { icon: '💡', text: 'Investment suggestions', action: 'suggestions' },
    { icon: '📈', text: 'Market trends', action: 'market_trends' },
    { icon: '🎯', text: 'Set financial goals', action: 'set_goals' },
  ];

  const generateAIResponse = async (userMessage) => {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('portfolio') || lowerMessage.includes('analyze')) {
      return `Based on your current portfolio analysis:

📊 Portfolio Health: Strong
💰 Total Value: $76,387.50
📈 YTD Return: +14.01%

Key Insights:
• Your portfolio is well-diversified across stocks, crypto, and ETFs
• Technology sector exposure (40%) is performing excellently
• Consider rebalancing: increase bond allocation by 5% for stability
• Your crypto holdings show high volatility - recommend taking partial profits

Would you like me to create a detailed rebalancing plan?`;
    } else if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
      return `Current Market Analysis:

🔥 Hot Sectors:
• Technology: Up 12.5% this quarter
• AI & Semiconductors: Strong momentum
• Renewable Energy: Growing steadily

📉 Cooling Sectors:
• Traditional Retail: Down 3.2%
• Commercial Real Estate: Flat

💡 Opportunities:
1. NVDA showing bullish pattern
2. Bitcoin breaking resistance at $43K
3. S&P 500 dividend stocks undervalued

Recommendation: Consider dollar-cost averaging into tech ETFs over the next 3 months.`;
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('plan')) {
      return `Let's set up your financial goals! 🎯

Based on your profile:
• Annual Income: $75,000
• Recommended Monthly Investment: $937 (15%)

Suggested Goals:
1. Emergency Fund: $37,500 (6 months)
   Timeline: 12-18 months
   
2. Retirement Savings: $1,000,000
   Timeline: 25 years
   Monthly: $1,200
   
3. House Down Payment: $100,000
   Timeline: 5 years
   Monthly: $1,500

Would you like me to create a detailed action plan for any of these goals?`;
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
      return `Risk Assessment for your portfolio:

Current Risk Level: Moderate-Aggressive

⚠️ Risk Factors:
• Crypto allocation (28.3%) is high
• Tech concentration risk
• Low bond/cash reserves

✅ Strengths:
• Good diversification across asset types
• Strong performer stocks
• Regular contributions maintained

Recommendations:
1. Reduce crypto to 15-20% of portfolio
2. Add 10% to bond/stable income assets
3. Set stop-loss orders on volatile holdings
4. Maintain 3-6 months emergency fund

Your risk tolerance: Moderate
Suggested adjustment: Reduce overall volatility by 12%`;
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('invest')) {
      return `Investment Recommendations for Current Market:

🌟 Top Picks:
1. VOO (S&P 500 ETF) - Core holding, low expense
   Entry: Market order
   Target allocation: 30%
   
2. QQQ (Tech ETF) - Growth exposure
   Entry: DCA over 3 months
   Target allocation: 20%
   
3. BTC - Digital asset exposure
   Entry: Below $42K (current: $43,250)
   Target allocation: 10%

⏰ Timing Strategy:
• Split investment across 4 weeks
• Set price alerts for entry points
• Avoid FOMO buying on green days

Budget: Based on your monthly investment capacity of $937, allocate:
• 60% ($562) to index funds
• 30% ($281) to growth stocks
• 10% ($94) to crypto

Ready to execute any of these trades?`;
    } else {
      return `I understand you're asking about "${userMessage}". 

I can help you with:
• Portfolio analysis and optimization
• Market research and trends
• Investment strategy development
• Risk management
• Financial goal setting
• Tax-efficient investing

Could you please provide more details about what specific area you'd like to explore? Or try one of the quick actions below! 💡`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const aiResponse = await generateAIResponse(inputMessage);

    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      },
    ]);
  };

  const handleQuickAction = async (action) => {
    const actionMessages = {
      analyze_portfolio: 'Analyze my current portfolio',
      suggestions: 'Give me investment suggestions',
      market_trends: 'What are the current market trends?',
      set_goals: 'Help me set financial goals',
    };

    setInputMessage(actionMessages[action]);
    // Auto-send after setting
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.chatContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.aiAvatar}>🤖</div>
            <div>
              <h3 style={styles.headerTitle}>AI Investment Advisor</h3>
              <p style={styles.headerStatus}>
                <span style={styles.statusDot}></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.assistantAvatar}>🤖</div>
              )}
              <div
                style={{
                  ...styles.message,
                  ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
                }}
              >
                <div style={styles.messageContent}>{msg.content}</div>
                <div style={styles.messageTime}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div style={styles.userAvatar}>
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={styles.messageWrapper}>
              <div style={styles.assistantAvatar}>🤖</div>
              <div style={{ ...styles.message, ...styles.assistantMessage }}>
                <div style={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              style={styles.quickActionButton}
            >
              <span style={styles.quickActionIcon}>{action.icon}</span>
              {action.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about investing..."
            style={styles.input}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            style={{
              ...styles.sendButton,
              opacity: inputMessage.trim() ? 1 : 0.5,
            }}
          >
            <span style={styles.sendIcon}>📤</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  chatContainer: {
    width: '100%',
    maxWidth: '800px',
    height: '85vh',
    maxHeight: '700px',
    background: '#1a2332',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #242d3d',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #242d3d',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  aiAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '4px 0 0 0',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite',
  },
  closeButton: {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  userMessage: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    borderBottomRightRadius: '4px',
  },
  assistantMessage: {
    background: '#242d3d',
    color: '#d1d5db',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  messageTime: {
    fontSize: '11px',
    marginTop: '6px',
    opacity: 0.7,
  },
  assistantAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  typingIndicator: {
    display: 'flex',
    gap: '6px',
    padding: '8px 0',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    padding: '15px 20px',
    borderTop: '1px solid #242d3d',
    background: '#0f1729',
  },
  quickActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#d1d5db',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quickActionIcon: {
    fontSize: '16px',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #242d3d',
    background: '#0f1729',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
    background: '#242d3d',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  sendIcon: {
    fontSize: '20px',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .typingIndicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    display: inline-block;
    animation: typing 1.4s infinite;
  }
  
  .typingIndicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typingIndicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
    30% { transform: translateY(-10px); opacity: 1; }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AIChatbot;

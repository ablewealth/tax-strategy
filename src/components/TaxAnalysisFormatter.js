/**
 * Swiss Grid-style formatter for Tax Analysis
 * Provides professional, clean formatting with consistent typography and spacing
 */

import React from 'react';
import './SwissGridStyles.css';

// Color system for financial data
const colors = {
  positive: 'text-green-700 bg-green-50 border-green-200',
  negative: 'text-red-700 bg-red-50 border-red-200',
  neutral: 'text-gray-700 bg-gray-50 border-gray-200',
  highlight: 'text-blue-700 bg-blue-50 border-blue-200',
  warning: 'text-amber-700 bg-amber-50 border-amber-200',
};

/**
 * Formats financial numbers with proper styling
 */
export const formatFinancialNumber = (value, type = 'currency') => {
  if (value === 0 || value === null || value === undefined) return null;

  const absValue = Math.abs(value);
  const isNegative = value < 0;

  let formattedValue;
  let colorClass;

  if (type === 'currency') {
    formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue);
    colorClass = isNegative ? colors.negative : colors.positive;
  } else if (type === 'percentage') {
    formattedValue = `${(absValue * 100).toFixed(1)}%`;
    colorClass = isNegative ? colors.negative : colors.positive;
  } else {
    formattedValue = absValue.toLocaleString();
    colorClass = colors.neutral;
  }

  return (
    <span
      className={`font-mono text-sm font-medium ${colorClass} px-2 py-1 rounded border inline-block`}
    >
      {isNegative && type === 'currency' ? '-' : ''}
      {formattedValue}
    </span>
  );
};

/**
 * Extracts and formats strategy rankings with financial data
 */
const extractStrategyRankings = (text) => {
  const rankingSection = text.match(/\*\*Strategy Effectiveness Ranking\*\*(.*?)(?=\*\*|$)/s);
  if (!rankingSection) return null;

  const rankings = [];
  const lines = rankingSection[1].split('\n').filter((line) => line.trim());

  lines.forEach((line) => {
    const match = line.match(/(\d+)\.\s*(.+?)\s*-\s*\$([0-9,]+)/);
    if (match) {
      const [, rank, strategy, amount] = match;
      const numericAmount = parseInt(amount.replace(/,/g, ''));

      // Only include if amount > 0
      if (numericAmount > 0) {
        rankings.push({
          rank: parseInt(rank),
          strategy: strategy.trim(),
          amount: numericAmount,
          roi: line.match(/\(([0-9.]+)%\)/)?.[1] || null,
        });
      }
    }
  });

  return rankings.length > 0 ? rankings : null;
};

/**
 * Extracts risk assessment data
 */
const extractRiskAssessment = (text) => {
  const riskSection = text.match(/\*\*Risk Assessment.*?\*\*(.*?)(?=\*\*|$)/s);
  if (!riskSection) return null;

  const riskData = {
    low: [],
    medium: [],
    high: [],
  };

  const content = riskSection[1];

  // Extract risk categories
  const lowRisk = content.match(/\*\*Low Risk Strategies:\*\*(.*?)(?=\*\*|$)/s)?.[1];
  const mediumRisk = content.match(/\*\*Medium Risk Strategies:\*\*(.*?)(?=\*\*|$)/s)?.[1];
  const highRisk = content.match(/\*\*High Risk Strategies:\*\*(.*?)(?=\*\*|$)/s)?.[1];

  if (lowRisk)
    riskData.low = lowRisk
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());
  if (mediumRisk)
    riskData.medium = mediumRisk
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());
  if (highRisk)
    riskData.high = highRisk
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());

  return riskData;
};

/**
 * Extracts implementation timeline
 */
const extractImplementationPlan = (text) => {
  const planSection = text.match(/\*\*Implementation Priority Matrix\*\*(.*?)(?=\*\*|$)/s);
  if (!planSection) return null;

  const timeline = {
    immediate: [],
    shortTerm: [],
    longTerm: [],
  };

  const content = planSection[1];

  const immediate = content.match(/\*\*Immediate.*?\*\*(.*?)(?=\*\*|$)/s)?.[1];
  const shortTerm = content.match(/\*\*Short-term.*?\*\*(.*?)(?=\*\*|$)/s)?.[1];
  const longTerm = content.match(/\*\*Long-term.*?\*\*(.*?)(?=\*\*|$)/s)?.[1];

  if (immediate)
    timeline.immediate = immediate
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());
  if (shortTerm)
    timeline.shortTerm = shortTerm
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());
  if (longTerm)
    timeline.longTerm = longTerm
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().substring(1).trim());

  return timeline;
};

/**
 * Main Swiss Grid formatter for tax analysis
 */
export const formatTaxAnalysisSwissGrid = (text) => {
  if (!text) return null;

  const rankings = extractStrategyRankings(text);
  const riskAssessment = extractRiskAssessment(text);
  const implementationPlan = extractImplementationPlan(text);

  return (
    <div className="swiss-grid-analysis">
      {/* Strategy Rankings */}
      {rankings && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Strategy Performance Analysis</h2>
          </div>
          <div className="section-content">
            <div className="ranking-container">
              {rankings.map((ranking, index) => (
                <div key={index} className="ranking-item">
                  <div className="ranking-left">
                    <div className="ranking-number">{ranking.rank}</div>
                    <div>
                      <div className="ranking-strategy">{ranking.strategy}</div>
                      {ranking.roi && <span className="ranking-roi">{ranking.roi}% ROI</span>}
                    </div>
                  </div>
                  <div className="ranking-value">
                    {formatFinancialNumber(ranking.amount, 'currency')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Risk Assessment Matrix</h2>
          </div>
          <div className="section-content">
            <div className="risk-container">
              <div className="risk-card risk-low">
                <h3 className="risk-title">Low Risk</h3>
                <ul className="risk-list">
                  {riskAssessment.low.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="risk-card risk-medium">
                <h3 className="risk-title">Medium Risk</h3>
                <ul className="risk-list">
                  {riskAssessment.medium.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="risk-card risk-high">
                <h3 className="risk-title">High Risk</h3>
                <ul className="risk-list">
                  {riskAssessment.high.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Timeline */}
      {implementationPlan && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Implementation Timeline</h2>
          </div>
          <div className="section-content">
            <div className="timeline-container">
              <div className="timeline-card timeline-immediate">
                <h3 className="timeline-title">Immediate (Q1)</h3>
                <ul className="timeline-list">
                  {implementationPlan.immediate.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="timeline-card timeline-short">
                <h3 className="timeline-title">Short-term (Q2-Q3)</h3>
                <ul className="timeline-list">
                  {implementationPlan.shortTerm.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="timeline-card timeline-long">
                <h3 className="timeline-title">Long-term (Q4+)</h3>
                <ul className="timeline-list">
                  {implementationPlan.longTerm.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Filters out zero-value results from strategy data
 */
export const filterNonZeroResults = (strategies, clientData) => {
  return strategies.filter((strategy) => {
    const inputValue = clientData?.[strategy.inputRequired];
    return inputValue && typeof inputValue === 'number' && inputValue > 0;
  });
};

/**
 * Creates a structured analysis prompt that ensures consistent output
 */
export const createStructuredAnalysisPrompt = (strategiesData, clientData, results) => {
  const nonZeroStrategies = filterNonZeroResults(strategiesData, clientData);

  if (nonZeroStrategies.length === 0) return null;

  const totalSavings = results?.cumulative?.totalSavings || 0;
  const baselineTax = results?.cumulative?.baselineTax || 0;
  const optimizedTax = results?.cumulative?.optimizedTax || 0;

  return `You are a senior tax strategist. Create a professional analysis following this EXACT structure:

**Strategy Effectiveness Ranking**

Rank only strategies with positive financial impact (exclude any $0 amounts):
1. [Strategy Name] - $[Amount] total savings ([ROI]%)
2. [Strategy Name] - $[Amount] total savings ([ROI]%)
[Continue for all strategies]

**Risk Assessment & Mitigation**

**Low Risk Strategies:** [List strategies with minimal complexity]
- [Strategy 1 with brief reason]
- [Strategy 2 with brief reason]

**Medium Risk Strategies:** [List strategies requiring documentation]
- [Strategy 1 with brief reason]
- [Strategy 2 with brief reason]

**High Risk Strategies:** [List strategies requiring professional oversight]
- [Strategy 1 with brief reason]
- [Strategy 2 with brief reason]

**Implementation Priority Matrix**

**Immediate (Q1 2025):** [Most urgent actions]
- [Action 1 with specific deadline]
- [Action 2 with specific deadline]

**Short-term (Q2-Q3 2025):** [High ROI setup items]
- [Action 1 with timeline]
- [Action 2 with timeline]

**Long-term (Q4 2025+):** [Multi-year planning]
- [Action 1 with milestone]
- [Action 2 with milestone]

IMPORTANT: Only include strategies with amounts > $0. Use specific dollar amounts. Keep analysis under 400 words.

Current data:
- Total savings: $${totalSavings.toLocaleString()}
- Baseline tax: $${baselineTax.toLocaleString()}
- Optimized tax: $${optimizedTax.toLocaleString()}
- Active strategies: ${nonZeroStrategies.length}`;
};

const TaxAnalysisFormatter = {
  formatTaxAnalysisSwissGrid,
  filterNonZeroResults,
  createStructuredAnalysisPrompt,
};

export default TaxAnalysisFormatter;

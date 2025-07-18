/**
 * Strategy Interaction Formatter
 * Focuses on meaningful strategy interactions and synergies for specific client scenarios
 */

import React from 'react';
import './SwissGridStyles.css';

/**
 * Formats financial numbers with proper styling
 */
const formatFinancialNumber = (value) => {
  if (value === 0 || value === null || value === undefined) return null;

  const absValue = Math.abs(value);
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);

  return (
    <span className="font-mono text-sm font-medium text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block">
      {formattedValue}
    </span>
  );
};

/**
 * Extracts strategy interactions from AI analysis
 */
const extractStrategyInteractions = (text) => {
  const interactions = [];

  // Look for strategy interaction patterns
  const sections = text.split(/\*\*[^*]+\*\*/);

  sections.forEach((section) => {
    if (section.trim()) {
      // Extract meaningful interactions
      const lines = section.split('\n').filter((line) => line.trim());
      const interactionLines = lines.filter(
        (line) =>
          line.includes('→') ||
          line.includes('combined') ||
          line.includes('together') ||
          line.includes('synergy') ||
          line.includes('interaction') ||
          line.includes('amplifies') ||
          line.includes('enhances')
      );

      interactionLines.forEach((line) => {
        if (line.trim().length > 20) {
          interactions.push(line.trim());
        }
      });
    }
  });

  return interactions;
};

/**
 * Extracts key insights from the analysis
 */
const extractKeyInsights = (text) => {
  const insights = [];

  // Look for bullet points or numbered lists
  const bulletPoints = text.match(/[•\-\*]\s*([^\n]+)/g) || [];
  const numberedPoints = text.match(/\d+\.\s*([^\n]+)/g) || [];

  [...bulletPoints, ...numberedPoints].forEach((point) => {
    const cleanPoint = point.replace(/^[•\-\*\d\.\s]+/, '').trim();
    if (cleanPoint.length > 20 && !cleanPoint.includes('$0')) {
      insights.push(cleanPoint);
    }
  });

  return insights.slice(0, 6); // Limit to most important insights
};

/**
 * Extracts state-specific considerations
 */
const extractStateConsiderations = (text, clientState) => {
  const stateConsiderations = [];

  const stateKeywords =
    clientState === 'NJ' ? ['New Jersey', 'NJ', 'Jersey'] : ['New York', 'NY', 'York'];

  const lines = text.split('\n');
  lines.forEach((line) => {
    if (stateKeywords.some((keyword) => line.includes(keyword)) && line.trim().length > 20) {
      stateConsiderations.push(line.trim());
    }
  });

  return stateConsiderations;
};

/**
 * Main strategy interaction formatter
 */
export const formatStrategyInteractions = (text, scenario, results) => {
  if (!text || !scenario || !results) return null;

  const interactions = extractStrategyInteractions(text);
  const keyInsights = extractKeyInsights(text);
  const stateConsiderations = extractStateConsiderations(text, scenario.clientData?.state);

  const totalSavings = results?.cumulative?.totalSavings || 0;
  const currentYearSavings = results?.projections?.[0]?.cumulativeSavings || 0;

  // Get enabled strategies for context
  const enabledStrategies = [];
  if (scenario.enabledStrategies) {
    Object.keys(scenario.enabledStrategies).forEach((strategyId) => {
      if (scenario.enabledStrategies[strategyId]) {
        enabledStrategies.push(strategyId);
      }
    });
  }

  return (
    <div className="swiss-grid-analysis">
      {/* Header Section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Strategy Interaction Analysis</h2>
          <p className="text-sm text-gray-600 mt-2">
            Analysis of how your {enabledStrategies.length} selected strategies work together to
            optimize your tax situation
          </p>
        </div>
        <div className="section-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <div className="text-sm font-medium text-blue-900">Total Annual Savings</div>
              <div className="text-2xl font-bold text-blue-700">
                {formatFinancialNumber(currentYearSavings)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded border border-green-200">
              <div className="text-sm font-medium text-green-900">Multi-Year Savings</div>
              <div className="text-2xl font-bold text-green-700">
                {formatFinancialNumber(totalSavings)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded border border-purple-200">
              <div className="text-sm font-medium text-purple-900">Active Strategies</div>
              <div className="text-2xl font-bold text-purple-700">{enabledStrategies.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Interactions */}
      {interactions.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">How Your Strategies Work Together</h3>
          </div>
          <div className="section-content">
            <div className="space-y-4">
              {interactions.map((interaction, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded p-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-1">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{interaction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      {keyInsights.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Key Insights for Your Situation</h3>
          </div>
          <div className="section-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keyInsights.map((insight, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-1">
                      ✓
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State-Specific Considerations */}
      {stateConsiderations.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">
              {scenario.clientData?.state === 'NJ' ? 'New Jersey' : 'New York'} Specific
              Considerations
            </h3>
          </div>
          <div className="section-content">
            <div className="space-y-3">
              {stateConsiderations.map((consideration, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-1">
                      !
                    </div>
                    <p className="text-yellow-800 text-sm leading-relaxed">{consideration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fallback for basic analysis */}
      {interactions.length === 0 && keyInsights.length === 0 && (
        <div className="section">
          <div className="section-content">
            <div className="bg-gray-50 border border-gray-200 rounded p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Strategy Analysis</h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div>
                  {text.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Creates a focused prompt for strategy interactions
 */
export const createStrategyInteractionPrompt = (enabledStrategies, clientData, results) => {
  const nonZeroStrategies = enabledStrategies.filter((strategy) => {
    const inputValue = clientData?.[strategy.inputRequired];
    return inputValue && typeof inputValue === 'number' && inputValue > 0;
  });

  if (nonZeroStrategies.length < 2) return null;

  const totalSavings = results?.cumulative?.totalSavings || 0;
  const currentYearSavings = results?.projections?.[0]?.cumulativeSavings || 0;

  const clientState = clientData?.state || 'Not specified';
  const stateDisplayName =
    clientState === 'NJ' ? 'New Jersey' : clientState === 'NY' ? 'New York' : clientState;

  const w2Income = clientData?.w2Income || 0;
  const businessIncome = clientData?.businessIncome || 0;
  const shortTermGains = clientData?.shortTermGains || 0;
  const longTermGains = clientData?.longTermGains || 0;

  const strategyList = nonZeroStrategies
    .map((s) => {
      const amount = clientData[s.inputRequired] || 0;
      return `${s.name}: $${amount.toLocaleString()}`;
    })
    .join('\n');

  return `You are analyzing the tax strategy interactions for a specific client. Focus ONLY on how these strategies work together, their synergies, and specific impacts for this client.

CLIENT PROFILE:
- Location: ${stateDisplayName}
- W2 Income: $${w2Income.toLocaleString()}
- Business Income: $${businessIncome.toLocaleString()}
- Capital Gains: $${(shortTermGains + longTermGains).toLocaleString()}
- Current Tax Savings: $${currentYearSavings.toLocaleString()}

SELECTED STRATEGIES (Investment/Contribution Amounts):
${strategyList}

**IMPORTANT DATA CONTEXT:**
- The amounts above are INVESTMENTS/CONTRIBUTIONS, NOT tax deductions
- Section 179: Investment amount, creates depreciation deduction
- 401(k)/Solo 401(k): Contribution amount, reduces taxable income dollar-for-dollar
- Charitable: Contribution amount, may have percentage limitations
- Oil & Gas: Investment amount, creates 70% deduction typically
- Each strategy type has different tax treatment and deduction calculations
- DO NOT sum these amounts - they represent different types of financial commitments

ANALYSIS FOCUS:
1. **Strategy Interactions**: How do these specific strategies enhance each other? For example:
   - How does Section 179 depreciation interact with QBI deduction?
   - How do retirement contributions affect the tax impact of other strategies?
   - What are the compounding effects when strategies are combined?

2. **Client-Specific Benefits**: Based on their income profile and ${stateDisplayName} residence:
   - Which combination provides maximum benefit for their tax bracket?
   - How does their state affect the strategy effectiveness?
   - What are the specific dollar benefits of combining these strategies?

3. **${stateDisplayName} Considerations**: State-specific impacts:
   - How does ${stateDisplayName} tax law affect these strategies?
   - Are there state-specific advantages or limitations?
   - What are the net federal vs state benefits?
   
   **CRITICAL TAX LAW UPDATES for 2025:**
   - New Jersey: Section 179 depreciation now requires a $975,000 add-back (not $25,000 as previously)
   - New Jersey: 401(k) deferrals are subject to NJ state income tax
   - New York: Generally allows federal deductions for Section 179 and retirement contributions
   - Both states: QBI deduction is federal-only, no state equivalent

IMPORTANT: 
- Focus on INTERACTIONS and SYNERGIES between selected strategies
- Provide specific dollar amounts and percentages where possible
- Explain how strategies work together, not just individually
- Keep under 300 words
- Be specific to this client's situation
- Don't include generic advice or broad recommendations

**CRITICAL: VERIFY ALL NUMBERS BEFORE RESPONDING**
- ONLY use the dollar amounts provided in the CLIENT PROFILE and SELECTED STRATEGIES sections above
- DO NOT add up all strategy amounts to create a "total deduction" - this is mathematically incorrect
- DO NOT calculate tax deductions manually - the system handles complex calculations
- Each strategy amount represents a specific contribution/investment, not a tax deduction
- Tax deductions are calculated differently for each strategy type with various limitations
- If you mention any dollar figure, it MUST match exactly what was provided in the data
- The "Current Tax Savings" figure is the actual calculated benefit - use this for savings discussions
- Double-check that your calculations make sense relative to the client's income levels
- If unsure about a calculation, acknowledge the limitation rather than guess
- Focus on HOW strategies work together, not on recalculating the numbers

Generate a focused analysis of how these ${nonZeroStrategies.length} strategies work together for this specific client scenario.

**BEFORE SUBMITTING YOUR RESPONSE:**
1. Re-read your response and verify every number matches the data provided above
2. Ensure you haven't created any "total deduction" or summed incompatible amounts
3. Confirm your analysis focuses on strategy interactions, not individual calculations
4. Check that any savings references use the "Current Tax Savings" figure provided`;
};

export default {
  formatStrategyInteractions,
  createStrategyInteractionPrompt,
};

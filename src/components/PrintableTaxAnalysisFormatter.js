/**
 * Printable Swiss Grid-style formatter for Tax Analysis
 * Provides professional, clean formatting optimized for print output
 */

import React from 'react';

// Print-optimized Swiss Grid styles
const printStyles = {
  container: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
    fontSize: '8pt',
    lineHeight: '1.3',
    color: '#333',
    maxWidth: '100%',
  },
  section: {
    marginBottom: '1rem',
    pageBreakInside: 'avoid',
  },
  sectionTitle: {
    fontSize: '10pt',
    fontWeight: '700',
    color: '#111',
    marginBottom: '0.5rem',
    paddingBottom: '0.25rem',
    borderBottom: '1px solid #ddd',
    fontFamily: "'Lato', sans-serif",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  gridItem: {
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    borderRadius: '2px',
    pageBreakInside: 'avoid',
  },
  rankingItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.4rem 0.6rem',
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    borderRadius: '2px',
    marginBottom: '0.25rem',
  },
  rankNumber: {
    width: '20px',
    height: '20px',
    backgroundColor: '#041D5B',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '7pt',
    fontWeight: '700',
    marginRight: '0.5rem',
  },
  currencyValue: {
    fontFamily: "'Courier New', monospace",
    fontWeight: '700',
    color: '#2e7d32',
    fontSize: '7pt',
  },
  riskLow: {
    backgroundColor: '#f0fdf4',
    borderColor: '#d0e0d0',
    color: '#166534',
  },
  riskMedium: {
    backgroundColor: '#fefce8',
    borderColor: '#e0d0a0',
    color: '#854d0e',
  },
  riskHigh: {
    backgroundColor: '#fef2f2',
    borderColor: '#f0c0c0',
    color: '#991b1b',
  },
  timelineImmediate: {
    backgroundColor: '#eff6ff',
    borderColor: '#93c5fd',
    color: '#1e40af',
  },
  timelineShort: {
    backgroundColor: '#f3e8ff',
    borderColor: '#c4b5fd',
    color: '#7c3aed',
  },
  timelineLong: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    color: '#4b5563',
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: '8pt',
    marginBottom: '0.25rem',
  },
  itemList: {
    paddingLeft: '0',
    margin: '0',
    listStyle: 'none',
  },
  itemListItem: {
    fontSize: '7pt',
    marginBottom: '0.2rem',
    paddingLeft: '0.5rem',
    position: 'relative',
  },
  bullet: {
    content: '•',
    position: 'absolute',
    left: '0',
    color: '#666',
  },
};

/**
 * Formats financial numbers for print
 */
const formatPrintCurrency = (value) => {
  if (value === 0 || value === null || value === undefined) return null;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
};

/**
 * Extracts and formats strategy rankings for print
 */
const extractPrintStrategyRankings = (text) => {
  const rankingSection = text.match(/\\*\\*Strategy Effectiveness Ranking\\*\\*(.*?)(?=\\*\\*|$)/s);
  if (!rankingSection) return null;
  
  const rankings = [];
  const lines = rankingSection[1].split('\\n').filter(line => line.trim());
  
  lines.forEach(line => {
    const match = line.match(/(\\d+)\\.\\ *(.+?)\\ *-\\ *\\$([0-9,]+)/);
    if (match) {
      const [, rank, strategy, amount] = match;
      const numericAmount = parseInt(amount.replace(/,/g, ''));
      
      // Only include if amount > 0
      if (numericAmount > 0) {
        rankings.push({
          rank: parseInt(rank),
          strategy: strategy.trim(),
          amount: numericAmount,
          roi: line.match(/\\(([0-9.]+)%\\)/)?.[1] || null,
        });
      }
    }
  });
  
  return rankings.length > 0 ? rankings : null;
};

/**
 * Extracts risk assessment for print
 */
const extractPrintRiskAssessment = (text) => {
  const riskSection = text.match(/\\*\\*Risk Assessment.*?\\*\\*(.*?)(?=\\*\\*|$)/s);
  if (!riskSection) return null;
  
  const riskData = {
    low: [],
    medium: [],
    high: [],
  };
  
  const content = riskSection[1];
  
  const lowRisk = content.match(/\\*\\*Low Risk Strategies:\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  const mediumRisk = content.match(/\\*\\*Medium Risk Strategies:\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  const highRisk = content.match(/\\*\\*High Risk Strategies:\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  
  if (lowRisk) riskData.low = lowRisk.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  if (mediumRisk) riskData.medium = mediumRisk.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  if (highRisk) riskData.high = highRisk.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  
  return riskData;
};

/**
 * Extracts implementation timeline for print
 */
const extractPrintImplementationPlan = (text) => {
  const planSection = text.match(/\\*\\*Implementation Priority Matrix\\*\\*(.*?)(?=\\*\\*|$)/s);
  if (!planSection) return null;
  
  const timeline = {
    immediate: [],
    shortTerm: [],
    longTerm: [],
  };
  
  const content = planSection[1];
  
  const immediate = content.match(/\\*\\*Immediate.*?\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  const shortTerm = content.match(/\\*\\*Short-term.*?\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  const longTerm = content.match(/\\*\\*Long-term.*?\\*\\*(.*?)(?=\\*\\*|$)/s)?.[1];
  
  if (immediate) timeline.immediate = immediate.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  if (shortTerm) timeline.shortTerm = shortTerm.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  if (longTerm) timeline.longTerm = longTerm.split('\\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim());
  
  return timeline;
};

/**
 * Main printable Swiss Grid formatter
 */
export const formatPrintableTaxAnalysis = (text) => {
  if (!text) return null;
  
  const rankings = extractPrintStrategyRankings(text);
  const riskAssessment = extractPrintRiskAssessment(text);
  const implementationPlan = extractPrintImplementationPlan(text);
  
  return (
    <div style={printStyles.container}>
      {/* Strategy Rankings */}
      {rankings && (
        <div style={printStyles.section}>
          <h3 style={printStyles.sectionTitle}>Strategy Performance Analysis</h3>
          <div>
            {rankings.map((ranking, index) => (
              <div key={index} style={printStyles.rankingItem}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={printStyles.rankNumber}>{ranking.rank}</div>
                  <div style={{ fontSize: '7pt', fontWeight: '600' }}>
                    {ranking.strategy}
                    {ranking.roi && (
                      <span style={{ fontSize: '6pt', color: '#666', marginLeft: '0.5rem' }}>
                        ({ranking.roi}% ROI)
                      </span>
                    )}
                  </div>
                </div>
                <div style={printStyles.currencyValue}>
                  {formatPrintCurrency(ranking.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Risk Assessment */}
      {riskAssessment && (
        <div style={printStyles.section}>
          <h3 style={printStyles.sectionTitle}>Risk Assessment Matrix</h3>
          <div style={printStyles.grid}>
            <div style={{ ...printStyles.gridItem, ...printStyles.riskLow }}>
              <div style={printStyles.itemTitle}>Low Risk</div>
              <ul style={printStyles.itemList}>
                {riskAssessment.low.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...printStyles.gridItem, ...printStyles.riskMedium }}>
              <div style={printStyles.itemTitle}>Medium Risk</div>
              <ul style={printStyles.itemList}>
                {riskAssessment.medium.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...printStyles.gridItem, ...printStyles.riskHigh }}>
              <div style={printStyles.itemTitle}>High Risk</div>
              <ul style={printStyles.itemList}>
                {riskAssessment.high.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Implementation Timeline */}
      {implementationPlan && (
        <div style={printStyles.section}>
          <h3 style={printStyles.sectionTitle}>Implementation Timeline</h3>
          <div style={printStyles.grid}>
            <div style={{ ...printStyles.gridItem, ...printStyles.timelineImmediate }}>
              <div style={printStyles.itemTitle}>Immediate (Q1)</div>
              <ul style={printStyles.itemList}>
                {implementationPlan.immediate.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...printStyles.gridItem, ...printStyles.timelineShort }}>
              <div style={printStyles.itemTitle}>Short-term (Q2-Q3)</div>
              <ul style={printStyles.itemList}>
                {implementationPlan.shortTerm.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ ...printStyles.gridItem, ...printStyles.timelineLong }}>
              <div style={printStyles.itemTitle}>Long-term (Q4+)</div>
              <ul style={printStyles.itemList}>
                {implementationPlan.longTerm.map((item, index) => (
                  <li key={index} style={printStyles.itemListItem}>
                    <span style={printStyles.bullet}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default formatPrintableTaxAnalysis;
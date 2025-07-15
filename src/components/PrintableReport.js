import React, { forwardRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  RETIREMENT_STRATEGIES,
  STRATEGY_LIBRARY,
  formatCurrency,
  formatPercentage,
} from '../constants';
import { formatPrintableTaxAnalysis } from './PrintableTaxAnalysisFormatter';

// Function to format numbers without decimals for printable report
const formatCurrencyNoDecimals = (amount) => {
  return Math.round(amount).toLocaleString();
};

// --- Compact Style Definitions for Dense Data Layout ---
const styles = {
  page: {
    fontFamily: "'Roboto', sans-serif",
    padding: '1.5cm', // Reduced padding for more content
    color: '#333',
    lineHeight: 1.3, // Tighter line spacing
    fontSize: '9pt', // Smaller base font
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem', // Reduced padding
    marginBottom: '1rem', // Reduced margin
  },
  logo: {
    height: '20px', // Smaller logo
  },
  headerText: {
    textAlign: 'right',
  },
  reportTitle: {
    fontFamily: "'Lato', sans-serif",
    fontSize: '16pt', // Smaller title
    fontWeight: '900',
    margin: 0,
    color: '#111',
  },
  clientInfo: {
    fontSize: '9pt',
    color: '#555',
    lineHeight: 1.3,
  },
  section: {
    marginBottom: '1rem', // Reduced section spacing
    pageBreakInside: 'avoid',
  },
  sectionTitle: {
    fontFamily: "'Lato', sans-serif",
    fontSize: '12pt', // Smaller section titles
    fontWeight: '700',
    borderBottom: '1px solid #ddd',
    paddingBottom: '0.25rem', // Reduced padding
    marginBottom: '0.5rem', // Reduced margin
    color: '#111',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // 3 columns instead of 2
    gap: '0.5rem 1rem', // Reduced gaps
  },
  metric: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    padding: '0.5rem', // Reduced padding
    borderRadius: '2px',
  },
  metricLabel: {
    fontSize: '8pt', // Smaller labels
    color: '#666',
    marginBottom: '0.15rem',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  metricValue: {
    fontSize: '12pt', // Smaller values
    fontWeight: '700',
    color: '#111',
  },
  highlightMetric: {
    backgroundColor: '#f0fdf0',
    borderColor: '#d0e0d0',
  },
  highlightValue: {
    color: '#2e7d32',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '8pt', // Smaller table font
  },
  th: {
    textAlign: 'left',
    padding: '0.3rem 0.5rem', // Reduced padding
    borderBottom: '1.5px solid #333',
    fontFamily: "'Lato', sans-serif",
    fontWeight: '700',
    fontSize: '8pt',
  },
  td: {
    textAlign: 'left',
    padding: '0.3rem 0.5rem', // Reduced padding
    borderBottom: '1px solid #eee',
    fontSize: '8pt',
  },
  tdRight: {
    textAlign: 'right',
    padding: '0.3rem 0.5rem', // Reduced padding
    borderBottom: '1px solid #eee',
    fontSize: '8pt',
  },
  insightContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem', // Reduced gap
  },
  insightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem', // Reduced gap
  },
  insightCard: {
    border: '1px solid #eee',
    borderRadius: '2px',
    padding: '0.5rem', // Reduced padding
    backgroundColor: '#fefefe',
  },
  insightTitle: {
    fontFamily: "'Lato', sans-serif",
    fontWeight: '700',
    fontSize: '8pt', // Smaller insight titles
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginBottom: '0.25rem',
  },
  insightText: {
    fontSize: '8pt', // Smaller insight text
    color: '#444',
    paddingLeft: '1rem', // Reduced padding
    lineHeight: 1.2,
  },
  warningInsightCard: {
    backgroundColor: '#fffdf0',
    borderColor: '#f0e0c0',
  },
  footer: {
    marginTop: '1rem', // Reduced margin
    paddingTop: '0.5rem', // Reduced padding
    borderTop: '1px solid #ccc',
    fontSize: '6pt', // Smaller footer text
    color: '#777',
    lineHeight: 1.2,
    pageBreakBefore: 'auto', // Allow natural page breaks for compact layout
  },
  strategyDetail: {
    marginBottom: '0.75rem', // Reduced margin
    pageBreakInside: 'avoid',
  },
  strategyDetailTitle: {
    fontFamily: "'Lato', sans-serif",
    fontSize: '10pt', // Smaller strategy titles
    fontWeight: '700',
    color: '#111',
    marginBottom: '0.25rem', // Reduced margin
  },
  strategyDetailDescription: {
    fontSize: '8pt', // Smaller descriptions
    color: '#444',
    lineHeight: 1.3,
  },
  interactionText: {
    fontSize: '8pt', // Smaller interaction text
    color: '#444',
    lineHeight: 1.3,
    backgroundColor: '#f8f8f8',
    border: '1px solid #eee',
    padding: '0.5rem', // Reduced padding
    borderRadius: '2px',
  },
  loadingText: {
    fontSize: '8pt', // Smaller loading text
    color: '#666',
    fontStyle: 'italic',
  },
  // New compact styles for better data density
  compactTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '7pt', // Even smaller for dense data
    marginBottom: '0.5rem',
  },
  compactTh: {
    textAlign: 'left',
    padding: '0.2rem 0.3rem',
    borderBottom: '1px solid #333',
    fontFamily: "'Lato', sans-serif",
    fontWeight: '700',
    fontSize: '7pt',
    backgroundColor: '#f5f5f5',
  },
  compactTd: {
    textAlign: 'left',
    padding: '0.2rem 0.3rem',
    borderBottom: '1px solid #eee',
    fontSize: '7pt',
  },
  compactTdRight: {
    textAlign: 'right',
    padding: '0.2rem 0.3rem',
    borderBottom: '1px solid #eee',
    fontSize: '7pt',
  },
};

// Compact data table for dense information display
const DataTable = ({ data, title, federalColor = '#041D5B', stateColor = '#083038' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <h3
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            fontSize: '10pt',
          }}
        >
          {title}
        </h3>
        <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666', fontSize: '8pt' }}>
          No data available for analysis.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          fontSize: '10pt',
        }}
      >
        {title}
      </h3>
      <table style={styles.compactTable}>
        <thead>
          <tr>
            <th style={styles.compactTh}>Scenario</th>
            <th style={{ ...styles.compactTh, textAlign: 'right' }}>Federal Tax</th>
            <th style={{ ...styles.compactTh, textAlign: 'right' }}>State Tax</th>
            <th style={{ ...styles.compactTh, textAlign: 'right' }}>Total Tax</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td style={styles.compactTd}>{item.scenario}</td>
              <td style={{ ...styles.compactTdRight, color: federalColor, fontWeight: 'bold' }}>
                {formatCurrency(item.federalTax || 0)}
              </td>
              <td style={{ ...styles.compactTdRight, color: stateColor, fontWeight: 'bold' }}>
                {formatCurrency(item.stateTax || 0)}
              </td>
              <td style={{ ...styles.compactTdRight, fontWeight: 'bold' }}>
                {formatCurrency((item.federalTax || 0) + (item.stateTax || 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Main Report Component ---
const PrintableReport = forwardRef(({ scenario, results, years, strategyAnalysis }, ref) => {
  // Use analysis from main app instead of generating our own
  const interactionExplanation = strategyAnalysis?.explanation || '';
  const loadingInteraction = strategyAnalysis?.loading || false;
  const interactionError = strategyAnalysis?.error || '';
  
  // Analysis is provided from the main app component via props

  // Add error boundary logging
  useEffect(() => {
    // Debug environment variable loading
    // Environment variable debug logging removed
  }, [scenario, results, years]);

  const allStrategies = useMemo(() => [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES], []);
  const enabledStrategies = useMemo(() => {
    return allStrategies.filter((strategy) => {
      const isEnabled = scenario.enabledStrategies?.[strategy.id];
      const inputValue = scenario.clientData?.[strategy.inputRequired];
      return isEnabled && typeof inputValue === 'number' && inputValue > 0;
    });
  }, [allStrategies, scenario.enabledStrategies, scenario.clientData]);

  // Analysis is now provided from the main app component

  // Enhanced validation with better error handling
  if (!results || !scenario) {
    return (
      <div
        ref={ref}
        style={{
          ...styles.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}
        >
          Report Data Missing
        </h1>
        <p style={{ fontSize: '14pt', color: '#666' }}>
          Unable to generate report. Please ensure all required data is available.
        </p>
        <p style={{ fontSize: '10pt', color: '#999', marginTop: '1rem' }}>
          Debug: scenario={!!scenario}, results={!!results}
        </p>
      </div>
    );
  }

  if (!results.cumulative || !results.projections || results.projections.length === 0) {
    return (
      <div
        ref={ref}
        style={{
          ...styles.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}
        >
          Calculating Report Data...
        </h1>
        <p style={{ fontSize: '14pt', color: '#666' }}>
          Please wait while we process your tax optimization strategies.
        </p>
        <p style={{ fontSize: '10pt', color: '#999', marginTop: '1rem' }}>
          Debug: cumulative={!!results.cumulative}, projections={!!results.projections}, length=
          {results.projections?.length || 0}
        </p>
      </div>
    );
  }

  // Additional validation for scenario data
  if (!scenario.clientData) {
    return (
      <div
        ref={ref}
        style={{
          ...styles.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}
        >
          Client Data Missing
        </h1>
        <p style={{ fontSize: '14pt', color: '#666' }}>
          Unable to generate report. Please ensure client data is provided.
        </p>
      </div>
    );
  }

  try {
    const { cumulative, projections, withStrategies } = results;

    // Safe data extraction with fallbacks
    const safeResults = {
      baselineTax: cumulative?.baselineTax || 0,
      optimizedTax: cumulative?.optimizedTax || 0,
      totalSavings: cumulative?.totalSavings || 0,
      capitalAllocated: cumulative?.capitalAllocated || 0,
    };

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const savingsPercentage =
      safeResults.baselineTax > 0 ? safeResults.totalSavings / safeResults.baselineTax : 0;

    // Safe insights extraction with null checks
    const benefits = withStrategies?.insights?.filter((i) => i?.type === 'success') || [];
    const considerations = withStrategies?.insights?.filter((i) => i?.type === 'warning') || [];

    // Safe chart data preparation
    let taxBreakdownData = [];
    try {
      if (projections && projections.length > 0 && projections[0]) {
        const baseline = projections[0].baseline || {};
        const optimized = projections[0].withStrategies || {};

        taxBreakdownData = [
          {
            scenario: 'Baseline',
            federalTax: baseline.fedTax || 0,
            stateTax: baseline.stateTax || 0,
          },
          {
            scenario: 'Optimized',
            federalTax: optimized.fedTax || 0,
            stateTax: optimized.stateTax || 0,
          },
        ];
      }
    } catch (e) {
      taxBreakdownData = [];
    }

    return (
      <div ref={ref} style={styles.page}>
        <header style={styles.header}>
          <img
            src="https://ablewealth.com/AWM%20Logo%203.png"
            alt="Able Wealth Management Logo"
            style={styles.logo}
          />
          <div style={styles.headerText}>
            <h1 style={styles.reportTitle}>Tax Optimization Analysis</h1>
            <p style={styles.clientInfo}>
              Prepared for: <strong>{scenario.clientData?.clientName || 'Client'}</strong>
              <br />
              Date of Analysis: {today}
            </p>
          </div>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Client Profile & Tax Situation</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Annual W2 Income</div>
              <div style={styles.metricValue}>{formatCurrency(scenario.clientData?.w2Income || 0)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Business Income</div>
              <div style={styles.metricValue}>{formatCurrency(scenario.clientData?.businessIncome || 0)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Capital Gains</div>
              <div style={styles.metricValue}>{formatCurrency((scenario.clientData?.shortTermGains || 0) + (scenario.clientData?.longTermGains || 0))}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Tax Residence</div>
              <div style={styles.metricValue}>{scenario.clientData?.state === 'NJ' ? 'New Jersey' : scenario.clientData?.state === 'NY' ? 'New York' : scenario.clientData?.state || 'Not specified'}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Filing Status</div>
              <div style={styles.metricValue}>{scenario.clientData?.filingStatus || 'Not specified'}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Projection Years</div>
              <div style={styles.metricValue}>{scenario.clientData?.projectionYears || 5}</div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Baseline Tax</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.baselineTax)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Optimized Tax</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.optimizedTax)}</div>
            </div>
            <div style={{ ...styles.metric, ...styles.highlightMetric }}>
              <div style={{ ...styles.metricLabel, color: '#2e7d32' }}>Total Savings</div>
              <div style={{ ...styles.metricValue, ...styles.highlightValue }}>
                {formatCurrency(safeResults.totalSavings)}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Tax Rate Reduction</div>
              <div style={styles.metricValue}>{formatPercentage(savingsPercentage)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Capital Allocated</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.capitalAllocated)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>ROI on Strategies</div>
              <div style={styles.metricValue}>
                {safeResults.capitalAllocated > 0 
                  ? formatPercentage(safeResults.totalSavings / safeResults.capitalAllocated)
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </section>

        {enabledStrategies.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Strategy Effectiveness Analysis</h2>
            <table style={styles.compactTable}>
              <thead>
                <tr>
                  <th style={styles.compactTh}>Strategy / Plan</th>
                  <th style={{ ...styles.compactTh, textAlign: 'right' }}>Amount</th>
                  <th style={{ ...styles.compactTh, textAlign: 'right' }}>Est. Annual Savings</th>
                  <th style={{ ...styles.compactTh, textAlign: 'right' }}>Effective Rate</th>
                </tr>
              </thead>
              <tbody>
                {enabledStrategies.map((strategy) => {
                  const amount = scenario.clientData[strategy.inputRequired] || 0;
                  const estimatedSavings = amount * 0.3; // Conservative estimate
                  const effectiveRate = amount > 0 ? (estimatedSavings / amount) : 0;
                  
                  return (
                    <tr key={strategy.id}>
                      <td style={styles.compactTd}>{strategy.name}</td>
                      <td style={styles.compactTdRight}>
                        {formatCurrency(amount)}
                      </td>
                      <td style={{ ...styles.compactTdRight, color: '#059669', fontWeight: 'bold' }}>
                        {formatCurrency(estimatedSavings)}
                      </td>
                      <td style={{ ...styles.compactTdRight, color: '#1f2937', fontWeight: 'bold' }}>
                        {formatPercentage(effectiveRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {enabledStrategies.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Detailed Strategy Explanations</h2>
            {enabledStrategies.map((strategy) => (
              <div key={`detail-${strategy.id}`} style={styles.strategyDetail}>
                <h3 style={styles.strategyDetailTitle}>{strategy.name}</h3>
                <p style={styles.strategyDetailDescription}>{strategy.description}</p>
              </div>
            ))}
          </section>
        )}

        {enabledStrategies.length > 1 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Strategic Tax Optimization Analysis</h2>
            {loadingInteraction ? (
              <div style={{
                ...styles.interactionText,
                color: '#6b7280',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}>
                <p>Generating comprehensive strategy analysis...</p>
                <p style={{ fontSize: '7pt', marginTop: '0.5rem' }}>
                  Analyzing strategy interactions, risk assessment, and implementation guidance
                </p>
              </div>
            ) : interactionError ? (
              <div
                style={{
                  ...styles.interactionText,
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #fecaca',
                }}
              >
                <strong>AI Analysis Unavailable:</strong> {interactionError}
                {interactionError.includes('API key') && (
                  <div style={{ marginTop: '0.5rem', fontSize: '7pt', color: '#991b1b' }}>
                    Note: AI-powered strategy analysis requires API configuration
                  </div>
                )}
              </div>
            ) : interactionExplanation ? (
              <div style={{
                ...styles.interactionText,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                lineHeight: 1.4
              }}>
                <div style={{ 
                  fontSize: '9pt', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem', 
                  color: '#475569',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.25rem'
                }}>
                  Professional Strategy Analysis
                </div>
                {formatPrintableTaxAnalysis(interactionExplanation) || (
                  <div style={{ fontSize: '8pt', lineHeight: 1.5 }}>
                    {interactionExplanation.split('\n').map((line, index) => (
                      <p key={index} style={{ margin: '0.5rem 0' }}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                ...styles.interactionText,
                color: '#6b7280',
                fontStyle: 'italic',
                textAlign: 'center',
                backgroundColor: '#f9fafb'
              }}>
                Strategy analysis will be generated when multiple strategies are selected and configured.
              </div>
            )}
          </section>
        )}

        {(benefits.length > 0 || considerations.length > 0) && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Implementation Guidance & Considerations</h2>
            
            {benefits.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  fontSize: '9pt', 
                  fontWeight: 'bold', 
                  color: '#059669', 
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #d1fae5',
                  paddingBottom: '0.25rem'
                }}>
                  Strategic Benefits
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {benefits.slice(0, 8).map((insight, index) => (
                    <div key={`b-${index}`} style={{
                      ...styles.insightCard,
                      backgroundColor: '#f0fdf4',
                      borderColor: '#d1fae5',
                      padding: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#059669', fontSize: '8pt', fontWeight: 'bold' }}>✓</span>
                        <p style={{ ...styles.insightText, fontSize: '7pt', margin: 0 }}>
                          {insight?.text || 'Benefit information not available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {considerations.length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: '9pt', 
                  fontWeight: 'bold', 
                  color: '#d97706', 
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #fed7aa',
                  paddingBottom: '0.25rem'
                }}>
                  Implementation Considerations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {considerations.slice(0, 8).map((insight, index) => (
                    <div key={`c-${index}`} style={{
                      ...styles.insightCard,
                      backgroundColor: '#fffbeb',
                      borderColor: '#fed7aa',
                      padding: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#d97706', fontSize: '8pt', fontWeight: 'bold' }}>⚠</span>
                        <p style={{ ...styles.insightText, fontSize: '7pt', margin: 0 }}>
                          {insight?.text || 'Consideration information not available'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Tax Liability Analysis - Data Table Only */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Tax Liability Analysis</h2>
          <DataTable
            data={taxBreakdownData}
            title="Federal vs State Tax Breakdown"
            federalColor="#041D5B"
            stateColor="#083038"
          />
        </section>

        {projections && projections.length > 1 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Multi-Year Projections</h2>

            {/* Annual Tax Comparison Table */}
            <div style={{ marginBottom: '1rem' }}>
              <h3
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  fontSize: '10pt',
                }}
              >
                Annual Tax Liability Comparison
              </h3>
              <table style={styles.compactTable}>
                <thead>
                  <tr>
                    <th style={styles.compactTh}>Year</th>
                    <th style={{ ...styles.compactTh, textAlign: 'right' }}>Baseline Tax</th>
                    <th style={{ ...styles.compactTh, textAlign: 'right' }}>Optimized Tax</th>
                    <th style={{ ...styles.compactTh, textAlign: 'right' }}>Annual Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {projections
                    .map((proj, index) => {
                      if (!proj || typeof proj.year === 'undefined') return null;
                      try {
                        const baselineTax = proj.baseline?.totalTax || 0;
                        const optimizedTax = proj.withStrategies?.totalTax || 0;
                        const annualSavings = Math.max(0, baselineTax - optimizedTax);

                        return (
                          <tr key={index}>
                            <td style={styles.compactTd}>Year {proj.year}</td>
                            <td
                              style={{
                                ...styles.compactTdRight,
                                color: '#9ca3af',
                                fontWeight: 'bold',
                              }}
                            >
                              {formatCurrency(baselineTax)}
                            </td>
                            <td
                              style={{
                                ...styles.compactTdRight,
                                color: '#041D5B',
                                fontWeight: 'bold',
                              }}
                            >
                              {formatCurrency(optimizedTax)}
                            </td>
                            <td
                              style={{
                                ...styles.compactTdRight,
                                color: '#059669',
                                fontWeight: 'bold',
                              }}
                            >
                              {formatCurrency(annualSavings)}
                            </td>
                          </tr>
                        );
                      } catch (e) {
                        return null;
                      }
                    })
                    .filter(Boolean)}
                </tbody>
              </table>
            </div>

            {/* Cumulative Savings Table */}
            <div style={{ marginBottom: '1rem' }}>
              <h3
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  fontSize: '10pt',
                }}
              >
                Cumulative Savings Over Time
              </h3>
              <table style={styles.compactTable}>
                <thead>
                  <tr>
                    <th style={styles.compactTh}>Year</th>
                    <th style={{ ...styles.compactTh, textAlign: 'right' }}>Cumulative Savings</th>
                    <th style={{ ...styles.compactTh, textAlign: 'right' }}>Savings Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {projections
                    .map((proj, index) => {
                      if (
                        !proj ||
                        typeof proj.year === 'undefined' ||
                        proj.cumulativeSavings === undefined ||
                        proj.cumulativeSavings === null
                      )
                        return null;

                      try {
                        const baselineTax = proj.baseline?.totalTax || 0;
                        const optimizedTax = proj.withStrategies?.totalTax || 0;
                        const savingsRate =
                          baselineTax > 0
                            ? Math.max(0, (baselineTax - optimizedTax) / baselineTax)
                            : 0;

                        return (
                          <tr key={index}>
                            <td style={styles.compactTd}>Year {proj.year}</td>
                            <td
                              style={{
                                ...styles.compactTdRight,
                                color: '#f59e0b',
                                fontWeight: 'bold',
                              }}
                            >
                              {formatCurrency(Math.max(0, proj.cumulativeSavings || 0))}
                            </td>
                            <td style={{ ...styles.compactTdRight, fontWeight: 'bold' }}>
                              {formatPercentage(savingsRate)}
                            </td>
                          </tr>
                        );
                      } catch (e) {
                        return null;
                      }
                    })
                    .filter(Boolean)}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer style={styles.footer}>
          <p>
            <strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary
            modeling tool developed by Able Wealth Management LLC ("AWM") for internal use by its
            advisors and planning professionals. This tool presents hypothetical tax optimization
            scenarios using inputs provided by the user and applies assumptions and tax rules in
            effect as of May 2025. The outputs generated are for illustrative purposes only and are
            intended to demonstrate the potential impact of various tax planning strategies under
            assumed conditions. The results are not a guarantee of future tax savings. Tax laws are
            complex and subject to change. AWM does not provide legal or tax advice. Please consult
            with your qualified professional tax advisor and legal counsel before implementing any
            strategy.
          </p>
        </footer>
      </div>
    );
  } catch (error) {
    return (
      <div
        ref={ref}
        style={{
          ...styles.page,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <h1
          style={{ fontSize: '24pt', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}
        >
          Report Generation Error
        </h1>
        <p style={{ fontSize: '14pt', color: '#666' }}>
          An error occurred while generating the report. Please try again.
        </p>
        <p style={{ fontSize: '10pt', color: '#999', marginTop: '1rem' }}>Error: {error.message}</p>
      </div>
    );
  }
});

const InteractionAnalysisDisplay = ({ loading, error, explanation }) => {
  if (loading) {
    return <p style={styles.loadingText}>Generating explanation of strategy interactions...</p>;
  }

  if (error) {
    return (
      <div
        style={{
          ...styles.loadingText,
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          padding: '1rem',
          borderRadius: '4px',
          border: '1px solid #fecaca',
        }}
      >
        <strong>AI Analysis Unavailable:</strong> {error}
        {error.includes('API key') && (
          <div style={{ marginTop: '0.5rem', fontSize: '9pt', color: '#991b1b' }}>
            To enable AI-powered strategy analysis, configure your Gemini API key in the .env file.
          </div>
        )}
      </div>
    );
  }

  return (
    <p style={styles.interactionText}>
      {explanation || 'No specific interactions to highlight for the selected strategies.'}
    </p>
  );
};

InteractionAnalysisDisplay.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  explanation: PropTypes.string,
};

InteractionAnalysisDisplay.defaultProps = {
  error: '',
  explanation: '',
};

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;

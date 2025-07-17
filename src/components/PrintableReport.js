import React, { forwardRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  RETIREMENT_STRATEGIES,
  STRATEGY_LIBRARY,
  formatCurrency,
  formatPercentage,
} from '../constants';
import { formatPrintableTaxAnalysis } from './PrintableTaxAnalysisFormatter';


// --- Modern High-End Financial Institution Styling ---
const styles = {
  page: {
    fontFamily: "'Inter', 'Helvetica Neue', 'Segoe UI', Arial, sans-serif",
    padding: '2cm 1.5cm', // Professional margins
    color: '#1a202c', // Deep charcoal for readability
    lineHeight: 1.5, // Optimal line spacing
    fontSize: '10pt', // Professional font size
    backgroundColor: '#ffffff',
    position: 'relative',
    minHeight: '100vh',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: '72pt',
    color: 'rgba(220, 38, 127, 0.025)', // Sophisticated burgundy watermark
    fontWeight: '800',
    pointerEvents: 'none',
    zIndex: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
  },
  confidentialBanner: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '4px 12px',
    fontSize: '8pt',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderRadius: '2px',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
  },
  header: {
    borderBottom: '3px solid #1e40af', // Strong blue accent
    paddingBottom: '2rem',
    marginBottom: '3rem',
    position: 'relative',
    width: '100%',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '8px 8px 0 0',
    padding: '2rem',
    marginTop: '-2rem',
    marginLeft: '-1.5rem',
    marginRight: '-1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  logo: {
    height: '48px',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  },
  reportTitle: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '28pt',
    fontWeight: '800',
    margin: 0,
    color: '#1e40af',
    letterSpacing: '-0.025em',
    textAlign: 'center',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  reportSubtitle: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '12pt',
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '0.5rem',
    letterSpacing: '0.02em',
  },
  headerText: {
    textAlign: 'right',
  },
  clientInfo: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '11pt',
    color: '#374151', // Darker gray for better readability
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  confidentialLabel: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '8pt',
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '0.5rem',
  },
  section: {
    marginBottom: '1.5rem', // Slightly increased spacing between sections
    pageBreakInside: 'avoid',
    position: 'relative',
  },
  sectionTitle: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '14pt', // Slightly larger section titles
    fontWeight: '600',
    borderBottom: '1px solid #e5e7eb', // Lighter border
    paddingBottom: '0.5rem',
    marginBottom: '1rem',
    color: '#1e40af', // Blue color for section titles
    position: 'relative',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // 3 columns instead of 2
    gap: '0.75rem 1.25rem', // Slightly increased gaps for better spacing
  },
  metric: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  metricAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    backgroundColor: '#1e40af',
    borderRadius: '0 4px 4px 0',
  },
  metricLabel: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '9pt',
    color: '#64748b',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metricValue: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: '16pt',
    fontWeight: '700',
    color: '#1e40af',
    lineHeight: 1.2,
  },
  highlightMetric: {
    backgroundColor: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderColor: '#3b82f6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
    transform: 'translateY(-2px)',
  },
  highlightValue: {
    color: '#0369a1',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  successMetric: {
    backgroundColor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderColor: '#22c55e',
  },
  successValue: {
    color: '#059669',
  },
  warningMetric: {
    backgroundColor: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#f59e0b',
  },
  warningValue: {
    color: '#d97706',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '9pt', // Slightly larger for better readability
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  th: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem', // Increased padding for better spacing
    borderBottom: '2px solid #3b82f6', // Blue border for headers
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '600',
    fontSize: '9pt',
    backgroundColor: '#f0f9ff', // Light blue background for headers
    color: '#1e40af', // Blue text for headers
  },
  td: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem', // Increased padding for better spacing
    borderBottom: '1px solid #e5e7eb', // Lighter border
    fontSize: '9pt',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  },
  tdRight: {
    textAlign: 'right',
    padding: '0.5rem 0.75rem', // Increased padding for better spacing
    borderBottom: '1px solid #e5e7eb', // Lighter border
    fontSize: '9pt',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
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
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  insightTitle: {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontWeight: '700',
    fontSize: '10pt',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    color: '#1e40af',
  },
  insightText: {
    fontSize: '9pt',
    color: '#374151',
    lineHeight: 1.5,
    paddingLeft: '1.5rem',
  },
  successInsightCard: {
    backgroundColor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    borderColor: '#22c55e',
    borderLeft: '4px solid #22c55e',
  },
  successInsightTitle: {
    color: '#059669',
  },
  warningInsightCard: {
    backgroundColor: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    borderColor: '#f59e0b',
    borderLeft: '4px solid #f59e0b',
  },
  warningInsightTitle: {
    color: '#d97706',
  },
  errorInsightCard: {
    backgroundColor: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
    borderColor: '#ef4444',
    borderLeft: '4px solid #ef4444',
  },
  errorInsightTitle: {
    color: '#dc2626',
  },
  footer: {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '2px solid #e2e8f0',
    fontSize: '8pt',
    color: '#64748b',
    lineHeight: 1.4,
    pageBreakBefore: 'auto',
    backgroundColor: '#f8fafc',
    padding: '2rem',
    marginLeft: '-1.5rem',
    marginRight: '-1.5rem',
    marginBottom: '-2rem',
  },
  legalDisclaimer: {
    backgroundColor: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '1.5rem',
    marginTop: '2rem',
    fontSize: '8pt',
    color: '#475569',
    lineHeight: 1.5,
  },
  disclaimerTitle: {
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1rem',
    fontSize: '9pt',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  disclaimerText: {
    marginBottom: '0.75rem',
  },
  printOptimized: {
    '@media print': {
      backgroundColor: '#ffffff !important',
      color: '#000000 !important',
      boxShadow: 'none !important',
      border: 'none !important',
      fontSize: '10pt !important',
      lineHeight: '1.4 !important',
      pageBreakAfter: 'auto',
      pageBreakBefore: 'auto',
      pageBreakInside: 'avoid',
    },
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
        {/* Confidential watermark */}
        <div style={styles.watermark}>CONFIDENTIAL</div>
        
        {/* Confidential Banner */}
        <div style={styles.confidentialBanner}>CONFIDENTIAL</div>

        <header style={styles.header}>
          <div style={styles.headerRow}>
            <div style={{ flex: '0 0 auto', marginRight: '2rem' }}>
              <img
                src="https://ablewealth.com/AWM%20Logo%203.png"
                alt="Able Wealth Management"
                style={styles.logo}
              />
            </div>
            <div style={{ flex: '1', textAlign: 'center' }}>
              <h1 style={styles.reportTitle}>
                Tax Optimization Analysis
              </h1>
              <p style={styles.reportSubtitle}>
                Comprehensive Strategic Financial Planning Report
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginTop: '1rem',
              paddingTop: '0.5rem',
            }}
          >
            <div style={{ flex: '1', marginRight: '1.5rem' }}>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: '6pt',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                  lineHeight: '0.9',
                }}
              >
                Prepared for:
              </p>
              <p
                style={{
                  fontWeight: '700',
                  fontSize: '10pt',
                  color: '#111827',
                  margin: 0,
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  lineHeight: '0.95',
                }}
              >
                {scenario.clientData?.clientName || 'John & Jane Doe'}
              </p>
            </div>
            <div style={{ flex: '1', textAlign: 'right' }}>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: '6pt',
                  color: '#6b7280',
                  margin: 0,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                  lineHeight: '0.9',
                }}
              >
                Date of Analysis:
              </p>
              <p
                style={{
                  fontWeight: '600',
                  fontSize: '9pt',
                  margin: 0,
                  color: '#111827',
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  marginBottom: '0.3rem',
                  lineHeight: '0.95',
                }}
              >
                {today}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: '6pt',
                  fontWeight: '600',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                  lineHeight: '0.9',
                }}
              >
                CONFIDENTIAL - FOR CLIENT USE ONLY
              </p>
            </div>
          </div>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Client Profile & Tax Situation</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Annual W2 Income</div>
              <div style={styles.metricValue}>
                {formatCurrency(scenario.clientData?.w2Income || 0)}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Business Income</div>
              <div style={styles.metricValue}>
                {formatCurrency(scenario.clientData?.businessIncome || 0)}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Capital Gains</div>
              <div style={styles.metricValue}>
                {formatCurrency(
                  (scenario.clientData?.shortTermGains || 0) +
                    (scenario.clientData?.longTermGains || 0)
                )}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>📍 Tax Residence</div>
              <div style={styles.metricValue}>
                {scenario.clientData?.state === 'NJ'
                  ? 'New Jersey'
                  : scenario.clientData?.state === 'NY'
                    ? 'New York'
                    : scenario.clientData?.state || 'Not specified'}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>👥 Filing Status</div>
              <div style={styles.metricValue}>
                {scenario.clientData?.filingStatus || 'Not specified'}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>📊 Projection Years</div>
              <div style={styles.metricValue}>{scenario.clientData?.projectionYears || 5}</div>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>🏦 Baseline Tax</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.baselineTax)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>⚡ Optimized Tax</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.optimizedTax)}</div>
            </div>
            <div style={{ ...styles.metric, ...styles.successMetric }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#22c55e' }}></div>
              <div style={{ ...styles.metricLabel, color: '#059669' }}>💰 Total Savings</div>
              <div style={{ ...styles.metricValue, ...styles.successValue }}>
                {formatCurrency(safeResults.totalSavings)}
              </div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>📉 Tax Rate Reduction</div>
              <div style={styles.metricValue}>{formatPercentage(savingsPercentage)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>💼 Capital Allocated</div>
              <div style={styles.metricValue}>{formatCurrency(safeResults.capitalAllocated)}</div>
            </div>
            <div style={safeResults.capitalAllocated > 0 && (safeResults.totalSavings / safeResults.capitalAllocated) > 0.5 ? 
              { ...styles.metric, ...styles.successMetric } : 
              safeResults.capitalAllocated > 0 && (safeResults.totalSavings / safeResults.capitalAllocated) > 0.2 ? 
              { ...styles.metric, ...styles.warningMetric } : styles.metric}>
              <div style={styles.metricAccent}></div>
              <div style={styles.metricLabel}>📈 ROI on Strategies</div>
              <div style={{
                ...styles.metricValue,
                ...(safeResults.capitalAllocated > 0 && (safeResults.totalSavings / safeResults.capitalAllocated) > 0.5 ? 
                  styles.successValue : 
                  safeResults.capitalAllocated > 0 && (safeResults.totalSavings / safeResults.capitalAllocated) > 0.2 ? 
                  styles.warningValue : {})
              }}>
                {safeResults.capitalAllocated > 0
                  ? formatPercentage(safeResults.totalSavings / safeResults.capitalAllocated)
                  : 'N/A'}
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
                  const effectiveRate = amount > 0 ? estimatedSavings / amount : 0;

                  return (
                    <tr key={strategy.id}>
                      <td style={styles.compactTd}>{strategy.name}</td>
                      <td style={styles.compactTdRight}>{formatCurrency(amount)}</td>
                      <td
                        style={{ ...styles.compactTdRight, color: '#059669', fontWeight: 'bold' }}
                      >
                        {formatCurrency(estimatedSavings)}
                      </td>
                      <td
                        style={{ ...styles.compactTdRight, color: '#1f2937', fontWeight: 'bold' }}
                      >
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
              <div
                style={{
                  ...styles.interactionText,
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                }}
              >
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
              <div
                style={{
                  ...styles.interactionText,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  lineHeight: 1.4,
                }}
              >
                <div
                  style={{
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    color: '#475569',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.25rem',
                  }}
                >
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
              <div
                style={{
                  ...styles.interactionText,
                  color: '#6b7280',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                }}
              >
                Strategy analysis will be generated when multiple strategies are selected and
                configured.
              </div>
            )}
          </section>
        )}

        {(benefits.length > 0 || considerations.length > 0) && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Implementation Guidance & Considerations</h2>

            {benefits.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h3
                  style={{
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '0.5rem',
                    borderBottom: '1px solid #d1fae5',
                    paddingBottom: '0.25rem',
                  }}
                >
                  Strategic Benefits
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {benefits.slice(0, 8).map((insight, index) => (
                    <div
                      key={`b-${index}`}
                      style={{
                        ...styles.insightCard,
                        backgroundColor: '#f0fdf4',
                        borderColor: '#d1fae5',
                        padding: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#059669', fontSize: '8pt', fontWeight: 'bold' }}>
                          ✓
                        </span>
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
                <h3
                  style={{
                    fontSize: '9pt',
                    fontWeight: 'bold',
                    color: '#d97706',
                    marginBottom: '0.5rem',
                    borderBottom: '1px solid #fed7aa',
                    paddingBottom: '0.25rem',
                  }}
                >
                  Implementation Considerations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {considerations.slice(0, 8).map((insight, index) => (
                    <div
                      key={`c-${index}`}
                      style={{
                        ...styles.insightCard,
                        backgroundColor: '#fffbeb',
                        borderColor: '#fed7aa',
                        padding: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#d97706', fontSize: '8pt', fontWeight: 'bold' }}>
                          ⚠
                        </span>
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

        {/* Comprehensive Legal Disclaimers */}
        <div style={styles.legalDisclaimer}>
          <h3 style={styles.disclaimerTitle}>Important Legal Disclaimers & Disclosures</h3>
          
          <div style={styles.disclaimerText}>
            <strong>Professional Advisory Tool:</strong> The Advanced Tax Strategy Optimizer is a proprietary
            modeling tool developed by Able Wealth Management LLC ("AWM") for internal use by its
            advisors and planning professionals. This analysis is provided for informational purposes only
            and represents hypothetical scenarios based on current tax laws and regulations.
          </div>

          <div style={styles.disclaimerText}>
            <strong>No Guarantee of Results:</strong> The projections and analyses contained in this report
            are based on assumptions about future tax laws, market conditions, and personal circumstances.
            Actual results may vary significantly due to changes in tax legislation, economic conditions,
            investment performance, and individual circumstances.
          </div>

          <div style={styles.disclaimerText}>
            <strong>Tax Law Complexity:</strong> Tax laws are complex and subject to frequent changes.
            The strategies analyzed may have different tax implications depending on individual circumstances,
            timing of implementation, and changes in federal, state, and local tax laws. Some strategies
            may be subject to IRS scrutiny or challenge.
          </div>

          <div style={styles.disclaimerText}>
            <strong>Professional Consultation Required:</strong> This analysis does not constitute legal,
            tax, or investment advice. Before implementing any strategy, you should consult with qualified
            professionals including certified public accountants, tax attorneys, and financial advisors
            who can provide personalized advice based on your specific circumstances.
          </div>

          <div style={styles.disclaimerText}>
            <strong>Confidentiality:</strong> This report contains confidential and proprietary information.
            It is intended solely for the use of the named recipient(s) and should not be shared with
            unauthorized parties without written consent from Able Wealth Management LLC.
          </div>

          <div style={styles.disclaimerText}>
            <strong>Risk Disclosure:</strong> Investment strategies involve risk including potential loss
            of principal. Past performance does not guarantee future results. The value of investments
            and the income from them can fluctuate and may be worth less than originally invested.
          </div>

          <div style={styles.disclaimerText}>
            <strong>Regulatory Compliance:</strong> Able Wealth Management LLC is a registered investment
            adviser. Advisory services are only offered to clients or prospective clients where AWM and
            its representatives are properly licensed or exempt from licensure.
          </div>
        </div>

        <footer style={styles.footer}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: '1px solid #cbd5e1',
            paddingTop: '1rem',
            marginTop: '1rem'
          }}>
            <div>
              <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>
                © 2025 Able Wealth Management LLC. All rights reserved.
              </p>
              <p style={{ fontSize: '7pt', color: '#9ca3af', margin: 0, marginTop: '0.25rem' }}>
                Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '8pt', color: '#64748b', margin: 0 }}>
                Able Wealth Management LLC
              </p>
              <p style={{ fontSize: '7pt', color: '#9ca3af', margin: 0, marginTop: '0.25rem' }}>
                Investment Adviser • SEC Registered
              </p>
            </div>
          </div>
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
    return (
      <div style={{
        ...styles.insightCard,
        backgroundColor: '#f0f9ff',
        borderColor: '#3b82f6',
        borderLeft: '4px solid #3b82f6',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #3b82f6',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>
          <div style={{...styles.insightTitle, color: '#1e40af'}}>
            🤖 AI Analysis in Progress
          </div>
          <div style={styles.insightText}>
            Generating comprehensive strategy interaction analysis...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...styles.insightCard,
        ...styles.errorInsightCard
      }}>
        <div style={{...styles.insightTitle, ...styles.errorInsightTitle}}>
          ⚠️ AI Analysis Unavailable
        </div>
        <div style={styles.insightText}>
          <strong>Error:</strong> {error}
          {error.includes('API key') && (
            <div style={{ marginTop: '0.5rem', fontSize: '8pt', color: '#991b1b' }}>
              Configure your Gemini API key in the .env file to enable AI-powered analysis.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.insightCard,
      ...styles.successInsightCard
    }}>
      <div style={{...styles.insightTitle, ...styles.successInsightTitle}}>
        🧠 AI Strategy Analysis
      </div>
      <div style={styles.insightText}>
        {explanation || 'No specific interactions to highlight for the selected strategies.'}
      </div>
    </div>
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

import React, { forwardRef } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY } from '../constants';

// --- Helper Functions ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value || 0));
const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

// --- Style Definitions for a Professional UHNW Report ---
const styles = {
    page: {
        fontFamily: "'Roboto', sans-serif",
        padding: '2cm',
        color: '#333',
        lineHeight: 1.4,
        fontSize: '10pt',
        backgroundColor: '#fff',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #333',
        paddingBottom: '1rem',
        marginBottom: '2rem',
    },
    logo: {
        height: '50px',
    },
    headerText: {
        textAlign: 'right',
    },
    reportTitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: '20pt',
        fontWeight: '900',
        margin: 0,
        color: '#111',
    },
    clientInfo: {
        fontSize: '10pt',
        color: '#555',
        lineHeight: 1.5,
    },
    section: {
        marginBottom: '2rem',
        pageBreakInside: 'avoid',
    },
    sectionTitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: '14pt',
        fontWeight: '700',
        borderBottom: '1px solid #ddd',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
        color: '#111',
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem 1.5rem',
    },
    metric: {
        backgroundColor: '#f9f9f9',
        border: '1px solid #eee',
        padding: '1rem',
        borderRadius: '4px',
    },
    metricLabel: {
        fontSize: '9pt',
        color: '#666',
        marginBottom: '0.25rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    metricValue: {
        fontSize: '16pt',
        fontWeight: '700',
        color: '#111',
    },
    highlightMetric: {
        backgroundColor: '#e8f5e9',
        borderColor: '#a5d6a7',
    },
    highlightValue: {
        color: '#2e7d32',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '10pt',
    },
    th: {
        textAlign: 'left',
        padding: '0.5rem 0.75rem',
        borderBottom: '1.5px solid #333',
        fontFamily: "'Lato', sans-serif",
        fontWeight: '700',
    },
    td: {
        textAlign: 'left',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #eee',
    },
    tdRight: {
        textAlign: 'right',
        padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #eee',
    },
    insightContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
    },
    insightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    insightCard: {
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '1rem',
        backgroundColor: '#fdfdfd',
    },
    insightTitle: {
        fontFamily: "'Lato', sans-serif",
        fontWeight: '700',
        fontSize: '10pt',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    insightText: {
        fontSize: '10pt',
        color: '#444',
        paddingLeft: '1.75rem',
    },
    chartContainer: {
        marginBottom: '2.5rem',
    },
    chartTitle: {
        textAlign: 'center',
        fontFamily: "'Lato', sans-serif",
        fontWeight: '700',
        fontSize: '11pt',
        marginBottom: '1rem',
        color: '#333',
    },
    footer: {
        marginTop: '2.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ccc',
        fontSize: '7.5pt',
        color: '#777',
        lineHeight: 1.4,
        pageBreakBefore: 'always',
    }
};

// --- Main Report Component ---
const PrintableReport = forwardRef(
  ({ scenario, results, years }, ref) => {
    if (!results || !scenario) return null;
    const { cumulative, projections, withStrategies } = results;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const savingsPercentage = cumulative.baselineTax > 0 ? cumulative.totalSavings / cumulative.baselineTax : 0;
    
    const enabledStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].filter(
        strategy => scenario.enabledStrategies[strategy.id] && scenario.clientData[strategy.inputRequired] > 0
    );

    const benefits = withStrategies?.insights?.filter(i => i.type === 'success') || [];
    const considerations = withStrategies?.insights?.filter(i => i.type === 'warning') || [];

    return (
      <div ref={ref} style={styles.page}>
        
        <header style={styles.header}>
          <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" style={styles.logo} />
          <div style={styles.headerText}>
            <h1 style={styles.reportTitle}>Tax Optimization Analysis</h1>
            <p style={styles.clientInfo}>
              Prepared for: <strong>{scenario.clientData.clientName}</strong><br />
              Date of Analysis: {today}
            </p>
          </div>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <div style={styles.summaryGrid}>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Baseline Tax Liability</div>
              <div style={styles.metricValue}>{formatCurrency(cumulative.baselineTax)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Optimized Tax Liability</div>
              <div style={styles.metricValue}>{formatCurrency(cumulative.optimizedTax)}</div>
            </div>
            <div style={{...styles.metric, ...styles.highlightMetric}}>
              <div style={{...styles.metricLabel, color: '#2e7d32'}}>Total Potential Tax Savings</div>
              <div style={{...styles.metricValue, ...styles.highlightValue}}>{formatCurrency(cumulative.totalSavings)}</div>
            </div>
            <div style={styles.metric}>
              <div style={styles.metricLabel}>Effective Tax Rate Reduction</div>
              <div style={styles.metricValue}>{formatPercentage(savingsPercentage)}</div>
            </div>
          </div>
        </section>

        {enabledStrategies.length > 0 && (
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Applied Strategies & Contributions</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Strategy / Plan</th>
                            <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enabledStrategies.map((strategy) => (
                            <tr key={strategy.id}>
                                <td style={styles.td}>{strategy.name}</td>
                                <td style={styles.tdRight}>{formatCurrency(scenario.clientData[strategy.inputRequired])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        )}

        {withStrategies?.insights && withStrategies.insights.length > 0 && (
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Strategic Implementation Insights</h2>
                <div style={styles.insightContainer}>
                    <div style={styles.insightColumn}>
                        {benefits.map((insight, index) => (
                            <div key={`b-${index}`} style={styles.insightCard}>
                                <div style={{...styles.insightTitle, color: '#2e7d32'}}>
                                    <span style={{fontSize: '1.2rem'}}>✓</span> Strategic Benefit
                                </div>
                                <p style={styles.insightText}>{insight.text}</p>
                            </div>
                        ))}
                    </div>
                    <div style={styles.insightColumn}>
                        {considerations.map((insight, index) => (
                             <div key={`c-${index}`} style={styles.insightCard}>
                                <div style={{...styles.insightTitle, color: '#d97706'}}>
                                    <span style={{fontSize: '1.2rem'}}>⚠️</span> Implementation Consideration
                                </div>
                                <p style={styles.insightText}>{insight.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )}

        {projections && projections.length > 1 && (
            <section style={{...styles.section, pageBreakBefore: 'always'}}>
                <h2 style={styles.sectionTitle}>Visual Projections</h2>
                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Annual Tax Liability Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="baseline.totalTax" fill="#8884d8" name="Baseline Tax" />
                            <Bar dataKey="withStrategies.totalTax" fill="#82ca9d" name="Optimized Tax" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Cumulative Savings Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={projections} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Line type="monotone" dataKey="cumulativeSavings" stroke="#2e7d32" strokeWidth={2} name="Savings" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>
        )}

        <footer style={styles.footer}>
          <p>
            <strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions. The results are not a guarantee of future tax savings. Tax laws are complex and subject to change. AWM does not provide legal or tax advice. Please consult with your qualified professional tax advisor and legal counsel before implementing any strategy.
          </p>
        </footer>
      </div>
    );
  }
);

export default PrintableReport;

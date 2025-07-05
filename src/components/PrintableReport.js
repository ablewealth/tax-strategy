import React, { forwardRef } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY } from '../constants';

// --- Helper Functions ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value || 0));
const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

// --- Style Definitions for a Professional Report ---
const styles = {
    page: {
        fontFamily: "'Times New Roman', Times, serif",
        padding: '2.5cm',
        color: '#111',
        lineHeight: 1.4,
        fontSize: '12pt',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #111',
        paddingBottom: '1rem',
        marginBottom: '2rem',
    },
    headerText: {
        textAlign: 'right',
    },
    reportTitle: {
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        fontSize: '24pt',
        fontWeight: 'bold',
        margin: '0 0 0.5rem 0',
    },
    clientInfo: {
        fontSize: '11pt',
        color: '#444',
    },
    logo: {
        height: '60px',
        filter: 'grayscale(100%)',
    },
    section: {
        marginBottom: '2.5rem',
        pageBreakInside: 'avoid',
    },
    sectionTitle: {
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        fontSize: '16pt',
        fontWeight: 'bold',
        borderBottom: '1px solid #ccc',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem 2rem',
    },
    metric: {
        border: '1px solid #eee',
        padding: '1rem',
        borderRadius: '8px',
    },
    metricLabel: {
        fontSize: '10pt',
        color: '#555',
        marginBottom: '0.5rem',
    },
    metricValue: {
        fontSize: '18pt',
        fontWeight: 'bold',
    },
    highlightMetric: {
        border: '1px solid #005a2b',
        backgroundColor: '#f0fff4',
        color: '#005a2b',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '11pt',
    },
    th: {
        textAlign: 'left',
        padding: '0.75rem',
        borderBottom: '2px solid #333',
        fontFamily: "'Helvetica', 'Arial', sans-serif",
    },
    td: {
        textAlign: 'left',
        padding: '0.75rem',
        borderBottom: '1px solid #ddd',
    },
    tdRight: {
        textAlign: 'right',
        padding: '0.75rem',
        borderBottom: '1px solid #ddd',
    },
    insightList: {
        listStyle: 'none',
        padding: 0,
    },
    insightItem: {
        padding: '1rem',
        marginBottom: '0.75rem',
        borderRadius: '4px',
        borderLeft: '5px solid',
    },
    chartContainer: {
        marginBottom: '3rem',
    },
    chartTitle: {
        textAlign: 'center',
        fontFamily: "'Helvetica', 'Arial', sans-serif",
        fontWeight: 'bold',
        fontSize: '12pt',
        marginBottom: '1rem',
        color: '#333',
    },
    footer: {
        marginTop: '3rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ccc',
        fontSize: '8pt',
        color: '#666',
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

    return (
      <div ref={ref} style={styles.page}>
        
        <header style={styles.header}>
          <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Logo" style={styles.logo} />
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
              <div style={{...styles.metricLabel, color: '#005a2b'}}>Total Potential Tax Savings</div>
              <div style={{...styles.metricValue, color: '#005a2b'}}>{formatCurrency(cumulative.totalSavings)}</div>
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
                <ul style={styles.insightList}>
                    {withStrategies.insights.map((insight, index) => (
                        <li key={index} style={{
                            ...styles.insightItem,
                            borderColor: insight.type === 'success' ? '#28a745' : '#ffc107',
                            backgroundColor: insight.type === 'success' ? '#f0fff4' : '#fffbeb'
                        }}>
                           <strong>{insight.type === 'success' ? 'Benefit: ' : 'Consideration: '}</strong>
                           {insight.text}
                        </li>
                    ))}
                </ul>
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
                            <Line type="monotone" dataKey="cumulativeSavings" stroke="#006400" strokeWidth={2} name="Savings" />
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

import React, { forwardRef, useEffect } from 'react';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY, formatCurrency, formatPercentage } from '../constants';

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
        height: '25px',
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
    footer: {
        marginTop: '2.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ccc',
        fontSize: '7.5pt',
        color: '#777',
        lineHeight: 1.4,
        pageBreakBefore: 'always',
    },
    chartPlaceholder: {
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        padding: '3rem',
        textAlign: 'center',
        margin: '2rem 0',
    },
    chartText: {
        fontSize: '12pt',
        color: '#6c757d',
        fontStyle: 'italic',
    }
};

// Simple data table - always works
const DataTable = ({ data, title, federalColor = '#041D5B', stateColor = '#083038' }) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h3>
                <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                    No data available for analysis.
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Scenario</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Federal Tax</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>State Tax</th>
                        <th style={{ ...styles.th, textAlign: 'right' }}>Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td style={styles.td}>{item.scenario}</td>
                            <td style={{ ...styles.tdRight, color: federalColor, fontWeight: 'bold' }}>
                                {formatCurrency(item.federalTax || 0)}
                            </td>
                            <td style={{ ...styles.tdRight, color: stateColor, fontWeight: 'bold' }}>
                                {formatCurrency(item.stateTax || 0)}
                            </td>
                            <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>
                                {formatCurrency((item.federalTax || 0) + (item.stateTax || 0))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Chart placeholder for print
const ChartPlaceholder = ({ title, description }) => (
    <div style={styles.chartPlaceholder}>
        <h3 style={{ ...styles.chartText, fontWeight: 'bold', marginBottom: '1rem' }}>{title}</h3>
        <p style={styles.chartText}>{description}</p>
        <p style={{ ...styles.chartText, marginTop: '1rem', fontSize: '9pt' }}>
            Interactive charts are available in the digital version of this report.
        </p>
    </div>
);

// --- Main Report Component ---
const PrintableReport = forwardRef(({ scenario, results, years }, ref) => {
    // Add error boundary logging
    useEffect(() => {
        console.log('PrintableReport rendering with:', {
            hasScenario: !!scenario,
            hasResults: !!results,
            hasCumulative: !!(results?.cumulative),
            hasProjections: !!(results?.projections),
            projectionsLength: results?.projections?.length || 0,
            enabledStrategiesCount: scenario?.enabledStrategies ? Object.values(scenario.enabledStrategies).filter(Boolean).length : 0
        });
    }, [scenario, results, years]);

    // Enhanced validation with better error handling
    if (!results || !scenario) {
        console.warn('PrintableReport: Missing required props');
        return (
            <div ref={ref} style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}>
                    Report Data Missing
                </h1>
                <p style={{ fontSize: '14pt', color: '#666' }}>
                    Unable to generate report. Please ensure all required data is available.
                </p>
            </div>
        );
    }

    if (!results.cumulative || !results.projections || results.projections.length === 0) {
        console.warn('PrintableReport: Missing calculation results');
        return (
            <div ref={ref} style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}>
                    Calculating Report Data...
                </h1>
                <p style={{ fontSize: '14pt', color: '#666' }}>
                    Please wait while we process your tax optimization strategies.
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
            capitalAllocated: cumulative?.capitalAllocated || 0
        };

        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const savingsPercentage = safeResults.baselineTax > 0 ? safeResults.totalSavings / safeResults.baselineTax : 0;
        
        // Safe strategy filtering
        const enabledStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].filter(strategy => {
            try {
                return scenario.enabledStrategies?.[strategy.id] && 
                       scenario.clientData?.[strategy.inputRequired] > 0;
            } catch (e) {
                console.warn('Error filtering strategy:', strategy.id, e);
                return false;
            }
        });

        // Safe insights extraction
        const benefits = withStrategies?.insights?.filter(i => i?.type === 'success') || [];
        const considerations = withStrategies?.insights?.filter(i => i?.type === 'warning') || [];

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
                        stateTax: baseline.stateTax || 0
                    },
                    {
                        scenario: 'Optimized',
                        federalTax: optimized.fedTax || 0,
                        stateTax: optimized.stateTax || 0
                    }
                ];
            }
        } catch (e) {
            console.warn('Error preparing chart data:', e);
            taxBreakdownData = [];
        }

        return (
            <div ref={ref} style={styles.page}>
                
                <header style={styles.header}>
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" style={styles.logo} />
                    <div style={styles.headerText}>
                        <h1 style={styles.reportTitle}>Tax Optimization Analysis</h1>
                        <p style={styles.clientInfo}>
                            Prepared for: <strong>{scenario.clientData?.clientName || 'Client'}</strong><br />
                            Date of Analysis: {today}
                        </p>
                    </div>
                </header>

                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Executive Summary</h2>
                    <div style={styles.summaryGrid}>
                        <div style={styles.metric}>
                            <div style={styles.metricLabel}>Baseline Tax Liability</div>
                            <div style={styles.metricValue}>{formatCurrency(safeResults.baselineTax)}</div>
                        </div>
                        <div style={styles.metric}>
                            <div style={styles.metricLabel}>Optimized Tax Liability</div>
                            <div style={styles.metricValue}>{formatCurrency(safeResults.optimizedTax)}</div>
                        </div>
                        <div style={{...styles.metric, ...styles.highlightMetric}}>
                            <div style={{...styles.metricLabel, color: '#2e7d32'}}>Total Potential Tax Savings</div>
                            <div style={{...styles.metricValue, ...styles.highlightValue}}>{formatCurrency(safeResults.totalSavings)}</div>
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
                                        <td style={styles.tdRight}>{formatCurrency(scenario.clientData[strategy.inputRequired] || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {(benefits.length > 0 || considerations.length > 0) && (
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
                                    <div key={`c-${index}`} style={{...styles.insightCard, backgroundColor: '#fffbe6', borderColor: '#fcd34d'}}>
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

                {/* Charts Section - Replaced with placeholders for print reliability */}
                <section style={{...styles.section, pageBreakBefore: 'always'}}>
                    <h2 style={styles.sectionTitle}>Visual Analysis</h2>
                    <ChartPlaceholder 
                        title="Tax Liability Comparison"
                        description="Interactive bar chart showing baseline vs optimized tax scenarios with federal and state breakdown"
                    />
                    {projections && projections.length > 1 && (
                        <ChartPlaceholder 
                            title="Multi-Year Projections"
                            description="Interactive charts showing annual tax comparison and cumulative savings over time"
                        />
                    )}
                </section>

                {projections && projections.length > 1 && (
                    <section style={{...styles.section, pageBreakBefore: 'always'}}>
                        <h2 style={styles.sectionTitle}>Multi-Year Projections</h2>
                        
                        {/* Annual Tax Comparison Table */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>Annual Tax Liability Comparison</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Year</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Baseline Tax</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Optimized Tax</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Annual Savings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projections.map((proj, index) => {
                                        if (!proj) return null;
                                        return (
                                            <tr key={index}>
                                                <td style={styles.td}>Year {proj.year}</td>
                                                <td style={{ ...styles.tdRight, color: '#9ca3af', fontWeight: 'bold' }}>
                                                    {formatCurrency(proj.baseline?.totalTax || 0)}
                                                </td> 
                                                <td style={{ ...styles.tdRight, color: '#041D5B', fontWeight: 'bold' }}>
                                                    {formatCurrency(proj.withStrategies?.totalTax || 0)}
                                                </td>
                                                <td style={{ ...styles.tdRight, color: '#059669', fontWeight: 'bold' }}>
                                                    {formatCurrency((proj.baseline?.totalTax || 0) - (proj.withStrategies?.totalTax || 0))}
                                                </td>
                                            </tr>
                                        );
                                    }).filter(Boolean)}
                                </tbody>
                            </table>
                        </div>

                        {/* Cumulative Savings Table */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>Cumulative Savings Over Time</h3>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Year</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Cumulative Savings</th>
                                        <th style={{ ...styles.th, textAlign: 'right' }}>Savings Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projections.map((proj, index) => {
                                        if (!proj || proj.cumulativeSavings === undefined || proj.cumulativeSavings === null) return null;
                                        
                                        const baselineTax = proj.baseline?.totalTax || 0;
                                        const optimizedTax = proj.withStrategies?.totalTax || 0; 
                                        const savingsRate = baselineTax > 0 ? (baselineTax - optimizedTax) / baselineTax : 0;
                                        
                                        return (
                                            <tr key={index}>
                                                <td style={styles.td}>Year {proj.year}</td>
                                                <td style={{ ...styles.tdRight, color: '#f59e0b', fontWeight: 'bold' }}>
                                                    {formatCurrency(proj.cumulativeSavings || 0)}
                                                </td>
                                                <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>
                                                    {formatPercentage(savingsRate)}
                                                </td>
                                            </tr>
                                        );
                                    }).filter(Boolean)}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <footer style={styles.footer}>
                    <p>
                        <strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC ("AWM") for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions. The results are not a guarantee of future tax savings. Tax laws are complex and subject to change. AWM does not provide legal or tax advice. Please consult with your qualified professional tax advisor and legal counsel before implementing any strategy.
                    </p>
                </footer>
            </div>
        );
    } catch (error) {
        console.error('PrintableReport rendering error:', error);
        return (
            <div ref={ref} style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
                    Report Generation Error
                </h1>
                <p style={{ fontSize: '14pt', color: '#666' }}>
                    An error occurred while generating the report. Please try again.
                </p>
                <p style={{ fontSize: '10pt', color: '#999', marginTop: '1rem' }}>
                    Error: {error.message}
                </p>
            </div>
        );
    }
});

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
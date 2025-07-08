import React, { forwardRef, useEffect, useState, useMemo } from 'react';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY, formatCurrency, formatPercentage } from '../constants';

// --- Style Definitions for a Professional UHNW Report ---
const styles = {
    page: {
        fontFamily: "'Roboto', sans-serif",
        padding: '2cm',
        color: '#333',
        lineHeight: 1.4, // Good for readability in print
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
        pageBreakInside: 'avoid', // Prevents sections from breaking across pages
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
        backgroundColor: '#f9f9f9', // Light background for metrics
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
    // Simplified highlight metric for print
    highlightMetric: {
        backgroundColor: '#f0fdf0', // Very light green for subtle highlight
        borderColor: '#d0e0d0',
    },
    highlightValue: {
        color: '#2e7d32', // Darker green for value
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
    // Simplified insight card for print
    insightCard: {
        border: '1px solid #eee',
        borderRadius: '4px',
        padding: '1rem',
        backgroundColor: '#fefefe', // Almost white for general insights
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
        paddingLeft: '1.75rem', // Aligns text with bullet/icon
    },
    // Specific style for warning insights
    warningInsightCard: {
        backgroundColor: '#fffdf0', // Very light yellow for warning
        borderColor: '#f0e0c0',
    },
    footer: {
        marginTop: '2.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ccc',
        fontSize: '7.5pt',
        color: '#777',
        lineHeight: 1.4,
        pageBreakBefore: 'always', // Ensures footer starts on a new page if content is long
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
    },
    // New styles for detailed strategy explanations
    strategyDetail: {
        marginBottom: '1.5rem',
        pageBreakInside: 'avoid',
    },
    strategyDetailTitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: '12pt',
        fontWeight: '700',
        color: '#111',
        marginBottom: '0.5rem',
    },
    strategyDetailDescription: {
        fontSize: '10pt',
        color: '#444',
        lineHeight: 1.5,
    },
    // New styles for interactions section
    interactionText: {
        fontSize: '10pt',
        color: '#444',
        lineHeight: 1.5,
        backgroundColor: '#f8f8f8',
        border: '1px solid #eee',
        padding: '1rem',
        borderRadius: '4px',
    },
    loadingText: {
        fontSize: '10pt',
        color: '#666',
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
    const [interactionExplanation, setInteractionExplanation] = useState('');
    const [loadingInteraction, setLoadingInteraction] = useState(false);
    const [interactionError, setInteractionError] = useState('');

    // Add error boundary logging
    useEffect(() => {
        // Debug environment variable loading
        // Environment variable debug logging removed
    }, [scenario, results, years]);

    const allStrategies = useMemo(() => [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES], []);
    const enabledStrategies = useMemo(() => {
        return allStrategies.filter(strategy => {
            const isEnabled = scenario.enabledStrategies?.[strategy.id];
            const inputValue = scenario.clientData?.[strategy.inputRequired];
            return isEnabled && typeof inputValue === 'number' && inputValue > 0;
        });
    }, [allStrategies, scenario.enabledStrategies, scenario.clientData]);

    useEffect(() => {
        const fetchInteractionExplanation = async () => {
            if (enabledStrategies.length > 1) {
                setLoadingInteraction(true);
                setInteractionError('');
                try {
                    const strategyDetails = enabledStrategies.map(s => `${s.name}: ${s.description}`).join('\n');
                    const prompt = `Explain how the following tax strategies might interact with each other and their combined impact on tax optimization. Focus on potential synergies or conflicts. Strategies:\n${strategyDetails}\n\nProvide a concise explanation.`;
                    
                    const chatHistory = []; 
                    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                    const payload = { contents: chatHistory };
                    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || ""; 
                    
                    // API integration check removed
                    
                    if (!apiKey) {
                        setInteractionError('AI analysis is not configured. To enable strategy interaction analysis, please set up your Gemini API key in the .env file.');
                        setLoadingInteraction(false);
                        return;
                    }
                    
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    if (result.candidates && result.candidates.length > 0 &&
                        result.candidates[0].content && result.candidates[0].content.parts &&
                        result.candidates[0].content.parts.length > 0) {
                        setInteractionExplanation(result.candidates[0].content.parts[0].text);
                    } else {
                        setInteractionError('Failed to generate interaction explanation.');
                        console.error('Gemini API response structure unexpected:', result);
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        setInteractionError('Request timed out. Strategy interaction analysis is unavailable.');
                    } else {
                        setInteractionError(`Error fetching interaction explanation: ${error.message}`);
                    }
                    console.error('Error in Gemini API call:', error);
                } finally {
                    setLoadingInteraction(false);
                }
            } else {
                setInteractionExplanation('');
                setInteractionError('');
            }
        };

        fetchInteractionExplanation();
    }, [enabledStrategies]);

    // Enhanced validation with better error handling
    if (!results || !scenario) {
        // PrintableReport: Missing required props
        return (
            <div ref={ref} style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}>
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
        // PrintableReport: Missing calculation results
        return (
            <div ref={ref} style={{ ...styles.page, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24pt', fontWeight: 'bold', color: '#d97706', marginBottom: '1rem' }}>
                    Calculating Report Data...
                </h1>
                <p style={{ fontSize: '14pt', color: '#666' }}>
                    Please wait while we process your tax optimization strategies.
                </p>
                <p style={{ fontSize: '10pt', color: '#999', marginTop: '1rem' }}>
                    Debug: cumulative={!!results.cumulative}, projections={!!results.projections}, length={results.projections?.length || 0}
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

        // Safe results extracted
        
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const savingsPercentage = safeResults.baselineTax > 0 ? safeResults.totalSavings / safeResults.baselineTax : 0;
        
        // Enabled strategies for report
        
        // Safe insights extraction with null checks
        const benefits = withStrategies?.insights?.filter(i => i?.type === 'success') || [];
        const considerations = withStrategies?.insights?.filter(i => i?.type === 'warning') || [];

        // Insights extracted
        
        // Safe chart data preparation
        let taxBreakdownData = [];
        try {
            if (projections && projections.length > 0 && projections[0]) {
                const baseline = projections[0].baseline || {};
                const optimized = projections[0].withStrategies || {};
                
                // Chart data preparation
                
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
                
                // Generated chart data
            } else {
                // No projections data available for chart
            }
        } catch (e) {
            taxBreakdownData = [];
        }

        // About to render report content with data

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
                        <h2 style={styles.sectionTitle}>Strategy Interactions and Combined Impact</h2>
                        {loadingInteraction ? (
                            <p style={styles.loadingText}>Generating explanation of strategy interactions...</p>
                        ) : interactionError ? (
                            <div style={{...styles.loadingText, color: '#dc2626', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '4px', border: '1px solid #fecaca'}}>
                                <strong>AI Analysis Unavailable:</strong> {interactionError}
                                {interactionError.includes('API key') && (
                                    <div style={{marginTop: '0.5rem', fontSize: '9pt', color: '#991b1b'}}>
                                        To enable AI-powered strategy analysis, configure your Gemini API key in the .env file.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={styles.interactionText}>{interactionExplanation || 'No specific interactions to highlight for the selected strategies.'}</p>
                        )}
                    </section>
                )}

                {(benefits.length > 0 || considerations.length > 0) && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Strategic Implementation Insights</h2>
                        <div style={styles.insightContainer}>
                            <div style={styles.insightColumn}>
                                {benefits.slice(0, 10).map((insight, index) => (
                                    <div key={`b-${index}`} style={styles.insightCard}>
                                        <div style={{...styles.insightTitle, color: '#2e7d32'}}>
                                            <span style={{fontSize: '1.2rem'}}>✓</span> Strategic Benefit
                                        </div>
                                        <p style={styles.insightText}>{insight?.text || 'Benefit information not available'}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={styles.insightColumn}>
                                {considerations.slice(0, 10).map((insight, index) => (
                                    <div key={`c-${index}`} style={{...styles.insightCard, ...styles.warningInsightCard}}>
                                        <div style={{...styles.insightTitle, color: '#d97706'}}>
                                            <span style={{fontSize: '1.2rem'}}>⚠️</span> Implementation Consideration
                                        </div>
                                        <p style={styles.insightText}>{insight?.text || 'Consideration information not available'}</p>
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
                                        if (!proj || typeof proj.year === 'undefined') return null;
                                        try {
                                            const baselineTax = proj.baseline?.totalTax || 0;
                                            const optimizedTax = proj.withStrategies?.totalTax || 0;
                                            const annualSavings = Math.max(0, baselineTax - optimizedTax);
                                            
                                            return (
                                                <tr key={index}>
                                                    <td style={styles.td}>Year {proj.year}</td>
                                                    <td style={{ ...styles.tdRight, color: '#9ca3af', fontWeight: 'bold' }}>
                                                        {formatCurrency(baselineTax)}
                                                    </td> 
                                                    <td style={{ ...styles.tdRight, color: '#041D5B', fontWeight: 'bold' }}>
                                                        {formatCurrency(optimizedTax)}
                                                    </td>
                                                    <td style={{ ...styles.tdRight, color: '#059669', fontWeight: 'bold' }}>
                                                        {formatCurrency(annualSavings)}
                                                    </td>
                                                </tr>
                                            );
                                        } catch (e) {
                                            // Error rendering projection row
                                            return null;
                                        }
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
                                        if (!proj || typeof proj.year === 'undefined' || proj.cumulativeSavings === undefined || proj.cumulativeSavings === null) return null;
                                        
                                        try {
                                            const baselineTax = proj.baseline?.totalTax || 0;
                                            const optimizedTax = proj.withStrategies?.totalTax || 0; 
                                            const savingsRate = baselineTax > 0 ? Math.max(0, (baselineTax - optimizedTax) / baselineTax) : 0;
                                            
                                            return (
                                                <tr key={index}>
                                                    <td style={styles.td}>Year {proj.year}</td>
                                                    <td style={{ ...styles.tdRight, color: '#f59e0b', fontWeight: 'bold' }}>
                                                        {formatCurrency(Math.max(0, proj.cumulativeSavings || 0))}
                                                    </td>
                                                    <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>
                                                        {formatPercentage(savingsRate)}
                                                    </td>
                                                </tr>
                                            );
                                        } catch (e) {
                                            // Error rendering cumulative savings row
                                            return null;
                                        }
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

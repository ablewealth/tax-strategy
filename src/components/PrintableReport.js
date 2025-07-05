import React, { forwardRef } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RETIREMENT_STRATEGIES } from '../constants'; // Import retirement strategies

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));

const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

const PrintableReport = forwardRef(
  ({ scenario, results, years, growthRate }, ref) => {
    if (!results || !scenario) return null;
    const { cumulative, projections, withStrategies } = results;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Filter for enabled retirement strategies to display them in their own section
    const enabledRetirementStrategies = RETIREMENT_STRATEGIES.filter(
        strategy => scenario.enabledStrategies[strategy.id] && scenario.clientData[strategy.inputRequired] > 0
    );

    // Calculate savings percentage for the summary
    const savingsPercentage = cumulative.baselineTax > 0 ? cumulative.totalSavings / cumulative.baselineTax : 0;

    return (
      <div ref={ref} id="printable-area" style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', color: '#000' }}>
        
        {/* Header Section */}
        <header style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" style={{ height: '50px', filter: 'grayscale(100%)' }} />
          <div style={{ marginLeft: '1.5rem' }}>
            <h1 style={{ fontSize: '2rem', margin: '0', fontWeight: 'bold' }}>Tax Optimization Report</h1>
            <p style={{ margin: '0', color: '#555' }}>
              For: {scenario.clientData.clientName} | Generated: {today}
            </p>
          </div>
        </header>

        {/* REDESIGNED: Executive Tax Optimization Analysis Section */}
        <section style={{ marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                    Executive Tax Optimization Analysis
                </h2>
                <p style={{ fontSize: '1rem', color: '#555', margin: '0' }}>
                    Comprehensive strategic tax planning results for {scenario.clientData.state} over {years === 0 ? 'the Current Year' : `${years} Years`}.
                </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', margin: '0 0 0.5rem 0' }}>Baseline Tax Liability</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{formatCurrency(cumulative.baselineTax)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '0' }}>Pre-optimization scenario</p>
                </div>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', margin: '0 0 0.5rem 0' }}>Optimized Tax Liability</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{formatCurrency(cumulative.optimizedTax)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '0' }}>Post-strategy implementation</p>
                </div>
                <div style={{ border: '2px solid #006400', borderRadius: '8px', padding: '1rem', backgroundColor: '#f0fff4' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#006400', margin: '0 0 0.5rem 0' }}>Total Tax Optimization</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#006400', margin: '0 0 0.25rem 0' }}>{formatCurrency(cumulative.totalSavings)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#006400', margin: '0' }}>{formatPercentage(savingsPercentage)} effective reduction</p>
                </div>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', margin: '0 0 0.5rem 0' }}>Total Capital Allocated</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{formatCurrency(cumulative.capitalAllocated)}</p>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: '0' }}>Total investment in strategies</p>
                </div>
            </div>
        </section>

        {/* Retirement Contributions Section */}
        {enabledRetirementStrategies.length > 0 && (
            <section style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Retirement Contributions
                </h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Plan</th>
                            <th style={{ padding: '0.5rem', textAlign: 'right' }}>Contribution Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enabledRetirementStrategies.map((strategy) => (
                            <tr key={strategy.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem', textAlign: 'left' }}>{strategy.name}</td>
                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(scenario.clientData[strategy.inputRequired])}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        )}

        {/* Strategic Insights Section */}
        {withStrategies?.insights && withStrategies.insights.length > 0 && (
            <section style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    Strategic Implementation Insights
                </h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {withStrategies.insights.map((insight, index) => (
                        <li key={index} style={{ 
                            padding: '0.75rem', 
                            marginBottom: '0.5rem', 
                            borderRadius: '4px',
                            borderLeft: `4px solid ${insight.type === 'success' ? '#28a745' : '#ffc107'}`,
                            backgroundColor: insight.type === 'success' ? '#f0fff4' : '#fffbeb'
                        }}>
                           <strong>{insight.type === 'success' ? 'Benefit: ' : 'Consideration: '}</strong>
                           {insight.text}
                        </li>
                    ))}
                </ul>
            </section>
        )}

        {/* Charts Section */}
        {projections && projections.length > 1 && (
            <section style={{ marginBottom: '2rem', pageBreakBefore: 'always' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
                    Visual Projections
                </h2>
                <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ textAlign: 'center', fontWeight: '600' }}>Annual Tax Liability Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projections}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="baseline.totalTax" fill="#8884d8" name="Baseline Tax" />
                            <Bar dataKey="withStrategies.totalTax" fill="#82ca9d" name="Optimized Tax" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div>
                    <h3 style={{ textAlign: 'center', fontWeight: '600' }}>Cumulative Savings Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={projections}>
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

        {/* Disclaimer Section */}
        <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ccc', fontSize: '0.75rem', color: '#666', pageBreakBefore: 'always' }}>
          <p>
            <strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions. The results are not a guarantee of future tax savings. Tax laws are complex and subject to change. AWM does not provide legal or tax advice. Please consult with your qualified professional tax advisor and legal counsel before implementing any strategy.
          </p>
        </footer>
      </div>
    );
  }
);

export default PrintableReport;

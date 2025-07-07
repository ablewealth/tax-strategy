import React from 'react';
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, ResponsiveContainer, Bar, LineChart, Line } from 'recharts';
import Section from './Section';
import { formatCurrency, formatPercentage } from '../constants'; // Ensure formatCurrency and formatPercentage are imported

const ChartsSection = ({ results, styles }) => { // styles passed as a prop
    if (!results || !results.projections || results.projections.length === 0) return null;
    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-300 shadow-xl max-w-xs">
                    <p className="label font-semibold text-black mb-2 text-sm sm:text-base">{`${label}`}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-black font-medium text-xs sm:text-sm">
                            <span 
                                className="inline-block w-3 h-3 rounded mr-2" 
                                style={{ backgroundColor: p.color }}
                            ></span>
                            {`${p.name}: ${formatCurrency(p.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Prepare data for the tax breakdown chart
    const firstProjection = results.projections[0];
    const taxBreakdownData = [
        {
            scenario: 'Baseline',
            federalTax: firstProjection.baseline.fedTax,
            stateTax: firstProjection.baseline.stateTax
        },
        {
            scenario: 'Optimized',
            federalTax: firstProjection.withStrategies.fedTax,
            stateTax: firstProjection.withStrategies.stateTax
        }
    ];

    return (
        <Section title="📈 Visual Projections" description="Analysis of tax liabilities and cumulative savings.">
            {/* Tax Liability Breakdown Chart */}
            <div style={styles.section}> {/* Apply section style */}
                <h3 className="text-sm sm:text-base font-semibold mb-4 text-center text-text-secondary">Tax Liability Comparison Analysis</h3>
                <p className="text-xs sm:text-sm text-text-muted text-center mb-6">Baseline vs. optimized tax scenarios with federal and state breakdown</p>
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taxBreakdownData} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="scenario" 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                interval={0}
                                angle={0}
                                textAnchor="middle"
                            />
                            <YAxis 
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} 
                                tick={{ fill: '#64748b', fontSize: 10 }} 
                                width={60}
                            />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                            <Bar dataKey="federalTax" stackId="taxes" fill="#041D5B" name="Federal Tax" />
                            <Bar dataKey="stateTax" stackId="taxes" fill="#083038" name="State Tax" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#041D5B' }}></div>
                        <span className="text-xs sm:text-sm text-text-secondary">Federal Tax</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: '#083038' }}></div>
                        <span className="text-xs sm:text-sm text-text-secondary">State Tax</span>
                    </div>
                </div>
            </div>

            {/* Multi-year projections - only show if more than 1 year */}
            {results.projections.length > 1 && (
                <div style={{...styles.section, pageBreakBefore: 'always'}}> {/* Apply section style */}
                    <h2 style={styles.sectionTitle}>Multi-Year Projections</h2> {/* Apply sectionTitle style */}
                    
                    {/* Annual Tax Comparison Table */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>Annual Tax Liability Comparison</h3>
                        <table style={styles.table}> {/* Apply table style */}
                            <thead>
                                <tr>
                                    <th style={styles.th}>Year</th> {/* Apply th style */}
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Baseline Tax</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Optimized Tax</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Annual Savings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.projections.map((proj, index) => ( // Use results.projections directly
                                    <tr key={index}>
                                        <td style={styles.td}>Year {proj.year}</td> {/* Apply td style */}
                                        <td style={{ ...styles.tdRight, color: '#9ca3af', fontWeight: 'bold' }}> {/* Apply tdRight style */}
                                            {formatCurrency(proj.baseline?.totalTax || 0)}
                                        </td>
                                        <td style={{ ...styles.tdRight, color: '#041D5B', fontWeight: 'bold' }}>
                                            {formatCurrency(proj.withStrategies?.totalTax || 0)}
                                        </td>
                                        <td style={{ ...styles.tdRight, color: '#059669', fontWeight: 'bold' }}>
                                            {formatCurrency((proj.baseline?.totalTax || 0) - (proj.withStrategies?.totalTax || 0))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cumulative Savings Table */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>Cumulative Savings Over Time</h3>
                        <table style={styles.table}> {/* Apply table style */}
                            <thead>
                                <tr>
                                    <th style={styles.th}>Year</th> {/* Apply th style */}
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Cumulative Savings</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Savings Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.projections.map((proj, index) => { // Use results.projections directly
                                    const baselineTax = proj.baseline?.totalTax || 0;
                                    const optimizedTax = proj.withStrategies?.totalTax || 0;
                                    const savingsRate = baselineTax > 0 ? (baselineTax - optimizedTax) / baselineTax : 0;
                                    return (
                                        <tr key={index}>
                                            <td style={styles.td}>Year {proj.year}</td> {/* Apply td style */}
                                            <td style={{ ...styles.tdRight, color: '#f59e0b', fontWeight: 'bold' }}>
                                                {formatCurrency(proj.cumulativeSavings || 0)}
                                            </td>
                                            <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>
                                                {formatPercentage(savingsRate)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Section>
    )
};

export default ChartsSection;

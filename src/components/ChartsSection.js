import React from 'react';
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, ResponsiveContainer, Bar, LineChart, Line } from 'recharts';
import Section from './Section';
import { formatCurrency, formatPercentage } from '../constants'; // Ensure formatCurrency and formatPercentage are imported

// Removed 'styles' from props, as it's not needed for the main UI component
const ChartsSection = ({ results }) => { 
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
            <div className="mb-8"> {/* Removed style={styles.section} */}
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8"> {/* Removed style={...styles.section, pageBreakBefore: 'always'} */}
                    <h2 className="text-sm sm:text-base font-semibold mb-4 text-center text-text-secondary">Multi-Year Projections</h2> {/* Removed style={styles.sectionTitle} */}
                    
                    {/* Annual Tax Comparison Table */}
                    <div className="mb-8"> {/* Changed to mb-8 from mb-3rem for consistency with Tailwind */}
                        <h3 className="text-sm sm:text-base font-semibold mb-4 text-center text-text-secondary">Annual Tax Liability Comparison</h3>
                        <div className="w-full" style={{ height: '250px', minHeight: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results.projections} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 9 }} width={50} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                    <Bar dataKey="baseline.totalTax" fill="#9ca3af" name="Baseline Tax" />
                                    <Bar dataKey="withStrategies.totalTax" fill="#3b82f6" name="Optimized Tax" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cumulative Savings Table */}
                    <div className="mb-8"> {/* Changed to mb-8 from mb-3rem for consistency with Tailwind */}
                        <h3 className="text-sm sm:text-base font-semibold mb-4 text-center text-text-secondary">Cumulative Savings Over Time</h3>
                        <div className="w-full" style={{ height: '250px', minHeight: '250px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={results.projections} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 9 }} width={50} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="cumulativeSavings" stroke="#f59e0b" strokeWidth={3} name="Savings" dot={{ r: 3 }} activeDot={{ r: 5 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </Section>
    )
};

export default ChartsSection;

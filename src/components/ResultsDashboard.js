import React from 'react';
// Import formatCurrency and formatPercentage from constants
import { formatCurrency, formatPercentage } from '../constants'; 

const ResultsDashboard = ({ results }) => {
    if (!results || !results.cumulative) return null;
    const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = results.cumulative;
    const savingsPercentage = baselineTax > 0 ? totalSavings / baselineTax : 0;

    const MetricCard = ({ label, value, subtext, isHighlighted = false }) => (
        <div className={`p-4 sm:p-6 rounded-lg text-center transition-all ${isHighlighted ? 'bg-white/20' : 'bg-white/10'}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">{label}</h3>
            <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${isHighlighted ? 'text-accent-gold-light' : 'text-white'} leading-tight`}>{value}</p>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{subtext}</p>
        </div>
    );
    
    return (
        <div className="bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl p-6 sm:p-8 lg:p-10 text-white shadow-xl">
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">Executive Tax Optimization Analysis</h2>
                <p className="text-sm sm:text-base opacity-80 mt-2">Comprehensive strategic tax planning results and optimization metrics.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard label="Baseline Tax Liability" value={formatCurrency(baselineTax)} subtext="Pre-optimization scenario" />
                <MetricCard label="Optimized Tax Liability" value={formatCurrency(optimizedTax)} subtext="Post-strategy implementation" />
                <MetricCard label="Total Tax Optimization" value={formatCurrency(totalSavings)} subtext={`${formatPercentage(savingsPercentage)} effective reduction`} isHighlighted />
                <MetricCard label="Total Capital Allocated" value={formatCurrency(capitalAllocated)} subtext="Total investment in strategies" />
            </div>
        </div>
    );
};

export default ResultsDashboard;
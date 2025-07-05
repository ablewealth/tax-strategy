import React, { useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, ResponsiveContainer, Bar, LineChart, Line } from 'recharts';
import {
    DEALS_EXPOSURE_LEVELS,
    STRATEGY_LIBRARY,
    RETIREMENT_STRATEGIES,
    FED_TAX_BRACKETS,
    AMT_BRACKETS,
    AMT_EXEMPTION,
    NJ_TAX_BRACKETS,
    NY_TAX_BRACKETS,
    STANDARD_DEDUCTION,
    createNewScenario
} from './constants';
import PrintableReport from './components/PrintableReport';

// --- Helper & Calculation Functions (Logic is preserved) ---
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value || 0));
const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;
const calculateTax = (income, brackets) => {
    if (income <= 0) return 0;
    let tax = 0;
    let remainingIncome = income;
    let lastMax = 0;
    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        const taxableInBracket = Math.min(remainingIncome, bracket.max - lastMax);
        tax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
        lastMax = bracket.max;
    }
    return tax;
};

const performTaxCalculations = (scenario) => {
    if (!scenario) return null;
    const { clientData, enabledStrategies } = scenario;
    const { projectionYears, growthRate } = clientData;

    const projections = [];
    let cumulativeBaselineTax = 0;
    let cumulativeOptimizedTax = 0;
    let cumulativeSavings = 0;
    const loopYears = projectionYears === 0 ? 1 : projectionYears;

    for (let i = 0; i < loopYears; i++) {
        const growthFactor = Math.pow(1 + (growthRate || 0) / 100, i);
        const currentYearData = { ...clientData, w2Income: clientData.w2Income * growthFactor, businessIncome: clientData.businessIncome * growthFactor, longTermGains: clientData.longTermGains * growthFactor, shortTermGains: clientData.shortTermGains * growthFactor };

        const getTaxesForYear = (yearData, strategies) => {
            let fedDeductions = { aboveAGI: 0, belowAGI: 0 }, stateDeductions = { total: 0 }, njAddBack = 0, qbiBaseIncome = yearData.businessIncome || 0, currentLtGains = yearData.longTermGains || 0, currentStGains = yearData.shortTermGains || 0, totalCapitalAllocated = 0, insights = [];
            const stateBrackets = yearData.state === 'NY' ? NY_TAX_BRACKETS : NJ_TAX_BRACKETS;
            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];

            allStrategies.forEach(strategy => {
                if (strategies[strategy.id]) {
                    if (strategy.type !== 'qbi' && yearData[strategy.inputRequired] > 0) totalCapitalAllocated += yearData[strategy.inputRequired];
                    switch (strategy.id) {
                        case 'QUANT_DEALS_01': { const exposure = DEALS_EXPOSURE_LEVELS[yearData.dealsExposure], stLoss = (yearData.investmentAmount || 0) * exposure.shortTermLossRate, ltGainFromDeals = (yearData.investmentAmount || 0) * exposure.longTermGainRate, stOffset = Math.min(currentStGains, stLoss); currentStGains -= stOffset; const remainingLoss = stLoss - stOffset, ltOffset = Math.min(currentLtGains, remainingLoss); currentLtGains -= ltOffset; const remainingLoss2 = remainingLoss - ltOffset, ordinaryOffset = Math.min(3000, remainingLoss2); fedDeductions.belowAGI += ordinaryOffset; stateDeductions.total += ordinaryOffset; currentLtGains += ltGainFromDeals; insights.push({ type: 'success', text: `DEALS strategy generated ${formatCurrency(stOffset + ltOffset)} in capital loss offsets and a ${formatCurrency(ordinaryOffset)} ordinary income deduction.` }); break; }
                        case 'EQUIP_S179_01': { const s179Ded = Math.min(yearData.equipmentCost, qbiBaseIncome, 1220000); qbiBaseIncome -= s179Ded; fedDeductions.aboveAGI += s179Ded; insights.push({ type: 'success', text: `Section 179 provides a ${formatCurrency(s179Ded)} federal deduction.` }); if (yearData.state === 'NY') { stateDeductions.total += s179Ded; } else { const njDed = Math.min(yearData.equipmentCost, 25000); stateDeductions.total += njDed; const addBack = Math.max(0, s179Ded - njDed); if (addBack > 0) { njAddBack += addBack; insights.push({ type: 'warning', text: `New Jersey requires a ${formatCurrency(addBack)} depreciation add-back for Section 179.` }); } } break; }
                        case 'CHAR_CLAT_01': { const fedAGIForClat = (yearData.w2Income + yearData.businessIncome) - fedDeductions.aboveAGI, clatDed = Math.min(yearData.charitableIntent || 0, fedAGIForClat * 0.30); fedDeductions.belowAGI += clatDed; insights.push({ type: 'success', text: `Charitable CLAT provides a ${formatCurrency(clatDed)} federal itemized deduction.` }); if (clatDed < (yearData.charitableIntent || 0)) insights.push({ type: 'warning', text: `Charitable deduction was limited by AGI to ${formatCurrency(clatDed)}.` }); if (yearData.state === 'NY') stateDeductions.total += clatDed * 0.5; break; }
                        case 'OG_USENERGY_01': { const ogDed = (yearData.ogInvestment || 0) * 0.70; fedDeductions.belowAGI += ogDed; insights.push({ type: 'success', text: `Oil & Gas investment generates a ${formatCurrency(ogDed)} federal deduction.` }); if (yearData.state === 'NY') stateDeductions.total += ogDed; break; }
                        case 'FILM_SEC181_01': { const filmDed = yearData.filmInvestment || 0; fedDeductions.belowAGI += filmDed; insights.push({ type: 'success', text: `Film financing provides a ${formatCurrency(filmDed)} federal deduction.` }); if (yearData.state === 'NY') stateDeductions.total += filmDed; break; }
                        case 'SOLO401K_EMPLOYEE_01': { const s401kEmpDed = Math.min(yearData.solo401kEmployee, 23000); fedDeductions.aboveAGI += s401kEmpDed; insights.push({ type: 'success', text: `Solo 401(k) employee contribution of ${formatCurrency(s401kEmpDed)} reduces federal AGI.` }); if (yearData.state === 'NY') { stateDeductions.total += s401kEmpDed; } else { njAddBack += s401kEmpDed; insights.push({ type: 'warning', text: `New Jersey taxes Solo 401(k) employee deferrals. A ${formatCurrency(s401kEmpDed)} add-back is required.` }); } break; }
                        case 'SOLO401K_EMPLOYER_01': { const s401kEmployerDed = yearData.solo401kEmployer || 0; qbiBaseIncome -= s401kEmployerDed; fedDeductions.aboveAGI += s401kEmployerDed; stateDeductions.total += s401kEmployerDed; insights.push({ type: 'success', text: `Solo 401(k) employer contribution of ${formatCurrency(s401kEmployerDed)} reduces business income for QBI.` }); break; }
                        case 'DB_PLAN_01': { const dbDed = yearData.dbContribution || 0; qbiBaseIncome -= dbDed; fedDeductions.aboveAGI += dbDed; stateDeductions.total += dbDed; insights.push({ type: 'success', text: `Defined Benefit plan contribution of ${formatCurrency(dbDed)} reduces business income for QBI.` }); break; }
                        default: break;
                    }
                }
            });

            const ordinaryIncome = yearData.w2Income + yearData.businessIncome + currentStGains;
            const fedAGI = ordinaryIncome - fedDeductions.aboveAGI;
            let amti = fedAGI; const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - (amti - 1140800) * 0.25); const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount); const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);
            const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);
            let qbiDeduction = 0;
            if (strategies['QBI_FINAL_01'] && qbiBaseIncome > 0) { if (fedTaxableForQBI <= 383900) { qbiDeduction = Math.min(qbiBaseIncome * 0.20, fedTaxableForQBI * 0.20); insights.push({ type: 'success', text: `QBI deduction of ${formatCurrency(qbiDeduction)} successfully applied.` }); } else { insights.push({ type: 'warning', text: `Client's taxable income exceeds the threshold for the QBI deduction.` }); } }
            const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
            const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
            const fedCapitalGainsTax = Math.max(0, currentLtGains) * 0.20;
            const regularFedTax = fedOrdinaryTax + fedCapitalGainsTax;
            const fedTax = Math.max(regularFedTax, amtTax);
            const stateTaxableIncome = Math.max(0, (yearData.w2Income + yearData.businessIncome + currentLtGains + currentStGains) - stateDeductions.total + njAddBack);
            const stateTax = calculateTax(stateTaxableIncome, stateBrackets);
            const totalIncome = yearData.w2Income + yearData.businessIncome + currentLtGains + currentStGains;
            const afterTaxIncome = totalIncome - (fedTax + stateTax);
            return { totalTax: fedTax + stateTax, fedTax, stateTax, totalCapitalAllocated, afterTaxIncome, insights };
        };

        const baseline = getTaxesForYear(currentYearData, {});
        const withStrategies = getTaxesForYear(currentYearData, enabledStrategies);
        cumulativeBaselineTax += baseline.totalTax;
        cumulativeOptimizedTax += withStrategies.totalTax;
        cumulativeSavings = cumulativeBaselineTax - cumulativeOptimizedTax;
        projections.push({ year: i + 1, baseline, withStrategies, cumulativeSavings });
    }
    return { projections, cumulative: { baselineTax: cumulativeBaselineTax, optimizedTax: cumulativeOptimizedTax, totalSavings: cumulativeSavings, capitalAllocated: projections[0]?.withStrategies.totalCapitalAllocated || 0, }, withStrategies: projections[0]?.withStrategies };
};

// --- NEW PROFESSIONAL UI COMPONENTS ---
const Header = ({ onPrint, clientName }) => (
    <div className="bg-background-primary border-b border-border-primary px-8 py-6 sticky top-0 z-50">
        <div className="flex items-center justify-between">
            {/* Logo and Company Info */}
            <div className="flex items-center gap-6">
                <img 
                    src="https://ablewealth.com/AWM%20Logo%203.png" 
                    alt="Able Wealth Management" 
                    className="h-16 w-auto"
                />
                <div className="border-l border-border-secondary pl-6">
                    <h1 className="font-serif text-2xl font-bold text-text-primary leading-tight">
                        Advanced Tax Strategy Optimizer
                    </h1>
                    <p className="font-serif text-sm text-text-secondary mt-1">
                        Able Wealth Management
                    </p>
                </div>
            </div>

            {/* Client Analysis Info and Actions */}
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="font-serif text-sm text-text-muted">Analysis for:</p>
                    <p className="font-serif text-lg font-semibold text-text-primary">{clientName}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background-tertiary px-4 py-2 rounded-md text-xs font-medium text-text-secondary">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        Analysis Active
                    </div>
                    <button 
                        onClick={onPrint} 
                        className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-navy transition-all shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                            <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                        </svg>
                        Print Report
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const Section = ({ title, description, children }) => (
    <div className="bg-background-primary rounded-lg shadow-md border border-border-primary overflow-hidden">
        <div className="px-8 py-6 border-b border-border-primary bg-background-secondary">
            <h2 className="font-serif text-xl font-semibold text-text-primary flex items-center gap-3">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <div className="p-8">{children}</div>
    </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="h-12 px-4 border border-border-secondary rounded-md text-base bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        />
    </div>
);

const SelectField = ({ label, value, onChange, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">{label}</label>
        <select value={value} onChange={onChange} className="h-12 px-4 border border-border-secondary rounded-md text-base bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent">
            {children}
        </select>
    </div>
);

const ClientInputSection = ({ scenario, updateClientData }) => {
    return (
        <Section title="📋 Client Profile & Projections" description="Configure client financial parameters and multi-year projection settings.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Client Name" type="text" value={scenario.clientData.clientName} onChange={e => updateClientData('clientName', e.target.value)} />
                <SelectField label="State of Residence" value={scenario.clientData.state} onChange={e => updateClientData('state', e.target.value)}>
                    <option value="NJ">New Jersey</option>
                    <option value="NY">New York</option>
                </SelectField>
                <InputField label="W-2 Income" type="number" value={scenario.clientData.w2Income} onChange={e => updateClientData('w2Income', Number(e.target.value) || 0)} placeholder="$ 500,000" />
                <InputField label="Business Income" type="number" value={scenario.clientData.businessIncome} onChange={e => updateClientData('businessIncome', Number(e.target.value) || 0)} placeholder="$ 2,000,000" />
                <InputField label="Short Term Gains" type="number" value={scenario.clientData.shortTermGains} onChange={e => updateClientData('shortTermGains', Number(e.target.value) || 0)} placeholder="$ 150,000" />
                <InputField label="Long Term Gains" type="number" value={scenario.clientData.longTermGains} onChange={e => updateClientData('longTermGains', Number(e.target.value) || 0)} placeholder="$ 850,000" />
                <SelectField label="Projection Years" value={scenario.clientData.projectionYears} onChange={e => updateClientData('projectionYears', parseInt(e.target.value))}>
                     <option value={0}>Current Year Only</option><option value={3}>3 Years</option><option value={5}>5 Years</option><option value={10}>10 Years</option>
                </SelectField>
                <InputField label="Income Growth Rate (%)" type="number" value={scenario.clientData.growthRate} onChange={e => updateClientData('growthRate', Number(e.target.value) || 0)} placeholder="e.g., 3" />
            </div>
        </Section>
    )
};

// FIXED: Move StrategyCard component outside of StrategiesSection to prevent re-renders
const StrategyCard = ({ strategy, scenario, toggleStrategy, updateClientData, children }) => {
    const isActive = scenario.enabledStrategies[strategy.id];
    return (
        <div className={`border rounded-lg p-6 transition-all relative ${isActive ? 'border-accent-gold bg-gradient-to-br from-white to-amber-50' : 'border-border-primary bg-background-primary hover:border-primary-blue'}`}>
            {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-gold rounded-l-lg"></div>}
            <div className="flex items-start gap-4">
                <input type="checkbox" checked={isActive} onChange={() => toggleStrategy(strategy.id)} className="mt-1 h-5 w-5 rounded accent-accent-gold"/>
                <div className="flex-1">
                    <h3 className="font-semibold text-base text-text-primary">{strategy.name}</h3>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">{strategy.category}</p>
                    <p className="text-sm text-text-secondary mt-2">{strategy.description}</p>
                </div>
            </div>
            {isActive && children && <div className="mt-4 pl-9">{children}</div>}
        </div>
    )
};

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => {
    return (
        <Section title="💼 Strategic Tax Optimization Portfolio" description="Select advanced tax strategies and input corresponding investment or contribution amounts.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {STRATEGY_LIBRARY.map(strategy => (
                    <StrategyCard 
                        key={strategy.id} 
                        strategy={strategy}
                        scenario={scenario}
                        toggleStrategy={toggleStrategy}
                        updateClientData={updateClientData}
                    >
                        <InputField 
                            label="Investment Amount" 
                            type="number" 
                            value={scenario.clientData[strategy.inputRequired]} 
                            onChange={e => updateClientData(strategy.inputRequired, Number(e.target.value) || 0)} 
                            placeholder="Enter amount"
                        />
                        {strategy.id === 'QUANT_DEALS_01' && (
                            <div className="mt-4">
                                <SelectField 
                                    label="DEALS Exposure Level" 
                                    value={scenario.clientData.dealsExposure} 
                                    onChange={e => updateClientData('dealsExposure', e.target.value)}
                                >
                                    {Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.description}</option>
                                    ))}
                                </SelectField>
                            </div>
                        )}
                    </StrategyCard>
                ))}
                {RETIREMENT_STRATEGIES.map(strategy => (
                    <StrategyCard 
                        key={strategy.id} 
                        strategy={strategy}
                        scenario={scenario}
                        toggleStrategy={toggleStrategy}
                        updateClientData={updateClientData}
                    >
                        <InputField 
                            label="Contribution Amount" 
                            type="number" 
                            value={scenario.clientData[strategy.inputRequired]} 
                            onChange={e => updateClientData(strategy.inputRequired, Number(e.target.value) || 0)} 
                            placeholder="Enter amount"
                        />
                    </StrategyCard>
                ))}
            </div>
        </Section>
    )
};

const ResultsDashboard = ({ results }) => {
    if (!results || !results.cumulative) return null;
    const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = results.cumulative;
    const savingsPercentage = baselineTax > 0 ? totalSavings / baselineTax : 0;

    const MetricCard = ({ label, value, subtext, isHighlighted = false }) => (
        <div className={`p-6 rounded-lg text-center transition-all ${isHighlighted ? 'bg-white/20' : 'bg-white/10'}`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</h3>
            <p className={`text-4xl font-bold my-2 ${isHighlighted ? 'text-accent-gold-light' : 'text-white'}`}>{value}</p>
            <p className="text-sm opacity-90">{subtext}</p>
        </div>
    );
    return (
        <div className="bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl p-10 text-white shadow-xl">
            <div className="text-center mb-8">
                <h2 className="font-serif text-3xl font-bold">Executive Tax Optimization Analysis</h2>
                <p className="text-base opacity-80 mt-2">Comprehensive strategic tax planning results and optimization metrics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard label="Baseline Tax Liability" value={formatCurrency(baselineTax)} subtext="Pre-optimization scenario" />
                <MetricCard label="Optimized Tax Liability" value={formatCurrency(optimizedTax)} subtext="Post-strategy implementation" />
                <MetricCard label="Total Tax Optimization" value={formatCurrency(totalSavings)} subtext={`${formatPercentage(savingsPercentage)} effective reduction`} isHighlighted />
                <MetricCard label="Total Capital Allocated" value={formatCurrency(capitalAllocated)} subtext="Total investment in strategies" />
            </div>
        </div>
    );
};

const InsightsSection = ({ insights }) => (
    <Section title="💡 Strategic Implementation Insights" description="Tax strategy analysis and optimization recommendations.">
        <div className="space-y-4">
            {!insights || insights.length === 0 ? (<p className="text-text-muted">Enable strategies to see personalized recommendations and considerations.</p>) : (
                insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg flex items-start gap-4 border-l-4 ${insight.type === 'success' ? 'bg-green-50 border-success' : 'bg-amber-50 border-warning'}`}>
                        <div className={`text-xl ${insight.type === 'success' ? 'text-success' : 'text-warning'}`}>{insight.type === 'success' ? '✅' : '⚠️'}</div>
                        <div>
                            <h4 className={`font-semibold ${insight.type === 'success' ? 'text-success' : 'text-warning'}`}>{insight.type === 'success' ? 'Strategic Benefit' : 'Implementation Consideration'}</h4>
                            <p className="text-text-secondary">{insight.text}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </Section>
);

const ChartsSection = ({ results }) => {
    if (!results || !results.projections || results.projections.length === 0) return null;
    
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (<div className="bg-primary-navy/90 p-4 rounded-lg border border-primary-blue shadow-lg text-white"><p className="label font-semibold">{`${label}`}</p>{payload.map((p, i) => (<p key={i} style={{ color: p.color }}>{`${p.name}: ${formatCurrency(p.value)}`}</p>))}</div>);
        }
        return null;
    };

    // Prepare data for the tax breakdown chart
    const firstProjection = results.projections[0];
    const taxBreakdownData = [
        {
            scenario: 'Baseline Scenario',
            federalTax: firstProjection.baseline.fedTax,
            stateTax: firstProjection.baseline.stateTax
        },
        {
            scenario: 'Optimized Strategy',
            federalTax: firstProjection.withStrategies.fedTax,
            stateTax: firstProjection.withStrategies.stateTax
        }
    ];

    return (
        <Section title="📈 Visual Projections" description="Multi-year analysis of tax liabilities and cumulative savings.">
            {/* Tax Liability Breakdown Chart */}
            <div className="mb-8">
                <h3 className="text-base font-semibold mb-4 text-center text-text-secondary">Tax Liability Comparison Analysis</h3>
                <p className="text-sm text-text-muted text-center mb-6">Baseline vs. optimized tax scenarios with federal and state breakdown</p>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={taxBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                        <XAxis 
                            dataKey="scenario" 
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                            interval={0}
                            angle={0}
                            textAnchor="middle"
                        />
                        <YAxis 
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} 
                            tick={{ fill: 'var(--text-muted)' }} 
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 64, 175, 0.1)' }} />
                        <Bar dataKey="federalTax" stackId="taxes" fill="var(--primary-blue)" name="Federal Tax" />
                        <Bar dataKey="stateTax" stackId="taxes" fill="var(--accent-gold)" name="State Tax" />
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--primary-blue)' }}></div>
                        <span className="text-sm text-text-secondary">Federal Tax</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--accent-gold)' }}></div>
                        <span className="text-sm text-text-secondary">State Tax</span>
                    </div>
                </div>
            </div>

            {/* Multi-year projections - only show if more than 1 year */}
            {results.projections.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-base font-semibold mb-4 text-center text-text-secondary">Annual Tax Liability Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={results.projections} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)' }} />
                                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fill: 'var(--text-muted)' }} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 64, 175, 0.1)' }} />
                                <Bar dataKey="baseline.totalTax" fill="var(--text-muted)" name="Baseline Tax" />
                                <Bar dataKey="withStrategies.totalTax" fill="var(--primary-blue)" name="Optimized Tax" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-4 text-center text-text-secondary">Cumulative Savings Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={results.projections} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)' }} />
                                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fill: 'var(--text-muted)' }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="cumulativeSavings" stroke="var(--accent-gold)" strokeWidth={3} name="Savings" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Section>
    )
};

const AppFooter = () => (
    <footer className="max-w-7xl mx-auto px-8 py-8 mt-8 border-t border-border-primary text-xs text-text-muted text-justify">
        <p><strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC ("AWM") for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions. The results are not a guarantee of future tax savings. Tax laws are complex and subject to change. AWM does not provide legal or tax advice. Please consult with your qualified professional tax advisor and legal counsel before implementing any strategy.</p>
    </footer>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [scenario, setScenario] = useState(() => createNewScenario('Default Scenario'));

    const handleUpdateClientData = useCallback((field, value) => {
        setScenario(prev => ({
            ...prev,
            clientData: { ...prev.clientData, [field]: value }
        }));
    }, []);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenario(prev => ({
            ...prev,
            enabledStrategies: { ...prev.enabledStrategies, [strategyId]: !prev.enabledStrategies[strategyId] }
        }));
    }, []);

    const calculationResults = useMemo(() => {
        return performTaxCalculations(scenario);
    }, [scenario]);

    const handlePrint = () => {
        const printContainer = document.getElementById('print-mount');
        if (printContainer && scenario && calculationResults) {
            ReactDOM.render(<PrintableReport scenario={scenario} results={calculationResults} years={scenario.clientData.projectionYears} />, printContainer, () => { window.print(); });
        }
    };

    return (
        <div className="bg-background-secondary min-h-screen">
            <Header onPrint={handlePrint} clientName={scenario.clientData.clientName} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <ClientInputSection scenario={scenario} updateClientData={handleUpdateClientData} />
                <StrategiesSection scenario={scenario} toggleStrategy={handleToggleStrategy} updateClientData={handleUpdateClientData} />
                <ResultsDashboard results={calculationResults} />
                <InsightsSection insights={calculationResults?.withStrategies?.insights} />
                <ChartsSection results={calculationResults} />
            </main>
            <AppFooter />
        </div>
    );
}

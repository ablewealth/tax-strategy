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

const performTaxCalculations = (scenario, projectionYears, growthRate) => {
    if (!scenario) return null;
    const projections = [];
    let cumulativeBaselineTax = 0;
    let cumulativeOptimizedTax = 0;
    let cumulativeSavings = 0;
    const loopYears = projectionYears === 0 ? 1 : projectionYears;

    for (let i = 0; i < loopYears; i++) {
        const growthFactor = Math.pow(1 + growthRate / 100, i);
        const currentYearData = { ...scenario.clientData, w2Income: scenario.clientData.w2Income * growthFactor, businessIncome: scenario.clientData.businessIncome * growthFactor, longTermGains: scenario.clientData.longTermGains * growthFactor, shortTermGains: scenario.clientData.shortTermGains * growthFactor };

        const getTaxesForYear = (clientData, enabledStrategies) => {
            let fedDeductions = { aboveAGI: 0, belowAGI: 0 }, stateDeductions = { total: 0 }, njAddBack = 0, qbiBaseIncome = clientData.businessIncome || 0, currentLtGains = clientData.longTermGains || 0, currentStGains = clientData.shortTermGains || 0, totalCapitalAllocated = 0, insights = [];
            const stateBrackets = clientData.state === 'NY' ? NY_TAX_BRACKETS : NJ_TAX_BRACKETS;
            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];

            allStrategies.forEach(strategy => {
                if (enabledStrategies[strategy.id]) {
                    if (strategy.type !== 'qbi' && clientData[strategy.inputRequired] > 0) totalCapitalAllocated += clientData[strategy.inputRequired];
                    switch (strategy.id) {
                        case 'QUANT_DEALS_01': { const exposure = DEALS_EXPOSURE_LEVELS[clientData.dealsExposure], stLoss = (clientData.investmentAmount || 0) * exposure.shortTermLossRate, ltGainFromDeals = (clientData.investmentAmount || 0) * exposure.longTermGainRate, stOffset = Math.min(currentStGains, stLoss); currentStGains -= stOffset; const remainingLoss = stLoss - stOffset, ltOffset = Math.min(currentLtGains, remainingLoss); currentLtGains -= ltOffset; const remainingLoss2 = remainingLoss - ltOffset, ordinaryOffset = Math.min(3000, remainingLoss2); fedDeductions.belowAGI += ordinaryOffset; stateDeductions.total += ordinaryOffset; currentLtGains += ltGainFromDeals; insights.push({ type: 'success', text: `DEALS strategy generated ${formatCurrency(stOffset + ltOffset)} in capital loss offsets and a ${formatCurrency(ordinaryOffset)} ordinary income deduction.` }); break; }
                        case 'EQUIP_S179_01': { const s179Ded = Math.min(clientData.equipmentCost, qbiBaseIncome, 1220000); qbiBaseIncome -= s179Ded; fedDeductions.aboveAGI += s179Ded; insights.push({ type: 'success', text: `Section 179 provides a ${formatCurrency(s179Ded)} federal deduction.` }); if (clientData.state === 'NY') { stateDeductions.total += s179Ded; } else { const njDed = Math.min(clientData.equipmentCost, 25000); stateDeductions.total += njDed; const addBack = Math.max(0, s179Ded - njDed); if (addBack > 0) { njAddBack += addBack; insights.push({ type: 'warning', text: `New Jersey requires a ${formatCurrency(addBack)} depreciation add-back for Section 179.` }); } } break; }
                        case 'CHAR_CLAT_01': { const fedAGIForClat = (clientData.w2Income + clientData.businessIncome) - fedDeductions.aboveAGI, clatDed = Math.min(clientData.charitableIntent || 0, fedAGIForClat * 0.30); fedDeductions.belowAGI += clatDed; insights.push({ type: 'success', text: `Charitable CLAT provides a ${formatCurrency(clatDed)} federal itemized deduction.` }); if (clatDed < (clientData.charitableIntent || 0)) insights.push({ type: 'warning', text: `Charitable deduction was limited by AGI to ${formatCurrency(clatDed)}.` }); if (clientData.state === 'NY') stateDeductions.total += clatDed * 0.5; break; }
                        case 'OG_USENERGY_01': { const ogDed = (clientData.ogInvestment || 0) * 0.70; fedDeductions.belowAGI += ogDed; insights.push({ type: 'success', text: `Oil & Gas investment generates a ${formatCurrency(ogDed)} federal deduction.` }); if (clientData.state === 'NY') stateDeductions.total += ogDed; break; }
                        case 'FILM_SEC181_01': { const filmDed = clientData.filmInvestment || 0; fedDeductions.belowAGI += filmDed; insights.push({ type: 'success', text: `Film financing provides a ${formatCurrency(filmDed)} federal deduction.` }); if (clientData.state === 'NY') stateDeductions.total += filmDed; break; }
                        case 'SOLO401K_EMPLOYEE_01': { const s401kEmpDed = Math.min(clientData.solo401kEmployee, 23000); fedDeductions.aboveAGI += s401kEmpDed; insights.push({ type: 'success', text: `Solo 401(k) employee contribution of ${formatCurrency(s401kEmpDed)} reduces federal AGI.` }); if (clientData.state === 'NY') { stateDeductions.total += s401kEmpDed; } else { njAddBack += s401kEmpDed; insights.push({ type: 'warning', text: `New Jersey taxes Solo 401(k) employee deferrals. A ${formatCurrency(s401kEmpDed)} add-back is required.` }); } break; }
                        case 'SOLO401K_EMPLOYER_01': { const s401kEmployerDed = clientData.solo401kEmployer || 0; qbiBaseIncome -= s401kEmployerDed; fedDeductions.aboveAGI += s401kEmployerDed; stateDeductions.total += s401kEmployerDed; insights.push({ type: 'success', text: `Solo 401(k) employer contribution of ${formatCurrency(s401kEmployerDed)} reduces business income for QBI.` }); break; }
                        case 'DB_PLAN_01': { const dbDed = clientData.dbContribution || 0; qbiBaseIncome -= dbDed; fedDeductions.aboveAGI += dbDed; stateDeductions.total += dbDed; insights.push({ type: 'success', text: `Defined Benefit plan contribution of ${formatCurrency(dbDed)} reduces business income for QBI.` }); break; }
                        default: break;
                    }
                }
            });

            const ordinaryIncome = clientData.w2Income + clientData.businessIncome + currentStGains;
            const fedAGI = ordinaryIncome - fedDeductions.aboveAGI;
            let amti = fedAGI; const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - (amti - 1140800) * 0.25); const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount); const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);
            const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);
            let qbiDeduction = 0;
            if (enabledStrategies['QBI_FINAL_01'] && qbiBaseIncome > 0) { if (fedTaxableForQBI <= 383900) { qbiDeduction = Math.min(qbiBaseIncome * 0.20, fedTaxableForQBI * 0.20); insights.push({ type: 'success', text: `QBI deduction of ${formatCurrency(qbiDeduction)} successfully applied.` }); } else { insights.push({ type: 'warning', text: `Client's taxable income exceeds the threshold for the QBI deduction.` }); } }
            const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
            const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
            const fedCapitalGainsTax = Math.max(0, currentLtGains) * 0.20;
            const regularFedTax = fedOrdinaryTax + fedCapitalGainsTax;
            const fedTax = Math.max(regularFedTax, amtTax);
            const stateTaxableIncome = Math.max(0, (clientData.w2Income + clientData.businessIncome + currentLtGains + currentStGains) - stateDeductions.total + njAddBack);
            const stateTax = calculateTax(stateTaxableIncome, stateBrackets);
            const totalIncome = clientData.w2Income + clientData.businessIncome + currentLtGains + currentStGains;
            const afterTaxIncome = totalIncome - (fedTax + stateTax);
            return { totalTax: fedTax + stateTax, fedTax, stateTax, totalCapitalAllocated, afterTaxIncome, insights };
        };

        const baseline = getTaxesForYear(currentYearData, {});
        const withStrategies = getTaxesForYear(currentYearData, scenario.enabledStrategies);
        cumulativeBaselineTax += baseline.totalTax;
        cumulativeOptimizedTax += withStrategies.totalTax;
        cumulativeSavings = cumulativeBaselineTax - cumulativeOptimizedTax;
        projections.push({ year: i + 1, baseline, withStrategies, cumulativeSavings });
    }
    return { projections, cumulative: { baselineTax: cumulativeBaselineTax, optimizedTax: cumulativeOptimizedTax, totalSavings: cumulativeSavings, capitalAllocated: projections[0]?.withStrategies.totalCapitalAllocated || 0, }, withStrategies: projections[0]?.withStrategies };
};

// --- NEW PROFESSIONAL UI COMPONENTS ---
const Header = ({ onPrint }) => (
    <div className="bg-background-primary border-b border-border-primary px-8 h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-navy to-primary-blue rounded-md flex items-center justify-center text-white font-bold text-lg">AWM</div>
            <div>
                <h1 className="font-serif text-xl font-semibold text-text-primary">Advanced Tax Strategy Optimizer</h1>
                <p className="text-xs text-text-muted uppercase tracking-wider">Able Wealth Management</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background-tertiary px-4 py-2 rounded-md text-xs font-medium text-text-secondary"><div className="w-2 h-2 bg-success rounded-full"></div>Analysis Active</div>
            <button onClick={onPrint} className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-navy transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
                Print Report
            </button>
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

// UPDATED: InputField component to fix typing issue
const InputField = ({ label, type = 'number', value, onChange, placeholder }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">{label}</label>
        <input
            type={type}
            // If value is 0, display an empty string to show the placeholder. Otherwise, show the value.
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
    // UPDATED: handleNumericChange to parse numbers correctly from input
    const handleNumericChange = (field, value) => {
        // The value from a number input is a string. Convert to number, or default to 0 if empty.
        updateClientData(field, Number(value) || 0);
    };
    return (
        <Section title="📋 Client Profile & Projections" description="Configure client financial parameters and multi-year projection settings.">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Client Name" type="text" value={scenario.clientData.clientName} onChange={e => updateClientData('clientName', e.target.value)} />
                <SelectField label="State of Residence" value={scenario.clientData.state} onChange={e => updateClientData('state', e.target.value)}>
                    <option value="NJ">New Jersey</option>
                    <option value="NY">New York</option>
                </SelectField>
                <InputField label="W-2 Income" value={scenario.clientData.w2Income} onChange={e => handleNumericChange('w2Income', e.target.value)} placeholder="$ 500,000" />
                <InputField label="Business Income" value={scenario.clientData.businessIncome} onChange={e => handleNumericChange('businessIncome', e.target.value)} placeholder="$ 2,000,000" />
                <InputField label="Short Term Gains" value={scenario.clientData.shortTermGains} onChange={e => handleNumericChange('shortTermGains', e.target.value)} placeholder="$ 150,000" />
                <InputField label="Long Term Gains" value={scenario.clientData.longTermGains} onChange={e => handleNumericChange('longTermGains', e.target.value)} placeholder="$ 850,000" />
                <SelectField label="Projection Years" value={scenario.projectionYears} onChange={e => updateClientData('projectionYears', parseInt(e.target.value))}>
                     <option value={0}>Current Year Only</option><option value={3}>3 Years</option><option value={5}>5 Years</option><option value={10}>10 Years</option>
                </SelectField>
                <InputField label="Income Growth Rate (%)" value={scenario.growthRate} onChange={e => handleNumericChange('growthRate', e.target.value)} placeholder="e.g., 3" />
            </div>
        </Section>
    )
};

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => {
    const handleNumericChange = (field, value) => {
        updateClientData(field, Number(value) || 0);
    };
    const StrategyCard = ({ strategy, children }) => {
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
    }
    return (
        <Section title="💼 Strategic Tax Optimization Portfolio" description="Select advanced tax strategies and input corresponding investment or contribution amounts.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {STRATEGY_LIBRARY.map(strategy => (
                    <StrategyCard key={strategy.id} strategy={strategy}>
                        <InputField label="Investment Amount" value={scenario.clientData[strategy.inputRequired]} onChange={e => handleNumericChange(strategy.inputRequired, e.target.value)} placeholder="Enter amount"/>
                        {strategy.id === 'QUANT_DEALS_01' && (
                            <div className="mt-4"><SelectField label="DEALS Exposure Level" value={scenario.clientData.dealsExposure} onChange={e => updateClientData('dealsExposure', e.target.value)}>{Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (<option key={key} value={key}>{`${value.description} - ${value.subtitle}`}</option>))}</SelectField></div>
                        )}
                    </StrategyCard>
                ))}
                {RETIREMENT_STRATEGIES.map(strategy => (
                    <StrategyCard key={strategy.id} strategy={strategy}>
                        <InputField label="Contribution Amount" value={scenario.clientData[strategy.inputRequired]} onChange={e => handleNumericChange(strategy.inputRequired, e.target.value)} placeholder="Enter amount"/>
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
    if (!results || !results.projections || results.projections.length === 0 || results.projections.length < 2) return null;
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (<div className="bg-primary-navy/90 p-4 rounded-lg border border-primary-blue shadow-lg text-white"><p className="label font-semibold">{`Year ${label}`}</p>{payload.map((p, i) => (<p key={i} style={{ color: p.color }}>{`${p.name}: ${formatCurrency(p.value)}`}</p>))}</div>);
        }
        return null;
    };
    return (
        <Section title="📈 Visual Projections" description="Multi-year analysis of tax liabilities and cumulative savings.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-base font-semibold mb-4 text-center text-text-secondary">Annual Tax Liability Comparison</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={results.projections} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                            <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)' }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} tick={{ fill: 'var(--text-muted)' }} />
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
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} tick={{ fill: 'var(--text-muted)' }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="cumulativeSavings" stroke="var(--accent-gold)" strokeWidth={3} name="Savings" dot={{ r: 4 }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Section>
    )
};

const AppFooter = () => (
    <footer className="max-w-7xl mx-auto px-8 py-8 mt-8 border-t border-border-primary text-xs text-text-muted text-justify">
        <p><strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions. The results are not a guarantee of future tax savings. Tax laws are complex and subject to change. AWM does not provide legal or tax advice. Please consult with your qualified professional tax advisor and legal counsel before implementing any strategy.</p>
    </footer>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [scenario, setScenario] = useState(() => createNewScenario('Default Scenario'));
    const [projectionYears, setProjectionYears] = useState(0);
    const [growthRate, setGrowthRate] = useState(0);

    const handleUpdateClientData = useCallback((field, value) => {
        if (field === 'projectionYears') {
            setProjectionYears(value);
        } else if (field === 'growthRate') {
            setGrowthRate(value);
        } else {
            setScenario(prev => ({ ...prev, clientData: { ...prev.clientData, [field]: value } }));
        }
    }, []);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenario(prev => ({ ...prev, enabledStrategies: { ...prev.enabledStrategies, [strategyId]: !prev.enabledStrategies[strategyId] } }));
    }, []);

    const calculationResults = useMemo(() => {
        return performTaxCalculations(scenario, projectionYears, growthRate);
    }, [scenario, projectionYears, growthRate]);

    const handlePrint = () => {
        const printContainer = document.getElementById('print-mount');
        if (printContainer && scenario && calculationResults) {
            ReactDOM.render(<PrintableReport scenario={scenario} results={calculationResults} years={projectionYears} />, printContainer, () => { window.print(); });
        }
    };

    return (
        <div className="bg-background-secondary min-h-screen">
            <Header onPrint={handlePrint} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <ClientInputSection scenario={{...scenario, projectionYears, growthRate}} updateClientData={handleUpdateClientData} />
                <StrategiesSection scenario={scenario} toggleStrategy={handleToggleStrategy} updateClientData={handleUpdateClientData} />
                <ResultsDashboard results={calculationResults} />
                <InsightsSection insights={calculationResults?.withStrategies?.insights} />
                <ChartsSection results={calculationResults} />
            </main>
            <AppFooter />
        </div>
    );
}

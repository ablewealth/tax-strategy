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

// --- Helper Functions (No changes to logic) ---

const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
}).format(Math.round(value || 0));

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

// --- Tax Calculation Logic (Updated for State Selection) ---

const performTaxCalculations = (scenario, projectionYears, growthRate) => {
    if (!scenario) return null;

    const projections = [];
    let cumulativeBaselineTax = 0;
    let cumulativeOptimizedTax = 0;
    let cumulativeSavings = 0;
    
    const loopYears = projectionYears === 0 ? 1 : projectionYears;

    for (let i = 0; i < loopYears; i++) {
        const growthFactor = Math.pow(1 + growthRate / 100, i);
        
        const currentYearData = {
            ...scenario.clientData,
            w2Income: scenario.clientData.w2Income * growthFactor,
            businessIncome: scenario.clientData.businessIncome * growthFactor,
            longTermGains: scenario.clientData.longTermGains * growthFactor,
            shortTermGains: scenario.clientData.shortTermGains * growthFactor,
        };

        const getTaxesForYear = (clientData, enabledStrategies) => {
            let fedDeductions = { aboveAGI: 0, belowAGI: 0 };
            let stateDeductions = { total: 0 };
            let njAddBack = 0; // NJ specific add-backs
            let qbiBaseIncome = clientData.businessIncome || 0;
            let currentLtGains = clientData.longTermGains || 0;
            let currentStGains = clientData.shortTermGains || 0;
            let totalCapitalAllocated = 0;
            
            const stateBrackets = clientData.state === 'NY' ? NY_TAX_BRACKETS : NJ_TAX_BRACKETS;
            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];

            allStrategies.forEach(strategy => {
                if (enabledStrategies[strategy.id]) {
                     if (strategy.type !== 'qbi' && clientData[strategy.inputRequired] > 0) {
                        totalCapitalAllocated += clientData[strategy.inputRequired];
                    }
                    
                    switch (strategy.id) {
                         case 'QUANT_DEALS_01':
                            const exposure = DEALS_EXPOSURE_LEVELS[clientData.dealsExposure];
                            const stLoss = (clientData.investmentAmount || 0) * exposure.shortTermLossRate;
                            const ltGainFromDeals = (clientData.investmentAmount || 0) * exposure.longTermGainRate;
                            
                            const stOffset = Math.min(currentStGains, stLoss);
                            currentStGains -= stOffset;
                            const remainingLoss = stLoss - stOffset;

                            const ltOffset = Math.min(currentLtGains, remainingLoss);
                            currentLtGains -= ltOffset;
                            const remainingLoss2 = remainingLoss - ltOffset;

                            const ordinaryOffset = Math.min(3000, remainingLoss2);
                            fedDeductions.belowAGI += ordinaryOffset;
                            stateDeductions.total += ordinaryOffset;
                            currentLtGains += ltGainFromDeals;
                            break;
                        case 'EQUIP_S179_01':
                            const s179Ded = Math.min(clientData.equipmentCost, qbiBaseIncome, 1220000);
                            qbiBaseIncome -= s179Ded;
                            fedDeductions.aboveAGI += s179Ded;
                            
                            if (clientData.state === 'NY') {
                                stateDeductions.total += s179Ded;
                            } else { // NJ logic
                                const njDed = Math.min(clientData.equipmentCost, 25000);
                                stateDeductions.total += njDed;
                                njAddBack += Math.max(0, s179Ded - njDed);
                            }
                            break;
                        case 'CHAR_CLAT_01':
                            const fedAGIForClat = (clientData.w2Income + clientData.businessIncome) - fedDeductions.aboveAGI;
                            const clatDed = Math.min(clientData.charitableIntent || 0, fedAGIForClat * 0.30);
                            fedDeductions.belowAGI += clatDed;
                            // NY allows 50% of federal deduction, NJ does not have this specific rule for CLATs
                            if (clientData.state === 'NY') {
                                stateDeductions.total += clatDed * 0.5;
                            }
                            break;
                        case 'OG_USENERGY_01':
                            const ogDed = (clientData.ogInvestment || 0) * 0.70;
                            fedDeductions.belowAGI += ogDed;
                            if (clientData.state === 'NY') {
                                stateDeductions.total += ogDed;
                            }
                            break;
                        case 'FILM_SEC181_01':
                            const filmDed = clientData.filmInvestment || 0;
                            fedDeductions.belowAGI += filmDed;
                            if (clientData.state === 'NY') {
                                stateDctions.total += filmDed;
                            }
                            break;
                        case 'SOLO401K_EMPLOYEE_01':
                            const s401kEmpDed = Math.min(clientData.solo401kEmployee, 23000);
                            fedDeductions.aboveAGI += s401kEmpDed;
                            if (clientData.state === 'NY') {
                                stateDeductions.total += s401kEmpDed;
                            } else { // NJ taxes employee deferrals
                                njAddBack += s401kEmpDed;
                            }
                            break;
                        case 'SOLO401K_EMPLOYER_01':
                            const s401kEmployerDed = clientData.solo401kEmployer || 0;
                            qbiBaseIncome -= s401kEmployerDed;
                            fedDeductions.aboveAGI += s401kEmployerDed;
                            stateDeductions.total += s401kEmployerDed;
                            break;
                        case 'DB_PLAN_01':
                            const dbDed = clientData.dbContribution || 0;
                            qbiBaseIncome -= dbDed;
                            fedDeductions.aboveAGI += dbDed;
                            stateDeductions.total += dbDed;
                            break;
                        default:
                            break;
                    }
                }
            });

            const ordinaryIncome = clientData.w2Income + clientData.businessIncome + currentStGains;
            const fedAGI = ordinaryIncome - fedDeductions.aboveAGI;
            
            let amti = fedAGI;
            const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - (amti - 1140800) * 0.25);
            const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount);
            const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);

            const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);
            let qbiDeduction = 0;
            if (enabledStrategies['QBI_FINAL_01'] && qbiBaseIncome > 0 && fedTaxableForQBI <= 383900) {
                qbiDeduction = Math.min(qbiBaseIncome * 0.20, fedTaxableForQBI * 0.20);
            }
            const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
            const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
            const fedCapitalGainsTax = Math.max(0, currentLtGains) * 0.20;
            const regularFedTax = fedOrdinaryTax + fedCapitalGainsTax;
            
            const fedTax = Math.max(regularFedTax, amtTax);

            const stateTaxableIncome = Math.max(0, (clientData.w2Income + clientData.businessIncome + currentLtGains + currentStGains) - stateDeductions.total + njAddBack);
            const stateTax = calculateTax(stateTaxableIncome, stateBrackets);

            const totalIncome = clientData.w2Income + clientData.businessIncome + currentLtGains + currentStGains;
            const afterTaxIncome = totalIncome - (fedTax + stateTax);

            return { totalTax: fedTax + stateTax, fedTax, stateTax, totalCapitalAllocated, afterTaxIncome };
        };

        const baseline = getTaxesForYear(currentYearData, {});
        const withStrategies = getTaxesForYear(currentYearData, scenario.enabledStrategies);

        cumulativeBaselineTax += baseline.totalTax;
        cumulativeOptimizedTax += withStrategies.totalTax;
        cumulativeSavings = cumulativeBaselineTax - cumulativeOptimizedTax;

        projections.push({
            year: i + 1,
            baseline,
            withStrategies,
            cumulativeSavings
        });
    }

    return {
        projections,
        cumulative: {
            baselineTax: cumulativeBaselineTax,
            optimizedTax: cumulativeOptimizedTax,
            totalSavings: cumulativeSavings,
            capitalAllocated: projections[0]?.withStrategies.totalCapitalAllocated || 0,
        }
    };
};

// --- REDESIGNED UI COMPONENTS ---

const Header = ({ onPrint }) => (
    <header className="bg-base-800/80 backdrop-blur-sm sticky top-0 z-40 print-hide border-b border-base-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-10 invert brightness-0" />
                    <h1 className="text-xl font-bold text-white">Tax Optimizer</h1>
                </div>
                <button
                    onClick={onPrint}
                    className="bg-primary text-base-900 font-semibold px-5 py-2 rounded-lg hover:bg-opacity-80 transition-all shadow-md"
                >
                    Print Report
                </button>
            </div>
        </div>
    </header>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-base-800 rounded-xl border border-base-700 shadow-card p-6 animate-fade-in ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-semibold text-white mb-4 border-b border-base-700 pb-2">{children}</h3>
);

const InputField = ({ label, type = 'number', value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            className="form-input w-full bg-base-900 border-base-700 focus:ring-primary focus:border-primary" 
        />
    </div>
);

const SelectField = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-sm font-medium text-text-muted mb-1">{label}</label>
        <select value={value} onChange={onChange} className="form-select w-full bg-base-900 border-base-700 focus:ring-primary focus:border-primary">
            {children}
        </select>
    </div>
);

const ClientInputSection = ({ scenario, updateClientData }) => (
    <Card>
        <SectionTitle>Client Financials</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField label="Client Name" type="text" value={scenario.clientData.clientName} onChange={e => updateClientData('clientName', e.target.value)} />
            
            {/* STATE SELECTOR ADDED HERE */}
            <SelectField label="State of Residence" value={scenario.clientData.state} onChange={e => updateClientData('state', e.target.value)}>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
            </SelectField>
            
            <InputField label="W-2 Income" value={scenario.clientData.w2Income} onChange={e => updateClientData('w2Income', parseFloat(e.target.value) || 0)} placeholder="e.g., 500000" />
            <InputField label="Business Income" value={scenario.clientData.businessIncome} onChange={e => updateClientData('businessIncome', parseFloat(e.target.value) || 0)} placeholder="e.g., 2000000" />
            <InputField label="Short Term Gains" value={scenario.clientData.shortTermGains} onChange={e => updateClientData('shortTermGains', parseFloat(e.target.value) || 0)} placeholder="e.g., 150000" />
            <InputField label="Long Term Gains" value={scenario.clientData.longTermGains} onChange={e => updateClientData('longTermGains', parseFloat(e.target.value) || 0)} placeholder="e.g., 850000" />
        </div>
    </Card>
);

const ProjectionsControl = ({ years, setYears, growthRate, setGrowthRate }) => (
    <Card>
        <SectionTitle>Projection Controls</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Projection Years" value={years} onChange={e => setYears(parseInt(e.target.value))}>
                <option value={0}>Current Year Only</option>
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={10}>10 Years</option>
            </SelectField>
            <InputField label="Income Growth Rate (%)" value={growthRate} onChange={e => setGrowthRate(parseFloat(e.target.value) || 0)} />
        </div>
    </Card>
);

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => (
    <Card>
        <SectionTitle>Tax Strategies</SectionTitle>
        <div className="space-y-4">
            {STRATEGY_LIBRARY.map(strategy => (
                <div key={strategy.id} className="bg-base-900 p-4 rounded-lg border border-base-700 transition-all hover:border-primary">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`strat-${strategy.id}`}
                                checked={scenario.enabledStrategies[strategy.id] || false}
                                onChange={() => toggleStrategy(strategy.id)}
                                className="h-4 w-4 rounded border-base-700 bg-base-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`strat-${strategy.id}`} className="ml-3">
                                <h4 className="font-medium text-text-main">{strategy.name}</h4>
                                <p className="text-sm text-text-muted">{strategy.description}</p>
                            </label>
                        </div>
                    </div>
                    {scenario.enabledStrategies[strategy.id] && strategy.inputRequired && (
                        <div className="mt-4 pl-7">
                            <InputField 
                                label="Investment Amount"
                                value={scenario.clientData[strategy.inputRequired] || ''}
                                onChange={e => updateClientData(strategy.inputRequired, parseFloat(e.target.value) || 0)}
                                placeholder="Enter amount"
                            />
                             {strategy.id === 'QUANT_DEALS_01' && (
                                <div className="mt-2">
                                    <SelectField value={scenario.clientData.dealsExposure} onChange={e => updateClientData('dealsExposure', e.target.value)}>
                                        {Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (
                                            <option key={key} value={key}>{value.description}</option>
                                        ))}
                                    </SelectField>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </Card>
);

const ResultsDashboard = ({ results }) => {
    if (!results || !results.cumulative) return (
        <Card className="flex items-center justify-center h-full">
            <p className="text-text-muted">Results will be displayed here.</p>
        </Card>
    );

    const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = results.cumulative;

    const MetricCard = ({ label, value, isHighlighted = false }) => (
        <div className={`p-4 rounded-lg text-center ${isHighlighted ? 'bg-primary' : 'bg-base-700'}`}>
            <p className={`text-sm font-medium ${isHighlighted ? 'text-base-900' : 'text-text-muted'}`}>{label}</p>
            <p className={`text-3xl font-bold mt-1 ${isHighlighted ? 'text-base-900' : 'text-white'}`}>{formatCurrency(value)}</p>
        </div>
    );
    
    return (
        <Card>
            <SectionTitle>Cumulative Summary</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard label="Baseline Tax" value={baselineTax} />
                <MetricCard label="Optimized Tax" value={optimizedTax} />
                <MetricCard label="Total Savings" value={totalSavings} isHighlighted />
                <MetricCard label="Capital Committed" value={capitalAllocated} />
            </div>
        </Card>
    );
};

const ChartsSection = ({ results }) => {
    if (!results || !results.projections || results.projections.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-700 p-4 rounded-lg border border-base-800 shadow-lg">
                    <p className="label text-text-main">{`Year ${label}`}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }} className="text-sm">
                            {`${p.name}: ${formatCurrency(p.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <SectionTitle>Visual Projections</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-md font-medium mb-4 text-center text-text-muted">Annual Tax Liability</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={results.projections} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="year" tick={{ fill: '#8b949e' }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} tick={{ fill: '#8b949e' }} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167, 139, 250, 0.1)' }}/>
                            <Bar dataKey="baseline.totalTax" fill="#be123c" name="Baseline Tax" />
                            <Bar dataKey="withStrategies.totalTax" fill="#2dd4bf" name="Optimized Tax" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h4 className="text-md font-medium mb-4 text-center text-text-muted">Cumulative Savings</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.projections} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="year" tick={{ fill: '#8b949e' }} />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} tick={{ fill: '#8b949e' }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="cumulativeSavings" stroke="#a78bfa" strokeWidth={3} name="Savings" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
    const [scenarios, setScenarios] = useState(() => [createNewScenario('Default Scenario')]);
    const [activeScenarioId, setActiveScenarioId] = useState(() => scenarios[0].id);
    const [projectionYears, setProjectionYears] = useState(5);
    const [growthRate, setGrowthRate] = useState(3.0);

    const activeScenario = useMemo(() => scenarios.find(s => s.id === activeScenarioId), [scenarios, activeScenarioId]);

    const calculationResults = useMemo(() => {
        if (!activeScenario) return null;
        return performTaxCalculations(activeScenario, projectionYears, growthRate);
    }, [activeScenario, projectionYears, growthRate]);

    const handlePrint = () => {
        const printContainer = document.getElementById('print-mount');
        if (printContainer && activeScenario && calculationResults) {
            ReactDOM.render(
                <PrintableReport 
                    scenario={activeScenario} 
                    results={calculationResults} 
                    years={projectionYears}
                    growthRate={growthRate}
                />, 
                printContainer, 
                () => { window.print(); }
            );
        }
    };
    
    const handleUpdateClientData = useCallback((field, value) => {
        setScenarios(prev => prev.map(s => 
            s.id === activeScenarioId 
                ? { ...s, clientData: { ...s.clientData, [field]: value } } 
                : s
        ));
    }, [activeScenarioId]);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenarios(prev => prev.map(s => 
            s.id === activeScenarioId 
                ? { ...s, enabledStrategies: { ...s.enabledStrategies, [strategyId]: !s.enabledStrategies[strategyId] } } 
                : s
        ));
    }, [activeScenarioId]);

    return (
        <div className="min-h-screen bg-base-900 animate-fade-in">
            <Header onPrint={handlePrint} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeScenario ? (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <ClientInputSection scenario={activeScenario} updateClientData={handleUpdateClientData} />
                            </div>
                            <div className="space-y-8">
                                <ProjectionsControl 
                                    years={projectionYears} 
                                    setYears={setProjectionYears} 
                                    growthRate={growthRate} 
                                    setGrowthRate={setGrowthRate} 
                                />
                                <ResultsDashboard results={calculationResults} />
                            </div>
                        </div>
                        <StrategiesSection 
                            scenario={activeScenario} 
                            toggleStrategy={handleToggleStrategy} 
                            updateClientData={handleUpdateClientData} 
                        />
                        <ChartsSection results={calculationResults} />
                    </div>
                ) : (
                     <Card className="text-center text-text-muted">
                        Please select or create a scenario to begin.
                     </Card>
                )}
            </main>
            <div id="print-mount" className="print-only"></div>
        </div>
    );
}

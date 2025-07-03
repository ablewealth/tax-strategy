import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Constants and Configuration ---

const DEALS_EXPOSURE_LEVELS = {
    '130/30': { shortTermLossRate: 0.10, longTermGainRate: 0.024, description: '130/30 Strategy' },
    '145/45': { shortTermLossRate: 0.138, longTermGainRate: 0.033, description: '145/45 Strategy' },
    '175/75': { shortTermLossRate: 0.206, longTermGainRate: 0.049, description: '175/75 Strategy' },
    '225/125': { shortTermLossRate: 0.318, longTermGainRate: 0.076, description: '225/125 Strategy' },
};

const STRATEGY_LIBRARY = [
    { id: 'QUANT_DEALS_01', name: 'Quantino DEALS™', category: 'Systematic Investment', description: 'Algorithmic trading generating strategic capital losses to offset gains.', inputRequired: 'investmentAmount', type: 'capital' },
    { id: 'EQUIP_S179_01', name: 'Section 179 Acceleration', category: 'Business Tax Strategy', description: 'Immediate expensing of qualifying business equipment purchases up to $1.22M.', inputRequired: 'equipmentCost', type: 'aboveAGI' },
    { id: 'CHAR_CLAT_01', name: 'Charitable CLAT', category: 'Philanthropic Planning', description: 'Charitable giving structure providing immediate substantial deductions.', inputRequired: 'charitableIntent', type: 'belowAGI' },
    { id: 'OG_USENERGY_01', name: 'Energy Investment IDCs', category: 'Alternative Investment', description: 'Participation in domestic oil & gas ventures providing upfront deductions.', inputRequired: 'ogInvestment', type: 'belowAGI' },
    { id: 'FILM_SEC181_01', name: 'Film Financing (Sec 181)', category: 'Alternative Investment', description: '100% upfront deduction of investment in qualified film production.', inputRequired: 'filmInvestment', type: 'belowAGI' },
    { id: 'QBI_FINAL_01', name: 'QBI Optimization', category: 'Income Strategy', description: 'Maximizing the 20% Qualified Business Income deduction.', inputRequired: 'businessIncome', type: 'qbi' },
    // Retirement strategies are handled in a separate component
];

const RETIREMENT_STRATEGIES = [
    { id: 'SOLO401K_EMPLOYEE_01', name: 'Solo 401(k) - Employee', description: 'Employee elective deferral contributions.', inputRequired: 'solo401kEmployee', type: 'aboveAGI' },
    { id: 'SOLO401K_EMPLOYER_01', name: 'Solo 401(k) - Employer', description: 'Employer profit-sharing contributions.', inputRequired: 'solo401kEmployer', type: 'aboveAGI' },
    { id: 'DB_PLAN_01', name: 'Executive Retirement Plan', description: 'High-contribution defined benefit pension plan.', inputRequired: 'dbContribution', type: 'aboveAGI' },
];


const FED_TAX_BRACKETS = [
    { rate: 0.10, min: 0, max: 23200 }, { rate: 0.12, min: 23201, max: 94300 }, { rate: 0.22, min: 94301, max: 201050 },
    { rate: 0.24, min: 201051, max: 383900 }, { rate: 0.32, min: 383901, max: 487450 }, { rate: 0.35, min: 487451, max: 731200 },
    { rate: 0.37, min: 731201, max: Infinity },
];

const NJ_TAX_BRACKETS = [
    { rate: 0.014, min: 0, max: 20000 }, { rate: 0.0175, min: 20001, max: 35000 }, { rate: 0.035, min: 35001, max: 40000 },
    { rate: 0.05525, min: 40001, max: 75000 }, { rate: 0.0637, min: 75001, max: 500000 }, { rate: 0.0897, min: 500001, max: 1000000 },
    { rate: 0.1075, min: 1000001, max: Infinity },
];

const STANDARD_DEDUCTION = 29200;

const createNewScenario = (name) => ({
    id: Date.now(),
    name: name,
    clientData: {
        w2Income: 500000, businessIncome: 2000000, capitalGains: 1000000, state: 'NJ',
        investmentAmount: 500000, dealsExposure: '175/75',
        equipmentCost: 0, charitableIntent: 0, ogInvestment: 0, filmInvestment: 0,
        solo401kEmployee: 0, solo401kEmployer: 0, dbContribution: 0,
    },
    enabledStrategies: [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
});


// --- Helper & Utility Components ---

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value || 0));

const TooltipWrapper = ({ text, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && (
                <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 z-50 shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
};

// --- Core Components ---

const Header = () => (
    <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white font-bold text-lg">AWM</div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Advanced Tax Strategy Optimizer</h1>
                        <p className="text-sm text-gray-500">For Able Wealth Management</p>
                    </div>
                </div>
                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">Print Report</button>
            </div>
        </div>
    </header>
);

const DisclaimerModal = ({ onAccept }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
            <p className="text-sm text-gray-600 mb-6">
                This tool is for illustrative purposes only and presents hypothetical tax optimization scenarios. It does not constitute legal, tax, or investment advice. Tax laws are subject to change. Consult a qualified professional before implementing any strategies.
            </p>
            <button onClick={onAccept} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                I Understand and Accept
            </button>
        </div>
    </div>
);

const ScenarioTabs = ({ scenarios, activeScenario, setActiveScenario, addScenario, removeScenario }) => (
    <div className="bg-gray-100 p-2 rounded-t-lg">
        <div className="flex items-center border-b border-gray-300">
            {scenarios.map(scenario => (
                <button
                    key={scenario.id}
                    onClick={() => setActiveScenario(scenario.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeScenario === scenario.id
                            ? 'border-blue-600 text-blue-600 bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                    }`}
                >
                    {scenario.name}
                    {scenarios.length > 1 && (
                         <span onClick={(e) => { e.stopPropagation(); removeScenario(scenario.id); }} className="ml-2 text-gray-400 hover:text-red-500">&times;</span>
                    )}
                </button>
            ))}
            <button onClick={addScenario} className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition">+</button>
        </div>
    </div>
);

const ClientInputSection = ({ scenario, updateClientData }) => {
    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        updateClientData(name, Number(value.replace(/[^0-9.-]+/g, '')) || 0);
    };

    const InputField = ({ name, label, tooltip }) => (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                {label}
                <TooltipWrapper text={tooltip}>
                    <span className="ml-1 text-gray-400 cursor-help">(?)</span>
                </TooltipWrapper>
            </label>
            <input
                type="text"
                name={name}
                value={new Intl.NumberFormat('en-US').format(scenario.clientData[name] || 0)}
                onChange={handleNumericChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-b-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Client Financial Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField name="w2Income" label="W-2 Income" tooltip="Salary and wages from employment." />
                <InputField name="businessIncome" label="Business Income" tooltip="Net income from self-employment or pass-through entities." />
                <InputField name="capitalGains" label="Long-Term Capital Gains" tooltip="Gains from assets held over one year." />
                <div className="flex flex-col">
                     <label className="text-sm font-medium text-gray-700 mb-1">State of Residence</label>
                     <select name="state" value={scenario.clientData.state} onChange={(e) => updateClientData('state', e.target.value)} className="p-2 border border-gray-300 rounded-md shadow-sm h-[42px]">
                         <option value="NJ">New Jersey</option>
                         <option value="NY">New York</option>
                     </select>
                </div>
            </div>
        </div>
    );
};

const RetirementStrategies = ({ scenario, toggleStrategy, updateClientData }) => {
    const areAnyActive = RETIREMENT_STRATEGIES.some(s => scenario.enabledStrategies[s.id]);
    return (
        <div className={`p-4 border rounded-lg transition ${areAnyActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
            <p className="font-semibold text-gray-800">Retirement & Executive Planning</p>
            <p className="text-xs text-gray-500 mb-4">Consolidated retirement contribution strategies.</p>
            <div className="space-y-4">
                {RETIREMENT_STRATEGIES.map(strategy => {
                    const isActive = scenario.enabledStrategies[strategy.id];
                    return (
                        <div key={strategy.id}>
                            <div className="flex items-center justify-between">
                                 <div className="flex items-center">
                                    <input type="checkbox" checked={isActive} onChange={() => toggleStrategy(strategy.id)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                                    <label className="ml-3 text-sm font-medium text-gray-700">{strategy.name}</label>
                                 </div>
                                {isActive && (
                                    <input
                                        type="text"
                                        value={new Intl.NumberFormat('en-US').format(scenario.clientData[strategy.inputRequired] || 0)}
                                        onChange={(e) => updateClientData(strategy.inputRequired, Number(e.target.value.replace(/[^0-9.-]+/g, '')) || 0)}
                                        className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                                    />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Tax Strategy Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRATEGY_LIBRARY.map(strategy => {
                const isActive = scenario.enabledStrategies[strategy.id];
                return (
                    <div key={strategy.id} className={`p-4 border rounded-lg transition ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
                        <div className="flex items-start">
                            <input type="checkbox" checked={isActive} onChange={() => toggleStrategy(strategy.id)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1" />
                            <div className="ml-3 flex-1">
                                <p className="font-semibold text-gray-800">{strategy.name}</p>
                                <p className="text-xs text-gray-500">{strategy.category}</p>
                                <TooltipWrapper text={strategy.description}>
                                     <p className="text-sm text-gray-600 mt-1 cursor-help">{strategy.description.substring(0, 60)}...</p>
                                </TooltipWrapper>
                            </div>
                        </div>
                        {isActive && strategy.inputRequired !== 'businessIncome' && (
                            <div className="mt-3 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Investment Amount</label>
                                <input
                                    type="text"
                                    value={new Intl.NumberFormat('en-US').format(scenario.clientData[strategy.inputRequired] || 0)}
                                    onChange={(e) => updateClientData(strategy.inputRequired, Number(e.target.value.replace(/[^0-9.-]+/g, '')) || 0)}
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                                />
                                {strategy.id === 'QUANT_DEALS_01' && (
                                     <div>
                                        <label className="text-sm font-medium text-gray-700">Exposure Level</label>
                                        <select value={scenario.clientData.dealsExposure} onChange={e => updateClientData('dealsExposure', e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm">
                                            {Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (
                                                <option key={key} value={key}>{value.description}</option>
                                            ))}
                                        </select>
                                     </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            <RetirementStrategies scenario={scenario} toggleStrategy={toggleStrategy} updateClientData={updateClientData} />
        </div>
    </div>
);

const ResultsDashboard = ({ results }) => {
    if (!results) return null;
    const { baseline, withStrategies } = results;
    const totalSavings = baseline.totalTax - withStrategies.totalTax;
    const savingsPercentage = baseline.totalTax > 0 ? totalSavings / baseline.totalTax : 0;

    const MetricCard = ({ label, value, change, highlight = false }) => (
        <div className={`p-4 rounded-lg text-center ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(value)}</p>
            <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{change}</p>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Executive Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard label="Baseline Tax" value={baseline.totalTax} change="Before Strategies" />
                <MetricCard label="Optimized Tax" value={withStrategies.totalTax} change="After Strategies" />
                <MetricCard label="Total Savings" value={totalSavings} change={`${(savingsPercentage * 100).toFixed(1)}% Reduction`} highlight={true} />
            </div>
        </div>
    );
};

const TaxComparisonChart = ({ results }) => {
    if (!results) return null;
    const { baseline, withStrategies } = results;

    const chartData = {
        labels: ['Baseline', 'With Strategies'],
        datasets: [
            { label: 'Federal Tax', data: [baseline.fedTax, withStrategies.fedTax], backgroundColor: 'rgba(59, 130, 246, 0.7)' },
            { label: 'State Tax', data: [baseline.stateTax, withStrategies.stateTax], backgroundColor: 'rgba(251, 191, 36, 0.7)' },
        ],
    };

    const options = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Tax Liability Comparison' } }, scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (value) => formatCurrency(value) } } }, };
    return <Bar options={options} data={chartData} />;
};

const StrategicSavingsChart = ({ results }) => {
    if (!results || !results.strategyImpacts) return null;
    const filteredImpacts = results.strategyImpacts.filter(i => i.savings > 0);
    const chartData = {
        labels: filteredImpacts.map(i => i.name),
        datasets: [{ label: 'Tax Savings', data: filteredImpacts.map(i => i.savings), backgroundColor: 'rgba(16, 185, 129, 0.7)' }],
    };
    const options = { indexAxis: 'y', responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Savings by Strategy' } }, scales: { x: { ticks: { callback: (value) => formatCurrency(value) } } }, };
    return <Bar options={options} data={chartData} />;
};

const ChartsSection = ({ results }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-lg"><TaxComparisonChart results={results} /></div>
        <div className="bg-white p-4 rounded-lg shadow-lg"><StrategicSavingsChart results={results} /></div>
    </div>
);

// --- Calculation Logic Hook ---

const useTaxCalculations = (scenario) => {
    return useMemo(() => {
        if (!scenario) return null;

        const { clientData } = scenario;

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
        
        const getTaxesForScenario = (enabledStrategies) => {
            let fedDeductions = { aboveAGI: 0, belowAGI: 0 };
            let stateDeductions = 0;
            let qbiBaseIncome = clientData.businessIncome || 0;
            let currentCapitalGains = clientData.capitalGains || 0;

            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];
            allStrategies.forEach(strategy => {
                if (enabledStrategies[strategy.id]) {
                    switch (strategy.id) {
                        case 'QUANT_DEALS_01':
                            const exposure = DEALS_EXPOSURE_LEVELS[clientData.dealsExposure];
                            const stLoss = (clientData.investmentAmount || 0) * exposure.shortTermLossRate;
                            const ltGain = (clientData.investmentAmount || 0) * exposure.longTermGainRate;
                            const gainOffset = Math.min(currentCapitalGains, stLoss);
                            fedDeductions.belowAGI += Math.min(3000, stLoss - gainOffset);
                            currentCapitalGains = currentCapitalGains - gainOffset + ltGain;
                            break;
                        case 'EQUIP_S179_01':
                            const s179Ded = Math.min(clientData.equipmentCost, qbiBaseIncome, 1220000);
                            qbiBaseIncome -= s179Ded;
                            fedDeductions.aboveAGI += s179Ded;
                            stateDeductions += Math.min(clientData.equipmentCost, 25000);
                            break;
                        case 'SOLO401K_EMPLOYEE_01':
                            fedDeductions.aboveAGI += Math.min(clientData.solo401kEmployee, 23000);
                            break;
                        case 'SOLO401K_EMPLOYER_01':
                            const s401kEmpDed = clientData.solo401kEmployer || 0;
                            qbiBaseIncome -= s401kEmpDed;
                            fedDeductions.aboveAGI += s401kEmpDed;
                            stateDeductions += s401kEmpDed;
                            break;
                        case 'DB_PLAN_01':
                            const dbDed = clientData.dbContribution || 0;
                            qbiBaseIncome -= dbDed;
                            fedDeductions.aboveAGI += dbDed;
                            stateDeductions += dbDed;
                            break;
                    }
                }
            });

            const fedAGI = (clientData.w2Income || 0) + (clientData.businessIncome || 0) - fedDeductions.aboveAGI;
            const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);
            let qbiDeduction = 0;
            if (enabledStrategies['QBI_FINAL_01'] && qbiBaseIncome > 0 && fedTaxableForQBI <= 383900) {
                qbiDeduction = Math.min(qbiBaseIncome * 0.20, fedTaxableForQBI * 0.20);
            }
            
            const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
            const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
            const fedCapitalGainsTax = Math.max(0, currentCapitalGains) * 0.20;
            const fedTax = fedOrdinaryTax + fedCapitalGainsTax;
            
            const stateTaxableIncome = (clientData.w2Income || 0) + (clientData.businessIncome || 0) + currentCapitalGains - stateDeductions;
            const stateTax = calculateTax(stateTaxableIncome, NJ_TAX_BRACKETS);

            return { totalTax: fedTax + stateTax, fedTax, stateTax };
        };

        const baselineTaxes = getTaxesForScenario({});
        const baseline = { ...baselineTaxes, ordinaryIncome: (clientData.w2Income || 0) + (clientData.businessIncome || 0) };
        const withStrategies = getTaxesForScenario(scenario.enabledStrategies);
        
        const strategyImpacts = [];
        
        // 1. Calculate combined retirement savings
        const retirementStrategyIds = RETIREMENT_STRATEGIES.map(s => s.id);
        const areAnyRetirementStrategiesEnabled = retirementStrategyIds.some(id => scenario.enabledStrategies[id]);

        if (areAnyRetirementStrategiesEnabled) {
            const enabledWithoutRetirement = { ...scenario.enabledStrategies };
            retirementStrategyIds.forEach(id => { enabledWithoutRetirement[id] = false; });
            
            const taxWithoutRetirement = getTaxesForScenario(enabledWithoutRetirement).totalTax;
            const retirementSavings = taxWithoutRetirement - withStrategies.totalTax;
            
            if (retirementSavings > 0) {
                strategyImpacts.push({ name: 'Retirement Planning', savings: retirementSavings });
            }
        }

        // 2. Calculate savings for all other (non-retirement) strategies
        STRATEGY_LIBRARY.forEach(strategy => {
            if (scenario.enabledStrategies[strategy.id]) {
                const enabledWithoutThisStrategy = { ...scenario.enabledStrategies, [strategy.id]: false };
                const taxWithoutThisStrategy = getTaxesForScenario(enabledWithoutThisStrategy).totalTax;
                const savings = taxWithoutThisStrategy - withStrategies.totalTax;
                
                if (savings > 0) {
                    strategyImpacts.push({ name: strategy.name, savings });
                }
            }
        });

        return { baseline, withStrategies, strategyImpacts };
    }, [scenario]);
};

// --- Main App Component ---

export default function App() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [scenarios, setScenarios] = useState([createNewScenario('Scenario 1')]);
    const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const calculationResults = useTaxCalculations(activeScenario);

    const handleUpdateClientData = useCallback((field, value) => {
        setScenarios(prev => prev.map(s => s.id === activeScenarioId ? { ...s, clientData: { ...s.clientData, [field]: value } } : s));
    }, [activeScenarioId]);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenarios(prev => prev.map(s => s.id === activeScenarioId ? { ...s, enabledStrategies: { ...s.enabledStrategies, [strategyId]: !s.enabledStrategies[strategyId] } } : s));
    }, [activeScenarioId]);
    
    const addScenario = () => {
        const newScenario = createNewScenario(`Scenario ${scenarios.length + 1}`);
        setScenarios([...scenarios, newScenario]);
        setActiveScenarioId(newScenario.id);
    };
    
    const removeScenario = (idToRemove) => {
        const newScenarios = scenarios.filter(s => s.id !== idToRemove);
        setScenarios(newScenarios);
        if (activeScenarioId === idToRemove) {
            setActiveScenarioId(newScenarios[0]?.id || null);
        }
    };

    if (!activeScenario) {
        return <div className="p-8 text-center">Please add a scenario to begin.</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScenarioTabs scenarios={scenarios} activeScenario={activeScenarioId} setActiveScenario={setActiveScenarioId} addScenario={addScenario} removeScenario={removeScenario} />
                <ClientInputSection scenario={activeScenario} updateClientData={handleUpdateClientData} />
                <StrategiesSection scenario={active-scenario} toggleStrategy={handleToggleStrategy} updateClientData={handleUpdateClientData} />
                <ResultsDashboard results={calculationResults} />
                <ChartsSection results={calculationResults} />
            </main>
        </div>
    );
}

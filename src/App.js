import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Constants and Configuration ---

const DEALS_EXPOSURE_LEVELS = {
    '130/30': { shortTermLossRate: 0.10, longTermGainRate: 0.024, netBenefit: 0.035, description: '130/30 Strategy - 3.5% annual tax benefits' },
    '145/45': { shortTermLossRate: 0.138, longTermGainRate: 0.033, netBenefit: 0.046, description: '145/45 Strategy - 4.6% annual tax benefits' },
    '175/75': { shortTermLossRate: 0.206, longTermGainRate: 0.049, netBenefit: 0.069, description: '175/75 Strategy - 6.9% annual tax benefits' },
    '225/125': { shortTermLossRate: 0.318, longTermGainRate: 0.076, netBenefit: 0.106, description: '225/125 Strategy - 10.6% annual tax benefits' },
};

const STRATEGY_LIBRARY = [
    { id: 'QUANT_DEALS_01', name: 'Quantino DEALS™', category: 'Systematic Investment', description: 'Algorithmic trading generating strategic capital losses to offset gains.', inputRequired: 'investmentAmount', type: 'capital' },
    { id: 'EQUIP_S179_01', name: 'Section 179 Acceleration', category: 'Business Tax Strategy', description: 'Immediate expensing of qualifying business equipment purchases up to $1.22M.', inputRequired: 'equipmentCost', type: 'aboveAGI' },
    { id: 'CHAR_CLAT_01', name: 'Charitable CLAT', category: 'Philanthropic Planning', description: 'Charitable giving structure providing immediate substantial deductions.', inputRequired: 'charitableIntent', type: 'belowAGI' },
    { id: 'OG_USENERGY_01', name: 'Energy Investment IDCs', category: 'Alternative Investment', description: 'Participation in domestic oil & gas ventures providing upfront deductions.', inputRequired: 'ogInvestment', type: 'belowAGI' },
    { id: 'FILM_SEC181_01', name: 'Film Financing (Sec 181)', category: 'Alternative Investment', description: '100% upfront deduction of investment in qualified film production.', inputRequired: 'filmInvestment', type: 'belowAGI' },
    { id: 'QBI_FINAL_01', name: 'QBI Optimization', category: 'Income Strategy', description: 'Maximizing the 20% Qualified Business Income deduction.', inputRequired: 'businessIncome', type: 'qbi' },
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
        clientName: 'John & Jane Doe',
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

const Header = ({ onPrint }) => (
    <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-10" />
                    <h1 className="text-xl font-bold text-gray-900">Advanced Tax Strategy Optimizer</h1>
                </div>
                <button onClick={onPrint} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">Print Report</button>
            </div>
        </div>
    </header>
);

const DisclaimerModal = ({ onAccept }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl mx-4 text-sm">
            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
            <div className="space-y-4 text-gray-600 max-h-[60vh] overflow-y-auto pr-4">
                 <p>The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions.</p>
                <p>This calculator does not constitute legal, tax, or investment advice. All data and results are based on modeling assumptions that may not reflect actual outcomes or future tax law changes. The scenarios modeled should not be relied upon for making financial or tax-related decisions. Clients and other users must consult their own qualified tax professionals, legal advisors, or financial consultants before implementing any strategies described.</p>
                <p>Tax laws and interpretations are subject to change, and the effectiveness or applicability of strategies modeled may vary based on a client’s individual circumstances. Use of the calculator does not create an advisory relationship with AWM, nor does it replace the need for a comprehensive, personalized analysis.</p>
                <p>Able Wealth Management LLC is a registered investment adviser with the U.S. Securities and Exchange Commission (SEC). Registration does not imply a certain level of skill or training. For additional information, please refer to AWM’s Form ADV and Code of Ethics.</p>
            </div>
            <button onClick={onAccept} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6">
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
    
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        updateClientData(name, value);
    };

    const InputField = ({ name, label, tooltip, isNumeric = true }) => (
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
                value={isNumeric ? new Intl.NumberFormat('en-US').format(scenario.clientData[name] || 0) : scenario.clientData[name]}
                onChange={isNumeric ? handleNumericChange : handleTextChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-b-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Client Financial Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField name="clientName" label="Client Name" tooltip="The name of the client for this report." isNumeric={false} />
                <InputField name="w2Income" label="W-2 Income" tooltip="Salary and wages from employment." />
                <InputField name="businessIncome" label="Business Income" tooltip="Net income from self-employment or pass-through entities." />
                <InputField name="capitalGains" label="Long-Term Capital Gains" tooltip="Gains from assets held over one year." />
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

const DealsTooltipContent = ({ exposureLevel }) => {
    const levelData = DEALS_EXPOSURE_LEVELS[exposureLevel];
    if (!levelData) return null;

    const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;

    return (
        <div>
            <p className="font-bold mb-1">Quantino DEALS™ Details</p>
            <p className="mb-2">Generates strategic short-term losses to offset capital gains.</p>
            <p className="font-semibold">Selected Level ({exposureLevel}):</p>
            <ul className="list-disc list-inside text-xs mt-1">
                <li>Short-Term Losses: {formatPercent(levelData.shortTermLossRate)}</li>
                <li>Long-Term Gains: {formatPercent(levelData.longTermGainRate)}</li>
                <li>Net Annualized Benefit: {formatPercent(levelData.netBenefit)}</li>
            </ul>
        </div>
    );
};

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Tax Strategy Portfolio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRATEGY_LIBRARY.map(strategy => {
                const isActive = scenario.enabledStrategies[strategy.id];
                const tooltipContent = strategy.id === 'QUANT_DEALS_01'
                    ? <DealsTooltipContent exposureLevel={scenario.clientData.dealsExposure} />
                    : strategy.description;

                return (
                    <div key={strategy.id} className={`p-4 border rounded-lg transition ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}`}>
                        <div className="flex items-start">
                            <input type="checkbox" checked={isActive} onChange={() => toggleStrategy(strategy.id)} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 mt-1" />
                            <div className="ml-3 flex-1">
                                <p className="font-semibold text-gray-800">{strategy.name}</p>
                                <p className="text-xs text-gray-500">{strategy.category}</p>
                                <TooltipWrapper text={tooltipContent}>
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
    const { baseline, withStrategies, totalCapitalAllocated } = results;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Baseline Tax" value={baseline.totalTax} change="Before Strategies" />
                <MetricCard label="Optimized Tax" value={withStrategies.totalTax} change="After Strategies" />
                <MetricCard label="Total Savings" value={totalSavings} change={`${(savingsPercentage * 100).toFixed(1)}% Reduction`} highlight={true} />
                <MetricCard label="Capital Allocated" value={totalCapitalAllocated} change="Total Investment" />
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

const InsightsSection = ({ insights }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">💡 Strategic Implementation Insights</h3>
        <div className="space-y-3">
            {insights && insights.length > 0 ? (
                insights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-md flex items-start text-sm ${
                        insight.type === 'success' ? 'bg-green-50 text-green-800' :
                        insight.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                        'bg-blue-50 text-blue-800'
                    }`}>
                        <span className="mr-3 text-lg">{
                            insight.type === 'success' ? '✅' :
                            insight.type === 'warning' ? '⚠️' : 'ℹ️'
                        }</span>
                        <span>{insight.text}</span>
                    </div>
                ))
            ) : (
                <div className="p-3 rounded-md flex items-start text-sm bg-gray-50 text-gray-600">
                    <span className="mr-3 text-lg">ℹ️</span>
                    <span>Enable strategies and enter investment amounts to generate personalized insights.</span>
                </div>
            )}
        </div>
    </div>
);


// --- Calculation Logic Hook ---

const useTaxCalculations = (scenario) => {
    return useMemo(() => {
        if (!scenario) return null;

        const { clientData } = scenario;
        let totalCapitalAllocated = 0;

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
            let insights = [];
            totalCapitalAllocated = 0; // Reset for each calculation run

            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];
            allStrategies.forEach(strategy => {
                if (enabledStrategies[strategy.id]) {
                    // Add to capital allocated if it's an investment
                    if (strategy.type !== 'qbi' && clientData[strategy.inputRequired] > 0) {
                        totalCapitalAllocated += clientData[strategy.inputRequired];
                    }
                    
                    switch (strategy.id) {
                        case 'QUANT_DEALS_01':
                            const exposure = DEALS_EXPOSURE_LEVELS[clientData.dealsExposure];
                            const stLoss = (clientData.investmentAmount || 0) * exposure.shortTermLossRate;
                            const ltGain = (clientData.investmentAmount || 0) * exposure.longTermGainRate;
                            const gainOffset = Math.min(currentCapitalGains, stLoss);
                            const ordinaryOffset = Math.min(3000, stLoss - gainOffset);
                            fedDeductions.belowAGI += ordinaryOffset;
                            currentCapitalGains = currentCapitalGains - gainOffset + ltGain;
                            if (gainOffset > 0 || ordinaryOffset > 0) {
                                insights.push({type: 'success', text: `DEALS strategy generated ${formatCurrency(gainOffset)} in capital loss offsets and a ${formatCurrency(ordinaryOffset)} ordinary income deduction.`});
                            }
                            break;
                        case 'EQUIP_S179_01':
                            const s179Ded = Math.min(clientData.equipmentCost, qbiBaseIncome, 1220000);
                            qbiBaseIncome -= s179Ded;
                            fedDeductions.aboveAGI += s179Ded;
                            stateDeductions += Math.min(clientData.equipmentCost, 25000);
                             if (s179Ded > 0) {
                                insights.push({type: 'success', text: `Section 179 provides a federal deduction of ${formatCurrency(s179Ded)}.`});
                            }
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
                        case 'CHAR_CLAT_01':
                            const fedAGIForClat = (clientData.w2Income || 0) + (clientData.businessIncome || 0) - fedDeductions.aboveAGI;
                            const clatDed = Math.min(clientData.charitableIntent || 0, fedAGIForClat * 0.30);
                            fedDeductions.belowAGI += clatDed;
                            stateDeductions += clatDed;
                            if (clatDed > 0) {
                                insights.push({type: 'success', text: `Charitable CLAT provides a federal deduction of ${formatCurrency(clatDed)}.`});
                                if (clatDed < clientData.charitableIntent) {
                                    insights.push({type: 'warning', text: `Charitable deduction was limited by AGI to 30%.`});
                                }
                            }
                            break;
                        case 'OG_USENERGY_01':
                            const ogDed = (clientData.ogInvestment || 0) * 0.70;
                            fedDeductions.belowAGI += ogDed;
                            stateDeductions += ogDed;
                             if (ogDed > 0) {
                                insights.push({type: 'success', text: `Energy Investment generates a deduction of ${formatCurrency(ogDed)}.`});
                            }
                            break;
                        case 'FILM_SEC181_01':
                            const filmDed = clientData.filmInvestment || 0;
                            fedDeductions.belowAGI += filmDed;
                            stateDeductions += filmDed;
                            if (filmDed > 0) {
                                insights.push({type: 'success', text: `Film Financing (Sec 181) provides a 100% upfront deduction of ${formatCurrency(filmDed)}.`});
                            }
                            break;
                    }
                }
            });

            const fedAGI = (clientData.w2Income || 0) + (clientData.businessIncome || 0) - fedDeductions.aboveAGI;
            const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);
            let qbiDeduction = 0;
            if (enabledStrategies['QBI_FINAL_01'] && qbiBaseIncome > 0 && fedTaxableForQBI <= 383900) {
                qbiDeduction = Math.min(qbiBaseIncome * 0.20, fedTaxableForQBI * 0.20);
                 if (qbiDeduction > 0) {
                    insights.push({type: 'success', text: `Successfully unlocked a Qualified Business Income (QBI) deduction of ${formatCurrency(qbiDeduction)}.`});
                }
            } else if (enabledStrategies['QBI_FINAL_01'] && fedTaxableForQBI > 383900) {
                insights.push({type: 'warning', text: `Taxable income exceeds the QBI threshold, preventing the QBI deduction.`});
            }
            
            const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
            const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
            const fedCapitalGainsTax = Math.max(0, currentCapitalGains) * 0.20;
            const fedTax = fedOrdinaryTax + fedCapitalGainsTax;
            
            const stateTaxableIncome = (clientData.w2Income || 0) + (clientData.businessIncome || 0) + currentCapitalGains - stateDeductions;
            const stateTax = calculateTax(stateTaxableIncome, NJ_TAX_BRACKETS);

            return { totalTax: fedTax + stateTax, fedTax, stateTax, insights, totalCapitalAllocated };
        };

        const baselineTaxes = getTaxesForScenario({});
        const baseline = { ...baselineTaxes, ordinaryIncome: (clientData.w2Income || 0) + (clientData.businessIncome || 0) };
        const { totalTax, fedTax, stateTax, insights, totalCapitalAllocated: finalCapital } = getTaxesForScenario(scenario.enabledStrategies);
        const withStrategies = { totalTax, fedTax, stateTax, insights };
        
        const strategyImpacts = [];
        
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

        return { baseline, withStrategies, strategyImpacts, insights, totalCapitalAllocated: finalCapital };
    }, [scenario]);
};

// --- Printable Report Component ---
const PrintableReport = ({ scenario, results }) => {
    if (!results || !scenario) return null;
    
    const { clientData } = scenario;
    const { baseline, withStrategies, insights, totalCapitalAllocated } = results;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="printable-area">
             <div className="text-center mb-8">
                <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-12 mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Tax Optimization Analysis Report</h1>
                <div className="mt-4 text-sm">
                    <p className="font-semibold">Report for: {clientData.clientName}</p>
                    <p className="text-gray-600">{today}</p>
                </div>
            </div>
            
            <div className="mb-6">
                <h2 className="text-lg font-semibold border-b pb-2 mb-3">Executive Summary</h2>
                <table className="w-full text-sm">
                    <tbody>
                        <tr><td className="py-1">Baseline Tax Liability</td><td className="text-right font-medium">{formatCurrency(baseline.totalTax)}</td></tr>
                        <tr><td className="py-1">Optimized Tax Liability</td><td className="text-right font-medium">{formatCurrency(withStrategies.totalTax)}</td></tr>
                        <tr className="border-t"><td className="py-1 font-bold">Total Potential Savings</td><td className="text-right font-bold">{formatCurrency(baseline.totalTax - withStrategies.totalTax)}</td></tr>
                        <tr><td className="py-1">Total Capital Allocated</td><td className="text-right font-medium">{formatCurrency(totalCapitalAllocated)}</td></tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold border-b pb-2 mb-3">Applied Strategies & Investments</h2>
                <table className="w-full text-sm">
                     <tbody>
                        {[...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].map(s => {
                            if (scenario.enabledStrategies[s.id] && clientData[s.inputRequired] > 0 && s.id !== 'QBI_FINAL_01') {
                                return (
                                    <tr key={s.id}><td className="py-1">{s.name}</td><td className="text-right font-medium">{formatCurrency(clientData[s.inputRequired])}</td></tr>
                                )
                            }
                            return null;
                        })}
                    </tbody>
                </table>
            </div>
            
            {insights && insights.length > 0 && (
                 <div className="mb-6">
                    <h2 className="text-lg font-semibold border-b pb-2 mb-3">Implementation Insights</h2>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        {insights.map((insight, index) => (
                            <li key={index}>{insight.text}</li>
                        ))}
                    </ul>
                </div>
            )}

             <div className="text-[10px] text-gray-500 mt-8 space-y-1 leading-snug">
                <p><strong>Disclaimer:</strong> The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions.</p>
                <p>This calculator does not constitute legal, tax, or investment advice. All data and results are based on modeling assumptions that may not reflect actual outcomes or future tax law changes. The scenarios modeled should not be relied upon for making financial or tax-related decisions. Clients and other users must consult their own qualified tax professionals, legal advisors, or financial consultants before implementing any strategies described.</p>
                <p>Tax laws and interpretations are subject to change, and the effectiveness or applicability of strategies modeled may vary based on a client’s individual circumstances. Use of the calculator does not create an advisory relationship with AWM, nor does it replace the need for a comprehensive, personalized analysis.</p>
                <p>Able Wealth Management LLC is a registered investment adviser with the U.S. Securities and Exchange Commission (SEC). Registration does not imply a certain level of skill or training. For additional information, please refer to AWM’s Form ADV and Code of Ethics.</p>
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [scenarios, setScenarios] = useState([createNewScenario('Scenario 1')]);
    const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);

    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const calculationResults = useTaxCalculations(activeScenario);

    const handlePrint = () => {
        window.print();
    };
    
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
        <>
            <div id="app-root">
                {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}
                <Header onPrint={handlePrint} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ScenarioTabs scenarios={scenarios} activeScenario={activeScenarioId} setActiveScenario={setActiveScenarioId} addScenario={addScenario} removeScenario={removeScenario} />
                    <ClientInputSection scenario={activeScenario} updateClientData={handleUpdateClientData} />
                    <StrategiesSection scenario={activeScenario} toggleStrategy={handleToggleStrategy} updateClientData={handleUpdateClientData} />
                    <ResultsDashboard results={calculationResults} />
                    <ChartsSection results={calculationResults} />
                    <InsightsSection insights={calculationResults?.insights} />
                </main>
            </div>
            <div id="print-mount" className="hidden">
                <PrintableReport scenario={activeScenario} results={calculationResults} />
            </div>
        </>
    );
}

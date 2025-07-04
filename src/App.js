import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
    DEALS_EXPOSURE_LEVELS,
    STRATEGY_LIBRARY,
    RETIREMENT_STRATEGIES,
    FED_TAX_BRACKETS,
    AMT_BRACKETS,
    AMT_EXEMPTION,
    NJ_TAX_BRACKETS,
    STANDARD_DEDUCTION,
    createNewScenario
} from './constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// --- Helper & Utility Components ---

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value || 0));

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

const TooltipWrapper = ({ tooltipContent, children }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && (
                <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 z-50 shadow-lg">
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};

// --- Core Components ---

const Header = ({ onPrint, clientName }) => (
    <header className="bg-white shadow-md sticky top-0 z-40 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-10" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Advanced Tax Strategy Optimizer</h1>
                         {clientName && <p className="text-sm text-gray-500">Analysis for: {clientName}</p>}
                    </div>
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

const ScenarioTabs = ({ scenarios, activeView, setActiveView, addScenario, removeScenario }) => (
    <div className="bg-gray-100 p-2 rounded-t-lg print-hide">
        <div className="flex items-center border-b border-gray-300">
            {scenarios.map(scenario => (
                <button
                    key={scenario.id}
                    onClick={() => setActiveView(scenario.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition ${
                        activeView === scenario.id
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
            <button onClick={addScenario} className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">+</button>
            <div className="flex-grow"></div>
            <button onClick={() => setActiveView('compare')} className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeView === 'compare' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
                Compare Scenarios
            </button>
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
                <TooltipWrapper tooltipContent={tooltip}>
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
                <InputField name="longTermGains" label="Long-Term Capital Gains" tooltip="Gains from assets held over one year." />
            </div>
        </div>
    );
};

const ProjectionsControl = ({ years, setYears, growthRate, setGrowthRate }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Multi-Year Projections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Projection Period: {years} Year(s)</label>
                <input type="range" min="1" max="10" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Assumed Annual Income Growth Rate: {growthRate}%</label>
                 <input type="range" min="0" max="10" step="0.5" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>
    </div>
);


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
                                <TooltipWrapper tooltipContent={tooltipContent}>
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
    if (!results || !results.cumulative) return null;
    const { cumulative } = results;
    const { baselineTax, optimizedTax, totalSavings } = cumulative;

    const MetricCard = ({ label, value, change, highlight = false }) => (
        <div className={`p-4 rounded-lg text-center ${highlight ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(value)}</p>
            {change && <p className={`text-xs mt-1 ${highlight ? 'text-blue-200' : 'text-gray-500'}`}>{change}</p>}
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Cumulative Projection Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard label="Total Baseline Tax" value={baselineTax} change={`Over ${results.projections.length} years`} />
                <MetricCard label="Total Optimized Tax" value={optimizedTax} change={`Over ${results.projections.length} years`} />
                <MetricCard label="Total Tax Savings" value={totalSavings} change="Cumulative" highlight={true} />
            </div>
        </div>
    );
};

const CumulativeSavingsChart = ({ results }) => {
    if (!results) return null;
    const labels = results.projections.map(p => `Year ${p.year}`);
    const data = {
        labels,
        datasets: [
            {
                label: 'Cumulative Savings',
                data: results.projections.map(p => p.cumulativeSavings),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                fill: true,
            },
        ],
    };
    const options = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Cumulative Tax Savings Over Time' } }, scales: { y: { ticks: { callback: (value) => formatCurrency(value) } } } };
    return <Line options={options} data={data} />;
};

const AnnualTaxChart = ({ results }) => {
     if (!results) return null;
    const labels = results.projections.map(p => `Year ${p.year}`);
    const data = {
        labels,
        datasets: [
            { label: 'Baseline Annual Tax', data: results.projections.map(p => p.baseline.totalTax), backgroundColor: 'rgba(239, 68, 68, 0.7)' },
            { label: 'Optimized Annual Tax', data: results.projections.map(p => p.withStrategies.totalTax), backgroundColor: 'rgba(59, 130, 246, 0.7)' },
        ],
    };
    const options = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Annual Tax Liability Comparison' } }, scales: { x: { stacked: false }, y: { stacked: false, ticks: { callback: (value) => formatCurrency(value) } } } };
    return <Bar options={options} data={data} />;
}

const ChartsSection = ({ results }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-4 rounded-lg shadow-lg"><AnnualTaxChart results={results} /></div>
        <div className="bg-white p-4 rounded-lg shadow-lg"><CumulativeSavingsChart results={results} /></div>
    </div>
);

const ComparisonView = ({ allScenarioResults, projectionYears }) => (
    <div className="bg-white p-6 rounded-b-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Scenario Comparison</h3>
        {/* Cumulative Summary Table */}
        <div className="overflow-x-auto mb-8">
            <h4 className="text-lg font-semibold mb-2">Cumulative Summary</h4>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                        {allScenarioResults.map(({ scenario }) => (
                            <th key={scenario.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{scenario.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { label: 'Total Tax Savings', key: 'totalSavings' },
                        { label: 'Optimized Tax (Cumulative)', key: 'optimizedTax' },
                        { label: 'Baseline Tax (Cumulative)', key: 'baselineTax' },
                        { label: 'Capital Allocated', key: 'capitalAllocated' },
                    ].map(metric => (
                        <tr key={metric.key}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.label}</td>
                            {allScenarioResults.map(({ scenario, results }) => (
                                <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                                    {results && results.cumulative ? formatCurrency(results.cumulative[metric.key]) : 'N/A'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Year-by-Year Breakdown Table */}
        <div>
            <h4 className="text-lg font-semibold mb-2">Year-by-Year Breakdown</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year / Metric</th>
                            {allScenarioResults.map(({ scenario }) => (
                                <th key={scenario.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{scenario.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: projectionYears }, (_, i) => i + 1).map(year => (
                            <React.Fragment key={year}>
                                <tr className="bg-gray-100">
                                    <td className="px-6 py-3 text-sm font-bold text-gray-800" colSpan={allScenarioResults.length + 1}>Year {year}</td>
                                </tr>
                                <tr>
                                    <td className="pl-8 pr-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Annual Tax Savings</td>
                                    {allScenarioResults.map(({ scenario, results }) => {
                                        const yearData = results?.projections?.[year - 1];
                                        const annualSavings = yearData ? yearData.baseline.totalTax - yearData.withStrategies.totalTax : 0;
                                        return (
                                            <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatCurrency(annualSavings)}</td>
                                        );
                                    })}
                                </tr>
                                <tr>
                                    <td className="pl-8 pr-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Optimized Annual Tax</td>
                                    {allScenarioResults.map(({ scenario, results }) => {
                                        const yearData = results?.projections?.[year - 1];
                                        return (
                                            <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(yearData?.withStrategies.totalTax)}</td>
                                        );
                                    })}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);


// --- Calculation Logic (Moved outside of component to be a pure function) ---

const performTaxCalculations = (scenario, years, growthRate) => {
    if (!scenario) return null;

    const projections = [];
    let cumulativeBaselineTax = 0;
    let cumulativeOptimizedTax = 0;
    let cumulativeSavings = 0;

    for (let i = 0; i < years; i++) {
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
            let stateDeductions = 0;
            let qbiBaseIncome = clientData.businessIncome || 0;
            let currentLtGains = clientData.longTermGains || 0;
            let currentStGains = clientData.shortTermGains || 0;
            let totalCapitalAllocated = 0;
            
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
                            currentLtGains += ltGainFromDeals;
                            break;
                        case 'EQUIP_S179_01':
                            const s179Ded = Math.min(clientData.equipmentCost, qbiBaseIncome, 1220000);
                            qbiBaseIncome -= s179Ded;
                            fedDeductions.aboveAGI += s179Ded;
                            stateDeductions += Math.min(clientData.equipmentCost, 25000);
                            break;
                        case 'CHAR_CLAT_01':
                            const fedAGIForClat = (clientData.w2Income + clientData.businessIncome) - fedDeductions.aboveAGI;
                            const clatDed = Math.min(clientData.charitableIntent || 0, fedAGIForClat * 0.30);
                            fedDeductions.belowAGI += clatDed;
                            stateDeductions += clatDed;
                            break;
                        case 'OG_USENERGY_01':
                            fedDeductions.belowAGI += (clientData.ogInvestment || 0) * 0.70;
                            stateDeductions += (clientData.ogInvestment || 0) * 0.70;
                            break;
                        case 'FILM_SEC181_01':
                            fedDeductions.belowAGI += clientData.filmInvestment || 0;
                            stateDeductions += clientData.filmInvestment || 0;
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

            const ordinaryIncome = clientData.w2Income + clientData.businessIncome + currentStGains;
            const fedAGI = ordinaryIncome - fedDeductions.aboveAGI;
            
            // AMT Calculation
            let amti = fedAGI;
            const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - (amti - 1140800) * 0.25);
            const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount);
            const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);

            // Regular Tax Calculation
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
            const stateTax = calculateTax(clientData.w2Income + clientData.businessIncome + currentLtGains + currentStGains - stateDeductions, NJ_TAX_BRACKETS);

            return { totalTax: fedTax + stateTax, fedTax, stateTax, totalCapitalAllocated };
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


// --- Main App Component ---

export default function App() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [scenarios, setScenarios] = useState(() => {
        const savedScenarios = localStorage.getItem('taxOptimizerScenarios');
        return savedScenarios ? JSON.parse(savedScenarios) : [createNewScenario('Scenario 1')];
    });
    const [activeView, setActiveView] = useState(scenarios[0]?.id || 'compare');
    const [projectionYears, setProjectionYears] = useState(5);
    const [growthRate, setGrowthRate] = useState(3.0);

    const activeScenario = scenarios.find(s => s.id === activeView);
    
    const allScenarioResults = useMemo(() => {
        return scenarios.map(s => ({
            scenario: s,
            results: performTaxCalculations(s, projectionYears, growthRate)
        }));
    }, [scenarios, projectionYears, growthRate]);

    const calculationResults = useMemo(() => {
        if (activeView === 'compare' || !activeScenario) return null;
        const activeResult = allScenarioResults.find(r => r.scenario.id === activeView);
        return activeResult ? activeResult.results : null;
    }, [activeView, allScenarioResults, activeScenario]);

    useEffect(() => {
        localStorage.setItem('taxOptimizerScenarios', JSON.stringify(scenarios));
    }, [scenarios]);

    const handlePrint = () => window.print();
    
    const handleUpdateClientData = useCallback((field, value) => {
        setScenarios(prev => prev.map(s => s.id === activeView ? { ...s, clientData: { ...s.clientData, [field]: value } } : s));
    }, [activeView]);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenarios(prev => prev.map(s => s.id === activeView ? { ...s, enabledStrategies: { ...s.enabledStrategies, [strategyId]: !s.enabledStrategies[strategyId] } } : s));
    }, [activeView]);
    
    const addScenario = () => {
        const newScenario = createNewScenario(`Scenario ${scenarios.length + 1}`);
        setScenarios([...scenarios, newScenario]);
        setActiveView(newScenario.id);
    };
    
    const removeScenario = (idToRemove) => {
        const newScenarios = scenarios.filter(s => s.id !== idToRemove);
        setScenarios(newScenarios);
        if (activeView === idToRemove) {
            setActiveView(newScenarios[0]?.id || 'compare');
        }
    };

    return (
        <>
            <div id="app-root">
                {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}
                <Header onPrint={handlePrint} clientName={activeScenario?.clientData.clientName} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ScenarioTabs scenarios={scenarios} activeView={activeView} setActiveView={setActiveView} addScenario={addScenario} removeScenario={removeScenario} />
                    
                    {activeView === 'compare' ? (
                        <ComparisonView allScenarioResults={allScenarioResults} projectionYears={projectionYears} />
                    ) : activeScenario ? (
                        <>
                            <ClientInputSection scenario={activeScenario} updateClientData={handleUpdateClientData} />
                            <ProjectionsControl years={projectionYears} setYears={setProjectionYears} growthRate={growthRate} setGrowthRate={setGrowthRate} />
                            <StrategiesSection scenario={activeScenario} toggleStrategy={handleToggleStrategy} updateClientData={handleUpdateClientData} />
                            <ResultsDashboard results={calculationResults} />
                            <ChartsSection results={calculationResults} />
                        </>
                    ) : (
                         <div className="p-8 text-center">Please select or create a scenario to begin.</div>
                    )}
                </main>
            </div>
            <div id="print-mount" className="hidden">
                 {/* Printable report would need to be adapted for multi-year/comparison */}
            </div>
        </>
    );
}

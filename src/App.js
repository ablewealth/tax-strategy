import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, ResponsiveContainer, LineChart, Bar, Line } from 'recharts';
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

// --- Helper Functions ---

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

// --- Tax Calculation Logic ---

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


// --- Components ---
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

const Header = ({ onPrint, clientName }) => (
    <header className="bg-white shadow-md sticky top-0 z-40 print-hide">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <div className="flex items-center space-x-4">
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-10" />
                    <div className="flex items-baseline space-x-3">
                        <h1 className="text-xl font-bold text-gray-800">Advanced Tax Strategy Optimizer</h1>
                        {clientName && <p className="text-sm text-gray-500 font-medium">| Analysis for: {clientName}</p>}
                    </div>
                </div>
                <button onClick={onPrint} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">Print Report</button>
            </div>
        </div>
    </header>
);

const PrintableReport = ({ scenario, results }) => {
    if (!results || !scenario) return null;
    
    const { clientData } = scenario;
    const { cumulative, projections } = results;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="print-report-area">
            <div className="print-header">
                <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="print-logo" />
                <div className="print-title">
                    <h1>Tax Optimization Analysis</h1>
                    <p className="print-date">For: {clientData.clientName} | Scenario: {scenario.name} | Date: {today}</p>
                </div>
            </div>
            <table className="print-table summary-table">
                <thead>
                    <tr><th colSpan="2">Cumulative Summary over {projections.length} Years</th></tr>
                </thead>
                <tbody>
                    <tr><th>Baseline Tax Liability</th><td>{formatCurrency(cumulative.baselineTax)}</td></tr>
                    <tr><th>Optimized Tax Liability</th><td>{formatCurrency(cumulative.optimizedTax)}</td></tr>
                    <tr className="highlight"><th>Total Potential Savings</th><td>{formatCurrency(cumulative.totalSavings)}</td></tr>
                    <tr><th>Total Capital Committed</th><td>{formatCurrency(cumulative.capitalAllocated)}</td></tr>
                </tbody>
            </table>
            
            <div className="print-chart">
                 <h3 className="text-lg font-semibold mb-2">Annual Tax Liability</h3>
                 <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={projections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="baseline.totalTax" fill="#ef4444" name="Baseline Tax" />
                        <Bar dataKey="withStrategies.totalTax" fill="#3b82f6" name="Optimized Tax" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="print-disclaimer">
                Disclaimer: The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC (“AWM”) for internal use by its advisors and planning professionals. This tool presents hypothetical tax optimization scenarios using inputs provided by the user and applies assumptions and tax rules in effect as of May 2025. The outputs generated are for illustrative purposes only and are intended to demonstrate the potential impact of various tax planning strategies under assumed conditions.
            </p>
        </div>
    );
};

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
                         <span onClick={(e) => { e.stopPropagation(); removeScenario(scenario.id); }} className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer">&times;</span>
                    )}
                </button>
            ))}
            <button onClick={addScenario} className="ml-2 px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">
                + Add Scenario
            </button>
            <div className="flex-grow"></div>
            <button 
                onClick={() => setActiveView('compare')} 
                className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeView === 'compare' 
                        ? 'border-blue-600 text-blue-600 bg-white' 
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                }`}
            >
                Compare Scenarios
            </button>
        </div>
    </div>
);

const ClientInputSection = ({ scenario, updateClientData }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                    type="text"
                    value={scenario.clientData.clientName}
                    onChange={(e) => updateClientData('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">W-2 Income</label>
                <input
                    type="number"
                    value={scenario.clientData.w2Income}
                    onChange={(e) => updateClientData('w2Income', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Income</label>
                <input
                    type="number"
                    value={scenario.clientData.businessIncome}
                    onChange={(e) => updateClientData('businessIncome', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Term Gains</label>
                <input
                    type="number"
                    value={scenario.clientData.shortTermGains}
                    onChange={(e) => updateClientData('shortTermGains', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Term Gains</label>
                <input
                    type="number"
                    value={scenario.clientData.longTermGains}
                    onChange={(e) => updateClientData('longTermGains', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    </div>
);

const ProjectionsControl = ({ years, setYears, growthRate, setGrowthRate }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Projection Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projection Years</label>
                <select 
                    value={years} 
                    onChange={(e) => setYears(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value={0}>Current Year Only</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                    <option value={10}>10 Years</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Income Growth Rate (%)</label>
                <input
                    type="number"
                    step="0.1"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    </div>
);

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Tax Strategies</h3>
        <div className="space-y-4">
            {STRATEGY_LIBRARY.map(strategy => (
                <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={scenario.enabledStrategies[strategy.id] || false}
                                onChange={() => toggleStrategy(strategy.id)}
                                className="mr-3 h-4 w-4"
                            />
                            <div>
                                <h4 className="font-medium">{strategy.name}</h4>
                                <p className="text-sm text-gray-600">{strategy.description}</p>
                            </div>
                        </div>
                    </div>
                    {scenario.enabledStrategies[strategy.id] && strategy.inputRequired && (
                        <div className="ml-4">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={scenario.clientData[strategy.inputRequired] || ''}
                                onChange={(e) => updateClientData(strategy.inputRequired, parseFloat(e.target.value) || 0)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                             {strategy.id === 'QUANT_DEALS_01' && (
                                <div className="mt-2">
                                    <select value={scenario.clientData.dealsExposure} onChange={e => updateClientData('dealsExposure', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm">
                                        {Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (
                                            <option key={key} value={key}>{value.description}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ResultsDashboard = ({ results }) => {
    if (!results || !results.cumulative) return null;
    const { cumulative } = results;
    const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = cumulative;

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Baseline Tax" value={baselineTax} change={`Over ${results.projections.length} years`} />
                <MetricCard label="Total Optimized Tax" value={optimizedTax} change={`Over ${results.projections.length} years`} />
                <MetricCard label="Total Tax Savings" value={totalSavings} change="Cumulative" highlight={true} />
                <MetricCard label="Capital Committed" value={capitalAllocated} change="For Year 1 Strategies" />
            </div>
        </div>
    );
};

const ChartsSection = ({ results }) => {
    if (!results || results.length === 0) return null;
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tax Projections</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-md font-medium mb-2">Annual Tax Liability</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={results.projections}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="baseline.totalTax" fill="#ef4444" name="Baseline Tax" />
                            <Bar dataKey="withStrategies.totalTax" fill="#3b82f6" name="Optimized Tax" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h4 className="text-md font-medium mb-2">After-Tax Income Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.projections}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                            <Line type="monotone" dataKey="withStrategies.afterTaxIncome" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const ComparisonView = ({ allScenarioResults, projectionYears }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Scenario Comparison</h3>
        <div className="overflow-x-auto">
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
                    {/* Cumulative Summary */}
                    <tr className="bg-gray-100"><td className="px-6 py-3 text-sm font-bold text-gray-800" colSpan={allScenarioResults.length + 1}>Cumulative Summary</td></tr>
                    {[
                        { label: 'Total Tax Savings', key: 'totalSavings' },
                        { label: 'Total Tax Paid', key: 'optimizedTax' },
                        { label: 'Capital Committed', key: 'capitalAllocated' }
                    ].map(metric => (
                         <tr key={metric.label}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.label}</td>
                            {allScenarioResults.map(({ scenario, results }) => {
                                return (
                                    <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(results.cumulative[metric.key])}</td>
                                );
                            })}
                        </tr>
                    ))}
                    {/* Year-by-Year Breakdown */}
                    {Array.from({ length: projectionYears === 0 ? 1 : projectionYears }, (_, i) => i + 1).map(year => (
                        <React.Fragment key={year}>
                            <tr className="bg-gray-100">
                                <td className="px-6 py-3 text-sm font-bold text-gray-800" colSpan={allScenarioResults.length + 1}>Year {year}</td>
                            </tr>
                            <tr>
                                <td className="pl-8 pr-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Annual Tax Savings</td>
                                {allScenarioResults.map(({ scenario, results }) => {
                                    const yearData = results.projections[year - 1];
                                    return (
                                        <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatCurrency(yearData?.baseline.totalTax - yearData?.withStrategies.totalTax)}</td>
                                    );
                                })}
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Main App Component ---

export default function App() {
    const [scenarios, setScenarios] = useState(() => [createNewScenario('Scenario 1')]);
    const [activeView, setActiveView] = useState(() => scenarios[0].id);
    const [projectionYears, setProjectionYears] = useState(0);
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

    const handlePrint = () => {
        const printContainer = document.getElementById('print-mount');
        if (printContainer && activeScenario && calculationResults) {
            ReactDOM.render(<PrintableReport scenario={activeScenario} results={calculationResults} />, printContainer, () => {
                window.print();
            });
        }
    };
    
    const handleUpdateClientData = useCallback((field, value) => {
        setScenarios(prev => prev.map(s => 
            s.id === activeView 
                ? { ...s, clientData: { ...s.clientData, [field]: value } } 
                : s
        ));
    }, [activeView]);

    const handleToggleStrategy = useCallback((strategyId) => {
        setScenarios(prev => prev.map(s => 
            s.id === activeView 
                ? { ...s, enabledStrategies: { ...s.enabledStrategies, [strategyId]: !s.enabledStrategies[strategyId] } } 
                : s
        ));
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
        <div className="min-h-screen bg-gray-50">
            <Header onPrint={handlePrint} clientName={activeScenario?.clientData.clientName} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScenarioTabs 
                    scenarios={scenarios} 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    addScenario={addScenario} 
                    removeScenario={removeScenario} 
                />
                
                {activeView === 'compare' ? (
                    <ComparisonView allScenarioResults={allScenarioResults} projectionYears={projectionYears} />
                ) : activeScenario ? (
                    <>
                        <ClientInputSection scenario={activeScenario} updateClientData={handleUpdateClientData} />
                        <ProjectionsControl 
                            years={projectionYears} 
                            setYears={setProjectionYears} 
                            growthRate={growthRate} 
                            setGrowthRate={setGrowthRate} 
                        />
                        <StrategiesSection 
                            scenario={activeScenario} 
                            toggleStrategy={handleToggleStrategy} 
                            updateClientData={handleUpdateClientData} 
                        />
                        <ResultsDashboard results={calculationResults} />
                        <ChartsSection results={calculationResults} />
                    </>
                ) : (
                     <div className="p-8 text-center">Please select or create a scenario to begin.</div>
                )}
            </main>
            <div id="print-mount" className="print-only"></div>
        </div>
    );
}

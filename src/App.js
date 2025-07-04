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

// --- Helper & Utility Components ---

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
    const { clientData, enabledStrategies } = scenario;
    const results = [];
    const loopYears = projectionYears === 0 ? 1 : projectionYears;
    
    for (let year = 0; year < loopYears; year++) {
        const growthFactor = Math.pow(1 + growthRate / 100, year);
        
        const adjustedW2Income = clientData.w2Income * growthFactor;
        const adjustedBusinessIncome = clientData.businessIncome * growthFactor;
        const adjustedShortTermGains = clientData.shortTermGains * growthFactor;
        const adjustedLongTermGains = clientData.longTermGains * growthFactor;
        
        let totalIncome = adjustedW2Income + adjustedBusinessIncome + adjustedShortTermGains + adjustedLongTermGains;
        let deductions = STANDARD_DEDUCTION;
        let taxSavings = 0;
        
        if (enabledStrategies['EQUIP_S179_01'] && clientData.equipmentCost > 0) {
            deductions += clientData.equipmentCost;
            taxSavings += clientData.equipmentCost * 0.35; // Approximate tax savings
        }
        
        if (enabledStrategies['CHAR_CLAT_01'] && clientData.charitableIntent > 0) {
            deductions += clientData.charitableIntent;
            taxSavings += clientData.charitableIntent * 0.35;
        }
        
        if (enabledStrategies['SOLO401K_EMPLOYEE_01'] && clientData.solo401kEmployee > 0) {
            deductions += clientData.solo401kEmployee;
            taxSavings += clientData.solo401kEmployee * 0.35;
        }
        
        if (enabledStrategies['QUANT_DEALS_01'] && clientData.investmentAmount > 0) {
            const dealsLevel = DEALS_EXPOSURE_LEVELS[clientData.dealsExposure];
            const annualBenefit = clientData.investmentAmount * dealsLevel.netBenefit;
            taxSavings += annualBenefit;
        }
        
        const taxableIncome = Math.max(0, totalIncome - deductions);
        const federalTax = calculateTax(taxableIncome, FED_TAX_BRACKETS);
        const stateTax = calculateTax(taxableIncome, NJ_TAX_BRACKETS);
        const totalTax = federalTax + stateTax - taxSavings;
        const afterTaxIncome = totalIncome - totalTax;
        
        results.push({
            year: year + 1,
            totalIncome,
            taxableIncome,
            deductions,
            federalTax,
            stateTax,
            taxSavings,
            totalTax,
            afterTaxIncome,
            effectiveRate: totalTax / totalIncome
        });
    }
    
    return results;
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

const PrintableReport = ({ scenario, results, projectionYears, growthRate }) => {
    if (!results || results.length === 0) return null;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalSavings = results.reduce((sum, year) => sum + year.taxSavings, 0);

    return (
        <div className="print-report-area">
            <div className="print-header">
                <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="print-logo" />
                <div className="print-title">
                    <h1>Tax Optimization Analysis</h1>
                    <p className="print-date">For: {scenario.clientData.clientName} | Scenario: {scenario.name} | Date: {today}</p>
                </div>
            </div>
            <table className="print-table summary-table">
                <thead>
                    <tr><th colSpan="2">Cumulative Summary over {results.length} Years</th></tr>
                </thead>
                <tbody>
                    <tr><th>Total Projected Savings</th><td className="highlight">{formatCurrency(totalSavings)}</td></tr>
                </tbody>
            </table>
            
            <div className="print-chart">
                 <h3 className="text-lg font-semibold mb-2">Annual Tax Liability</h3>
                 <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={results}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="totalTax" fill="#ef4444" name="Total Tax" />
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
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ResultsDashboard = ({ results }) => {
    if (!results || results.length === 0) return null;
    
    const currentYear = results[0];
    const totalSavings = results.reduce((sum, year) => sum + year.taxSavings, 0);
    
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tax Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentYear.totalIncome)}</div>
                    <div className="text-sm text-gray-600">Total Income (Year 1)</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(currentYear.totalTax)}</div>
                    <div className="text-sm text-gray-600">Total Tax (Year 1)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</div>
                    <div className="text-sm text-gray-600">Total Tax Savings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{(currentYear.effectiveRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Effective Tax Rate</div>
                </div>
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
                        <BarChart data={results}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="totalTax" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h4 className="text-md font-medium mb-2">After-Tax Income Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                            <Line type="monotone" dataKey="afterTaxIncome" stroke="#10b981" strokeWidth={2} />
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
                        { label: 'Total Tax Savings', key: 'taxSavings' },
                        { label: 'Total Tax Paid', key: 'totalTax' }
                    ].map(metric => (
                         <tr key={metric.label}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.label}</td>
                            {allScenarioResults.map(({ scenario, results }) => {
                                const total = results.reduce((sum, year) => sum + year[metric.key], 0);
                                return (
                                    <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(total)}</td>
                                );
                            })}
                        </tr>
                    ))}
                    {/* Year-by-Year Breakdown */}
                    {Array.from({ length: projectionYears }, (_, i) => i + 1).map(year => (
                        <React.Fragment key={year}>
                            <tr className="bg-gray-100">
                                <td className="px-6 py-3 text-sm font-bold text-gray-800" colSpan={allScenarioResults.length + 1}>Year {year}</td>
                            </tr>
                            <tr>
                                <td className="pl-8 pr-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Annual Tax Savings</td>
                                {allScenarioResults.map(({ scenario, results }) => {
                                    const yearData = results[year - 1];
                                    return (
                                        <td key={scenario.id} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">{formatCurrency(yearData?.taxSavings)}</td>
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

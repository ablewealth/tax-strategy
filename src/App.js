import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// --- Constants and Configuration (Moved outside component) ---

const DEALS_EXPOSURE_LEVELS = {
    '130/30': { shortTermLossRate: 0.10, longTermGainRate: 0.024, netBenefit: 0.035, description: '130/30 Strategy - 3.5% annual tax benefits' },
    '145/45': { shortTermLossRate: 0.138, longTermGainRate: 0.033, netBenefit: 0.046, description: '145/45 Strategy - 4.6% annual tax benefits' },
    '175/75': { shortTermLossRate: 0.206, longTermGainRate: 0.049, netBenefit: 0.069, description: '175/75 Strategy - 6.9% annual tax benefits' },
    '225/125': { shortTermLossRate: 0.318, longTermGainRate: 0.076, netBenefit: 0.106, description: '225/125 Strategy - 10.6% annual tax benefits' },
};

const STRATEGY_LIBRARY = [
    { id: 'QUANT_DEALS_01', name: 'Quantino DEALS™', category: 'Systematic Investment', description: 'Algorithmic trading generating strategic capital losses to offset gains.', inputRequired: 'investmentAmount', type: 'investment' },
    { id: 'EQUIP_S179_01', name: 'Section 179 Acceleration', category: 'Business Tax Strategy', description: 'Immediate expensing of qualifying business equipment purchases up to $1.22M.', inputRequired: 'equipmentCost', type: 'business' },
    { id: 'CHAR_CLAT_01', name: 'Charitable CLAT', category: 'Philanthropic Planning', description: 'Charitable giving structure providing immediate substantial deductions.', inputRequired: 'charitableIntent', type: 'charity' },
    { id: 'OG_USENERGY_01', name: 'Energy Investment IDCs', category: 'Alternative Investment', description: 'Participation in domestic oil & gas ventures providing upfront deductions.', inputRequired: 'ogInvestment', type: 'energy' },
    { id: 'FILM_SEC181_01', name: 'Film Financing (Sec 181)', category: 'Alternative Investment', description: '100% upfront deduction of investment in qualified film production.', inputRequired: 'filmInvestment', type: 'film' },
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

const AMT_BRACKETS = [
    { rate: 0.26, min: 0, max: 220700 },
    { rate: 0.28, min: 220701, max: Infinity }
];
const AMT_EXEMPTION = 126500;

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
        w2Income: 500000, businessIncome: 2000000, shortTermGains: 150000, longTermGains: 850000,
        incomeGrowth: 3, investmentGrowth: 5,
        investmentAmount: 500000, dealsExposure: '175/75',
        equipmentCost: 0, charitableIntent: 0, ogInvestment: 0, filmInvestment: 0,
        solo401kEmployee: 0, solo401kEmployer: 0, dbContribution: 0,
    },
    enabledStrategies: [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].reduce((acc, s) => ({ ...acc, [s.id]: false }), {})
});

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
    <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3">
                    <img src="https://ablewealth.com/AWM%20Logo%203.png" alt="Able Wealth Management Logo" className="h-10" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Advanced Tax Strategy Optimizer</h1>
                         {clientName && <p className="text-sm text-gray-500">Analysis for: {clientName}</p>}
                    </div>
                </div>
                <button onClick={onPrint} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition print-hide">Print Report</button>
            </div>
        </div>
    </header>
);

const DisclaimerModal = ({ onAccept }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl mx-4 text-sm">
            <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
            <div className="space-y-4 text-gray-600 max-h-[60vh] overflow-y-auto pr-4">
                 <p>The Advanced Tax Strategy Optimizer is a proprietary modeling tool developed by Able Wealth Management LLC ("AWM") for internal use by its advisors and planning professionals. This calculator is provided for informational purposes only and should not be distributed or shared with clients or the public without the express written consent of AWM.</p>
                <p>This calculator does not constitute legal, tax, or investment advice. All data and results are based on modeling assumptions that may not reflect actual outcomes or future tax law changes.</p>
                <p>Tax laws and interpretations are subject to change, and the effectiveness or applicability of strategies modeled may vary based on a client's individual circumstances. Use of the calculator does not establish an advisory relationship with AWM.</p>
                <p>Able Wealth Management LLC is a registered investment adviser with the U.S. Securities and Exchange Commission (SEC). Registration does not imply a certain level of skill or training.</p>
            </div>
            <button onClick={onAccept} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6">
                I Understand and Accept
            </button>
        </div>
    </div>
);

const ScenarioTabs = ({ scenarios, activeView, setActiveView, addScenario, removeScenario }) => (
    <div className="bg-gray-100 p-2 rounded-t-lg">
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
            <button onClick={() => setActiveView('compare')} className={`px-4 py-3 text-sm font-medium border-b-2 transition ${activeView === 'compare' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'}`}>
                Compare Scenarios
            </button>
        </div>
    </div>
);

// ...rest of your components unchanged (ClientInputSection, ProjectionsControl, StrategiesSection, ResultsDashboard, etc.)
// (Omitted for brevity, as above, but you would keep all component code as in your file)


// --- Calculation Logic (Moved outside of component to be a pure function) ---

// (Same as your current logic, unchanged)


// --- Main App Component ---

export default function App() {
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [scenarios, setScenarios] = useState(() => {
        try {
            const savedScenarios = localStorage.getItem('taxOptimizerScenarios');
            return savedScenarios ? JSON.parse(savedScenarios) : [createNewScenario('Scenario 1')];
        } catch (e) {
            return [createNewScenario('Scenario 1')];
        }
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
        try {
            localStorage.setItem('taxOptimizerScenarios', JSON.stringify(scenarios));
        } catch (e) {
            console.warn('Failed to save scenarios to localStorage:', e);
        }
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
                        <ComparisonView allScenarioResults={allScenarioResults} />
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

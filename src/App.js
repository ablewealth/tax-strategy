import React, { useState, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
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
    createNewScenario,
    formatCurrencyForDisplay, // Keep this for InputField in its own file
    parseCurrencyInput // Keep this for InputField in its own file
} from './constants';
import PrintableReport from './components/PrintableReport';

// Import the new component files
import Header from './components/Header';
import ClientInputSection from './components/ClientInputSection';
import StrategiesSection from './components/StrategiesSection';
import ResultsDashboard from './components/ResultsDashboard';
import InsightsSection from './components/InsightsSection'; // CORRECTED PATH
import ChartsSection from './components/ChartsSection';
import AppFooter from './components/AppFooter';


// --- Helper & Calculation Functions (Logic preserved) ---
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
        const fedDeductions = { aboveAGI: 0, belowAGI: 0 }, stateDeductions = { total: 0 }; 
        let njAddBack = 0, qbiBaseIncome = yearData.businessIncome || 0, currentLtGains = yearData.longTermGains || 0, currentStGains = yearData.shortTermGains || 0, totalCapitalAllocated = 0; 
        const insights = [];
            const stateBrackets = yearData.state === 'NY' ? NY_TAX_BRACKETS : NJ_TAX_BRACKETS;
            const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];

            allStrategies.forEach(strategy => {
                if (strategies[strategy.id]) { // Check if strategy is enabled
                    const strategyInputAmount = yearData[strategy.inputRequired] || 0;
                    if (strategy.type !== 'qbi' && strategyInputAmount > 0) {
                        totalCapitalAllocated += strategyInputAmount;
                    }
                    
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
            const amti = fedAGI; 
            const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - (amti - 1140800) * 0.25); 
            const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount); 
            const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);           
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

// --- MAIN APP COMPONENT ---
export default function App() {
    const [scenario, setScenario] = useState(() => createNewScenario('Default Scenario'));

    // Create a map from inputRequired field name to strategy ID for efficient lookup
    const strategyInputToIdMap = useMemo(() => {
        const map = {};
        [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].forEach(strategy => {
            map[strategy.inputRequired] = strategy.id;
        });
        return map;
    }, []);

    const handleUpdateClientData = useCallback((field, value) => {
        setScenario(prev => {
            const newClientData = { ...prev.clientData, [field]: value };
            const newEnabledStrategies = { ...prev.enabledStrategies };

            // Automatically enable/disable strategy based on input value
            const strategyId = strategyInputToIdMap[field];
            if (strategyId) {
                newEnabledStrategies[strategyId] = (value > 0);
            }

            return {
                ...prev,
                clientData: newClientData,
                enabledStrategies: newEnabledStrategies
            };
        });
    }, [strategyInputToIdMap]);

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
        // console.log('Print button clicked'); // Commented out
        // console.log('Scenario:', scenario); // Commented out
        // console.log('Results:', calculationResults); // Commented out
        
        const printContainer = document.getElementById('print-mount');
        if (!printContainer) {
            // console.error('Print container not found'); // Commented out
            return;
        }

        // Clear existing content
        printContainer.innerHTML = '';
        
        try {
            ReactDOM.render(
                <PrintableReport 
                    scenario={scenario} 
                    results={calculationResults} 
                    years={scenario.clientData.projectionYears} 
                />, 
                printContainer, 
                () => {
                    // console.log('Print component rendered, starting print...'); // Commented out
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }
            );
        } catch (error) {
            // console.error('Print rendering error:', error); // Commented out
            
            // Fallback: create a simple HTML report
            printContainer.innerHTML = `
                <div style="padding: 2cm; font-family: Arial, sans-serif;">
                    <h1>Tax Optimization Report</h1>
                    <p><strong>Client:</strong> ${scenario.clientData.clientName}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    
                    <h2>Summary</h2>
                    <p>Baseline Tax: ${formatCurrency(calculationResults?.cumulative?.baselineTax || 0)}</p>
                    <p>Optimized Tax: ${formatCurrency(calculationResults?.cumulative?.optimizedTax || 0)}</p>
                    <p>Total Savings: ${formatCurrency(calculationResults?.cumulative?.totalSavings || 0)}</p>
                    
                    <p style="margin-top: 2rem; font-size: 0.8rem; color: #666;">
                        This is a simplified report. For full details, please ensure all data is properly loaded.
                    </p>
                </div>
            `;
            
            setTimeout(() => {
                window.print();
            }, 100);
        }
    };

    return (
        <div className="bg-background-secondary min-h-screen">
            <Header onPrint={handlePrint} clientName={scenario.clientData.clientName} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
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
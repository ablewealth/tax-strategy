import React, { useState, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  STRATEGY_LIBRARY,
  RETIREMENT_STRATEGIES,
  createNewScenario,
  formatCurrency,
} from './constants';
import PrintableReport from './components/PrintableReport';
import logger from './utils/logger';
import { performTaxCalculations } from './utils/taxCalculations';

// Import the new component files
import Header from './components/Header';
import ClientInputSection from './components/ClientInputSection';
import StrategiesSection from './components/StrategiesSection';
import ResultsDashboard from './components/ResultsDashboard';
import InsightsSection from './components/InsightsSection'; // CORRECTED: Removed extra 'components/'
import ChartsSection from './components/ChartsSection';
import AppFooter from './components/AppFooter';
import StrategyInteractionAnalysis from './components/StrategyInteractionAnalysis';

// --- Helper & Calculation Functions (Logic preserved) ---
// Tax calculation functions are now imported from utils/taxCalculations.js

// --- MAIN APP COMPONENT ---
export default function App() {
  const [scenario, setScenario] = useState(() => createNewScenario('Default Scenario'));
  const [strategyAnalysis, setStrategyAnalysis] = useState({
    explanation: '',
    loading: false,
    error: ''
  });

  // Create a map from inputRequired field name to strategy ID for efficient lookup
  const strategyInputToIdMap = useMemo(() => {
    const map = {};
    [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].forEach((strategy) => {
      map[strategy.inputRequired] = strategy.id;
    });
    return map;
  }, []);

  const handleUpdateClientData = useCallback(
    (field, value) => {
      setScenario((prev) => {
        const newClientData = { ...prev.clientData, [field]: value };
        const newEnabledStrategies = { ...prev.enabledStrategies };

        // Automatically enable/disable strategy based on input value
        const strategyId = strategyInputToIdMap[field];
        if (strategyId) {
          newEnabledStrategies[strategyId] = value > 0;
        }

        return {
          ...prev,
          clientData: newClientData,
          enabledStrategies: newEnabledStrategies,
        };
      });
    },
    [strategyInputToIdMap]
  );

  const handleToggleStrategy = useCallback((strategyId) => {
    setScenario((prev) => ({
      ...prev,
      enabledStrategies: {
        ...prev.enabledStrategies,
        [strategyId]: !prev.enabledStrategies[strategyId],
      },
    }));
  }, []);

  const calculationResults = useMemo(() => {
    return performTaxCalculations(scenario);
  }, [scenario]);

  const handlePrint = () => {
    const printContainer = document.getElementById('print-mount');
    if (!printContainer) {
      return;
    }

    // Clear existing content
    printContainer.innerHTML = '';

    try {
      // Check if analysis is available
      
      // Check if we have analysis or if it's still loading
      if (strategyAnalysis.loading) {
        alert('Analysis is still generating. Please wait for the analysis to complete before printing.');
        return;
      }
      
      const root = createRoot(printContainer);
      root.render(
        <PrintableReport
          scenario={scenario}
          results={calculationResults}
          years={scenario.clientData.projectionYears}
          strategyAnalysis={strategyAnalysis}
        />
      );

      // Print component rendered, starting print
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (error) {
      logger.error('Error rendering PrintableReport:', error);
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
                    
                    <p>Charts Section: [Charts would be here in full report]</p>
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
        <StrategiesSection
          scenario={scenario}
          toggleStrategy={handleToggleStrategy}
          updateClientData={handleUpdateClientData}
        />
        <ResultsDashboard results={calculationResults} />
        <InsightsSection insights={calculationResults?.withStrategies?.insights} />
        <StrategyInteractionAnalysis 
          scenario={scenario} 
          results={calculationResults} 
          onAnalysisUpdate={setStrategyAnalysis}
        />
        <ChartsSection results={calculationResults} />
      </main>
      <AppFooter />
    </div>
  );
}

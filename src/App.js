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
import StyleInjector from './components/StyleInjector';

// --- Helper & Calculation Functions (Logic preserved) ---
// Tax calculation functions are now imported from utils/taxCalculations.js

// --- MAIN APP COMPONENT ---
export default function App() {
  const [scenario, setScenario] = useState(() => createNewScenario('Default Scenario'));
  const [strategyAnalysis, setStrategyAnalysis] = useState({
    explanation: '',
    loading: false,
    error: '',
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
      logger.error('Print container not found');
      alert('Print functionality is not available. Please refresh the page and try again.');
      return;
    }

    // Validate required data
    if (!scenario || !calculationResults) {
      logger.error('Required data not available for printing');
      alert('Cannot generate report: Required data is missing. Please ensure all fields are completed.');
      return;
    }

    // Clear existing content
    printContainer.innerHTML = '';

    try {
      // Check if analysis is available
      if (strategyAnalysis.loading) {
        alert(
          'Analysis is still generating. Please wait for the analysis to complete before printing.'
        );
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
        try {
          window.print();
        } catch (printError) {
          logger.error('Error during print:', printError);
          alert('Print failed. Please try again or use your browser\'s print function.');
        }
      }, 100);
    } catch (error) {
      logger.error('Error rendering PrintableReport:', error);
      
      // Validate fallback data
      const safeClientName = scenario?.clientData?.clientName || 'Unknown Client';
      const safeBaselineTax = calculationResults?.cumulative?.baselineTax || 0;
      const safeOptimizedTax = calculationResults?.cumulative?.optimizedTax || 0;
      const safeTotalSavings = calculationResults?.cumulative?.totalSavings || 0;
      
      // Fallback: create a simple HTML report
      printContainer.innerHTML = `
                <div style="padding: 2cm; font-family: Arial, sans-serif;">
                    <h1>Tax Optimization Report</h1>
                    <p><strong>Client:</strong> ${safeClientName}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    
                    <h2>Summary</h2>
                    <p>Baseline Tax: ${formatCurrency(safeBaselineTax)}</p>
                    <p>Optimized Tax: ${formatCurrency(safeOptimizedTax)}</p>
                    <p>Total Savings: ${formatCurrency(safeTotalSavings)}</p>
                    
                    <p style="margin-top: 2rem; font-size: 0.8rem; color: #666;">
                        This is a simplified report due to a rendering error. For full details, please refresh the page and try again.
                    </p>
                    <p style="font-size: 0.8rem; color: #666;">
                        Error: ${error.message || 'Unknown error occurred'}
                    </p>
                </div>
            `;

      setTimeout(() => {
        try {
          window.print();
        } catch (printError) {
          logger.error('Error during fallback print:', printError);
          alert('Print failed. Please try copying the report content manually.');
        }
      }, 100);
    }
  };

  return (
    <div className="bg-background-secondary min-h-screen">
      <StyleInjector />
      <Header onPrint={handlePrint} clientName={scenario.clientData.clientName} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        <ClientInputSection scenario={scenario} updateClientData={handleUpdateClientData} />
        <StrategiesSection
          scenario={scenario}
          toggleStrategy={handleToggleStrategy}
          updateClientData={handleUpdateClientData}
        />
        <ResultsDashboard results={calculationResults} scenario={scenario} />
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

import React, { useState, useMemo, useEffect } from 'react';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY } from '../constants';
import Section from './Section';
import { formatAIAnalysis } from './AIAnalysisFormatter';

const StrategyInteractionAnalysis = ({ scenario, results, onAnalysisUpdate }) => {
  const [interactionExplanation, setInteractionExplanation] = useState('');
  const [loadingInteraction, setLoadingInteraction] = useState(false);
  const [interactionError, setInteractionError] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [lastAnalyzedStrategies, setLastAnalyzedStrategies] = useState([]);

  // Update parent component state
  useEffect(() => {
    if (onAnalysisUpdate) {
      onAnalysisUpdate({
        explanation: interactionExplanation,
        loading: loadingInteraction,
        error: interactionError,
      });
    }
  }, [interactionExplanation, loadingInteraction, interactionError, onAnalysisUpdate]);

  const allStrategies = useMemo(() => {
    return [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];
  }, []);

  const enabledStrategies = useMemo(() => {
    return allStrategies.filter((strategy) => {
      const isEnabled = scenario?.enabledStrategies?.[strategy.id];
      const inputValue = scenario?.clientData?.[strategy.inputRequired];
      return isEnabled && typeof inputValue === 'number' && inputValue > 0;
    });
  }, [allStrategies, scenario?.enabledStrategies, scenario?.clientData]);

  // Check if strategies have changed since last analysis
  const strategiesChanged = useMemo(() => {
    const currentStrategyIds = enabledStrategies.map((s) => s.id).sort();
    const lastStrategyIds = lastAnalyzedStrategies.map((s) => s.id).sort();

    return JSON.stringify(currentStrategyIds) !== JSON.stringify(lastStrategyIds);
  }, [enabledStrategies, lastAnalyzedStrategies]);

  const getButtonText = () => {
    if (loadingInteraction) return 'Analyzing...';
    if (hasAnalyzed && !strategiesChanged) return 'Analysis Complete';
    if (strategiesChanged) return 'Refresh Analysis';
    return 'Generate AI Analysis';
  };

  const fetchInteractionExplanation = async () => {
    if (enabledStrategies.length > 1) {
      setLoadingInteraction(true);
      setInteractionError('');
      try {
        const clientState = scenario?.clientData?.state || 'Unknown';
        const stateDisplayName =
          clientState === 'NY'
            ? 'New York'
            : clientState === 'NJ'
              ? 'New Jersey'
              : clientState === 'CA'
                ? 'California'
                : clientState;

        // Extract client financial data
        const clientData = scenario?.clientData || {};
        const w2Income = clientData.w2Income || 0;
        const businessIncome = clientData.businessIncome || 0;
        const shortTermGains = clientData.shortTermCapitalGains || 0;
        const longTermGains = clientData.longTermCapitalGains || 0;

        // Extract calculation results
        const totalSavings = results?.cumulative?.totalSavings || 0;
        const currentYearSavings = results?.withStrategies?.totalSavings || 0;
        const baselineTax = results?.cumulative?.baselineTax || 0;
        const optimizedTax = results?.cumulative?.optimizedTax || 0;

        // Create a more detailed mapping of strategies with tax implications
        const strategyTaxDetails = enabledStrategies.map((strategy) => {
          const inputValue = clientData[strategy.inputRequired] || 0;
          let federalBenefit = 0;
          let stateBenefit = 0;
          let stateAddBack = 0;
          let specialConsiderations = '';

          // Calculate specific benefits based on strategy type using actual marginal rates
          const federalMarginalRate = businessIncome > 731200 ? 0.37 : businessIncome > 487450 ? 0.35 : businessIncome > 383900 ? 0.32 : 0.24;
          const stateMarginalRate = clientState === 'NY' ? 
            (businessIncome > 25000000 ? 0.109 : businessIncome > 5000000 ? 0.103 : businessIncome > 2155350 ? 0.0965 : 0.0685) :
            (businessIncome > 1000000 ? 0.1075 : businessIncome > 500000 ? 0.0897 : 0.0637);
          
          switch (strategy.id) {
            case 'EQUIP_S179_01':
              federalBenefit = inputValue * federalMarginalRate;
              if (clientState === 'NY') {
                stateBenefit = inputValue * stateMarginalRate;
                specialConsiderations = 'NY allows full Section 179 deduction';
              } else if (clientState === 'NJ') {
                const njDeduction = Math.min(975000, inputValue); // Updated 2025 limit
                stateBenefit = njDeduction * stateMarginalRate;
                stateAddBack = (inputValue - njDeduction) * stateMarginalRate;
                specialConsiderations = 'NJ has $975,000 Section 179 limit (2025)';
              }
              break;
            case 'SOLO401K_EMPLOYEE_01':
              federalBenefit = inputValue * federalMarginalRate;
              if (clientState === 'NY') {
                stateBenefit = inputValue * stateMarginalRate;
                specialConsiderations = 'NY allows full deduction for employee deferrals';
              } else if (clientState === 'NJ') {
                stateAddBack = inputValue * stateMarginalRate;
                specialConsiderations = 'NJ requires add-back for employee 401(k) deferrals';
              }
              break;
            case 'SOLO401K_EMPLOYER_01':
            case 'DB_PLAN_01':
              federalBenefit = inputValue * federalMarginalRate;
              stateBenefit = inputValue * stateMarginalRate;
              specialConsiderations = 'Reduces QBI base income - consider timing';
              break;
            case 'QUANT_DEALS_01':
              // Capital loss harvesting benefits at ordinary income rates
              const exposureLevel = clientData.dealsExposure || '175/75';
              const lossRate = exposureLevel === '130/30' ? 0.1 : exposureLevel === '145/45' ? 0.138 : exposureLevel === '175/75' ? 0.206 : 0.318;
              federalBenefit = inputValue * lossRate * federalMarginalRate;
              stateBenefit = inputValue * lossRate * stateMarginalRate;
              specialConsiderations = clientState === 'NJ' ? 'NJ has no capital loss carryover - use-it-or-lose-it' : 'Capital losses can offset ordinary income';
              break;
            case 'CHAR_CLAT_01':
              const agiLimit = (w2Income + businessIncome) * 0.3;
              const deductibleAmount = Math.min(inputValue, agiLimit);
              federalBenefit = deductibleAmount * federalMarginalRate;
              if (clientState === 'NY') {
                stateBenefit = deductibleAmount * 0.5 * stateMarginalRate; // NY allows 50%
                specialConsiderations = 'NY allows 50% of federal charitable deduction';
              } else {
                stateAddBack = deductibleAmount * stateMarginalRate;
                specialConsiderations = 'NJ does not allow charitable deductions - full add-back';
              }
              break;
            case 'OG_USENERGY_01':
              federalBenefit = inputValue * 0.7 * federalMarginalRate; // 70% IDC deduction
              if (clientState === 'NY') {
                stateBenefit = inputValue * 0.7 * stateMarginalRate;
                specialConsiderations = 'NY generally follows federal treatment';
              } else {
                stateAddBack = inputValue * 0.7 * stateMarginalRate;
                specialConsiderations = 'NJ requires capitalization - no immediate deduction';
              }
              break;
            case 'FILM_SEC181_01':
              federalBenefit = inputValue * federalMarginalRate;
              if (clientState === 'NY') {
                stateBenefit = inputValue * stateMarginalRate;
                specialConsiderations = 'NY follows federal Section 181 treatment';
              } else {
                stateBenefit = 0;
                specialConsiderations = 'Consider NJ film tax credits as alternative';
              }
              break;
            case 'QBI_FINAL_01':
              const qbiDeduction = Math.min(inputValue * 0.2, (w2Income + businessIncome - 29200) * 0.2);
              federalBenefit = qbiDeduction * federalMarginalRate;
              specialConsiderations = 'Subject to income limitations and W-2 wage tests';
              break;
            default:
              federalBenefit = inputValue * federalMarginalRate;
              break;
          }

          return {
            name: strategy.name,
            id: strategy.id,
            amount: inputValue,
            federalBenefit: federalBenefit,
            stateBenefit: stateBenefit,
            stateAddBack: stateAddBack,
            totalBenefit: federalBenefit + stateBenefit,
            specialConsiderations: specialConsiderations,
          };
        });

        // Sort strategies by total benefit for the prompt
        const sortedStrategies = [...strategyTaxDetails].sort(
          (a, b) => b.totalBenefit - a.totalBenefit
        );

        const prompt = `You are a senior tax strategist at a premier wealth management firm, providing sophisticated analysis for ultra-high-net-worth clients. Conduct a comprehensive analysis of the strategic interactions between these tax optimization strategies, emphasizing synergies, timing, and implementation priorities.

**CLIENT WEALTH PROFILE:**
- Total W2 Income: $${w2Income.toLocaleString()}
- Business Income: $${businessIncome.toLocaleString()}
- Short-term Capital Gains: $${shortTermGains.toLocaleString()}
- Long-term Capital Gains: $${longTermGains.toLocaleString()}
- Tax Domicile: ${stateDisplayName}
- Estimated Federal Marginal Rate: ${Math.round(businessIncome > 731200 ? 37 : businessIncome > 487450 ? 35 : businessIncome > 383900 ? 32 : 24)}%
- Estimated State Marginal Rate: ${Math.round(clientState === 'NY' ? (businessIncome > 25000000 ? 10.9 : businessIncome > 5000000 ? 10.3 : businessIncome > 2155350 ? 9.65 : 6.85) : (businessIncome > 1000000 ? 10.75 : businessIncome > 500000 ? 8.97 : 6.37))}%

**OPTIMIZATION RESULTS:**
- Current Tax Liability (Baseline): $${baselineTax.toLocaleString()}
- Optimized Tax Liability: $${optimizedTax.toLocaleString()}
- Annual Tax Savings: $${currentYearSavings.toLocaleString()}
- Multi-Year Cumulative Savings: $${totalSavings.toLocaleString()}
- Effective Tax Rate Reduction: ${Math.round((currentYearSavings/baselineTax)*100)}%

**STRATEGIC PORTFOLIO ANALYSIS:**
${sortedStrategies
  .map(
    (s, i) =>
      `${i + 1}. **${s.name}**
   - Capital Deployment: $${s.amount.toLocaleString()}
   - Federal Tax Benefit: $${Math.round(s.federalBenefit).toLocaleString()}
   - State Tax Impact: $${Math.round(s.stateBenefit - s.stateAddBack).toLocaleString()}
   - Total Annual Benefit: $${Math.round(s.totalBenefit).toLocaleString()}
   - ROI: ${Math.round((s.totalBenefit/s.amount)*100)}%
   - Implementation Notes: ${s.specialConsiderations || 'Standard implementation'}
`
  )
  .join('\n')}

**${stateDisplayName.toUpperCase()} STATE TAX ENVIRONMENT:**
${
  clientState === 'NY'
    ? `**New York Tax Landscape:**
- Generally conforms to federal tax treatment with strategic exceptions
- Section 179 limitations create federal-state timing differences
- Bonus depreciation add-backs require careful cash flow planning
- 50% charitable deduction limitation for high-income taxpayers
- No QBI deduction recognition creates planning opportunities
- Progressive rates up to 10.9% for income over $25M
- Full retirement plan deduction alignment with federal treatment`
    : clientState === 'NJ'
      ? `**New Jersey Tax Landscape:**
- Significant departures from federal tax treatment create complexity
- Section 179 limitation to $975,000 (2025) with federal excess add-back
- Employee 401(k) contribution add-back requirement
- No capital loss carryover (use-it-or-lose-it) demands strategic timing
- Full charitable deduction add-back requirement
- No QBI deduction recognition
- Progressive rates up to 10.75% for income over $1M
- Aggressive state tax planning essential for optimization`
      : `**${stateDisplayName} Tax Environment:**
Please provide specific state tax considerations for comprehensive analysis.`
}

**ANALYSIS REQUIREMENTS:**
1. Use only ** for bold text. Write in complete professional sentences.
2. Provide specific dollar amounts and percentages in all recommendations.
3. Calculate exact tax savings based on marginal rates provided above.
4. Address AMT, NIIT, and Section 199A implications for high-income taxpayers.
5. Include detailed cash flow and timing considerations for each strategy.
6. Focus on strategy interactions and synergies rather than individual benefits.
7. Provide actionable implementation guidance with specific deadlines.

**COMPREHENSIVE ANALYSIS FRAMEWORK:**\n\n**Executive Summary**\nProvide a sophisticated 3-4 sentence analysis of the integrated tax strategy approach, highlighting the total optimization potential of $${totalSavings.toLocaleString()} and the strategic rationale for the recommended portfolio approach.\n\n**Strategy Synergies and Interactions**\nAnalyze how these strategies work together to create compound tax benefits:\n- **Complementary Strategies**: Which strategies amplify each other's effectiveness and why?\n- **Timing Interdependencies**: How does the implementation sequence affect overall benefits?\n- **Cash Flow Optimization**: How do the strategies' cash flow patterns create additional planning opportunities?\n- **Risk Mitigation**: How does diversifying across multiple strategies reduce overall tax planning risk?\n\n**Advanced Strategy Effectiveness Analysis**\nProvide detailed analysis for each strategy with specific calculations:\n${sortedStrategies.map((s, i) => `${i + 1}. **${s.name}** - Federal: $${Math.round(s.federalBenefit).toLocaleString()}, State: $${Math.round(s.stateBenefit - s.stateAddBack).toLocaleString()}, Total: $${Math.round(s.totalBenefit).toLocaleString()}/year (${Math.round((s.totalBenefit/s.amount)*100)}% ROI)`).join('\\n')}\n\n**${stateDisplayName} State Tax Optimization Matrix**\nProvide comprehensive state-specific analysis:\n- **Maximum State Benefit Strategy**: Identify and explain the strategy providing the highest state tax savings\n- **State Tax Traps and Mitigation**: Analyze strategies that create add-backs or phantom income and provide mitigation strategies\n- **Federal-State Timing Arbitrage**: Identify opportunities to optimize timing differences between federal and state treatment\n- **State-Specific Implementation Sequence**: Recommend optimal order considering state tax implications\n\n**Strategic Integration Analysis**\nAnalyze how strategies interact across different tax areas:\n- **Income Character Optimization**: How do the strategies optimize the character of income (ordinary vs. capital gains)?\n- **Deduction Timing Strategies**: How can deduction timing be optimized across strategies?\n- **AMT and NIIT Considerations**: Detailed analysis of Alternative Minimum Tax and Net Investment Income Tax implications\n- **Section 199A QBI Interactions**: How do strategies affect qualified business income deductions?\n- **Multi-Year Tax Planning**: Strategic timing across multiple tax years for maximum benefit\n\n**Implementation Roadmap with Specific Deadlines**\n**Phase 1 - Immediate (Next 30 days):**\n- [Highest priority actions with specific dates and rationale]\n\n**Phase 2 - Short-term (Next 90 days):**\n- [Medium priority implementations with preparation requirements]\n\n**Phase 3 - Long-term (Remainder of 2025):**\n- [Strategic positioning moves with complex implementation]\n\n**Risk Assessment and Mitigation**\n- **Low Risk Strategies**: [Established precedent strategies with implementation details]\n- **Medium Risk Strategies**: [Strategies requiring careful documentation with specific compliance requirements]\n- **High Risk Strategies**: [Strategies with audit considerations and mitigation approaches]\n\n**Cash Flow and Economic Analysis**\n- **Total Capital Requirement**: $[sum of all strategy investments]\n- **Payback Analysis**: [Break-even timeline for each strategy]\n- **NPV Analysis**: [Net present value of the strategy portfolio]\n- **Sensitivity Analysis**: [How changes in tax rates or income affect strategy effectiveness]\n\n**2025 Tax Year Strategic Action Plan**\nProvide specific, actionable next steps with deadlines:\n1. [Most urgent action by specific date with detailed rationale and preparation steps]\n2. [Second priority by specific date with dependencies and requirements]\n3. [Third priority by specific date with long-term strategic considerations]\n\n**Professional Recommendations**\nProvide 3-5 specific professional recommendations for advisors (CPAs, attorneys, financial planners) and their roles in implementation.\n\n**Conclusion and Next Steps**\nSummarize the strategic approach and provide clear next steps for client action.\n\nTarget length: 1,200-1,500 words for comprehensive analysis. Focus on strategic insights, quantified benefits, specific implementation guidance, and professional-grade recommendations suitable for ultra-high-net-worth clients.`;

        // Use the secure backend proxy instead of direct API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased timeout for comprehensive analysis

        try {
          // Call our backend API proxy
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          if (!backendUrl) {
            throw new Error('Backend URL not configured. Please set REACT_APP_BACKEND_URL environment variable.');
          }

          // Map enabled strategies to the format expected by backend
          const mappedStrategies = enabledStrategies.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
          }));

          const response = await fetch(`${backendUrl}/api/gemini`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              useFramework: true,
              clientState: scenario?.clientData,
              enabledStrategies: mappedStrategies,
              prompt: prompt, // Also include the prompt as fallback
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.response) {
            setInteractionExplanation(result.response);
            setHasAnalyzed(true);
            setLastAnalyzedStrategies([...enabledStrategies]);
          } else {
            throw new Error('No response received from analysis service.');
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          setInteractionError('Request timed out. Please try again.');
        } else {
          setInteractionError(`Analysis failed: ${error.message}`);
        }
      } finally {
        setLoadingInteraction(false);
      }
    }
  };

  // Don't render if no strategies enabled
  if (enabledStrategies.length <= 1) {
    return null;
  }

  return (
    <Section
      title="🧠 Advanced Tax Strategy Analysis"
      description="AI-powered analysis of strategy interactions and implementation guidance"
    >
      {loadingInteraction ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-blue-100"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing Strategy Interactions
              </h3>
              <p className="text-gray-600">
                Analyzing {enabledStrategies.length} strategies for{' '}
                {scenario?.clientData?.state || 'your state'} residents
              </p>
            </div>
          </div>
        </div>
      ) : interactionError ? (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-lg font-semibold text-red-900">Analysis Error</h4>
              <p className="text-red-700 mt-1">{interactionError}</p>

              <div className="mt-4">
                <button
                  onClick={fetchInteractionExplanation}
                  disabled={loadingInteraction}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : interactionExplanation ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-700 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-gray-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Tax Strategy Analysis</h3>
                  <p className="text-gray-600">Professional insights and recommendations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {strategiesChanged && (
                  <div className="flex items-center text-amber-600 text-sm">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span>Strategies updated</span>
                  </div>
                )}
                <button
                  onClick={fetchInteractionExplanation}
                  disabled={loadingInteraction}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    strategiesChanged
                      ? 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md'
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {getButtonText()}
                </button>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 bg-white">
            <div className="max-w-none">{formatAIAnalysis(interactionExplanation)}</div>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Powered by AI</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Generated {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Analysis based on {enabledStrategies.length} selected strategies
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready for Professional Analysis
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Enable multiple tax strategies to generate comprehensive analysis and implementation
              guidance.
            </p>
            <button
              onClick={fetchInteractionExplanation}
              disabled={loadingInteraction}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                enabledStrategies.length >= 2
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loadingInteraction ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                'Generate AI Analysis'
              )}
            </button>

            {enabledStrategies.length < 2 && (
              <p className="text-sm text-gray-500 mt-4">
                Select at least 2 strategies to enable analysis.
              </p>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

export default StrategyInteractionAnalysis;

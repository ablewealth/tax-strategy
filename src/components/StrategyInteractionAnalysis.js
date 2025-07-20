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
  const [retryCount, setRetryCount] = useState(0);
  const [showFallbackAnalysis, setShowFallbackAnalysis] = useState(false);

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

  // Generate fallback analysis when AI service is unavailable
  const generateFallbackAnalysis = () => {
    const clientData = scenario?.clientData || {};
    const w2Income = clientData.w2Income || 0;
    const businessIncome = clientData.businessIncome || 0;
    const clientState = clientData.state || 'Unknown';
    const stateDisplayName = clientState === 'NY' ? 'New York' : clientState === 'NJ' ? 'New Jersey' : clientState === 'CA' ? 'California' : clientState;
    
    const totalSavings = results?.cumulative?.totalSavings || 0;
    const currentYearSavings = results?.withStrategies?.totalSavings || 0;
    const baselineTax = results?.cumulative?.baselineTax || 0;
    const optimizedTax = results?.cumulative?.optimizedTax || 0;
    const capitalAllocated = results?.cumulative?.capitalAllocated || 0;
    
    const federalMarginalRate = businessIncome > 731200 ? 37 : businessIncome > 487450 ? 35 : businessIncome > 383900 ? 32 : 24;
    const stateMarginalRate = clientState === 'NY' ? 
      (businessIncome > 25000000 ? 10.9 : businessIncome > 5000000 ? 10.3 : businessIncome > 2155350 ? 9.65 : 6.85) :
      (businessIncome > 1000000 ? 10.75 : businessIncome > 500000 ? 8.97 : 6.37);
    
    const roi = capitalAllocated > 0 ? (totalSavings / capitalAllocated) * 100 : 0;
    const savingsPercentage = baselineTax > 0 ? (currentYearSavings / baselineTax) * 100 : 0;
    
    const sortedStrategies = enabledStrategies
      .map(strategy => {
        const inputValue = clientData[strategy.inputRequired] || 0;
        const federalBenefit = inputValue * (federalMarginalRate / 100);
        const stateBenefit = inputValue * (stateMarginalRate / 100);
        return {
          name: strategy.name,
          amount: inputValue,
          federalBenefit,
          stateBenefit,
          totalBenefit: federalBenefit + stateBenefit,
          roi: inputValue > 0 ? ((federalBenefit + stateBenefit) / inputValue) * 100 : 0
        };
      })
      .sort((a, b) => b.totalBenefit - a.totalBenefit);
    
    const fallbackAnalysis = `EXECUTIVE SUMMARY

Based on your ${enabledStrategies.length} selected tax strategies, our comprehensive analysis reveals a total optimization potential of $${totalSavings.toLocaleString()} with an effective tax rate reduction of ${Math.round(savingsPercentage)}%. Your strategic portfolio demonstrates strong ROI potential of ${Math.round(roi)}% on $${capitalAllocated.toLocaleString()} in capital allocated. This diversified approach to tax optimization provides multiple pathways to reduce your overall tax burden while managing risk across different strategy types.

STRATEGY PORTFOLIO ANALYSIS

Your tax optimization strategy consists of ${enabledStrategies.length} carefully selected approaches that work together to create substantial tax savings:

${sortedStrategies.map((s, i) => `${i + 1}. **${s.name}**
   - Capital Deployment: $${s.amount.toLocaleString()}
   - Federal Tax Benefit: $${Math.round(s.federalBenefit).toLocaleString()}
   - State Tax Benefit: $${Math.round(s.stateBenefit).toLocaleString()}
   - Total Annual Benefit: $${Math.round(s.totalBenefit).toLocaleString()}
   - Strategy ROI: ${Math.round(s.roi)}%
   - Implementation Notes: This strategy provides ${s.roi > 30 ? 'excellent' : s.roi > 20 ? 'strong' : 'moderate'} returns and ${s.totalBenefit > 100000 ? 'significant' : 'meaningful'} tax savings.`).join('\n\n')}

STRATEGY SYNERGIES AND INTERACTIONS

Your selected strategies work together in several important ways:

Income Reduction Strategies work as the foundation of your tax optimization approach. ${enabledStrategies.filter(s => s.id && (s.id.includes('SOLO401K') || s.id.includes('DB_PLAN'))).length > 0 ? 'Your retirement plan contributions directly reduce taxable income at both federal and state levels, creating a foundation for additional deductions.' : 'Consider adding retirement plan strategies to create a foundation of income reduction.'}

Deduction Amplification strategies maximize your tax benefits through business-related deductions. ${enabledStrategies.filter(s => s.id && (s.id.includes('EQUIP_S179') || s.id.includes('FILM_SEC181') || s.id.includes('OG_USENERGY'))).length > 0 ? 'Your business deduction strategies including Section 179 equipment purchases, film financing investments, and energy investments work together to maximize deductions against your highest marginal tax rates.' : 'Business deduction strategies can provide immediate tax relief.'}

Capital Management strategies provide timing flexibility and portfolio optimization benefits. ${enabledStrategies.filter(s => s.id && (s.id.includes('QUANT_DEALS') || s.id.includes('CHAR_CLAT'))).length > 0 ? 'Your capital-based strategies provide flexibility in timing and can offset gains from other investments while providing ongoing tax benefits.' : 'Capital management strategies can provide timing flexibility.'}

${stateDisplayName.toUpperCase()} STATE TAX OPTIMIZATION

As a ${stateDisplayName} resident with a ${Math.round(federalMarginalRate)}% federal marginal rate and ${Math.round(stateMarginalRate)}% state marginal rate, your tax planning requires careful consideration of state-specific rules and limitations.

${clientState === 'NY' ? 
  `**New York Tax Environment**: New York generally follows federal tax treatment with some strategic exceptions. Key considerations for your strategies include Section 179 limitations that may require timing adjustments, bonus depreciation add-backs that affect cash flow planning, and the 50% charitable deduction limitation for high-income taxpayers. Your retirement plan contributions receive full state deduction benefits, making them particularly valuable in New York's high-tax environment.` : 
  clientState === 'NJ' ? 
  `**New Jersey Tax Environment**: New Jersey has significant departures from federal tax treatment that create both challenges and opportunities. Critical considerations include the $975,000 Section 179 limitation (meaning federal excess requires add-backs), employee 401(k) contribution add-backs that reduce state benefits, no capital loss carryover provisions (use-it-or-lose-it), and full charitable deduction add-backs. However, employer retirement plan contributions and certain business investments maintain their deductibility, making strategic selection crucial.` : 
  `**State Tax Considerations**: Your state tax environment should be carefully reviewed with your tax advisor to ensure optimal strategy implementation. State-specific limitations and add-backs can significantly impact the effectiveness of federal strategies.`
}

IMPLEMENTATION ROADMAP

**Phase 1 - Immediate Implementation (Next 30 days)**
${sortedStrategies.slice(0, 3).map(s => `• **${s.name}**: Begin implementation immediately due to ${s.roi > 25 ? 'excellent ROI' : 'strong benefits'} and ${s.totalBenefit > 50000 ? 'significant tax impact' : 'material savings'}.`).join('\n')}

**Phase 2 - Short-term Implementation (Next 90 days)**
${sortedStrategies.slice(3, 6).map(s => `• **${s.name}**: Prepare documentation and coordinate with advisors for systematic implementation.`).join('\n')}

**Phase 3 - Long-term Strategic Positioning (Remainder of 2025)**
${sortedStrategies.slice(6).map(s => `• **${s.name}**: Position for optimal timing and maximum benefit realization.`).join('\n')}

RISK ASSESSMENT AND MITIGATION

Low Risk Strategies represent established precedent with minimal audit exposure.
${sortedStrategies.filter(s => s.id && (s.id.includes('SOLO401K') || s.id.includes('DB_PLAN'))).map(s => `• ${s.name}: Well-established retirement planning with clear regulatory framework.`).join('\n') || '• No low-risk strategies selected in current portfolio.'}

**Medium Risk Strategies** (Require careful documentation):
${sortedStrategies.filter(s => s.id && (s.id.includes('EQUIP_S179') || s.id.includes('CHAR_CLAT'))).map(s => `• ${s.name}: Requires proper documentation and compliance with regulatory requirements.`).join('\n') || '• No medium-risk strategies selected in current portfolio.'}

**Higher Risk Strategies** (Require enhanced documentation and professional oversight):
${sortedStrategies.filter(s => s.id && (s.id.includes('QUANT_DEALS') || s.id.includes('FILM_SEC181') || s.id.includes('OG_USENERGY'))).map(s => `• ${s.name}: Requires comprehensive documentation and ongoing compliance monitoring.`).join('\n') || '• No higher-risk strategies selected in current portfolio.'}

**Key Performance Metrics**

• **Total Tax Savings**: $${totalSavings.toLocaleString()} over the projection period
• **Annual Tax Reduction**: $${Math.round(totalSavings / 5).toLocaleString()} average per year
• **Effective Tax Rate**: Reduced from ${Math.round((baselineTax / (w2Income + businessIncome)) * 100)}% to ${Math.round((optimizedTax / (w2Income + businessIncome)) * 100)}%
• **Strategy Portfolio ROI**: ${Math.round(roi)}% return on invested capital
• **Capital Efficiency**: ${Math.round(totalSavings / capitalAllocated)}x multiplier on deployed capital

**Professional Recommendations**

1. **Tax Advisor Coordination**: Engage a qualified tax professional familiar with ${stateDisplayName} tax law for strategy implementation and ongoing compliance.

2. **Annual Review Process**: Establish annual review meetings to assess strategy effectiveness and make adjustments based on changing tax law and personal circumstances.

3. **Documentation Standards**: Maintain comprehensive records for all strategies, particularly those with higher audit risk profiles.

4. **Cash Flow Management**: Coordinate strategy implementation with your financial advisor to ensure adequate liquidity for optimal timing.

**Next Steps for Implementation**

1. **Immediate Action Required**: Begin implementation of your top 3 highest-ROI strategies within the next 30 days to maximize 2025 tax benefits.

2. **Professional Consultation**: Schedule meetings with your tax advisor and financial planner to coordinate strategy implementation and ensure compliance.

3. **Documentation Preparation**: Gather all necessary documentation for strategy implementation, including business records, investment documentation, and compliance materials.

4. **Monitoring Protocol**: Establish quarterly review processes to track strategy performance and make necessary adjustments.

**Important Disclaimer**: This analysis is based on current tax law and your provided information. Tax laws may change, and individual circumstances vary significantly. This analysis should not be considered as tax advice, and you should consult with a qualified tax professional before implementing any strategies. The calculations shown are estimates based on current marginal tax rates and may not reflect actual tax savings due to various factors including Alternative Minimum Tax, Net Investment Income Tax, and other limitations.

---
*This analysis was generated when the AI service was temporarily unavailable. For more detailed insights about strategy interactions, timing considerations, and advanced planning opportunities, please try the full AI analysis when the service is restored.*`;
    
    return fallbackAnalysis;
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
              // Film financing allows deduction of total film cost under Section 181 and 168(k)
              // Federal benefits apply uniformly regardless of investor state residency
              const totalFilmCost = inputValue; // This represents total film cost
              const cashDownPayment = inputValue * 0.25; // Typical 25% cash down
              const debtAssumed = inputValue * 0.75; // Typical 75% debt assumed
              federalBenefit = totalFilmCost * federalMarginalRate; // Deduct full film cost under Section 181/168(k)
              
              // State tax credits can be monetized regardless of investor residency
              const estimatedStateCredits = totalFilmCost * 0.25; // Assume 25% state credits (e.g., Georgia)
              const creditMonetizationValue = estimatedStateCredits * 0.9; // 90% monetization rate
              
              // State benefits include both state deduction and credit monetization
              stateBenefit = (totalFilmCost * stateMarginalRate) + (creditMonetizationValue / totalFilmCost * federalMarginalRate);
              
              specialConsiderations = `Section 181 and 168(k) allow 100% federal deduction of ${totalFilmCost.toLocaleString()} (${cashDownPayment.toLocaleString()} cash + ${debtAssumed.toLocaleString()} debt). State film credits (~${estimatedStateCredits.toLocaleString()}) can be sold to reduce debt by ~${creditMonetizationValue.toLocaleString()}, regardless of investor state residency. Recourse debt obligation.`;
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

CRITICAL FORMATTING AND CONTENT REQUIREMENTS:
- Use ONLY section headers in ALL CAPS followed by paragraphs in complete sentences
- NO bullet points, asterisks, dashes, underscores, or other formatting symbols in the body text
- Write in professional, flowing prose without lists or abbreviated text
- Separate major sections with double line breaks for clear visual spacing
- Use numbers (1, 2, 3) only for sequential steps, not for general lists
- All content must be in complete, well-structured paragraphs with clear spacing between ideas
- Be comprehensive and detailed in your analysis - provide thorough explanations rather than brief summaries
- Each paragraph should contain substantial content with specific examples and detailed calculations
- Ensure clear transitions between concepts and ideas within each section
- Provide extensive detail on implementation considerations, timing, and strategic implications

FILM FINANCING TAX BENEFITS GUIDANCE:
When discussing film financing, emphasize that tax benefits are not necessarily tied to the investor's state of residency. Federal Tax Deductions under Section 181 and Section 168(k) allow investors to deduct 100% of the film's cost as an expense, including both their initial cash payment and any assumed debt. Section 168(k) also allows bonus depreciation deduction for the entire cost of a completed film once placed in service. These are federal provisions applying uniformly across the United States regardless of investor state residency. For example, a taxpayer with 10,000,000 dollars in taxable income could reduce their federal taxable income to zero by acquiring a qualifying film for 10,000,000 dollars. State Film Tax Credits are offered by many states like Georgia, typically 25% or 30% of money spent in that state for film production. Investors have options that decouple the benefit from their state residency. They can offset state income tax in the credit-issuing state if they have tax liability there, or crucially, they can assign or sell these state tax credits to third parties, often the producer or re-seller, in exchange for a reduction against the principal balance of debt they owe on the film. For instance, if an investor assigns a 300,000 dollar tax credit, their debt on the film could be reduced by an amount equal to 90% of that credit, or 270,000 dollars. This mechanism directly reduces the investor's financial obligation on the film, providing tangible benefit irrespective of their personal state tax situation or residency in the state where the film was produced. Therefore, even if an investor is not a resident of the state issuing the film tax credits, they can still monetize these credits by using them to reduce their film-related debt, demonstrating that the tax benefit is not solely dependent on their state of residency.

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

**CRITICAL ANALYSIS REQUIREMENTS:**
1. **MANDATORY MINIMUM LENGTH**: Your response must be AT LEAST 1,800-2,200 words. This is NOT optional.
2. **STRUCTURED FORMAT**: Use section headers in ALL CAPS followed by detailed paragraphs. NO bullet points, asterisks, dashes, underscores, or formatting symbols in body text.
3. **COMPLETE SENTENCES ONLY**: Write ONLY in complete, professional sentences in paragraph form. Never use incomplete phrases or truncated text.
4. **EXTENSIVE DETAIL REQUIRED**: Provide comprehensive explanations, not brief summaries. Each section must be thoroughly developed in flowing prose.
5. **SPECIFIC CALCULATIONS**: Include exact dollar amounts and percentages in ALL recommendations with detailed calculations.
6. **COMPREHENSIVE COVERAGE**: Address AMT, NIIT, Section 199A implications, and state-specific considerations in depth.
7. **DETAILED CASH FLOW ANALYSIS**: Include extensive cash flow and timing considerations for each strategy.
8. **STRATEGY SYNERGIES FOCUS**: Emphasize how strategies work together, not just individual benefits.
9. **ACTIONABLE IMPLEMENTATION**: Provide specific, detailed implementation guidance with exact deadlines and steps.

**COMPREHENSIVE ANALYSIS FRAMEWORK (MINIMUM 1,800-2,200 WORDS):**

Format your response using section headers in ALL CAPS followed by detailed paragraphs in complete sentences. Do not use bullet points, lists, asterisks, dashes, or formatting symbols in the body text.

EXECUTIVE SUMMARY
Provide a sophisticated, comprehensive analysis of the integrated tax strategy approach. Explain in detail the total optimization potential of $${totalSavings.toLocaleString()}, the strategic rationale for the recommended portfolio approach, and how these strategies work together to create compound benefits. Include specific discussion of risk mitigation, cash flow optimization, and long-term planning considerations.

**Key Insights for Your Situation** (450-550 words - CRITICAL SECTION)
This section is the most important and must be extensively detailed with complete sentences and comprehensive explanations. You must provide in-depth analysis of:

✓ **Strategy-Specific Benefits**: For each strategy, explain exactly how it benefits your ${stateDisplayName} tax situation with detailed calculations showing federal and state tax implications.

✓ **State Tax Implications**: Provide comprehensive analysis of how ${stateDisplayName} state tax rules affect each strategy's federal benefits, including specific add-back requirements, limitations, and timing considerations.

✓ **Implementation Timing**: Detailed discussion of optimal timing for each strategy implementation, including specific dates, deadlines, and sequencing considerations.

✓ **Cash Flow Analysis**: Comprehensive examination of cash flow implications, liquidity requirements, and how strategies affect your overall financial position.

✓ **Risk Assessment**: Detailed analysis of audit risk, compliance requirements, and mitigation strategies specific to your situation.

✓ **Integration Strategy**: Extensive discussion of how these strategies integrate with your overall wealth management approach and long-term financial goals.

**Strategy Synergies and Interactions** (350-400 words)
Provide comprehensive analysis of how these strategies work together:
- **Complementary Strategies**: Detailed explanation of which strategies amplify each other's effectiveness and the specific mechanisms behind this amplification
- **Timing Interdependencies**: Comprehensive analysis of how implementation sequence affects overall benefits with specific examples
- **Cash Flow Optimization**: Detailed examination of how the strategies' cash flow patterns create additional planning opportunities
- **Risk Mitigation**: Extensive discussion of how diversifying across multiple strategies reduces overall tax planning risk

**Advanced Strategy Effectiveness Analysis** (300-350 words)
Provide detailed analysis for each strategy with comprehensive calculations and explanations:
${sortedStrategies.map((s, i) => `${i + 1}. **${s.name}** - Federal: $${Math.round(s.federalBenefit).toLocaleString()}, State: $${Math.round(s.stateBenefit - s.stateAddBack).toLocaleString()}, Total: $${Math.round(s.totalBenefit).toLocaleString()}/year (${Math.round((s.totalBenefit/s.amount)*100)}% ROI) - Provide detailed explanation of calculation methodology, risk factors, and implementation considerations`).join('\\n')}

**${stateDisplayName} State Tax Optimization Matrix** (250-300 words)
Provide comprehensive state-specific analysis with extensive detail:
- **Maximum State Benefit Strategy**: Detailed identification and explanation of the strategy providing the highest state tax savings with specific calculations
- **State Tax Traps and Mitigation**: Comprehensive analysis of strategies that create add-backs or phantom income with detailed mitigation strategies
- **Federal-State Timing Arbitrage**: Detailed identification of opportunities to optimize timing differences between federal and state treatment
- **State-Specific Implementation Sequence**: Detailed recommendations for optimal order considering state tax implications

STRATEGIC INTEGRATION ANALYSIS

Provide comprehensive analysis of how strategies interact across different tax areas in complete paragraph form. Cover income character optimization explaining how strategies optimize the character of income between ordinary and capital gains treatment. Analyze deduction timing strategies and how deduction timing can be optimized across strategies. Provide extensive analysis of Alternative Minimum Tax and Net Investment Income Tax implications. Detail how strategies affect qualified business income deductions under Section 199A. Discuss strategic timing across multiple tax years. Write this as flowing paragraphs totaling 200-250 words.

IMPLEMENTATION ROADMAP WITH SPECIFIC DEADLINES

Provide detailed, actionable implementation plan in paragraph form. Begin with Phase 1 immediate actions for the next 30 days, detailing highest priority actions with specific dates and comprehensive rationale. Continue with Phase 2 short-term implementations for the next 90 days, covering medium priority implementations with preparation requirements. Conclude with Phase 3 long-term strategic positioning for the remainder of 2025, detailing strategic positioning moves with complex implementation. Write this as flowing paragraphs totaling 150-200 words.

RISK ASSESSMENT AND MITIGATION

Provide comprehensive risk analysis in paragraph form. Begin with low risk strategies, detailing established precedent strategies with implementation details. Continue with medium risk strategies, providing comprehensive analysis of strategies requiring careful documentation with specific compliance requirements. Conclude with high risk strategies, detailing strategies with audit considerations and mitigation approaches. Write this as flowing paragraphs totaling 150-200 words.

PROFESSIONAL RECOMMENDATIONS

Provide 3 to 5 specific, detailed professional recommendations for advisors in paragraph form. Cover CPAs, attorneys, and financial planners and their specific roles in implementation. Write this as flowing paragraphs totaling 100-150 words.

CONCLUSION AND NEXT STEPS

Provide comprehensive summary of the strategic approach and detailed next steps for client action in paragraph form. Write this as flowing paragraphs totaling 100-150 words.

MANDATORY REQUIREMENTS: Your total response must be 2,200-2,800 words minimum for comprehensive analysis. The 'Key Insights for Your Situation' section must be 550-700 words and contain complete, detailed sentences with no truncation. Be thorough and comprehensive in every section - provide extensive detail, specific examples, detailed calculations, and comprehensive explanations. Do not provide abbreviated or truncated responses. Each section should be substantive with clear spacing between different concepts and ideas. Focus on comprehensive analysis, detailed strategic insights, quantified benefits, specific implementation guidance, and professional-grade recommendations suitable for ultra-high-net-worth clients. Ensure each paragraph contains substantial content and detailed explanations rather than brief summaries.`;

        // Use the secure backend proxy instead of direct API call
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // Extended timeout for comprehensive 1,800-2,200 word analysis

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
          setInteractionError('AI analysis timed out. The service may be busy. Please try again in a few moments.');
        } else if (error.message.includes('503') || error.message.includes('busy')) {
          setInteractionError('AI service is temporarily busy. Please try again in a few moments.');
        } else if (error.message.includes('Backend URL')) {
          setInteractionError('AI analysis service is not configured. Please contact support.');
        } else {
          setInteractionError(`AI analysis temporarily unavailable: ${error.message}`);
        }
        
        // Increment retry count
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        // Show fallback analysis after 1 failed attempt
        if (newRetryCount >= 1) {
          setShowFallbackAnalysis(true);
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
                Generating Advanced Tax Strategy Analysis
              </h3>
              <p className="text-gray-600 mb-2">
                Analyzing {enabledStrategies.length} strategies for{' '}
                {scenario?.clientData?.state || 'your state'} residents
              </p>
              <p className="text-sm text-gray-500 italic">
                Please wait - AI analysis generation may take 30-60 seconds
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

              <div className="mt-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchInteractionExplanation}
                    disabled={loadingInteraction}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => {
                      const fallbackAnalysis = generateFallbackAnalysis();
                      setInteractionExplanation(fallbackAnalysis);
                      setShowFallbackAnalysis(true);
                      setInteractionError('');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Show Basic Analysis
                  </button>
                </div>
                
                {retryCount >= 1 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">AI Service Temporarily Unavailable</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          The AI analysis service is experiencing high demand. You can try again in a few minutes or view a basic analysis of your selected strategies.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : interactionExplanation ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className={`px-8 py-6 border-b border-gray-200 ${showFallbackAnalysis ? 'bg-yellow-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-3 ${showFallbackAnalysis ? 'bg-yellow-600' : 'bg-gray-700'}`}>
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
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {showFallbackAnalysis ? 'Basic Tax Strategy Analysis' : 'Tax Strategy Analysis'}
                    </h3>
                    {showFallbackAnalysis && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Fallback Mode
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {showFallbackAnalysis ? 'Fundamental insights and recommendations' : 'Professional insights and recommendations'}
                  </p>
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
                <div className="flex items-center space-x-3">
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
                  {showFallbackAnalysis && (
                    <button
                      onClick={() => {
                        setShowFallbackAnalysis(false);
                        setRetryCount(0);
                        fetchInteractionExplanation();
                      }}
                      disabled={loadingInteraction}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Try Full AI Analysis
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8 bg-white">
            {showFallbackAnalysis && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Basic Analysis Mode
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This analysis was generated using our fallback system while the AI service was temporarily unavailable. 
                        While comprehensive, it provides fundamental insights rather than the advanced AI-powered analysis. 
                        For more detailed strategy interactions and personalized recommendations, please try the full AI analysis above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  <span>{showFallbackAnalysis ? 'Basic Analysis' : 'Powered by AI'}</span>
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

import React, { useState, useMemo } from 'react';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY } from '../constants';
import Section from './Section';

// Function to format numbers without decimals
const formatCurrency = (amount) => {
    return Math.round(amount).toLocaleString();
};

// Function to format AI analysis text with professional styling
const formatAIAnalysis = (text) => {
    if (!text) return null;
    
    // Split text into paragraphs and format each part
    const parts = text.split('\n').filter(part => part.trim());
    
    return parts.map((part, index) => {
        const trimmedPart = part.trim();
        
        // Handle numbered sections (1., 2., etc.) with bold titles
        if (/^\d+\.\s*\*\*/.test(trimmedPart)) {
            const match = trimmedPart.match(/^(\d+\.\s*)(\*\*[^*]+\*\*)(.*)$/);
            if (match) {
                const [, number, title, content] = match;
                return (
                    <div key={index} className="mb-4 p-4 bg-white rounded border-l-4 border-blue-600">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2 font-semibold">
                                {number.replace('.', '')}
                            </span>
                            {title.replace(/\*\*/g, '')}
                        </h4>
                        <div className="text-gray-700 leading-relaxed pl-8">
                            {formatInlineText(content)}
                        </div>
                    </div>
                );
            }
        }
        
        // Handle main headings with **text** (but not headings with ### or ##)
        if (/^\*\*[^*]+\*\*$/.test(trimmedPart) && !trimmedPart.includes(':') && !trimmedPart.startsWith('#')) {
            return (
                <div key={index} className="mb-4 mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-300">
                        {trimmedPart.replace(/\*\*/g, '')}
                    </h3>
                </div>
            );
        }
        
        // Handle markdown headings (###, ##) and convert them to styled headings
        if (/^#{2,3}\s/.test(trimmedPart)) {
            const level = trimmedPart.match(/^(#{2,3})/)[1].length;
            const text = trimmedPart.replace(/^#{2,3}\s*/, '');
            const headingClass = level === 2 ? 
                "text-xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-300" :
                "text-lg font-semibold text-gray-800 mb-2";
            
            return (
                <div key={index} className={level === 2 ? "mb-4 mt-6" : "mb-3 mt-4"}>
                    <h3 className={headingClass}>
                        {text}
                    </h3>
                </div>
            );
        }
        
        // Handle subheadings with **text:** pattern
        if (/^\*\*[^*]+:\*\*/.test(trimmedPart)) {
            const content = trimmedPart.replace(/^\*\*([^*]+):\*\*\s*/, '');
            const heading = trimmedPart.match(/^\*\*([^*]+):\*\*/)[1];
            return (
                <div key={index} className="mb-3 bg-gray-50 p-3 rounded border border-gray-200">
                    <h5 className="text-base font-semibold text-gray-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {heading}:
                    </h5>
                    <div className="text-gray-700 leading-relaxed pl-4">
                        {formatInlineText(content)}
                    </div>
                </div>
            );
        }
        
        // Handle quotes or important callouts (lines starting with ">")
        if (trimmedPart.startsWith('>')) {
            const content = trimmedPart.replace(/^>\s*/, '');
            return (
                <div key={index} className="mb-4 border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-amber-800 leading-relaxed">
                            {formatInlineText(content)}
                        </div>
                    </div>
                </div>
            );
        }
        
        // Handle bullet points with enhanced styling
        if (trimmedPart.startsWith('*   ') || trimmedPart.startsWith('* ')) {
            const content = trimmedPart.replace(/^\*\s*/, '');
            return (
                <div key={index} className="flex items-start mb-2 pl-3">
                    <span className="text-blue-600 mr-3 mt-1">•</span>
                    <div className="text-gray-700 leading-relaxed flex-1">
                        {formatInlineText(content)}
                    </div>
                </div>
            );
        }
        
        // Handle numbered lists
        if (/^\d+\.\s/.test(trimmedPart) && !trimmedPart.includes('**')) {
            const match = trimmedPart.match(/^(\d+\.\s)(.*)$/);
            if (match) {
                const [, number, content] = match;
                return (
                    <div key={index} className="flex items-start mb-2 pl-3">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 font-medium">
                            {number.replace('.', '')}
                        </span>
                        <div className="text-gray-700 leading-relaxed flex-1">
                            {formatInlineText(content)}
                        </div>
                    </div>
                );
            }
        }
        
        // Handle regular paragraphs with better spacing
        if (trimmedPart.length > 0) {
            return (
                <div key={index} className="mb-3 p-3 bg-white rounded border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                        {formatInlineText(trimmedPart)}
                    </p>
                </div>
            );
        }
        
        return null;
    }).filter(Boolean);
};

// Function to format inline text with enhanced markdown support
const formatInlineText = (text) => {
    if (!text) return '';
    
    // Handle multiple formatting patterns
    const processedText = text;
    const parts = [];
    let lastIndex = 0;
    
    // Regular expression to match various patterns
    const patterns = [
        { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
        { regex: /\*([^*]+)\*/g, type: 'italic' },
        { regex: /`([^`]+)`/g, type: 'code' },
        { regex: /\$([0-9,]+(?:\.[0-9]{2})?)/g, type: 'currency' },
        { regex: /([0-9]+(?:\.[0-9]+)?%)/g, type: 'percentage' },
        { regex: /\b(Section \d+|IRC \d+|Form \d+)\b/g, type: 'legal' },
        { regex: /\b(AGI|QBI|AMT|IRA|401k|IRS|LLC|S-Corp|C-Corp)\b/g, type: 'tax-term' }
    ];
    
    // Find all matches and their positions
    const matches = [];
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(processedText)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                content: match[1] || match[0],
                fullMatch: match[0],
                type: pattern.type
            });
        }
    });
    
    // Sort matches by position and remove overlapping matches
    matches.sort((a, b) => a.start - b.start);
    const filteredMatches = [];
    let lastEnd = 0;
    
    matches.forEach(match => {
        if (match.start >= lastEnd) {
            filteredMatches.push(match);
            lastEnd = match.end;
        }
    });
    
    // Process matches and build formatted output
    filteredMatches.forEach((match, index) => {
        // Add text before this match
        if (match.start > lastIndex) {
            parts.push(processedText.substring(lastIndex, match.start));
        }
        
        // Add formatted match
        switch (match.type) {
            case 'bold':
                parts.push(
                    <strong key={`bold-${index}`} className="font-semibold text-gray-900">
                        {match.content}
                    </strong>
                );
                break;
            case 'italic':
                parts.push(
                    <em key={`italic-${index}`} className="italic text-gray-800">
                        {match.content}
                    </em>
                );
                break;
            case 'code':
                parts.push(
                    <code key={`code-${index}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">
                        {match.content}
                    </code>
                );
                break;
            case 'currency':
                parts.push(
                    <span key={`currency-${index}`} className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        ${match.content}
                    </span>
                );
                break;
            case 'percentage':
                parts.push(
                    <span key={`percentage-${index}`} className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                        {match.content}
                    </span>
                );
                break;
            case 'legal':
                parts.push(
                    <span key={`legal-${index}`} className="font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                        {match.content}
                    </span>
                );
                break;
            case 'tax-term':
                parts.push(
                    <span key={`tax-term-${index}`} className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                        {match.content}
                    </span>
                );
                break;
            default:
                parts.push(match.content);
        }
        
        lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < processedText.length) {
        parts.push(processedText.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
};

const StrategyInteractionAnalysis = ({ scenario, results }) => {
    const [interactionExplanation, setInteractionExplanation] = useState('');
    const [loadingInteraction, setLoadingInteraction] = useState(false);
    const [interactionError, setInteractionError] = useState('');
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [lastAnalyzedStrategies, setLastAnalyzedStrategies] = useState([]);

    const allStrategies = useMemo(() => [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES], []);
    const enabledStrategies = useMemo(() => {
        return allStrategies.filter(strategy => {
            const isEnabled = scenario?.enabledStrategies?.[strategy.id];
            const inputValue = scenario?.clientData?.[strategy.inputRequired];
            return isEnabled && typeof inputValue === 'number' && inputValue > 0;
        });
    }, [allStrategies, scenario?.enabledStrategies, scenario?.clientData]);

    // Check if strategies have changed since last analysis
    const strategiesChanged = useMemo(() => {
        const currentStrategyIds = enabledStrategies.map(s => s.id).sort();
        const lastStrategyIds = lastAnalyzedStrategies.map(s => s.id).sort();
        return JSON.stringify(currentStrategyIds) !== JSON.stringify(lastStrategyIds);
    }, [enabledStrategies, lastAnalyzedStrategies]);

    const getButtonText = () => {
        if (!hasAnalyzed) return 'Generate AI Analysis';
        if (strategiesChanged) return 'Refresh Analysis';
        return 'Regenerate Analysis';
    };

    const fetchInteractionExplanation = async (retryCount = 0) => {
        if (enabledStrategies.length > 1) {
            setLoadingInteraction(true);
            setInteractionError('');
            try {
                const clientState = scenario?.clientData?.state || 'Not specified';
                const stateDisplayName = clientState === 'NJ' ? 'New Jersey' : 
                                       clientState === 'NY' ? 'New York' : 
                                       clientState;
                
                // Extract client financial data
                const clientData = scenario?.clientData || {};
                const w2Income = clientData.w2Income || 0;
                const businessIncome = clientData.businessIncome || 0;
                const shortTermGains = clientData.shortTermGains || 0;
                const longTermGains = clientData.longTermGains || 0;
                
                // Extract calculation results
                const totalSavings = results?.cumulative?.totalSavings || 0;
                const baselineTax = results?.cumulative?.baselineTax || 0;
                const optimizedTax = results?.cumulative?.optimizedTax || 0;
                const currentYearSavings = results?.projections?.[0]?.totalSavings || 0;
                
                // Calculate strategy-specific data (keeping for backward compatibility)
                // const strategyContributions = enabledStrategies.map(strategy => {
                //     const inputValue = clientData[strategy.inputRequired] || 0;
                //     const estimatedSavings = inputValue * 0.25; // Rough estimate based on average tax rate
                //     return {
                //         name: strategy.name,
                //         amount: inputValue,
                //         estimatedSavings: estimatedSavings
                //     };
                // });
                
                // Calculate more precise strategy-specific savings and state impacts
                
                // Calculate more precise strategy-specific savings and state impacts
                const strategyDetailsForAI = enabledStrategies.map(strategy => {
                    const inputValue = clientData[strategy.inputRequired] || 0;
                    let federalBenefit = 0;
                    let stateBenefit = 0;
                    let stateAddBack = 0;
                    let specialConsiderations = '';
                    
                    // Calculate specific benefits based on strategy type and state
                    switch (strategy.id) {
                        case 'EQUIP_S179_01':
                            federalBenefit = Math.min(inputValue, 1220000) * 0.35; // Rough federal tax benefit
                            if (clientState === 'NY') {
                                stateBenefit = Math.min(inputValue, 1220000) * 0.109; // NY allows full deduction
                            } else { // NJ
                                stateBenefit = Math.min(inputValue, 25000) * 0.1075; // NJ caps at $25K
                                stateAddBack = Math.max(0, inputValue - 25000);
                                specialConsiderations = 'NJ caps Section 179 at $25,000 with required add-back';
                            }
                            break;
                        case 'SOLO401K_EMPLOYEE_01':
                            federalBenefit = Math.min(inputValue, 23000) * 0.35;
                            if (clientState === 'NY') {
                                stateBenefit = Math.min(inputValue, 23000) * 0.109;
                            } else { // NJ
                                stateBenefit = 0; // NJ taxes 401k deferrals
                                stateAddBack = Math.min(inputValue, 23000);
                                specialConsiderations = 'NJ taxes 401(k) deferrals - no state tax benefit';
                            }
                            break;
                        case 'SOLO401K_EMPLOYER_01':
                        case 'DB_PLAN_01':
                            federalBenefit = inputValue * 0.35;
                            stateBenefit = inputValue * (clientState === 'NY' ? 0.109 : 0.1075);
                            specialConsiderations = 'Reduces QBI base income';
                            break;
                        case 'QUANT_DEALS_01':
                            const exposureRates = {
                                '130/30': { shortTermLossRate: 0.10, longTermGainRate: 0.024, netBenefit: 0.035 },
                                '145/45': { shortTermLossRate: 0.138, longTermGainRate: 0.033, netBenefit: 0.046 },
                                '175/75': { shortTermLossRate: 0.206, longTermGainRate: 0.049, netBenefit: 0.069 },
                                '225/125': { shortTermLossRate: 0.318, longTermGainRate: 0.076, netBenefit: 0.106 }
                            };
                            const exposure = exposureRates[clientData.dealsExposure] || exposureRates['175/75'];
                            federalBenefit = inputValue * exposure.netBenefit * 0.35;
                            stateBenefit = inputValue * exposure.netBenefit * (clientState === 'NY' ? 0.109 : 0.1075);
                            specialConsiderations = `${clientData.dealsExposure || '175/75'} exposure level - ${(exposure.netBenefit * 100).toFixed(1)}% annual benefit`;
                            break;
                        case 'CHAR_CLAT_01':
                            federalBenefit = Math.min(inputValue, (w2Income + businessIncome) * 0.30) * 0.35;
                            if (clientState === 'NY') {
                                stateBenefit = Math.min(inputValue, (w2Income + businessIncome) * 0.30) * 0.5 * 0.109;
                                specialConsiderations = 'NY allows 50% of federal charitable deduction';
                            } else {
                                stateBenefit = 0;
                                specialConsiderations = 'NJ provides no state tax benefit for charitable deductions';
                            }
                            break;
                        case 'OG_USENERGY_01':
                            federalBenefit = inputValue * 0.70 * 0.35;
                            if (clientState === 'NY') {
                                stateBenefit = inputValue * 0.70 * 0.109;
                            } else {
                                stateBenefit = 0;
                                specialConsiderations = 'NJ provides no state deduction for oil & gas investments';
                            }
                            break;
                        case 'FILM_SEC181_01':
                            federalBenefit = inputValue * 0.35;
                            if (clientState === 'NY') {
                                stateBenefit = inputValue * 0.109;
                            } else {
                                stateBenefit = 0;
                                specialConsiderations = 'NJ provides no state deduction for film investments';
                            }
                            break;
                        case 'QBI_FINAL_01':
                            if (businessIncome > 0) {
                                federalBenefit = businessIncome * 0.20 * 0.35;
                                stateBenefit = 0; // QBI is federal only
                                specialConsiderations = 'Federal-only benefit, no state equivalent';
                            }
                            break;
                        default:
                            // For any other strategies, use generic calculation
                            federalBenefit = inputValue * 0.25; // 25% effective tax rate estimate
                            stateBenefit = inputValue * (clientState === 'NY' ? 0.109 : 0.1075) * 0.5; // Conservative state benefit
                            specialConsiderations = 'Generic strategy calculation';
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
                        specialConsiderations: specialConsiderations
                    };
                });

                const prompt = `You are a senior tax strategist analyzing ${enabledStrategies.length} specific strategies for a ${stateDisplayName} resident in 2025. Generate a comprehensive, actionable analysis focusing on strategy interactions, risk assessment, and long-term optimization.

**Client Profile:**
- W2 Income: $${formatCurrency(w2Income)}
- Business Income: $${formatCurrency(businessIncome)}
- Short-term Capital Gains: $${formatCurrency(shortTermGains)}
- Long-term Capital Gains: $${formatCurrency(longTermGains)}
- State: ${stateDisplayName}
- Total Annual Income: $${formatCurrency(w2Income + businessIncome + shortTermGains + longTermGains)}

**Current Tax Situation:**
- Baseline Annual Tax: $${formatCurrency(baselineTax)}
- Optimized Annual Tax: $${formatCurrency(optimizedTax)}
- Current Year Savings: $${formatCurrency(currentYearSavings)}
- Total Multi-Year Savings: $${formatCurrency(totalSavings)}
- Effective Tax Rate Reduction: ${((currentYearSavings / (w2Income + businessIncome + shortTermGains + longTermGains)) * 100).toFixed(1)}%

**Strategy Analysis with ${stateDisplayName} Impact:**
${strategyDetailsForAI.map(s => `- **${s.name}**: $${formatCurrency(s.amount)} → Fed: $${formatCurrency(s.federalBenefit)} | State: $${formatCurrency(s.stateBenefit)}${s.stateAddBack > 0 ? ` | Add-back: $${formatCurrency(s.stateAddBack)}` : ''} | Total: $${formatCurrency(s.totalBenefit)}${s.specialConsiderations ? ` | ${s.specialConsiderations}` : ''}`).join('\n')}

**CRITICAL: Use only ** for bold text. Never use ### or ## for headings. Provide specific analysis for 2025+ tax years:**

**Strategy Effectiveness Ranking**

Rank strategies by total tax benefit and ROI (return on investment):
1. [Highest total benefit strategy] - $${formatCurrency(Math.max(...strategyDetailsForAI.map(s => s.totalBenefit)))} total savings ([ROI percentage]%)
2. [Second highest] - $[amount] total savings ([ROI percentage]%)
3. [Continue for all strategies]

**${stateDisplayName} State Tax Optimization**

${clientState === 'NJ' ? 'New Jersey specific impacts:' : 'New York specific impacts:'}
- ${clientState === 'NJ' ? 'Section 179 capped at $25,000 (add-back required above this)' : 'Section 179 fully deductible at state level'}
- ${clientState === 'NJ' ? '401(k) deferrals are taxable (no state benefit)' : '401(k) deferrals are deductible'}
- ${clientState === 'NJ' ? 'No state benefits for charitable, oil & gas, or film investments' : 'Partial state benefits for charitable (50%), full for oil & gas and film'}
- Net state impact: $${formatCurrency(strategyDetailsForAI.reduce((sum, s) => sum + s.stateBenefit, 0))} annual state savings

**Advanced Strategy Interactions**

**Positive Synergies:**
- [Which strategies create compounding benefits when combined]
- [How strategies reduce each other's taxable income base]
- [Timing strategies that create maximum benefit overlap]

**Negative Interactions & Limitations:**
- [Which strategies compete for the same tax benefits]
- [Income phase-out thresholds that affect multiple strategies]
- [AMT implications from combining strategies]

**Risk Assessment & Mitigation**

**Low Risk Strategies:** [List strategies with minimal audit risk or complexity]
**Medium Risk Strategies:** [List strategies requiring careful documentation]
**High Risk Strategies:** [List strategies requiring professional oversight]

**Long-term Optimization (2025-2027)**

**Year 1 (2025):** Focus on [immediate impact strategies] for $${formatCurrency(currentYearSavings)} savings
**Year 2-3 (2026-2027):** Build on [foundational strategies] for potential additional $[projected amount] savings
**Multi-year considerations:** [Strategies that build value over time]

**Implementation Priority Matrix**

**Immediate (Q1 2025):** [Strategies with year-end deadlines or maximum current benefit]
**Short-term (Q2-Q3 2025):** [Strategies requiring setup but with high ROI]
**Long-term (Q4 2025+):** [Strategies requiring significant planning or multi-year commitment]

**Professional Guidance Requirements**

**Self-implementation:** [Strategies you can handle independently]
**CPA consultation:** [Strategies requiring professional tax preparation]
**Attorney consultation:** [Strategies requiring legal structure setup]

**2025 Tax Year Action Plan**

Your immediate next steps with specific deadlines:
1. [Most urgent action with exact deadline and specific steps]
2. [Second priority with timeline and required documentation]
3. [Third priority with implementation milestones]

**Key Performance Indicators**

Track these metrics to measure strategy success:
- Quarterly tax savings vs. baseline
- Strategy-specific ROI calculations
- State vs. federal benefit optimization
- Year-over-year improvement trends

Keep analysis under 500 words. Focus on your specific $${formatCurrency(currentYearSavings)} savings and ${stateDisplayName} state rules with actionable implementation guidance.`;

                const chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
                
                if (!apiKey) {
                    setInteractionError('AI analysis is not configured. To enable strategy interaction analysis, please set up your Gemini API key in the .env file.');
                    setLoadingInteraction(false);
                    return;
                }
                
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30 seconds

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    setInteractionExplanation(result.candidates[0].content.parts[0].text);
                    setHasAnalyzed(true);
                    setLastAnalyzedStrategies([...enabledStrategies]);
                } else {
                    setInteractionError('Failed to generate interaction explanation.');
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    if (retryCount < 1) {
                        // Retry once with a simpler request
                        return fetchInteractionExplanation(retryCount + 1);
                    } else {
                        setInteractionError('Request timed out after multiple attempts. The AI service may be experiencing high load. Please try again in a moment.');
                    }
                } else if (error.message.includes('429') || error.message.includes('503')) {
                    setInteractionError('AI service is temporarily busy. Please try again in a few moments.');
                } else {
                    setInteractionError(`Error fetching interaction explanation: ${error.message}`);
                }
            } finally {
                setLoadingInteraction(false);
            }
        }
    };

    // Don't render if no strategies or only one strategy
    if (enabledStrategies.length <= 1) {
        return null;
    }

    return (
        <Section 
            title="🤖 Advanced Tax Strategy Analysis" 
            description="Comprehensive professional analysis including strategy interactions, risk assessment, long-term optimization, and implementation guidance tailored to your state and financial profile"
        >
            {loadingInteraction ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-blue-600"></div>
                            <div className="absolute inset-0 rounded-full h-10 w-10 border-3 border-transparent border-t-blue-400 animate-spin" style={{animationDuration: '1.5s'}}></div>
                        </div>
                        <div className="ml-4">
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                                Advanced Tax Strategy Analysis in Progress
                            </div>
                            <div className="text-sm text-gray-600">
                                Generating comprehensive analysis including risk assessment, long-term optimization, and implementation guidance for {scenario?.clientData?.state || 'your state'} residents...<br/>
                                <span className="text-xs text-gray-500">This comprehensive analysis may take up to 30 seconds</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-50 rounded p-4 border border-gray-100">
                        <div className="text-sm text-gray-600 mb-3">
                            <strong>Client Profile:</strong>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-xs text-gray-500">State of Residence:</span>
                                <div className="font-medium text-gray-800">
                                    {scenario?.clientData?.state === 'NJ' ? 'New Jersey' : 
                                     scenario?.clientData?.state === 'NY' ? 'New York' : 
                                     scenario?.clientData?.state || 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Selected Strategies:</span>
                                <div className="font-medium text-gray-800">{enabledStrategies.length}</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {enabledStrategies.map((strategy, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                    {strategy.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : interactionError ? (
                <div className="bg-white border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-red-900 mb-2">AI Analysis Unavailable</h4>
                            <p className="text-red-800 mb-4 leading-relaxed">{interactionError}</p>
                            
                            {interactionError.includes('API key') && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <h5 className="font-medium text-red-900 mb-2">Setup Required</h5>
                                    <p className="text-sm text-red-800 mb-3">
                                        To enable AI-powered strategy analysis, you'll need to configure your Gemini API key.
                                    </p>
                                    <div className="text-xs text-red-700 space-y-1">
                                        <p>• Create a <code className="bg-red-200 px-1 rounded">.env</code> file in your project root</p>
                                        <p>• Add: <code className="bg-red-200 px-1 rounded">REACT_APP_GEMINI_API_KEY=your_api_key_here</code></p>
                                        <p>• Restart your development server</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <h5 className="font-medium text-gray-900 mb-2">Selected Strategies:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {enabledStrategies.map((strategy, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm">
                                            {strategy.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : interactionExplanation ? (
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="bg-blue-600 rounded-full p-2 mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.953-1.382l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Advanced Tax Strategy Analysis</h3>
                                </div>
                                <button
                                    onClick={fetchInteractionExplanation}
                                    disabled={loadingInteraction}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        strategiesChanged 
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loadingInteraction ? 'Analyzing...' : getButtonText()}
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Advanced analysis including strategy interactions, risk assessment, long-term optimization, and implementation guidance for {scenario?.clientData?.state || 'your state'} residents
                            </p>
                            {strategiesChanged && (
                                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center text-orange-800">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="text-sm font-medium">Strategies changed - refresh for updated analysis</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="prose prose-lg max-w-none">
                            <div className="ai-analysis-content space-y-3">
                                {formatAIAnalysis(interactionExplanation)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Analysis powered by Google Gemini AI</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secure & Private</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="mb-6">
                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.953-1.382l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Tax Strategy Analysis</h3>
                        <p className="text-gray-600 mb-6">
                            Ready to generate a comprehensive analysis including strategy interactions, risk assessment, long-term optimization, and implementation guidance for {scenario?.clientData?.state || 'your state'} residents with specific dollar amounts and actionable steps
                        </p>
                        
                        <button
                            onClick={fetchInteractionExplanation}
                            disabled={loadingInteraction}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                        >
                            {loadingInteraction ? 'Analyzing...' : getButtonText()}
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 max-w-md mx-auto">
                        <div className="text-sm text-gray-600 mb-4">
                            <strong>How it works:</strong>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                                <span>Choose 2 or more tax strategies</span>
                            </div>
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                                <span>Click to generate AI analysis</span>
                            </div>
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                                <span>Get comprehensive analysis with risk assessment and implementation guidance</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Section>
    );
};

export default StrategyInteractionAnalysis;

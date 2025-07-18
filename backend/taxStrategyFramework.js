const fs = require('fs');
const path = require('path');

// Read the UnifiedTaxStrategyGuide.md file (or fallback to TaxStrategyFramework.md)
const readTaxStrategyFramework = () => {
  try {
    // Try multiple possible locations for the file, prioritizing the unified guide
    const possiblePaths = [
      path.join(__dirname, '..', 'data', 'UnifiedTaxStrategyGuide.md'),
      path.join(__dirname, 'data', 'UnifiedTaxStrategyGuide.md'),
      path.join(process.cwd(), 'data', 'UnifiedTaxStrategyGuide.md'),
      // Fallback to original file if unified guide not found
      path.join(__dirname, '..', 'data', 'TaxStrategyFramework.md'),
      path.join(__dirname, 'data', 'TaxStrategyFramework.md'),
      path.join(process.cwd(), 'data', 'TaxStrategyFramework.md')
    ];
    
    let content = null;
    let foundPath = null;
    
    // Try each path until we find the file
    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          console.log(`Found framework file at: ${filePath}`);
          content = fs.readFileSync(filePath, 'utf8');
          foundPath = filePath;
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }
    
    if (!content) {
      console.error(`File not found in any of the expected locations: ${possiblePaths.join(', ')}`);
      // Return a simple default framework content for testing
      return `
<Strategy id="test">
<n>Test Strategy</n>
<Hierarchy>1</Hierarchy>
<Description>This is a test strategy.</Description>
<CalculationLogic>Test calculation logic.</CalculationLogic>
<AGI_Impact_Rule>Test AGI impact.</AGI_Impact_Rule>
<Interactions>Test interactions.</Interactions>
<StateTaxTreatment>
<State name="NY">
<Conformity>Test</Conformity>
<Deductibility>Test</Deductibility>
</State>
<State name="NJ">
<Conformity>Test</Conformity>
<Deductibility>Test</Deductibility>
</State>
</StateTaxTreatment>
<Limitations_Risks>Test limitations.</Limitations_Risks>
</Strategy>
      `;
    }
    
    console.log(`Successfully read framework file from: ${foundPath}`);
    return content;
  } catch (error) {
    console.error('Error reading framework file:', error);
    // Return a simple default framework content for testing
    return `
<Strategy id="test">
<n>Test Strategy</n>
<Hierarchy>1</Hierarchy>
<Description>This is a test strategy.</Description>
<CalculationLogic>Test calculation logic.</CalculationLogic>
<AGI_Impact_Rule>Test AGI impact.</AGI_Impact_Rule>
<Interactions>Test interactions.</Interactions>
<StateTaxTreatment>
<State name="NY">
<Conformity>Test</Conformity>
<Deductibility>Test</Deductibility>
</State>
<State name="NJ">
<Conformity>Test</Conformity>
<Deductibility>Test</Deductibility>
</State>
</StateTaxTreatment>
<Limitations_Risks>Test limitations.</Limitations_Risks>
</Strategy>
    `;
  }
};

// Parse the framework content to extract structured data
const parseTaxStrategyFramework = (content) => {
  if (!content) return null;

  const strategies = [];
  const strategyRegex = /<Strategy id="([^"]+)">([\s\S]*?)<\/Strategy>/g;
  const nameRegex = /<Name>([\s\S]*?)<\/Name>/;
  const hierarchyRegex = /<Hierarchy>([\s\S]*?)<\/Hierarchy>/;
  const descriptionRegex = /<Description>([\s\S]*?)<\/Description>/;
  const calculationLogicRegex = /<CalculationLogic>([\s\S]*?)<\/CalculationLogic>/;
  const agiImpactRegex = /<AGI_Impact_Rule>([\s\S]*?)<\/AGI_Impact_Rule>/;
  const interactionsRegex = /<Interactions>([\s\S]*?)<\/Interactions>/;
  const stateTaxTreatmentRegex = /<StateTaxTreatment>([\s\S]*?)<\/StateTaxTreatment>/;
  const limitationsRegex = /<Limitations_Risks>([\s\S]*?)<\/Limitations_Risks>/;

  let match;
  while ((match = strategyRegex.exec(content)) !== null) {
    const id = match[1];
    const strategyContent = match[2];

    const nameMatch = nameRegex.exec(strategyContent);
    const hierarchyMatch = hierarchyRegex.exec(strategyContent);
    const descriptionMatch = descriptionRegex.exec(strategyContent);
    const calculationLogicMatch = calculationLogicRegex.exec(strategyContent);
    const agiImpactMatch = agiImpactRegex.exec(strategyContent);
    const interactionsMatch = interactionsRegex.exec(strategyContent);
    const stateTaxTreatmentMatch = stateTaxTreatmentRegex.exec(strategyContent);
    const limitationsMatch = limitationsRegex.exec(strategyContent);

    // Extract state-specific tax treatment
    const nyTreatment = extractStateTreatment(stateTaxTreatmentMatch ? stateTaxTreatmentMatch[1] : '', 'NY');
    const njTreatment = extractStateTreatment(stateTaxTreatmentMatch ? stateTaxTreatmentMatch[1] : '', 'NJ');

    strategies.push({
      id,
      name: nameMatch ? nameMatch[1].trim() : '',
      hierarchy: hierarchyMatch ? parseInt(hierarchyMatch[1].trim()) : 0,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      calculationLogic: calculationLogicMatch ? calculationLogicMatch[1].trim() : '',
      agiImpact: agiImpactMatch ? agiImpactMatch[1].trim() : '',
      interactions: interactionsMatch ? interactionsMatch[1].trim() : '',
      stateTaxTreatment: {
        NY: nyTreatment,
        NJ: njTreatment
      },
      limitations: limitationsMatch ? limitationsMatch[1].trim() : ''
    });
  }

  // Sort strategies by hierarchy
  strategies.sort((a, b) => a.hierarchy - b.hierarchy);

  return {
    strategies,
    rawContent: content
  };
};

// Helper function to extract state-specific tax treatment
const extractStateTreatment = (stateTaxContent, stateName) => {
  const stateRegex = new RegExp(`<State name="${stateName}">([\\s\\S]*?)<\\/State>`, 'i');
  const stateMatch = stateRegex.exec(stateTaxContent);
  
  if (!stateMatch) return { conformity: 'Unknown', deductibility: 'Unknown' };
  
  const stateContent = stateMatch[1];
  
  const conformityRegex = /<Conformity>([\s\S]*?)<\/Conformity>/;
  const deductibilityRegex = /<Deductibility>([\s\S]*?)<\/Deductibility>/;
  const detailsRegex = /<Details>([\s\S]*?)<\/Details>/;
  
  const conformityMatch = conformityRegex.exec(stateContent);
  const deductibilityMatch = deductibilityRegex.exec(stateContent);
  const detailsMatch = detailsRegex.exec(stateContent);
  
  return {
    conformity: conformityMatch ? conformityMatch[1].trim() : 'Unknown',
    deductibility: deductibilityMatch ? deductibilityMatch[1].trim() : 'Unknown',
    details: detailsMatch ? detailsMatch[1].trim() : ''
  };
};

// Generate a fallback prompt when framework fails
const generateFallbackPrompt = (clientState, enabledStrategies) => {
  const stateCode = clientState?.state || clientState;
  const stateName = stateCode === 'NJ' ? 'New Jersey' : stateCode === 'NY' ? 'New York' : stateCode === 'CA' ? 'California' : stateCode;
  
  const strategiesText = enabledStrategies.map(s => `- ${s.name}: ${s.description || 'Tax strategy'}`).join('\n');
  
  return `
You are a professional tax strategist analyzing multiple tax strategies for a ${stateName} resident.

**Client State:** ${stateName}

**Selected Strategies:**
${strategiesText}

**State-Specific Considerations:**
${stateCode === 'NJ' ? 
  'New Jersey has several critical tax differences including limited Section 179 deductions ($975,000 cap for 2025), no deduction for 401(k) employee contributions, and no carryover for capital losses.' : 
  stateCode === 'NY' ? 
  'New York generally conforms to federal tax treatment with some exceptions, particularly for high-income taxpayers. NY offers valuable tax credits for certain activities like film production.' :
  `Please provide state-specific tax guidance for ${stateName}.`}

**FORMATTING REQUIREMENTS:**
- NO asterisks anywhere in the response
- NO placeholder amounts like "XXX,XXX" - use specific realistic dollar amounts
- Use proper section headings and professional formatting
- This analysis is FOR financial advisors, NOT by financial advisors

Provide a comprehensive professional analysis of:
1. How these strategies work together for ${stateName} residents
2. Strategy conflicts, synergies, and optimal sequencing
3. State-specific tax implications and planning considerations
4. Implementation timeline with specific deadlines

**REQUIRED SECTIONS:**

**SECTION 1: KEY STRATEGIC INSIGHTS**
Provide 4-6 key insights with specific dollar calculations and ${stateName} tax implications.

**SECTION 2: STRATEGY INTERACTION ANALYSIS** 
Detailed analysis of how strategies work together, including conflicts and synergies with state-specific considerations.

**SECTION 3: IMPLEMENTATION ROADMAP**
Step-by-step implementation guidance with specific calendar dates and sequencing requirements.
`;
};

// Generate an AI prompt based on the framework
const generateAIPrompt = (clientState, enabledStrategies) => {
  console.log('Generating AI prompt with:', { clientState, enabledStrategies });
  
  try {
    const frameworkContent = readTaxStrategyFramework();
    if (!frameworkContent) {
      console.error('Failed to read tax strategy framework');
      return generateFallbackPrompt(clientState, enabledStrategies);
    }
    
    const framework = parseTaxStrategyFramework(frameworkContent);
    if (!framework) {
      console.error('Failed to parse tax strategy framework');
      return generateFallbackPrompt(clientState, enabledStrategies);
    }
  
  const stateCode = clientState?.state || clientState;
  const stateName = stateCode === 'NJ' ? 'New Jersey' : stateCode === 'NY' ? 'New York' : stateCode === 'CA' ? 'California' : stateCode;
  
  // Filter strategies that are enabled
  const activeStrategies = framework.strategies.filter(strategy => 
    enabledStrategies.some(s => s.id === strategy.id)
  );
  
  // Sort by hierarchy
  activeStrategies.sort((a, b) => a.hierarchy - b.hierarchy);
  
  // Generate strategy-specific information
  const strategyInfo = activeStrategies.map(strategy => {
    const stateTreatment = strategy.stateTaxTreatment[stateCode] || { 
      conformity: 'Unknown', 
      deductibility: 'Unknown' 
    };
    
    return `
**${strategy.name}** (Hierarchy: ${strategy.hierarchy})
- Description: ${strategy.description}
- ${stateName} Tax Treatment: ${stateTreatment.conformity} conformity. ${stateTreatment.deductibility}
- AGI Impact: ${strategy.agiImpact}
- Interactions: ${strategy.interactions}
    `;
  }).join('\n\n');
  
  // Generate state-specific guidance
  const stateGuidance = stateCode === 'NJ' ? 
    `New Jersey has several critical tax differences including limited Section 179 deductions ($975,000 cap for 2025), no deduction for 401(k) employee contributions, and no carryover for capital losses.` : 
    stateCode === 'NY' ? 
    `New York generally conforms to federal tax treatment with some exceptions, particularly for high-income taxpayers. NY offers valuable tax credits for certain activities like film production.` :
    `Please provide state-specific tax guidance for ${stateName}.`;
  
  // Extract analysis principles if using unified guide
  const analysisPrinciples = frameworkContent.includes('<AnalysisPrinciples>') ? 
    frameworkContent.match(/<AnalysisPrinciples>([\s\S]*?)<\/AnalysisPrinciples>/)?.[1] || '' : '';
  
  // Extract interaction matrix if available
  const interactionMatrix = frameworkContent.includes('<InteractionMatrix>') ? 
    frameworkContent.match(/<InteractionMatrix>([\s\S]*?)<\/InteractionMatrix>/)?.[1] || '' : '';

  // Generate the prompt
  const prompt = `
You are a professional tax strategist analyzing ${activeStrategies.length} tax strategies for a ${stateName} resident. 
Generate a comprehensive, professional analysis focusing on strategy interactions, state-specific impacts, and optimal implementation sequencing.

${analysisPrinciples ? `**Analysis Principles:**
${analysisPrinciples}` : ''}

**Client State:** ${stateName}

**Selected Strategies (in optimal implementation order):**
${strategyInfo}

**State-Specific Considerations:**
${stateGuidance}

${interactionMatrix ? `**Known Strategy Interactions:**
${interactionMatrix}` : ''}

**CRITICAL FORMATTING AND CONTENT REQUIREMENTS:**

**Content Guidelines:**
1. Focus on how these strategies work together specifically for a ${stateName} resident
2. Highlight any state-specific tax implications that affect the overall strategy
3. Explain the optimal sequencing based on the hierarchy numbers and interactions
4. Provide specific dollar amounts and percentages when discussing tax benefits
5. Use complete, grammatically correct sentences with proper punctuation
6. Maintain a professional, formal tone appropriate for ultra-high-net-worth clients
7. This analysis is FOR financial advisors, NOT by financial advisors - do not recommend consulting financial advisors
8. Generate a structured analysis of 1,200-1,500 words - concise but comprehensive

**MANDATORY FORMATTING RULES:**
- Use BOLD FORMATTING by wrapping text in __double underscores__ instead of asterisks
- NO asterisks (*) anywhere in the response - use __text__ for bold emphasis
- NO placeholder amounts like "XXX,XXX" or "$X,XXX" - use specific realistic dollar amounts
- Use proper section headings with clear hierarchy
- Use numbered lists and bullet points appropriately
- Format dollar amounts properly (e.g., "$125,000" not "$XXX,XXX")
- Use clean, professional formatting suitable for client presentation
- Organize with clear section breaks and logical flow
- Be CONCISE and STRUCTURED - avoid unnecessary wordiness
- Use bullet points and short paragraphs instead of long blocks of text
- Focus on actionable insights rather than general explanations
- When mentioning strategy names, wrap them in __strategy name__ for special formatting

REQUIRED ANALYSIS STRUCTURE (with minimum word counts):

SECTION 1: EXECUTIVE SUMMARY (200-250 words)
Provide a sophisticated analysis of the integrated tax strategy approach, explaining total optimization potential and compound benefits. Include projected savings amounts and tax rate reductions.

SECTION 2: DETAILED STRATEGY ANALYSIS (300-400 words)
This is the CRITICAL section requiring concise detail on:
• Strategy-specific benefits with exact dollar calculations
• ${stateName} state tax implications (be specific and brief)
• Implementation timing with calendar dates
• Key compliance requirements
• Integration considerations

Format this section with clear bullet points and short paragraphs for easy scanning.

SECTION 3: STRATEGY SYNERGIES AND CONFLICTS (200-250 words)
Use bullet points to identify:
• Key synergies with dollar impact
• Major conflicts and solutions
• Optimal implementation sequence

SECTION 4: ${stateName} STATE TAX OPTIMIZATION (150-200 words)
• State benefit calculations with specific amounts
• Add-back implications and mitigation
• State-specific planning opportunities

SECTION 5: IMPLEMENTATION TIMELINE (150-200 words)
• Phase 1: Immediate actions (30 days) - list 2-3 key steps
• Phase 2: Short-term (90 days) - list 2-3 key steps
• Phase 3: Year-end positioning - list 2-3 key steps

SECTION 6: RISK ASSESSMENT (100-150 words)
• Low-risk strategies (list with brief description)
• Medium-risk strategies (list with brief description)  
• High-risk strategies (list with brief description)

SECTION 7: KEY RECOMMENDATIONS (100-150 words)
Provide 4-5 specific actionable recommendations with deadlines and responsible parties.
`;

  return prompt;
  } catch (error) {
    console.error('Error in generateAIPrompt:', error);
    return generateFallbackPrompt(clientState, enabledStrategies);
  }
};

module.exports = {
  readTaxStrategyFramework,
  parseTaxStrategyFramework,
  generateAIPrompt
};
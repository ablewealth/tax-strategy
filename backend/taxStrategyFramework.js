const fs = require('fs');
const path = require('path');

// Read the TaxStrategyFramework.md file
const readTaxStrategyFramework = () => {
  try {
    // Try multiple possible locations for the file
    const possiblePaths = [
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
          console.log(`Found TaxStrategyFramework.md at: ${filePath}`);
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
    
    console.log(`Successfully read TaxStrategyFramework.md from: ${foundPath}`);
    return content;
  } catch (error) {
    console.error('Error reading TaxStrategyFramework.md:', error);
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
  const nameRegex = /<n>([\s\S]*?)<\/n>/;
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
  const stateName = clientState === 'NJ' ? 'New Jersey' : clientState === 'NY' ? 'New York' : clientState;
  
  const strategiesText = enabledStrategies.map(s => `- ${s.name}: ${s.description || 'Tax strategy'}`).join('\n');
  
  return `
You are a professional tax strategist analyzing multiple tax strategies for a ${stateName} resident.

**Client State:** ${stateName}

**Selected Strategies:**
${strategiesText}

**State-Specific Considerations:**
${clientState === 'NJ' ? 
  'New Jersey has several critical tax differences including limited Section 179 deductions ($25,000 cap), no deduction for 401(k) employee contributions, and no carryover for capital losses.' : 
  clientState === 'NY' ? 
  'New York generally conforms to federal tax treatment with some exceptions, particularly for high-income taxpayers. NY offers valuable tax credits for certain activities like film production.' :
  `Please provide state-specific tax guidance for ${stateName}.`}

Provide a professional analysis of:
1. How these strategies work together
2. Any conflicts or synergies between them
3. State-specific considerations for ${stateName} residents
4. Optimal implementation sequence

Format your response with these sections:
**Key Insights for Your Situation**
* [3-5 bullet points with the most important insights]

**Strategy Interaction Analysis**
[Detailed analysis of how the strategies interact, with state-specific considerations]

**Optimal Implementation Approach**
[Step-by-step guidance on how to implement these strategies in the correct order]
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
  
  const stateName = clientState === 'NJ' ? 'New Jersey' : clientState === 'NY' ? 'New York' : clientState;
  
  // Filter strategies that are enabled
  const activeStrategies = framework.strategies.filter(strategy => 
    enabledStrategies.some(s => s.id === strategy.id)
  );
  
  // Sort by hierarchy
  activeStrategies.sort((a, b) => a.hierarchy - b.hierarchy);
  
  // Generate strategy-specific information
  const strategyInfo = activeStrategies.map(strategy => {
    const stateTreatment = strategy.stateTaxTreatment[clientState] || { 
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
  const stateGuidance = clientState === 'NJ' ? 
    `New Jersey has several critical tax differences including limited Section 179 deductions ($25,000 cap), no deduction for 401(k) employee contributions, and no carryover for capital losses.` : 
    clientState === 'NY' ? 
    `New York generally conforms to federal tax treatment with some exceptions, particularly for high-income taxpayers. NY offers valuable tax credits for certain activities like film production.` :
    `Please provide state-specific tax guidance for ${stateName}.`;
  
  // Generate the prompt
  const prompt = `
You are a professional tax strategist analyzing ${activeStrategies.length} tax strategies for a ${stateName} resident. 
Generate a concise, professional analysis focusing on strategy interactions, state-specific impacts, and optimal implementation sequencing.

**Client State:** ${stateName}

**Selected Strategies (in optimal implementation order):**
${strategyInfo}

**State-Specific Considerations:**
${stateGuidance}

**Instructions for Analysis:**
1. Focus on how these strategies work together specifically for a ${stateName} resident
2. Highlight any state-specific tax implications that affect the overall strategy
3. Explain the optimal sequencing based on the hierarchy numbers and interactions
4. Provide specific dollar figures and percentages when discussing tax benefits
5. Use complete, grammatically correct sentences with proper punctuation
6. Maintain a professional, formal tone appropriate for high-net-worth clients
7. Organize your analysis with clear sections and bullet points where appropriate
8. Keep your analysis concise but comprehensive (300-400 words)

Format your response as a professional tax strategy analysis with these sections:
1. Strategy Effectiveness Ranking
2. ${stateName} State Tax Optimization
3. Strategy Sequencing for Maximum Benefit
4. Critical Interactions
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
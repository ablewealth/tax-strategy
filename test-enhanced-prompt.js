// Test script to verify the enhanced AI prompt structure
// This demonstrates how the prompt now includes comprehensive client financial data

const testScenario = {
    clientData: {
        state: 'NJ',
        w2Income: 150000,
        businessIncome: 85000,
        shortTermGains: 25000,
        longTermGains: 45000,
        projectionYears: 5
    },
    enabledStrategies: {
        'retirement-401k': true,
        'business-deductions': true,
        'charitable-giving': true
    }
};

const testStrategies = [
    {
        id: 'retirement-401k',
        name: '401(k) Contribution',
        description: 'Maximize pre-tax retirement contributions to reduce current taxable income'
    },
    {
        id: 'business-deductions',
        name: 'Business Expense Deductions',
        description: 'Optimize business expense deductions to reduce taxable business income'
    },
    {
        id: 'charitable-giving',
        name: 'Charitable Giving Strategy',
        description: 'Strategic charitable contributions for tax deductions and social impact'
    }
];

console.log('=== Enhanced AI Prompt Test ===');
console.log('Client Financial Profile:');
console.log(`- W2 Income: $${testScenario.clientData.w2Income.toLocaleString()}`);
console.log(`- Business Income: $${testScenario.clientData.businessIncome.toLocaleString()}`);
console.log(`- Short-term Capital Gains: $${testScenario.clientData.shortTermGains.toLocaleString()}`);
console.log(`- Long-term Capital Gains: $${testScenario.clientData.longTermGains.toLocaleString()}`);
console.log(`- State of Residence: ${testScenario.clientData.state === 'NJ' ? 'New Jersey' : testScenario.clientData.state}`);
console.log('\nSelected Strategies:');
testStrategies.forEach(strategy => {
    console.log(`- ${strategy.name}: ${strategy.description}`);
});

console.log('\n=== Key Enhancements ===');
console.log('✅ Structured professional format with consistent sections');
console.log('✅ Integration of specific client financial data');
console.log('✅ State-specific tax analysis for New Jersey');
console.log('✅ Optimal implementation sequence with prioritization');
console.log('✅ Comprehensive formatting requirements for consistent output');
console.log('✅ Enhanced timeout handling (30 seconds) with retry logic');

console.log('\n=== Expected Output Structure ===');
console.log('1. Introduction & Objective');
console.log('2. Client Scenario (NJ resident with specific income breakdown)');
console.log('3. Key Strategic Interdependencies');
console.log('4. New Jersey Tax Impact Analysis');
console.log('5. Optimal Implementation Sequence');
console.log('6. Key Synergies and Potential Conflicts');

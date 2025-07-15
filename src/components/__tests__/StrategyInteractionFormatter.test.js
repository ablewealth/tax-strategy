// src/components/__tests__/StrategyInteractionFormatter.test.js
import { formatStrategyInteractions, createStrategyInteractionPrompt } from '../StrategyInteractionFormatter';
import { render, screen } from '@testing-library/react';

// Mock scenario and results data
const mockScenario = {
  clientData: {
    state: 'NJ',
    w2Income: 150000,
    businessIncome: 100000,
    shortTermGains: 20000,
    longTermGains: 30000
  },
  enabledStrategies: {
    'SOLO401K_EMPLOYEE_01': true,
    'SOLO401K_EMPLOYER_01': true,
    'QUANT_DEALS_01': true
  }
};

const mockResults = {
  cumulative: {
    totalSavings: 250000
  },
  projections: [
    {
      cumulativeSavings: 50000
    }
  ]
};

describe('StrategyInteractionFormatter', () => {
  describe('formatStrategyInteractions', () => {
    test('returns null when required parameters are missing', () => {
      expect(formatStrategyInteractions(null, mockScenario, mockResults)).toBeNull();
      expect(formatStrategyInteractions('text', null, mockResults)).toBeNull();
      expect(formatStrategyInteractions('text', mockScenario, null)).toBeNull();
    });

    test('renders formatted analysis content when all parameters are provided', () => {
      const mockText = `
        **Strategy Interactions**
        
        The Solo 401(k) Employee contribution → enhances tax savings by reducing AGI
        The Solo 401(k) Employer contribution → amplifies QBI deduction benefits
        
        * This is a bullet point insight
        * This is another key insight
        
        1. This is a numbered point
        2. This is another numbered point
        
        New Jersey residents need to be aware of special considerations for 401(k) plans.
      `;

      const { container } = render(
        <div>{formatStrategyInteractions(mockText, mockScenario, mockResults)}</div>
      );
      
      // Check for main section headers
      expect(screen.getByText('Strategy Interaction Analysis')).toBeInTheDocument();
      
      // Check for financial numbers
      expect(screen.getByText('Total Annual Savings')).toBeInTheDocument();
      expect(screen.getByText('Multi-Year Savings')).toBeInTheDocument();
      
      // Check for state-specific section (based on NJ in mock data)
      expect(screen.getByText('New Jersey Specific Considerations')).toBeInTheDocument();
      
      // Verify container has content
      expect(container.innerHTML).not.toBe('');
    });

    test('renders fallback view when no interactions or insights are found', () => {
      const mockText = 'Just some plain text with no specific formats or patterns.';

      render(
        <div>{formatStrategyInteractions(mockText, mockScenario, mockResults)}</div>
      );
      
      // Check for fallback content
      expect(screen.getByText('Strategy Analysis')).toBeInTheDocument();
    });
  });

  describe('createStrategyInteractionPrompt', () => {
    test('returns null when less than 2 non-zero strategies are provided', () => {
      const noStrategies = [];
      const oneStrategy = [
        { 
          id: 'SOLO401K_EMPLOYEE_01', 
          name: 'Solo 401(k) Employee Contribution', 
          inputRequired: 'solo401kEmployeeContribution' 
        }
      ];
      
      expect(createStrategyInteractionPrompt(noStrategies, mockScenario.clientData, mockResults)).toBeNull();
      expect(createStrategyInteractionPrompt(oneStrategy, mockScenario.clientData, mockResults)).toBeNull();
    });

    test('generates a properly formatted prompt with client data and strategies', () => {
      const strategies = [
        { 
          id: 'SOLO401K_EMPLOYEE_01', 
          name: 'Solo 401(k) Employee Contribution', 
          inputRequired: 'solo401kEmployeeContribution' 
        },
        { 
          id: 'SOLO401K_EMPLOYER_01', 
          name: 'Solo 401(k) Employer Contribution', 
          inputRequired: 'solo401kEmployerContribution' 
        }
      ];
      
      const clientData = {
        state: 'NJ',
        w2Income: 150000,
        businessIncome: 100000,
        solo401kEmployeeContribution: 20000,
        solo401kEmployerContribution: 30000
      };
      
      const prompt = createStrategyInteractionPrompt(strategies, clientData, mockResults);
      
      // Verify the prompt contains key elements
      expect(prompt).toContain('CLIENT PROFILE:');
      expect(prompt).toContain('Location: New Jersey');
      expect(prompt).toContain('W2 Income: $150,000');
      expect(prompt).toContain('Business Income: $100,000');
      
      // Verify strategy-specific content
      expect(prompt).toContain('SELECTED STRATEGIES');
      expect(prompt).toContain('Solo 401(k) Employee Contribution');
      expect(prompt).toContain('Solo 401(k) Employer Contribution');
      
      // Verify analysis focus sections
      expect(prompt).toContain('ANALYSIS FOCUS:');
      expect(prompt).toContain('Strategy Interactions');
      expect(prompt).toContain('Client-Specific Benefits');
      expect(prompt).toContain('New Jersey Considerations');
    });
  });
});

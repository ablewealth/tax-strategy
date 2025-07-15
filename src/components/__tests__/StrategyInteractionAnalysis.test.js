// src/components/__tests__/StrategyInteractionAnalysis.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StrategyInteractionAnalysis from '../StrategyInteractionAnalysis';
import * as formatter from '../StrategyInteractionFormatter';

// Mock the dependencies
jest.mock('../StrategyInteractionFormatter', () => ({
  formatStrategyInteractions: jest.fn(),
  createStrategyInteractionPrompt: jest.fn()
}));

// Mock constants
jest.mock('../../constants', () => ({
  STRATEGY_LIBRARY: [
    {
      id: 'SOLO401K_EMPLOYEE_01',
      name: 'Solo 401(k) - Employee',
      description: 'Employee elective deferral contributions.',
      inputRequired: 'solo401kEmployeeContribution',
      type: 'aboveAGI',
    },
    {
      id: 'SOLO401K_EMPLOYER_01',
      name: 'Solo 401(k) - Employer',
      description: 'Employer profit-sharing contributions.',
      inputRequired: 'solo401kEmployerContribution',
      type: 'aboveAGI',
    }
  ],
  RETIREMENT_STRATEGIES: [
    {
      id: 'DB_PLAN_01',
      name: 'Executive Retirement Plan',
      description: 'High-contribution defined benefit pension plan.',
      inputRequired: 'dbContribution',
      type: 'aboveAGI',
    }
  ]
}));

// Mock fetch function
global.fetch = jest.fn();

// Mock environment variable
process.env.REACT_APP_GEMINI_API_KEY = 'test-api-key';

describe('StrategyInteractionAnalysis', () => {
  const mockScenario = {
    clientData: {
      state: 'NJ',
      w2Income: 150000,
      businessIncome: 100000,
      shortTermGains: 20000,
      longTermGains: 30000,
      solo401kEmployeeContribution: 20000,
      solo401kEmployerContribution: 30000
    },
    enabledStrategies: {
      'SOLO401K_EMPLOYEE_01': true,
      'SOLO401K_EMPLOYER_01': true
    }
  };

  const mockResults = {
    cumulative: {
      totalSavings: 250000
    },
    projections: [
      {
        totalSavings: 50000,
        cumulativeSavings: 50000
      }
    ]
  };

  const mockOnAnalysisUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    formatter.formatStrategyInteractions.mockImplementation(() => <div>Formatted Analysis</div>);
    formatter.createStrategyInteractionPrompt.mockImplementation(() => 'test prompt');
    global.fetch.mockClear();
  });

  test('renders nothing when less than 2 strategies are enabled', () => {
    const scenarioWithOneStrategy = {
      ...mockScenario,
      enabledStrategies: {
        'SOLO401K_EMPLOYEE_01': true
      }
    };

    render(
      <StrategyInteractionAnalysis 
        scenario={scenarioWithOneStrategy} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    expect(formatter.formatStrategyInteractions).not.toHaveBeenCalled();
    expect(screen.queryByText(/Advanced Tax Strategy Analysis/)).not.toBeInTheDocument();
  });

  test('renders initial state with generate button when multiple strategies are enabled', () => {
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );

    expect(screen.getAllByRole('heading')).toHaveLength(2);
    expect(screen.getByText(/Generate AI Analysis/)).toBeInTheDocument();
  });

  test('shows loading state when fetching analysis', async () => {
    // Mock fetch to return a pending promise
    global.fetch.mockImplementation(() => new Promise(() => {}));
    
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );
    
    // Click generate button
    fireEvent.click(screen.getByText(/Generate AI Analysis/));
    
    // Check if loading state is shown
    expect(screen.getByText(/Analyzing Strategy Interactions/)).toBeInTheDocument();
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({ 
      explanation: '', 
      loading: true, 
      error: '' 
    });
  });

  test('handles error when API key is missing', async () => {
    // Temporarily remove API key
    const originalApiKey = process.env.REACT_APP_GEMINI_API_KEY;
    process.env.REACT_APP_GEMINI_API_KEY = '';
    
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );
    
    // Click generate button
    fireEvent.click(screen.getByText(/Generate AI Analysis/));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/AI Analysis Unavailable/)).toBeInTheDocument();
    });
    
    // Then check additional UI elements
    expect(screen.getByText(/AI analysis is not configured/)).toBeInTheDocument();
    
    // Restore API key
    process.env.REACT_APP_GEMINI_API_KEY = originalApiKey;
  });

  test('handles successful API response', async () => {
    // Mock successful API response
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'This is a test analysis' }]
          }
        }
      ]
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );
    
    // Click generate button
    fireEvent.click(screen.getByText(/Generate AI Analysis/));
    
    // Wait for analysis to be displayed
    await waitFor(() => {
      expect(formatter.formatStrategyInteractions).toHaveBeenCalled();
    });
    
    // Then check that the formatting was done with the right arguments
    expect(formatter.formatStrategyInteractions).toHaveBeenCalledWith(
      'This is a test analysis',
      mockScenario,
      mockResults
    );
    
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({
      explanation: 'This is a test analysis',
      loading: false,
      error: ''
    });
  });

  test('handles API error response', async () => {
    // Mock API error
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );
    
    // Click generate button
    fireEvent.click(screen.getByText(/Generate AI Analysis/));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/AI Analysis Unavailable/)).toBeInTheDocument();
    });
    
    // Then check additional UI elements
    expect(screen.getByText(/Error fetching interaction explanation/)).toBeInTheDocument();
    
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({
      explanation: '',
      loading: false,
      error: expect.stringContaining('Error fetching interaction explanation')
    });
  });

  test('handles invalid API response format', async () => {
    // Mock invalid API response (missing expected data structure)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalidData: true })
    });
    
    render(
      <StrategyInteractionAnalysis
        scenario={mockScenario}
        results={mockResults}
        onAnalysisUpdate={mockOnAnalysisUpdate}
      />
    );
    
    // Click generate button
    fireEvent.click(screen.getByText(/Generate AI Analysis/));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/AI Analysis Unavailable/)).toBeInTheDocument();
    });
    
    // Then check additional UI elements
    expect(screen.getByText(/Failed to generate interaction explanation/)).toBeInTheDocument();
    
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({
      explanation: '',
      loading: false,
      error: 'Failed to generate interaction explanation.'
    });
  });
});

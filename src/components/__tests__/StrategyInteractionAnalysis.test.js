// src/components/__tests__/StrategyInteractionAnalysis.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StrategyInteractionAnalysis from '../StrategyInteractionAnalysis';
import * as formatter from '../StrategyInteractionFormatter';

// Mock the dependencies
jest.mock('../StrategyInteractionFormatter', () => ({
  formatStrategyInteractions: jest.fn(),
  createStrategyInteractionPrompt: jest.fn()
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

    const { container } = render(
      <StrategyInteractionAnalysis 
        scenario={scenarioWithOneStrategy} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders initial UI with generate button when no analysis has been done', () => {
    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Check for initial UI elements
    expect(screen.getByText('Advanced Tax Strategy Analysis')).toBeInTheDocument();
    expect(screen.getByText('Generate AI Analysis')).toBeInTheDocument();
  });

  test('shows loading state when fetching analysis', async () => {
    // Setup fetch to return a promise that doesn't resolve immediately
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Check loading state
    expect(screen.getByText('Analyzing Strategy Interactions')).toBeInTheDocument();
    expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({ explanation: '', loading: true, error: '' });
  });

  test('shows error message when API key is missing', async () => {
    // Temporarily remove API key
    const originalKey = process.env.REACT_APP_GEMINI_API_KEY;
    process.env.REACT_APP_GEMINI_API_KEY = '';

    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('AI Analysis Unavailable')).toBeInTheDocument();
      expect(screen.getByText(/To enable AI-powered strategy analysis/)).toBeInTheDocument();
    });

    // Restore API key
    process.env.REACT_APP_GEMINI_API_KEY = originalKey;
  });

  test('successfully fetches and displays analysis', async () => {
    // Mock successful API response
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Test analysis content'
                  }
                ]
              }
            }
          ]
        })
      })
    );

    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Wait for analysis to be displayed
    await waitFor(() => {
      expect(formatter.formatStrategyInteractions).toHaveBeenCalled();
      expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({ 
        explanation: 'Test analysis content', 
        loading: false, 
        error: '' 
      });
    });
  });

  test('handles API error responses', async () => {
    // Mock API error
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      })
    );

    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('AI Analysis Unavailable')).toBeInTheDocument();
      expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({ 
        explanation: '', 
        loading: false, 
        error: expect.any(String)
      });
    });
  });

  test('handles invalid API responses', async () => {
    // Mock invalid API response (missing candidates)
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          // Missing candidates array
        })
      })
    );

    render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('AI Analysis Unavailable')).toBeInTheDocument();
      expect(mockOnAnalysisUpdate).toHaveBeenCalledWith({ 
        explanation: '', 
        loading: false, 
        error: 'Failed to generate interaction explanation.'
      });
    });
  });

  test('shows refresh button when strategies have changed', async () => {
    // Mock successful API response
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'Test analysis content'
                  }
                ]
              }
            }
          ]
        })
      })
    );

    const { rerender } = render(
      <StrategyInteractionAnalysis 
        scenario={mockScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Click the generate button
    fireEvent.click(screen.getByText('Generate AI Analysis'));

    // Wait for analysis to be displayed
    await waitFor(() => {
      expect(formatter.formatStrategyInteractions).toHaveBeenCalled();
    });

    // Change enabled strategies
    const updatedScenario = {
      ...mockScenario,
      enabledStrategies: {
        'SOLO401K_EMPLOYEE_01': true,
        'SOLO401K_EMPLOYER_01': true,
        'QUANT_DEALS_01': true // Added new strategy
      }
    };

    // Re-render with new scenario
    rerender(
      <StrategyInteractionAnalysis 
        scenario={updatedScenario} 
        results={mockResults} 
        onAnalysisUpdate={mockOnAnalysisUpdate} 
      />
    );

    // Should show refresh button
    expect(screen.getByText('Refresh Analysis')).toBeInTheDocument();
  });
});

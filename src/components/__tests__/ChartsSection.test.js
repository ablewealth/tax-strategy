// src/components/__tests__/ChartsSection.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChartsSection from '../ChartsSection';

// Mock formatCurrency from constants
jest.mock('../../constants', () => ({
  formatCurrency: jest.fn(val => `$${val.toLocaleString()}`)
}));

// Mocking recharts components since they use SVG which JSDom doesn't fully support
jest.mock('recharts', () => ({
  CartesianGrid: () => <div data-testid="recharts-cartesian-grid" />,
  XAxis: () => <div data-testid="recharts-xaxis" />,
  YAxis: () => <div data-testid="recharts-yaxis" />,
  Tooltip: () => <div data-testid="recharts-tooltip" />,
  BarChart: ({ children }) => <div data-testid="recharts-barchart">{children}</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive-container">{children}</div>,
  Bar: () => <div data-testid="recharts-bar" />,
  LineChart: ({ children }) => <div data-testid="recharts-linechart">{children}</div>,
  Line: () => <div data-testid="recharts-line" />,
  RechartsTooltip: () => <div data-testid="recharts-tooltip" />
}));

describe('ChartsSection', () => {
  const mockResults = {
    projections: [
      {
        year: 2025,
        baselineTax: 50000,
        optimizedTax: 40000,
        savings: 10000,
        cumulativeSavings: 10000,
        baseline: {
          fedTax: 35000,
          stateTax: 15000,
          totalTax: 50000
        },
        withStrategies: {
          fedTax: 30000,
          stateTax: 10000,
          totalTax: 40000
        }
      },
      {
        year: 2026,
        baselineTax: 52000,
        optimizedTax: 41000,
        savings: 11000,
        cumulativeSavings: 21000,
        baseline: {
          fedTax: 36000,
          stateTax: 16000,
          totalTax: 52000
        },
        withStrategies: {
          fedTax: 31000,
          stateTax: 10000,
          totalTax: 41000
        }
      }
    ],
    cumulative: {
      baselineTax: 102000,
      optimizedTax: 81000,
      totalSavings: 21000
    }
  };

  test('renders nothing when results are missing or empty', () => {
    render(<ChartsSection results={null} />);
    expect(screen.queryByText('Tax Savings Visualization')).not.toBeInTheDocument();

    render(<ChartsSection results={{}} />);
    expect(screen.queryByText('Tax Savings Visualization')).not.toBeInTheDocument();

    render(<ChartsSection results={{ projections: [] }} />);
    expect(screen.queryByText('Tax Savings Visualization')).not.toBeInTheDocument();
  });

  test('renders charts when valid results are provided', () => {
    render(<ChartsSection results={mockResults} />);
    
    // Check for section title using a more flexible matcher
    expect(screen.getByText(/Visual Projections/)).toBeInTheDocument();
    
    // Check for chart labels
    expect(screen.getByText('Tax Liability Comparison Analysis')).toBeInTheDocument();
    expect(screen.getByText('Annual Tax Liability Comparison')).toBeInTheDocument();
    expect(screen.getByText('Cumulative Savings Over Time')).toBeInTheDocument();
  });

  test('renders the correct number of years in the charts', () => {
    render(<ChartsSection results={mockResults} />);
    
    // Check for year labels using a regex pattern
    expect(screen.getByText(/2-Year Projections/)).toBeInTheDocument();
  });

  test('displays summary statistics correctly', () => {
    render(<ChartsSection results={mockResults} />);
    
    // Check for summary statistics display
    expect(screen.getByText(/Federal Tax/i)).toBeInTheDocument();
    expect(screen.getByText(/State Tax/i)).toBeInTheDocument();
  });
});

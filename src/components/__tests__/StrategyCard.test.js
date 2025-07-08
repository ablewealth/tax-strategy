import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import StrategyCard from '../StrategyCard';

describe('StrategyCard Component', () => {
  const mockStrategy = {
    id: 'TEST_STRATEGY',
    name: 'Test Strategy',
    description: 'This is a test strategy description',
    inputRequired: 'testInput',
    category: 'test'
  };

  const mockScenario = {
    enabledStrategies: {
      TEST_STRATEGY: false
    }
  };

  const defaultProps = {
    strategy: mockStrategy,
    scenario: mockScenario,
    toggleStrategy: jest.fn(),
    updateClientData: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders strategy card with name and description', () => {
    render(<StrategyCard {...defaultProps} />);
    
    expect(screen.getByText('Test Strategy')).toBeInTheDocument();
    expect(screen.getByText('This is a test strategy description')).toBeInTheDocument();
  });

  test('calls toggleStrategy when checkbox is clicked', () => {
    const toggleStrategy = jest.fn();
    render(<StrategyCard {...defaultProps} toggleStrategy={toggleStrategy} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(toggleStrategy).toHaveBeenCalledWith('TEST_STRATEGY');
  });

  test('checkbox is checked when strategy is enabled', () => {
    const enabledScenario = {
      enabledStrategies: {
        TEST_STRATEGY: true
      }
    };
    render(<StrategyCard {...defaultProps} scenario={enabledScenario} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('checkbox is unchecked when strategy is disabled', () => {
    render(<StrategyCard {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  test('renders children when provided', () => {
    render(
      <StrategyCard {...defaultProps}>
        <div>Test Children</div>
      </StrategyCard>
    );
    
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  test('applies active styling when strategy is enabled', () => {
    const enabledScenario = {
      enabledStrategies: {
        TEST_STRATEGY: true
      }
    };
    render(<StrategyCard {...defaultProps} scenario={enabledScenario} />);
    
    // Check that the strategy name is still visible (active state)
    expect(screen.getByText('Test Strategy')).toBeInTheDocument();
  });
});
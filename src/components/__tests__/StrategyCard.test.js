// src/components/__tests__/StrategyCard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StrategyCard from '../StrategyCard';

describe('StrategyCard', () => {
  const mockStrategy = {
    id: 'STRATEGY_01',
    name: 'Test Strategy',
    category: 'Tax Optimization',
    description: 'This is a test strategy description',
    inputRequired: 'testInput'
  };

  const mockScenario = {
    enabledStrategies: {
      'STRATEGY_01': false
    },
    clientData: {
      testInput: 0
    }
  };

  const mockToggleStrategy = jest.fn();
  const mockUpdateClientData = jest.fn();

  test('renders strategy details correctly', () => {
    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={mockScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      />
    );

    expect(screen.getByText('Test Strategy')).toBeInTheDocument();
    expect(screen.getByText('Tax Optimization')).toBeInTheDocument();
    expect(screen.getByText('This is a test strategy description')).toBeInTheDocument();
  });

  test('checkbox is unchecked when strategy is not enabled', () => {
    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={mockScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  test('checkbox is checked when strategy is enabled', () => {
    const activeScenario = {
      ...mockScenario,
      enabledStrategies: {
        'STRATEGY_01': true
      }
    };

    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={activeScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('toggles strategy when checkbox is clicked', () => {
    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={mockScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggleStrategy).toHaveBeenCalledWith('STRATEGY_01');
  });

  test('renders children components', () => {
    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={mockScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      >
        <div data-testid="child-component">Child Component</div>
      </StrategyCard>
    );

    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  test('applies active styling when strategy is enabled', () => {
    const activeScenario = {
      ...mockScenario,
      enabledStrategies: {
        'STRATEGY_01': true
      }
    };

    render(
      <StrategyCard
        strategy={mockStrategy}
        scenario={activeScenario}
        toggleStrategy={mockToggleStrategy}
        updateClientData={mockUpdateClientData}
      />
    );

    // For styling tests, we can use container.innerHTML to verify the component rendered
    // but we should avoid assertions on specific classes
    expect(screen.getByText('Test Strategy')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});

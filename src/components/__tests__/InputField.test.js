// src/components/__tests__/InputField.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../InputField';
import { formatCurrencyForDisplay, parseCurrencyInput } from '../../constants';

// Mock the constants module
jest.mock('../../constants', () => ({
  formatCurrencyForDisplay: jest.fn(value => {
    if (value === 0 || value === null || value === undefined) return '';
    return `$${value.toLocaleString()}`;
  }),
  parseCurrencyInput: jest.fn(value => {
    if (!value || value === '') return 0;
    return parseInt(value.replace(/[^0-9.-]+/g, ''), 10) || 0;
  })
}));

describe('InputField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with label and placeholder', () => {
    render(
      <InputField 
        label="Test Label" 
        value={1000} 
        onChange={() => {}} 
        placeholder="Test Placeholder" 
      />
    );
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
  });

  test('displays formatted currency for numeric inputs', () => {
    formatCurrencyForDisplay.mockReturnValueOnce('$50,000');
    
    render(
      <InputField 
        label="Income" 
        value={50000} 
        onChange={() => {}} 
        placeholder="Enter income" 
      />
    );
    
    expect(formatCurrencyForDisplay).toHaveBeenCalledWith(50000);
    const input = screen.getByPlaceholderText('Enter income');
    expect(input.value).toBe('$50,000');
  });

  test('displays raw value for non-currency fields', () => {
    render(
      <InputField 
        label="Client Name" 
        value="John Doe" 
        onChange={() => {}} 
        placeholder="Enter name" 
      />
    );
    
    expect(formatCurrencyForDisplay).not.toHaveBeenCalled();
    const input = screen.getByPlaceholderText('Enter name');
    expect(input.value).toBe('John Doe');
  });

  test('handles currency input changes correctly', () => {
    const mockOnChange = jest.fn();
    parseCurrencyInput.mockReturnValueOnce(75000);
    
    render(
      <InputField 
        label="Income" 
        value={0} 
        onChange={mockOnChange} 
        placeholder="Enter income" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter income');
    fireEvent.change(input, { target: { value: '$75,000' } });
    
    expect(parseCurrencyInput).toHaveBeenCalledWith('$75,000');
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('handles non-currency input changes correctly', () => {
    const mockOnChange = jest.fn();
    
    render(
      <InputField 
        label="Client Name" 
        value="" 
        onChange={mockOnChange} 
        placeholder="Enter name" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter name');
    fireEvent.change(input, { target: { value: 'Jane Doe' } });
    
    expect(parseCurrencyInput).not.toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('Jane Doe');
  });

  test('handles blur event for currency fields', () => {
    parseCurrencyInput.mockReturnValueOnce(1000);
    formatCurrencyForDisplay.mockReturnValueOnce('$1,000');
    
    const mockOnChange = jest.fn();
    
    render(
      <InputField 
        label="Income" 
        value={0} 
        onChange={mockOnChange} 
        placeholder="Enter income" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter income');
    fireEvent.change(input, { target: { value: '1000' } });
    fireEvent.blur(input);
    
    expect(formatCurrencyForDisplay).toHaveBeenCalled();
  });

  test('handles null values correctly', () => {
    render(
      <InputField 
        label="Income" 
        value={null} 
        onChange={() => {}} 
        placeholder="Enter income" 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter income');
    expect(input.value).toBe('');
  });

  test('handles growth rate percentage field correctly', () => {
    render(
      <InputField 
        label="Income Growth Rate (%)" 
        value={3.5} 
        onChange={() => {}} 
        placeholder="Enter growth rate" 
      />
    );
    
    // Should not format as currency
    expect(formatCurrencyForDisplay).not.toHaveBeenCalled();
    const input = screen.getByPlaceholderText('Enter growth rate');
    expect(input.value).toBe('3.5');
  });
});

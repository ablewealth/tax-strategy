import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import InputField from '../InputField';

describe('InputField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
    id: 'test-input',
    type: 'text',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field with label', () => {
    render(<InputField {...defaultProps} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('calls onChange when value changes', () => {
    const onChange = jest.fn();
    render(<InputField {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123' } });

    expect(onChange).toHaveBeenCalled();
  });

  test('renders with placeholder', () => {
    render(<InputField {...defaultProps} placeholder="Enter value" />);

    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  test('handles currency formatting for financial fields', () => {
    render(<InputField {...defaultProps} label="Amount" value={1000} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  test('handles non-currency fields', () => {
    render(<InputField {...defaultProps} label="Client Name" value="Test Client" />);

    const input = screen.getByRole('textbox');
    expect(input.value).toBe('Test Client');
  });
});

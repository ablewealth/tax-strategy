import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import SelectField from '../SelectField';

describe('SelectField Component', () => {
  const defaultProps = {
    label: 'Test Select',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders select field with label', () => {
    render(
      <SelectField {...defaultProps}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </SelectField>
    );

    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('renders all options', () => {
    render(
      <SelectField {...defaultProps}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </SelectField>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('calls onChange when selection changes', () => {
    const onChange = jest.fn();
    render(
      <SelectField {...defaultProps} onChange={onChange}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(onChange).toHaveBeenCalled();
  });

  test('shows selected value', () => {
    render(
      <SelectField {...defaultProps} value="option2">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>
    );

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('option2');
  });
});

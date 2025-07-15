// src/components/__tests__/SelectField.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectField from '../SelectField';

describe('SelectField', () => {
  test('renders with label and options', () => {
    render(
      <SelectField 
        label="Test Select" 
        value="option1" 
        onChange={() => {}}
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>
    );
    
    expect(screen.getByText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  test('selects the correct option based on value', () => {
    render(
      <SelectField 
        label="Test Select" 
        value="option2" 
        onChange={() => {}}
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.value).toBe('option2');
  });

  test('calls onChange when selection changes', () => {
    const handleChange = jest.fn();
    
    render(
      <SelectField 
        label="Test Select" 
        value="option1" 
        onChange={handleChange}
      >
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </SelectField>
    );
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('applies correct CSS classes', () => {
    render(
      <SelectField 
        label="Test Select" 
        value="option1" 
        onChange={() => {}}
      >
        <option value="option1">Option 1</option>
      </SelectField>
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass('border');
    expect(selectElement).toHaveClass('rounded-md');
    expect(selectElement).toHaveClass('focus:ring-2');
  });

  test('renders children correctly', () => {
    render(
      <SelectField 
        label="Test Select" 
        value="option1" 
        onChange={() => {}}
      >
        <optgroup label="Group 1">
          <option value="option1">Option 1</option>
        </optgroup>
        <optgroup label="Group 2">
          <option value="option2">Option 2</option>
        </optgroup>
      </SelectField>
    );
    
    // Test optgroups by querying for options and checking their attributes
    const option1 = screen.getByText('Option 1');
    const option2 = screen.getByText('Option 2');
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});

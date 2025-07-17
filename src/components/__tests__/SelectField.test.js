// src/components/__tests__/SelectField.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectField from '../SelectField';

describe('SelectField', () => {
  test('renders select field with label', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    render(
      <SelectField label="Test Select" options={options} value="option1" onChange={() => {}} />
    );

    expect(screen.getByText('Test Select')).toBeInTheDocument();
  });
});

// src/components/__tests__/ChartsSection.test.js
import React from 'react';
import { render } from '@testing-library/react';
import ChartsSection from '../ChartsSection';

describe('ChartsSection', () => {
  test('renders without crashing', () => {
    const mockData = {
      clientInfo: { income: 100000 },
      strategies: []
    };
    
    // Simple render test to ensure the component mounts
    const { container } = render(<ChartsSection data={mockData} />);
    expect(container).toBeInTheDocument();
  });
});

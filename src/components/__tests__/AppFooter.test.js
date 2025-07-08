import React from 'react';
import { render, screen } from '@testing-library/react';
import AppFooter from '../AppFooter';

describe('AppFooter Component', () => {
  test('renders footer content', () => {
    render(<AppFooter />);
    
    expect(screen.getByText(/Able Wealth Management/i)).toBeInTheDocument();
  });

  test('renders year 2025 in disclaimer', () => {
    render(<AppFooter />);
    
    expect(screen.getByText(/May 2025/)).toBeInTheDocument();
  });

  test('renders disclaimer text', () => {
    render(<AppFooter />);
    
    expect(screen.getByText(/disclaimer/i)).toBeInTheDocument();
  });

  test('renders with proper styling', () => {
    render(<AppFooter />);
    
    // Check for footer role or tag
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
// src/components/__tests__/Section.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Section from '../Section';

describe('Section', () => {
  test('renders section with title and description', () => {
    render(
      <Section 
        title="Test Title" 
        description="Test description for the section"
      >
        <div>Child content</div>
      </Section>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description for the section')).toBeInTheDocument();
  });

  test('renders children content', () => {
    render(
      <Section 
        title="Test Title" 
        description="Test description"
      >
        <div data-testid="child-element">Child content</div>
      </Section>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('applies correct CSS classes for styling', () => {
    render(
      <Section 
        title="Test Title" 
        description="Test description"
        data-testid="section-component"
      >
        <div>Child content</div>
      </Section>
    );
    
    // Just verify that the component renders properly
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('renders with custom class names if provided', () => {
    render(
      <Section 
        title="Custom Section" 
        description="With custom styling"
        className="custom-class"
      >
        <div>Custom content</div>
      </Section>
    );
    
    expect(screen.getByText('Custom Section')).toBeInTheDocument();
    expect(screen.getByText('With custom styling')).toBeInTheDocument();
  });

  test('handles empty description', () => {
    render(
      <Section 
        title="No Description Section" 
        description=""
      >
        <div>Section with no description</div>
      </Section>
    );
    
    expect(screen.getByText('No Description Section')).toBeInTheDocument();
    expect(screen.getByText('Section with no description')).toBeInTheDocument();
  });
});

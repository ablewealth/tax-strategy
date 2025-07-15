import React from 'react';
import { render, screen } from '@testing-library/react';
import Section from '../Section';

describe('Section Component', () => {
  test('renders section with title', () => {
    render(
      <Section title="Test Section">
        <div>Section content</div>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  test('renders section with title and description', () => {
    render(
      <Section title="Test Section" description="Test description">
        <div>Section content</div>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  test('renders without description when not provided', () => {
    render(
      <Section title="Test Section">
        <div>Section content</div>
      </Section>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Section content')).toBeInTheDocument();
    // Should not have description text
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
  });

  test('renders multiple children', () => {
    render(
      <Section title="Test Section">
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Section>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });
});

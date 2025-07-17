// src/components/__tests__/TaxAnalysisFormatter.test.js
import React from 'react';
import { render } from '@testing-library/react';
import * as formatter from '../TaxAnalysisFormatter';

describe('TaxAnalysisFormatter', () => {
  describe('formatFinancialNumber', () => {
    test('returns null for zero, null, or undefined', () => {
      expect(formatter.formatFinancialNumber(0)).toBeNull();
      expect(formatter.formatFinancialNumber(null)).toBeNull();
      expect(formatter.formatFinancialNumber(undefined)).toBeNull();
    });

    test('formats positive currency values', () => {
      const { container } = render(formatter.formatFinancialNumber(12345));
      expect(container.textContent).toContain('$12,345');
    });

    test('formats negative currency values', () => {
      const { container } = render(formatter.formatFinancialNumber(-5000));
      expect(container.textContent).toContain('-$5,000');
    });

    test('formats percentage values', () => {
      const { container } = render(formatter.formatFinancialNumber(0.123, 'percentage'));
      expect(container.textContent).toContain('12.3%');
    });

    test('formats neutral values', () => {
      const { container } = render(formatter.formatFinancialNumber(1000, 'neutral'));
      expect(container.textContent).toContain('1,000');
    });
  });

  describe('filterNonZeroResults', () => {
    test('filters out strategies with zero or missing input values', () => {
      const strategies = [
        { id: 'A', inputRequired: 'a' },
        { id: 'B', inputRequired: 'b' },
        { id: 'C', inputRequired: 'c' },
      ];
      const clientData = { a: 100, b: 0, c: null };
      const filtered = formatter.filterNonZeroResults(strategies, clientData);
      expect(filtered).toEqual([{ id: 'A', inputRequired: 'a' }]);
    });

    test('returns all strategies if all have positive values', () => {
      const strategies = [
        { id: 'A', inputRequired: 'a' },
        { id: 'B', inputRequired: 'b' },
      ];
      const clientData = { a: 1, b: 2 };
      const filtered = formatter.filterNonZeroResults(strategies, clientData);
      expect(filtered.length).toBe(2);
    });
  });
});

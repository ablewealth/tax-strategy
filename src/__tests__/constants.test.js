import { 
  formatCurrency, 
  formatPercentage, 
  STRATEGY_LIBRARY, 
  RETIREMENT_STRATEGIES,
  DEALS_EXPOSURE_LEVELS
} from '../constants';

describe('Constants and Utilities', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(50000)).toBe('$50,000');
    });

    test('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    test('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,235');
    });

    test('handles decimal values', () => {
      expect(formatCurrency(1234.67)).toBe('$1,235');
      expect(formatCurrency(1234.23)).toBe('$1,234');
    });
  });

  describe('formatPercentage', () => {
    test('formats decimal percentages correctly', () => {
      expect(formatPercentage(0.25)).toBe('25.0%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(0.1)).toBe('10.0%');
    });

    test('formats zero correctly', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    test('formats values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150.0%');
    });

    test('formats negative percentages', () => {
      expect(formatPercentage(-0.1)).toBe('-10.0%');
    });
  });

  describe('STRATEGY_LIBRARY', () => {
    test('contains expected strategies', () => {
      expect(Array.isArray(STRATEGY_LIBRARY)).toBe(true);
      expect(STRATEGY_LIBRARY.length).toBeGreaterThan(0);
    });

    test('each strategy has required properties', () => {
      STRATEGY_LIBRARY.forEach(strategy => {
        expect(strategy).toHaveProperty('id');
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('description');
        expect(strategy).toHaveProperty('inputRequired');
        expect(strategy).toHaveProperty('category');
      });
    });

    test('strategy IDs are unique', () => {
      const ids = STRATEGY_LIBRARY.map(s => s.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('RETIREMENT_STRATEGIES', () => {
    test('contains expected retirement strategies', () => {
      expect(Array.isArray(RETIREMENT_STRATEGIES)).toBe(true);
      expect(RETIREMENT_STRATEGIES.length).toBeGreaterThan(0);
    });

    test('each retirement strategy has required properties', () => {
      RETIREMENT_STRATEGIES.forEach(strategy => {
        expect(strategy).toHaveProperty('id');
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('description');
        expect(strategy).toHaveProperty('inputRequired');
        expect(strategy).toHaveProperty('type');
      });
    });
  });

  describe('DEALS_EXPOSURE_LEVELS', () => {
    test('contains expected exposure levels', () => {
      expect(typeof DEALS_EXPOSURE_LEVELS).toBe('object');
      expect(DEALS_EXPOSURE_LEVELS).toHaveProperty('130/30');
      expect(DEALS_EXPOSURE_LEVELS).toHaveProperty('145/45');
      expect(DEALS_EXPOSURE_LEVELS).toHaveProperty('175/75');
      expect(DEALS_EXPOSURE_LEVELS).toHaveProperty('225/125');
    });

    test('each exposure level has required properties', () => {
      Object.values(DEALS_EXPOSURE_LEVELS).forEach(level => {
        expect(level).toHaveProperty('shortTermLossRate');
        expect(level).toHaveProperty('longTermGainRate');
        expect(level).toHaveProperty('netBenefit');
        expect(level).toHaveProperty('description');
      });
    });

    test('exposure levels have correct types', () => {
      Object.values(DEALS_EXPOSURE_LEVELS).forEach(level => {
        expect(typeof level.shortTermLossRate).toBe('number');
        expect(typeof level.longTermGainRate).toBe('number');
        expect(typeof level.netBenefit).toBe('number');
        expect(typeof level.description).toBe('string');
      });
    });
  });
});
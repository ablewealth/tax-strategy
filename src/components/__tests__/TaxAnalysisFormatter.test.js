import { filterNonZeroResults } from '../TaxAnalysisFormatter';

describe('TaxAnalysisFormatter', () => {
  const mockStrategies = [
    { id: 'STRATEGY_1', inputRequired: 'field1' },
    { id: 'STRATEGY_2', inputRequired: 'field2' },
    { id: 'STRATEGY_3', inputRequired: 'field3' },
  ];

  const mockClientData = {
    field1: 5000,  // Valid positive value
    field2: 0,     // Zero value (should be filtered out)
    field3: 10000, // Valid positive value
  };

  test('filterNonZeroResults should filter out strategies with zero values', () => {
    const result = filterNonZeroResults(mockStrategies, mockClientData);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('STRATEGY_1');
    expect(result[1].id).toBe('STRATEGY_3');
  });

  test('filterNonZeroResults should filter out strategies with undefined values', () => {
    const clientDataWithUndefined = {
      field1: 5000,
      field2: undefined,
      field3: 10000,
    };
    
    const result = filterNonZeroResults(mockStrategies, clientDataWithUndefined);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('STRATEGY_1');
    expect(result[1].id).toBe('STRATEGY_3');
  });

  test('filterNonZeroResults should return empty array when no valid strategies', () => {
    const clientDataAllZero = {
      field1: 0,
      field2: 0,
      field3: 0,
    };
    
    const result = filterNonZeroResults(mockStrategies, clientDataAllZero);
    
    expect(result).toHaveLength(0);
  });
});
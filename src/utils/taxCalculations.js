/**
 * Tax calculation utilities
 * Contains complex tax calculation functions extracted from App.js
 */

import {
  DEALS_EXPOSURE_LEVELS,
  STRATEGY_LIBRARY,
  RETIREMENT_STRATEGIES,
  FED_TAX_BRACKETS,
  AMT_BRACKETS,
  AMT_EXEMPTION,
  NJ_TAX_BRACKETS,
  NY_TAX_BRACKETS,
  STANDARD_DEDUCTION,
  formatCurrency,
} from '../constants';

/**
 * Validates and defaults input values to prevent calculation errors
 * @param {any} value - The value to validate
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Validated number
 */
const validateAndDefault = (value, defaultValue = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return defaultValue;
  }
  return Math.max(0, Number(value));
};

/**
 * Calculate tax based on income and tax brackets with proper progressive calculation
 * @param {number} income - The taxable income
 * @param {Array} brackets - Tax brackets array
 * @returns {number} Calculated tax amount
 */
export const calculateTax = (income, brackets) => {
  const validatedIncome = validateAndDefault(income, 0);
  if (validatedIncome <= 0 || !brackets || brackets.length === 0) return 0;
  
  let tax = 0;
  let previousMax = 0;
  
  for (const bracket of brackets) {
    if (validatedIncome <= previousMax) break;
    
    const taxableInBracket = Math.min(validatedIncome, bracket.max) - previousMax;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * bracket.rate;
    }
    previousMax = bracket.max;
    
    // Stop if we've reached the income level
    if (validatedIncome <= bracket.max) break;
  }
  
  return Math.round(tax * 100) / 100; // Round to cents
};

/**
 * Calculate taxes for a given year with specific strategies
 * @param {Object} yearData - Client data for the year
 * @param {Object} strategies - Enabled strategies
 * @returns {Object} Tax calculation results
 */
export const getTaxesForYear = (yearData, strategies) => {
  // Validate inputs
  if (!yearData || typeof yearData !== 'object') {
    throw new Error('Invalid yearData provided to getTaxesForYear');
  }
  
  if (!strategies || typeof strategies !== 'object') {
    strategies = {};
  }
  
  // Validate and default all financial inputs
  const validatedYearData = {
    ...yearData,
    w2Income: validateAndDefault(yearData.w2Income, 0),
    businessIncome: validateAndDefault(yearData.businessIncome, 0),
    longTermGains: validateAndDefault(yearData.longTermGains, 0),
    shortTermGains: validateAndDefault(yearData.shortTermGains, 0),
    state: yearData.state || 'NJ' // Default to NJ if not specified
  };
  
  const fedDeductions = { aboveAGI: 0, belowAGI: 0 };
  const stateDeductions = { total: 0 };
  let njAddBack = 0;
  let qbiBaseIncome = validatedYearData.businessIncome;
  let currentLtGains = validatedYearData.longTermGains;
  let currentStGains = validatedYearData.shortTermGains;
  let totalCapitalAllocated = 0;
  const insights = [];

  const stateBrackets = validatedYearData.state === 'NY' ? NY_TAX_BRACKETS : NJ_TAX_BRACKETS;
  const allStrategies = [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES];

  // Process each strategy
  allStrategies.forEach((strategy) => {
    if (strategies[strategy.id]) {
      const strategyInputAmount = validateAndDefault(validatedYearData[strategy.inputRequired], 0);
      if (strategy.type !== 'qbi' && strategyInputAmount > 0) {
        totalCapitalAllocated += strategyInputAmount;
      }

      switch (strategy.id) {
        case 'QUANT_DEALS_01': {
          const result = processQuantDealsStrategy(
            validatedYearData,
            currentStGains,
            currentLtGains,
            fedDeductions,
            stateDeductions,
            insights
          );
          currentStGains = result.currentStGains;
          currentLtGains = result.currentLtGains;
          break;
        }
        case 'EQUIP_S179_01': {
          const result = processSection179Strategy(
            validatedYearData,
            qbiBaseIncome,
            fedDeductions,
            stateDeductions,
            njAddBack,
            insights
          );
          qbiBaseIncome = result.qbiBaseIncome;
          njAddBack = result.njAddBack;
          break;
        }
        case 'CHAR_CLAT_01':
          processCharitableClatStrategy(validatedYearData, fedDeductions, stateDeductions, insights);
          break;
        case 'OG_USENERGY_01':
          processOilGasStrategy(validatedYearData, fedDeductions, stateDeductions, insights);
          break;
        case 'FILM_SEC181_01':
          processFilmStrategy(validatedYearData, fedDeductions, stateDeductions, insights);
          break;
        case 'SOLO401K_EMPLOYEE_01': {
          const result = processSolo401kEmployeeStrategy(
            validatedYearData,
            fedDeductions,
            stateDeductions,
            njAddBack,
            insights
          );
          njAddBack = result.njAddBack;
          break;
        }
        case 'SOLO401K_EMPLOYER_01': {
          const result = processSolo401kEmployerStrategy(
            validatedYearData,
            qbiBaseIncome,
            fedDeductions,
            stateDeductions,
            insights
          );
          qbiBaseIncome = result.qbiBaseIncome;
          break;
        }
        case 'DB_PLAN_01': {
          const result = processDbPlanStrategy(
            validatedYearData,
            qbiBaseIncome,
            fedDeductions,
            stateDeductions,
            insights
          );
          qbiBaseIncome = result.qbiBaseIncome;
          break;
        }
        default:
          break;
      }
    }
  });

  // Calculate final tax amounts using validated data
  const ordinaryIncome = validatedYearData.w2Income + validatedYearData.businessIncome + currentStGains;
  const fedAGI = Math.max(0, ordinaryIncome - fedDeductions.aboveAGI);
  const amti = fedAGI;
  const amtExemptionAmount = Math.max(0, AMT_EXEMPTION - Math.max(0, amti - 1140800) * 0.25);
  const amtTaxableIncome = Math.max(0, amti - amtExemptionAmount);
  const amtTax = calculateTax(amtTaxableIncome, AMT_BRACKETS);
  const fedTaxableForQBI = Math.max(0, fedAGI - STANDARD_DEDUCTION - fedDeductions.belowAGI);

  // QBI deduction calculation with validation
  let qbiDeduction = 0;
  if (strategies['QBI_FINAL_01'] && qbiBaseIncome > 0) {
    if (fedTaxableForQBI <= 383900) {
      qbiDeduction = Math.min(qbiBaseIncome * 0.2, fedTaxableForQBI * 0.2);
      insights.push({
        type: 'success',
        text: `QBI deduction of ${formatCurrency(qbiDeduction)} successfully applied.`,
      });
    } else {
      insights.push({
        type: 'warning',
        text: `Client's taxable income exceeds the threshold for the QBI deduction.`,
      });
    }
  }

  const fedTaxableIncome = Math.max(0, fedTaxableForQBI - qbiDeduction);
  const fedOrdinaryTax = calculateTax(fedTaxableIncome, FED_TAX_BRACKETS);
  const fedCapitalGainsTax = Math.max(0, currentLtGains) * 0.2;
  const regularFedTax = fedOrdinaryTax + fedCapitalGainsTax;
  const fedTax = Math.max(regularFedTax, amtTax);

  const stateTaxableIncome = Math.max(
    0,
    validatedYearData.w2Income +
      validatedYearData.businessIncome +
      currentLtGains +
      currentStGains -
      stateDeductions.total +
      njAddBack
  );
  const stateTax = calculateTax(stateTaxableIncome, stateBrackets);
  const totalIncome = validatedYearData.w2Income + validatedYearData.businessIncome + currentLtGains + currentStGains;
  const afterTaxIncome = totalIncome - (fedTax + stateTax);

  return {
    totalTax: fedTax + stateTax,
    fedTax,
    stateTax,
    totalCapitalAllocated,
    afterTaxIncome,
    insights,
  };
};

/**
 * Process Quantino DEALS strategy
 */
const processQuantDealsStrategy = (
  yearData,
  currentStGains,
  currentLtGains,
  fedDeductions,
  stateDeductions,
  insights
) => {
  const exposure = DEALS_EXPOSURE_LEVELS[yearData.dealsExposure];
  const stLoss = (yearData.investmentAmount || 0) * exposure.shortTermLossRate;
  const ltGainFromDeals = (yearData.investmentAmount || 0) * exposure.longTermGainRate;
  const stOffset = Math.min(currentStGains, stLoss);

  const updatedStGains = currentStGains - stOffset;
  const remainingLoss = stLoss - stOffset;
  const ltOffset = Math.min(currentLtGains, remainingLoss);
  const updatedLtGains = currentLtGains - ltOffset + ltGainFromDeals;
  const remainingLoss2 = remainingLoss - ltOffset;
  const ordinaryOffset = Math.min(3000, remainingLoss2);

  fedDeductions.belowAGI += ordinaryOffset;
  stateDeductions.total += ordinaryOffset;

  insights.push({
    type: 'success',
    text: `DEALS strategy generated ${formatCurrency(stOffset + ltOffset)} in capital loss offsets and a ${formatCurrency(ordinaryOffset)} ordinary income deduction.`,
  });

  return { currentStGains: updatedStGains, currentLtGains: updatedLtGains };
};

/**
 * Process Section 179 strategy
 */
const processSection179Strategy = (
  yearData,
  qbiBaseIncome,
  fedDeductions,
  stateDeductions,
  njAddBack,
  insights
) => {
  const s179Ded = Math.min(yearData.equipmentCost, qbiBaseIncome, 1220000);
  const updatedQbiBaseIncome = qbiBaseIncome - s179Ded;
  let updatedNjAddBack = njAddBack;

  fedDeductions.aboveAGI += s179Ded;

  insights.push({
    type: 'success',
    text: `Section 179 provides a ${formatCurrency(s179Ded)} federal deduction.`,
  });

  if (yearData.state === 'NY') {
    stateDeductions.total += s179Ded;
  } else {
    const njDed = Math.min(yearData.equipmentCost, 975000); // Updated for 2025 NJ tax law
    stateDeductions.total += njDed;
    const addBack = Math.max(0, s179Ded - njDed);
    if (addBack > 0) {
      updatedNjAddBack += addBack;
      insights.push({
        type: 'warning',
        text: `New Jersey requires a ${formatCurrency(addBack)} depreciation add-back for Section 179 (2025 tax law: $975,000 limit).`,
      });
    }
  }

  return { qbiBaseIncome: updatedQbiBaseIncome, njAddBack: updatedNjAddBack };
};

/**
 * Process Charitable CLAT strategy
 */
const processCharitableClatStrategy = (yearData, fedDeductions, stateDeductions, insights) => {
  const fedAGIForClat = yearData.w2Income + yearData.businessIncome - fedDeductions.aboveAGI;
  const clatDed = Math.min(yearData.charitableIntent || 0, fedAGIForClat * 0.3);

  fedDeductions.belowAGI += clatDed;
  insights.push({
    type: 'success',
    text: `Charitable CLAT provides a ${formatCurrency(clatDed)} federal itemized deduction.`,
  });

  if (clatDed < (yearData.charitableIntent || 0)) {
    insights.push({
      type: 'warning',
      text: `Charitable deduction was limited by AGI to ${formatCurrency(clatDed)}.`,
    });
  }

  if (yearData.state === 'NY') {
    stateDeductions.total += clatDed * 0.5;
  }
};

/**
 * Process Oil & Gas strategy
 */
const processOilGasStrategy = (yearData, fedDeductions, stateDeductions, insights) => {
  const ogDed = (yearData.ogInvestment || 0) * 0.7;
  fedDeductions.belowAGI += ogDed;

  insights.push({
    type: 'success',
    text: `Oil & Gas investment generates a ${formatCurrency(ogDed)} federal deduction.`,
  });

  if (yearData.state === 'NY') {
    stateDeductions.total += ogDed;
  }
};

/**
 * Process Film financing strategy
 */
const processFilmStrategy = (yearData, fedDeductions, stateDeductions, insights) => {
  const filmDed = yearData.filmInvestment || 0;
  fedDeductions.belowAGI += filmDed;

  insights.push({
    type: 'success',
    text: `Film financing provides a ${formatCurrency(filmDed)} federal deduction.`,
  });

  if (yearData.state === 'NY') {
    stateDeductions.total += filmDed;
  }
};

/**
 * Process Solo 401k Employee strategy
 */
const processSolo401kEmployeeStrategy = (
  yearData,
  fedDeductions,
  stateDeductions,
  njAddBack,
  insights
) => {
  const s401kEmpDed = Math.min(yearData.solo401kEmployee, 23000);
  let updatedNjAddBack = njAddBack;

  fedDeductions.aboveAGI += s401kEmpDed;

  insights.push({
    type: 'success',
    text: `Solo 401(k) employee contribution of ${formatCurrency(s401kEmpDed)} reduces federal AGI.`,
  });

  if (yearData.state === 'NY') {
    stateDeductions.total += s401kEmpDed;
  } else {
    updatedNjAddBack += s401kEmpDed;
    insights.push({
      type: 'warning',
      text: `New Jersey taxes Solo 401(k) employee deferrals. A ${formatCurrency(s401kEmpDed)} add-back is required.`,
    });
  }

  return { njAddBack: updatedNjAddBack };
};

/**
 * Process Solo 401k Employer strategy
 */
const processSolo401kEmployerStrategy = (
  yearData,
  qbiBaseIncome,
  fedDeductions,
  stateDeductions,
  insights
) => {
  const s401kEmployerDed = yearData.solo401kEmployer || 0;
  const updatedQbiBaseIncome = qbiBaseIncome - s401kEmployerDed;

  fedDeductions.aboveAGI += s401kEmployerDed;
  stateDeductions.total += s401kEmployerDed;

  insights.push({
    type: 'success',
    text: `Solo 401(k) employer contribution of ${formatCurrency(s401kEmployerDed)} reduces business income for QBI.`,
  });

  return { qbiBaseIncome: updatedQbiBaseIncome };
};

/**
 * Process Defined Benefit plan strategy
 */
const processDbPlanStrategy = (
  yearData,
  qbiBaseIncome,
  fedDeductions,
  stateDeductions,
  insights
) => {
  const dbDed = yearData.dbContribution || 0;
  const updatedQbiBaseIncome = qbiBaseIncome - dbDed;

  fedDeductions.aboveAGI += dbDed;
  stateDeductions.total += dbDed;

  insights.push({
    type: 'success',
    text: `Defined Benefit plan contribution of ${formatCurrency(dbDed)} reduces business income for QBI.`,
  });

  return { qbiBaseIncome: updatedQbiBaseIncome };
};

/**
 * Main tax calculation function
 * @param {Object} scenario - Complete scenario object
 * @returns {Object} Tax calculation results
 */
export const performTaxCalculations = (scenario) => {
  if (!scenario) return null;

  const { clientData, enabledStrategies } = scenario;
  const { projectionYears, growthRate } = clientData;

  const projections = [];
  let cumulativeBaselineTax = 0;
  let cumulativeOptimizedTax = 0;
  let cumulativeSavings = 0;
  const loopYears = projectionYears === 0 ? 1 : projectionYears;

  for (let i = 0; i < loopYears; i++) {
    const growthFactor = Math.pow(1 + (growthRate || 0) / 100, i);
    const currentYearData = {
      ...clientData,
      w2Income: clientData.w2Income * growthFactor,
      businessIncome: clientData.businessIncome * growthFactor,
      longTermGains: clientData.longTermGains * growthFactor,
      shortTermGains: clientData.shortTermGains * growthFactor,
    };

    const baseline = getTaxesForYear(currentYearData, {});
    const withStrategies = getTaxesForYear(currentYearData, enabledStrategies);
    cumulativeBaselineTax += baseline.totalTax;
    cumulativeOptimizedTax += withStrategies.totalTax;
    cumulativeSavings = cumulativeBaselineTax - cumulativeOptimizedTax;
    projections.push({ year: i + 1, baseline, withStrategies, cumulativeSavings });
  }

  return {
    projections,
    cumulative: {
      baselineTax: cumulativeBaselineTax,
      optimizedTax: cumulativeOptimizedTax,
      totalSavings: cumulativeSavings,
      capitalAllocated: projections[0]?.withStrategies.totalCapitalAllocated || 0,
    },
    withStrategies: projections[0]?.withStrategies,
  };
};

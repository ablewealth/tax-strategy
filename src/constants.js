// --- Constants and Configuration ---

export const DEALS_EXPOSURE_LEVELS = {
  '130/30': {
    shortTermLossRate: 0.1,
    longTermGainRate: 0.024,
    netBenefit: 0.035,
    description: '130/30 Strategy - 3.5% annual tax benefits',
  },
  '145/45': {
    shortTermLossRate: 0.138,
    longTermGainRate: 0.033,
    netBenefit: 0.046,
    description: '145/45 Strategy - 4.6% annual tax benefits',
  },
  '175/75': {
    shortTermLossRate: 0.206,
    longTermGainRate: 0.049,
    netBenefit: 0.069,
    description: '175/75 Strategy - 6.9% annual tax benefits',
  },
  '225/125': {
    shortTermLossRate: 0.318,
    longTermGainRate: 0.076,
    netBenefit: 0.106,
    description: '225/125 Strategy - 10.6% annual tax benefits',
  },
};

export const STRATEGY_LIBRARY = [
  {
    id: 'QUANT_DEALS_01',
    name: 'Quantino DEALS™',
    category: 'Systematic Investment',
    description: 'Algorithmic trading generating strategic capital losses to offset gains.',
    inputRequired: 'investmentAmount',
    type: 'capital',
  },
  {
    id: 'EQUIP_S179_01',
    name: 'Section 179 Acceleration',
    category: 'Business Tax Strategy',
    description: 'Immediate expensing of qualifying business equipment purchases up to $1.22M.',
    inputRequired: 'equipmentCost',
    type: 'aboveAGI',
  },
  {
    id: 'CHAR_CLAT_01',
    name: 'Charitable CLAT',
    category: 'Philanthropic Planning',
    description: 'Charitable giving structure providing immediate substantial deductions.',
    inputRequired: 'charitableIntent',
    type: 'belowAGI',
  },
  {
    id: 'OG_USENERGY_01',
    name: 'Energy Investment IDCs',
    category: 'Alternative Investment',
    description: 'Participation in domestic oil & gas ventures providing upfront deductions.',
    inputRequired: 'ogInvestment',
    type: 'belowAGI',
  },
  {
    id: 'FILM_SEC181_01',
    name: 'Film Financing (Sec 181)',
    category: 'Alternative Investment',
    description: '100% upfront deduction of investment in qualified film production.',
    inputRequired: 'filmInvestment',
    type: 'belowAGI',
  },
  {
    id: 'QBI_FINAL_01',
    name: 'QBI Optimization',
    category: 'Income Strategy',
    description: 'Maximizing the 20% Qualified Business Income deduction.',
    inputRequired: 'businessIncome',
    type: 'qbi',
  },
];

export const RETIREMENT_STRATEGIES = [
  {
    id: 'SOLO401K_EMPLOYEE_01',
    name: 'Solo 401(k) - Employee',
    description: 'Employee elective deferral contributions.',
    inputRequired: 'solo401kEmployee',
    type: 'aboveAGI',
  },
  {
    id: 'SOLO401K_EMPLOYER_01',
    name: 'Solo 401(k) - Employer',
    description: 'Employer profit-sharing contributions.',
    inputRequired: 'solo401kEmployer',
    type: 'aboveAGI',
  },
  {
    id: 'DB_PLAN_01',
    name: 'Executive Retirement Plan',
    description: 'High-contribution defined benefit pension plan.',
    inputRequired: 'dbContribution',
    type: 'aboveAGI',
  },
];

export const FED_TAX_BRACKETS = [
  { rate: 0.1, min: 0, max: 23200 },
  { rate: 0.12, min: 23201, max: 94300 },
  { rate: 0.22, min: 94301, max: 201050 },
  { rate: 0.24, min: 201051, max: 383900 },
  { rate: 0.32, min: 383901, max: 487450 },
  { rate: 0.35, min: 487451, max: 731200 },
  { rate: 0.37, min: 731201, max: Infinity },
];

export const AMT_BRACKETS = [
  { rate: 0.26, min: 0, max: 220700 },
  { rate: 0.28, min: 220701, max: Infinity },
];
export const AMT_EXEMPTION = 126500;

export const NJ_TAX_BRACKETS = [
  { rate: 0.014, min: 0, max: 20000 },
  { rate: 0.0175, min: 20001, max: 35000 },
  { rate: 0.035, min: 35001, max: 40000 },
  { rate: 0.05525, min: 40001, max: 75000 },
  { rate: 0.0637, min: 75001, max: 500000 },
  { rate: 0.0897, min: 500001, max: 1000000 },
  { rate: 0.1075, min: 1000001, max: Infinity },
];

export const NY_TAX_BRACKETS = [
  { rate: 0.04, min: 0, max: 17150 },
  { rate: 0.045, min: 17151, max: 23900 },
  { rate: 0.0525, min: 23901, max: 27900 },
  { rate: 0.0585, min: 27901, max: 161550 },
  { rate: 0.0625, min: 161551, max: 323200 },
  { rate: 0.0685, min: 323201, max: 2155350 },
  { rate: 0.0965, min: 2155351, max: 5000000 },
  { rate: 0.103, min: 5000001, max: 25000000 },
  { rate: 0.109, min: 25000001, max: Infinity },
];

export const STANDARD_DEDUCTION = 29200;

export const createNewScenario = (name) => ({
  id: Date.now(),
  name: name,
  clientData: {
    clientName: 'John & Jane Doe',
    state: 'NJ',
    projectionYears: 0, // Defaulted to 0
    growthRate: 0, // Defaulted to 0
    w2Income: 500000,
    businessIncome: 2000000,
    shortTermGains: 150000,
    longTermGains: 850000,
    investmentAmount: 500000,
    dealsExposure: '175/75',
    equipmentCost: 0,
    charitableIntent: 0,
    ogInvestment: 0,
    filmInvestment: 0,
    solo401kEmployee: 0,
    solo401kEmployer: 0,
    dbContribution: 0,
  },
  enabledStrategies: [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES].reduce(
    (acc, s) => ({ ...acc, [s.id]: false }),
    {}
  ),
});

// Export these helper functions so they can be imported by other components
export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
export const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

export const formatCurrencyForDisplay = (value) => {
  // This function is used for displaying numbers in input fields
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const parseCurrencyInput = (stringValue) => {
  if (typeof stringValue !== 'string' || stringValue.trim() === '') {
    return 0;
  }
  const cleanedString = stringValue.replace(/[^0-9.-]+/g, '');
  const parsedValue = parseFloat(cleanedString);
  return isNaN(parsedValue) ? 0 : parsedValue;
};

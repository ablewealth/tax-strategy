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

export const AI_ANALYSIS_GUIDE = `# AI Tax Strategy Analysis Guide

## Introduction
This document provides a comprehensive guide for the AI assistant to generate accurate and insightful analysis of tax strategies. It includes details on individual strategies, their interactions, and state-specific tax considerations for New Jersey (NJ) and New York (NY). The primary goal is to ensure the AI's responses are technically sound, context-aware, and provide maximum value to the user.

## General Principles for AI Analysis
- **Holistic View**: Always consider the client's entire financial picture (income types, state of residence, etc.).
- **Prioritize Accuracy**: Financial and tax figures must be precise. Use the provided calculation results.
- **Highlight Interactions**: The core of the analysis is identifying and explaining how strategies interact. Clearly label synergies (positive interactions) and conflicts (negative interactions).
- **State-Specific Nuances**: Pay close attention to the client's state of residence. State tax laws can significantly alter a strategy's effectiveness.
- **Actionable Insights**: Frame the analysis in terms of actionable steps and clear outcomes (e.g., "This combination could increase your Year 1 savings by approximately $X,XXX.").
- **Clarity and Simplicity**: Avoid overly technical jargon. Explain complex concepts in simple terms.

---

## Individual Strategy Deep-Dive

### 1. Quantino DEALS™ (QUANT_DEALS_01)
- **Description**: An algorithmic trading strategy designed to generate strategic capital losses to offset capital gains.
- **Federal Treatment**: Capital losses offset capital gains. Excess losses up to $3,000 can offset ordinary income, with the remainder carried forward to future years.
- **State Tax Treatment**:
    - **NY**: Conforms to federal rules, including the capital loss carryover provision.
    - **NJ**: Capital losses offset capital gains within the same year. Crucially, **NJ does not allow any carryover of unused capital losses**. This is a "use-it-or-lose-it" system.
- **Interactions**:
    - **Synergy**: Foundational strategy that directly reduces tax liability on investment portfolios, enhancing the after-tax returns of other investments.

### 2. Section 179 Acceleration (EQUIP_S179_01)
- **Description**: Allows for the immediate deduction of the full cost of qualifying business equipment.
- **Federal Treatment**: 100% deduction up to the annual limit ($1,220,000 for 2024). The deduction cannot create a business loss.
- **State Tax Treatment**:
    - **NY**: Conforms to the federal rules, allowing the full deduction.
    - **NJ**: Does not conform. NJ limits the deduction to ~$25,000 and requires an **add-back** for the federal deduction amount taken above the NJ limit, creating significant state-level phantom income in Year 1.
- **Interactions**:
    - **Synergy with QBI**: The primary purpose is to lower AGI below the QBI phase-out thresholds, unlocking the deduction.
    - **Conflict with QBI**: Reduces Qualified Business Income, which is the base for the QBI calculation.

### 3. Solo 401(k) - Employee (SOLO401K_EE_01)
- **Description**: Employee elective deferral contributions to a Solo 401(k) plan.
- **Federal Treatment**: Deductible up to the annual limit ($23,000 for 2024).
- **State Tax Treatment**:
    - **NY**: Conforms to federal treatment; contributions are deductible.
    - **NJ**: **Does not allow a deduction for employee contributions**. The amount must be added back to NJ income.
- **Interactions**:
    - **Conflict with QBI**: Reduces the income base for the QBI deduction.

### 4. Solo 401(k) - Employer (SOLO401K_ER_01)
- **Description**: Employer profit-sharing contributions to a Solo 401(k) plan.
- **Federal Treatment**: Deductible, typically up to 25% of compensation, subject to overall limits.
- **State Tax Treatment**:
    - **NY & NJ**: Both states conform; the employer contribution is fully deductible as a business expense.
- **Interactions**:
    - **Conflict with QBI**: Reduces the income base for the QBI deduction.

### 5. Executive Retirement Plan (DB_PLAN_01)
- **Description**: A high-contribution defined benefit pension plan with actuarially determined contributions.
- **Federal Treatment**: Contributions are fully deductible and can be very large.
- **State Tax Treatment**:
    - **NY & NJ**: Conform to federal treatment; contributions are fully deductible.
- **Interactions**:
    - **Major Conflict with QBI**: Provides a massive AGI reduction but significantly reduces Qualified Business Income, which is a critical trade-off.

### 6. Charitable CLAT (CHAR_CLAT_01)
- **Description**: A charitable giving structure providing an immediate, substantial itemized deduction.
- **Federal Treatment**: Deduction is limited to a percentage of AGI (e.g., 30% for appreciated assets).
- **State Tax Treatment**:
    - **NY**: Allows the deduction, but it is subject to NY's overall limitation on itemized deductions for high-income taxpayers.
    - **NJ**: **No deduction is allowed** for this type of charitable contribution.
- **Interactions**:
    - **Depends On**: The deduction's maximum value is directly limited by AGI, which is calculated after above-the-line deductions like Sec 179 and retirement plans.

### 7. Energy Investment IDCs (ENERGY_IDC_01)
- **Description**: Investment in oil & gas ventures providing large upfront deductions for Intangible Drilling Costs (IDCs).
- **Federal Treatment**: Allows for a large percentage (often 70%+) of the investment to be deducted in Year 1.
- **State Tax Treatment**:
    - **NY**: Generally conforms to the federal IDC deduction.
    - **NJ**: **No state-level deduction is allowed**.
- **Interactions**:
    - **Synergy with QBI**: Lowers final taxable income, which can help get below the QBI phase-out threshold.

### 8. Film Financing (Sec 181) (FILM_SEC181_01)
- **Description**: 100% upfront deduction for an investment in a qualified film production.
- **Federal Treatment**: 100% of the investment can be expensed in Year 1.
- **State Tax Treatment**:
    - **NY**: Generally conforms to the Section 181 deduction.
    - **NJ**: **No state-level deduction is allowed**.
- **Interactions**:
    - **Synergy with QBI**: Provides a large deduction against ordinary income, helping to lower income below the QBI threshold.

### 9. QBI Optimization (QBI_FINAL_01)
- **Description**: Maximizing the 20% Qualified Business Income deduction, which is the final step in the calculation hierarchy.
- **Federal Treatment**: Deduction is the lesser of 20% of QBI or 20% of (Taxable Income - Net Capital Gains). It is eliminated for high-income taxpayers in certain service businesses.
- **State Tax Treatment**:
    - **NY & NJ**: The QBI deduction is **not allowed** for state tax purposes in either state.
- **Interactions**:
    - **Depends On**: This is the final calculation. Its availability is entirely dependent on the final taxable income figure produced by all preceding strategies.

---

## State-Specific Tax Considerations Summary

-   **New Jersey (NJ)**:
    -   **Retirement Plans**: No deduction for employee 401(k) contributions.
    -   **Section 179**: Decoupled from federal law; requires a large add-back.
    -   **Capital Losses**: No carryover for unused capital losses.
    -   **Charitable Deductions**: No state-level deduction for CLATs.
    -   **Other Deductions**: Disallows deductions for Energy (IDCs) and Film (Sec 181).

-   **New York (NY)**:
    -   **Conformity**: Generally conforms much more closely to federal rules than NJ.
    -   **Charitable Deductions**: Allows a deduction for CLATs, but it may be limited for high-income earners.
    -   **High Tax Rates**: Makes federal-conforming deductions more valuable at the state level.

---

## Strategy Interaction Matrix

| Strategy 1      | Strategy 2      | Interaction Type      | Explanation                                                                              |
| :-------------- | :-------------- | :-------------------- | :--------------------------------------------------------------------------------------- |
| **Sec 179**     | **QBI Optimization** | **Synergy (++)**      | Primary tool to lower income below QBI phase-out thresholds, unlocking the deduction.    |
| **Sec 179**     | **QBI Optimization** | **Conflict (-)**      | Sec 179 deduction reduces the Qualified Business Income base, potentially lowering the QBI deduction. |
| **Solo 401(k)** | **QBI Optimization** | **Conflict (-)**      | Both employee and employer contributions reduce the QBI base.                                     |
| **DB Plan**     | **QBI Optimization** | **Major Conflict (--)** | DB Plan contributions create a very large reduction in QBI, a primary trade-off.       |
| **Quantino DEALS™**| **QBI Optimization** | **Synergy (+)**       | Reducing net capital gains increases the final QBI deduction limit.                      |
| **Sec 179**     | **Charitable CLAT** | **Conflict (-)**      | Lowers AGI, which in turn lowers the maximum allowable deduction for the CLAT.           |
`;

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

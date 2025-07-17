<TaxStrategyFramework>
  <Introduction>
    This document provides a structured breakdown of advanced tax strategies for High-Net-Worth individuals. Each strategy is detailed with its function, calculation logic, state-specific tax treatment for New York (NY) and New Jersey (NJ), interactions with other strategies, and its required order in the calculation hierarchy. The hierarchy is critical as the outcome of strategies with a lower number directly impacts the calculations for strategies with a higher number. Tax figures are updated for the 2025 tax year.
  </Introduction>

  <Strategy id="QUANT_DEALS_01">
    <Name>Quantinno DEALS™</Name>
    <Hierarchy>2</Hierarchy>
    <Description>An algorithmic long/short equity strategy designed to systematically generate capital losses to offset gains in any market environment, creating "tax alpha." Utilizes leverage and shorting to consistently harvest losses from both long and short positions, revitalizing accounts that are "stuck" with unrealized gains.</Description>
    <CalculationLogic>
The strategy is offered at various exposure levels, each with a unique long/short structure and an estimated annual tax benefit:
- **130/30 Strategy:** Estimated 3.5% annual tax benefit. This involves taking 130% long positions and 30% short positions, creating a net 100% long exposure to the market. The structure allows for generating tax losses from short positions in rising markets and long positions in falling markets.
- **145/45 Strategy:** Estimated 4.6% annual tax benefit. This strategy increases the magnitude of both long (145%) and short (45%) exposure, creating greater potential for tax-loss harvesting compared to the 130/30 strategy, while maintaining 100% net long exposure.
- **175/75 Strategy:** Estimated 6.9% annual tax benefit. With 175% long and 75% short exposure, this strategy further amplifies loss-harvesting opportunities, aiming for higher tax alpha while keeping 100% net long exposure.
- **225/125 Strategy:** Estimated 10.6% annual tax benefit. This approach employs the highest levels of leverage, with 225% long and 125% short positions. It is designed to maximize tax benefits through the most intensified loss-harvesting activities, again with 100% net long market exposure.

Federal: Losses offset gains, with $3,000 excess deductible against ordinary income and indefinite carryforward.
    </CalculationLogic>
    <AGI_Impact_Rule>Reduces taxable income via capital loss netting. Primarily impacts the "Net Capital Gains" figure, which is a key component of the QBI calculation.</AGI_Impact_Rule>
    <Interactions>
      <Enhances>Synergistic with QBI Optimization by reducing the Net Capital Gains figure. Critical for NJ residents to manage their unique tax situation.</Enhances>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Yes</Conformity><Deductibility>Fully conforms to federal rules, including the indefinite carryover of unused capital losses.</Deductibility></State>
      <State name="NJ"><Conformity>Partial (CRITICAL)</Conformity><Deductibility>No carryover of unused capital losses is allowed. This "use-it-or-lose-it" rule makes the strategy's ability to generate gains on demand (to absorb losses) exceptionally valuable.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Inherent market risk of a long/short investment strategy. Most effective when the client has substantial capital gains to offset.</Limitations_Risks>
  </Strategy>

  <Strategy id="EQUIP_S179_01">
    <Name>Section 179 &amp; Bonus Depreciation</Name>
    <Hierarchy>3</Hierarchy>
    <Description>IRC §179 Expense and Bonus Depreciation are tax deductions related to equipment purchases. They are forms of accelerated depreciation that offer potential tax benefits to equipment owners by allowing a business to deduct a significant portion, or all, of the cost of qualifying equipment in the first year.</Description>
    <CalculationLogic>
This strategy combines two provisions for accelerated depreciation:
- **Bonus Depreciation:** For 2025, bonus depreciation allows an immediate deduction of 40% of the cost of qualifying new or used equipment. This rate is down from 60% in 2024 and is scheduled to decrease further in subsequent years. It is not limited by business income.
- **IRC §179:** In addition to, or in place of, bonus depreciation, IRC §179 allows for the immediate expensing of up to $1,250,000 (2025). This deduction is limited to the business's net income and begins to phase out for total equipment purchases exceeding $3,130,000.
The combined deductions can offset passive or active income, depending on the owner's level of business involvement (material participation).
    </CalculationLogic>
    <AGI_Impact_Rule>Directly reduces AGI.</AGI_Impact_Rule>
    <Interactions>
      <Impacts>Lowers AGI, which reduces the deduction limit for Charitable CLAT and can help qualify for QBI Optimization.</Impacts>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Partial</Conformity><Deductibility>Conforms to federal Section 179 limits. However, New York has decoupled from federal bonus depreciation, so the additional 40% deduction is disallowed and must be added back for state tax calculations.</Deductibility></State>
      <State name="NJ"><Conformity>No</Conformity><Deductibility>Does not conform to federal bonus depreciation. The Section 179 deduction is limited to $25,000. The excess federal deduction over the state allowance must be added back, creating significant "phantom income" at the state level.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>The IRC §179 deduction cannot create a business loss (bonus depreciation can). To treat deductions as active losses against active income, the owner must meet material participation standards (e.g., 100+ hours annually while maintaining managerial control over assets). Benefits are significantly reduced for NY &amp; NJ residents due to state tax non-conformity.</Limitations_Risks>
  </Strategy>

  <Strategy id="SOLO401K_EE_01">
    <Name>Solo 401(k) - Employee</Name>
    <Hierarchy>4</Hierarchy>
    <Description>Employee elective deferral contributions.</Description>
    <CalculationLogic>Federal Deduction: Up to $23,500 (2025), plus a $7,500 catch-up if age 50 or over.</CalculationLogic>
    <AGI_Impact_Rule>Directly reduces AGI.</AGI_Impact_Rule>
    <Interactions>
      <Impacts>Reduces the income base for the QBI Optimization calculation.</Impacts>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Yes</Conformity><Deductibility>Fully deductible.</Deductibility></State>
      <State name="NJ"><Conformity>No</Conformity><Deductibility>NOT deductible. Must be added back to NJ income.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Subject to annual IRS contribution limits.</Limitations_Risks>
  </Strategy>

  <Strategy id="SOLO401K_ER_01">
    <Name>Solo 401(k) - Employer</Name>
    <Hierarchy>5</Hierarchy>
    <Description>Employer profit-sharing contributions.</Description>
    <CalculationLogic>Federal Deduction: Up to 25% of compensation. Total employee + employer contributions cannot exceed $70,000 (2025).</CalculationLogic>
    <AGI_Impact_Rule>Directly reduces AGI.</AGI_Impact_Rule>
    <Interactions>
      <Impacts>Reduces the income base for the QBI Optimization calculation.</Impacts>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Yes</Conformity><Deductibility>Fully deductible.</Deductibility></State>
      <State name="NJ"><Conformity>Yes</Conformity><Deductibility>Fully deductible. This makes the Solo 401(k) the premier retirement tool for eligible NJ residents due to its specific statutory approval.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Subject to overall IRS contribution limits.</Limitations_Risks>
  </Strategy>

  <Strategy id="DB_PLAN_01">
    <Name>Executive Retirement Plan (Defined Benefit)</Name>
    <Hierarchy>6</Hierarchy>
    <Description>High-contribution defined benefit pension plan allowing for very large annual deductions.</Description>
    <CalculationLogic>Deduction amount is actuarially determined based on age, income, and retirement goals. Can exceed $280,000 annually (2025).</CalculationLogic>
    <AGI_Impact_Rule>Directly reduces AGI.</AGI_Impact_Rule>
    <Interactions>
      <Impacts>Provides a very large AGI reduction but significantly reduces the income base for QBI Optimization.</Impacts>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Yes</Conformity><Deductibility>Fully deductible.</Deductibility></State>
      <State name="NJ"><Conformity>Ambiguous</Conformity><Deductibility>The deductibility for self-employed individuals is not explicitly sanctioned by statute, unlike the Solo 401(k). The conservative position is that it is not deductible, making it a risky strategy for NJ residents.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Contributions are mandatory. Requires an actuary and complex administration.</Limitations_Risks>
  </Strategy>

  <Strategy id="CHAR_CLAT_01">
    <Name>Charitable CLAT</Name>
    <Hierarchy>7</Hierarchy>
    <Description>Charitable giving structure providing an immediate substantial income tax deduction (grantor CLAT) or significant gift/estate tax savings (non-grantor CLAT).</Description>
    <CalculationLogic>For a grantor CLAT, the income tax deduction for appreciated assets is limited to 30% of AGI.</CalculationLogic>
    <AGI_Impact_Rule>Reduces taxable income via an itemized deduction.</AGI_Impact_Rule>
    <Interactions>
      <DependsOn>Maximum income tax deduction depends on AGI calculated *after* all above-the-line deductions (Sec 179, retirement plans) are taken.</DependsOn>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Partial</Conformity><Deductibility>Allowed, but limited for high-income taxpayers (e.g., to 25% of the federal deduction for AGI > $10M). This reduces the value of a grantor CLAT for state tax purposes.</Deductibility></State>
      <State name="NJ"><Conformity>No</Conformity><Deductibility>No income tax deduction is allowed. Philanthropic planning is almost exclusively a federal income/estate tax strategy for NJ residents, favoring non-grantor CLATs.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Complex trust structure. Grantor CLATs require the donor to pay tax on trust income annually.</Limitations_Risks>
  </Strategy>
  
  <Strategy id="ENERGY_IDC_01">
    <Name>Energy Investment IDCs</Name>
    <Hierarchy>8</Hierarchy>
    <Description>Participation in domestic oil &amp; gas ventures providing large upfront deductions for Intangible Drilling Costs.</Description>
    <CalculationLogic>100% immediate federal deduction for IDCs (typically 60-90% of total investment).</CalculationLogic>
    <AGI_Impact_Rule>Reduces final taxable income.</AGI_Impact_Rule>
    <Interactions>
      <Enhances>Can significantly lower the final taxable income figure, which is the last step before calculating the QBI Optimization deduction.</Enhances>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>No</Conformity><Deductibility>Costs must be capitalized and depreciated over the asset's life.</Deductibility></State>
      <State name="NJ"><Conformity>No</Conformity><Deductibility>Costs must be capitalized, creating "phantom income" and diminishing the investment's value for NJ residents.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Subject to passive activity loss rules. Carries inherent market risk. Low after-tax return for NY/NJ residents.</Limitations_Risks>
  </Strategy>

  <Strategy id="FILM_SEC181_01">
    <Name>Film Financing (Sec 181)</Name>
    <Hierarchy>9</Hierarchy>
    <Description>100% upfront deduction of investment in qualified film, television, or theatrical production.</Description>
    <CalculationLogic>Federal Deduction: 100% of production costs up to $15M ($20M in certain designated areas).</CalculationLogic>
    <AGI_Impact_Rule>Reduces final taxable income.</AGI_Impact_Rule>
    <Interactions>
        <Enhances>Can be "stacked" with valuable state-level film tax credits. NY offers a 30% refundable credit. NJ offers a 30-35% transferable credit. This combination de-risks the investment.</Enhances>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>Synergistic</Conformity><Details>While there is no direct state deduction, the state's 30% refundable tax credit program complements the federal deduction, creating a powerful combined incentive.</Details></State>
      <State name="NJ"><Conformity>Synergistic</Conformity><Details>The state's 30-35% transferable tax credit can be monetized (sold), creating immediate cash flow for the project and enhancing investor returns alongside the federal deduction.</Details></State>
    </StateTaxTreatment>
    <Limitations_Risks>Requires material participation to be treated as an active loss. Subject to specific qualification rules for productions.</Limitations_Risks>
  </Strategy>

  <Strategy id="QBI_FINAL_01">
    <Name>QBI Optimization</Name>
    <Hierarchy>10</Hierarchy>
    <Description>Maximizing the 20% Qualified Business Income deduction. This is the final major calculation.</Description>
    <CalculationLogic>Deduction = MIN(20% of QBI, 20% of (Taxable Income - Net Capital Gains)). Subject to limitations based on income, business type, wages, and property. For 2025, the income threshold where limitations begin for Specified Service Trades or Businesses (SSTBs) is projected to be approximately $394,600 (MFJ).</CalculationLogic>
    <AGI_Impact_Rule>Reduces final federal taxable income. It is a "below-the-line" deduction.</AGI_Impact_Rule>
    <Interactions>
      <DependsOn>This is the capstone calculation. Its availability and amount are entirely dependent on the final taxable income figure produced by the application of all preceding strategies.</DependsOn>
    </Interactions>
    <StateTaxTreatment>
      <State name="NY"><Conformity>No</Conformity><Deductibility>Not allowed.</Deductibility></State>
      <State name="NJ"><Conformity>No</Conformity><Deductibility>Not allowed.</Deductibility></State>
    </StateTaxTreatment>
    <Limitations_Risks>Highly complex rules regarding income thresholds, what constitutes a qualified business, and W-2 wage limitations.</Limitations_Risks>
  </Strategy>
</TaxStrategyFramework>

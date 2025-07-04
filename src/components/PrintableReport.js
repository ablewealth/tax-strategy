import React, { forwardRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));

const PrintableReport = forwardRef(
  ({ scenario, results, projections, clientName, years, growthRate }, ref) => {
    if (!results || !scenario) return null;
    const { cumulative } = results;

    // Prepare charts data (reuse logic from ChartsSection)
    const labels = projections.map((p) => `Year ${p.year}`);
    const annualTaxData = {
      labels,
      datasets: [
        {
          label: 'Baseline Annual Tax',
          data: projections.map((p) => p.baseline.totalTax),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        },
        {
          label: 'Optimized Annual Tax',
          data: projections.map((p) => p.withStrategies.totalTax),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
      ],
    };
    const savingsData = {
      labels,
      datasets: [
        {
          label: 'Cumulative Savings',
          data: projections.map((p) => p.cumulativeSavings),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          fill: true,
        },
      ],
    };

    return (
      <div ref={ref} id="printable-area" className="print-report-area">
        <div className="print-header">
          <img
            src="https://ablewealth.com/AWM%20Logo%203.png"
            alt="Able Wealth Management Logo"
            className="print-logo"
          />
          <div className="print-title">
            <h1>Tax Strategy Optimization Report</h1>
            <p className="print-date">
              Printed: {new Date().toLocaleDateString()} | Analysis for: {clientName}
            </p>
          </div>
        </div>
        <hr />
        <section>
          <h2>Scenario: {scenario.name}</h2>
          <table className="print-table">
            <tbody>
              <tr>
                <th>Client Name</th>
                <td>{scenario.clientData.clientName}</td>
              </tr>
              <tr>
                <th>W-2 Income</th>
                <td>{formatCurrency(scenario.clientData.w2Income)}</td>
              </tr>
              <tr>
                <th>Business Income</th>
                <td>{formatCurrency(scenario.clientData.businessIncome)}</td>
              </tr>
              <tr>
                <th>Growth Rate</th>
                <td>{growthRate}%/year</td>
              </tr>
              <tr>
                <th>Projection Years</th>
                <td>{years}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <h2>Summary</h2>
          <table className="print-table summary-table">
            <tbody>
              <tr>
                <th>Total Baseline Tax</th>
                <td>{formatCurrency(cumulative.baselineTax)}</td>
              </tr>
              <tr>
                <th>Total Optimized Tax</th>
                <td>{formatCurrency(cumulative.optimizedTax)}</td>
              </tr>
              <tr>
                <th>Total Tax Savings</th>
                <td className="highlight">{formatCurrency(cumulative.totalSavings)}</td>
              </tr>
              <tr>
                <th>Capital Allocated</th>
                <td>{formatCurrency(cumulative.capitalAllocated)}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <h2>Annual Tax Comparison</h2>
          <div className="print-chart">
            <Bar options={{
              responsive: false,
              plugins: {
                legend: { display: true, position: 'top' },
                title: { display: false }
              },
              scales: { y: { ticks: { callback: formatCurrency } } }
            }}
              data={annualTaxData}
              height={250}
              width={450}
            />
          </div>
        </section>
        <section>
          <h2>Cumulative Tax Savings</h2>
          <div className="print-chart">
            <Line options={{
              responsive: false,
              plugins: {
                legend: { display: true, position: 'top' },
                title: { display: false }
              },
              scales: { y: { ticks: { callback: formatCurrency } } }
            }}
              data={savingsData}
              height={250}
              width={450}
            />
          </div>
        </section>
        <section className="print-disclaimer">
          <small>
            This report is generated for illustrative purposes only and does not constitute legal, tax, or investment advice. Please consult your advisor before making any financial decisions.
          </small>
        </section>
      </div>
    );
  }
);

export default PrintableReport;

import React, { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '../constants';

const ResultsDashboard = React.memo(({ results, scenario }) => {
  const calculatedResults = useMemo(() => {
    if (!results || !results.cumulative) return null;
    
    const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = results.cumulative;
    const savingsPercentage = baselineTax > 0 ? totalSavings / baselineTax : 0;
    const roi = capitalAllocated > 0 ? totalSavings / capitalAllocated : 0;
    
    return {
      baselineTax,
      optimizedTax,
      totalSavings,
      capitalAllocated,
      savingsPercentage,
      roi
    };
  }, [results]);
  
  if (!calculatedResults) return null;
  
  const { baselineTax, optimizedTax, totalSavings, capitalAllocated, savingsPercentage, roi } = calculatedResults;

  const MetricCard = ({ label, value, subtext, isHighlighted = false, icon, delay = 0, cardType = 'default' }) => {
    const getCardStyles = () => {
      switch (cardType) {
        case 'success':
          return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300';
        case 'warning':
          return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300';
        case 'highlight':
          return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300';
        default:
          return 'bg-white border-gray-200 hover:border-gray-300';
      }
    };

    const getAccentColor = () => {
      switch (cardType) {
        case 'success':
          return 'bg-green-500';
        case 'warning':
          return 'bg-yellow-500';
        case 'highlight':
          return 'bg-blue-500';
        default:
          return 'bg-gray-400';
      }
    };

    const getTextColor = () => {
      switch (cardType) {
        case 'success':
          return 'text-green-700';
        case 'warning':
          return 'text-yellow-700';
        case 'highlight':
          return 'text-blue-700';
        default:
          return 'text-gray-900';
      }
    };

    return (
      <div
        className={`${getCardStyles()} rounded-xl shadow-sm border p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in relative overflow-hidden`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Visual accent bar */}
        <div className={`absolute top-0 left-0 w-1 h-full ${getAccentColor()}`}></div>
        <div className="flex items-start justify-between mb-3 ml-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            {icon && <span className="text-slate-500">{icon}</span>}
            {label}
          </h3>
        </div>
        <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${getTextColor()} leading-tight ml-4`}>
          {value}
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed ml-4">{subtext}</p>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm border border-blue-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block bg-blue-600/10 px-4 py-1 rounded-full mb-3">
            <span className="text-xs font-semibold tracking-wider text-blue-700">
              EXECUTIVE DASHBOARD
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-gray-900">
            Tax Optimization Analysis
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
            Comprehensive strategic tax planning results and optimization metrics for high-net-worth
            strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
          <MetricCard
            label="Baseline Tax Liability"
            value={formatCurrency(baselineTax)}
            subtext="Pre-optimization scenario"
            icon={null}
            cardType="default"
            delay={0}
          />
          <MetricCard
            label="Optimized Tax Liability"
            value={formatCurrency(optimizedTax)}
            subtext="Post-strategy implementation"
            delay={100}
          />
          <MetricCard
            label="Total Tax Optimization"
            value={formatCurrency(totalSavings)}
            subtext={`${formatPercentage(savingsPercentage)} effective reduction`}
            icon={null}
            cardType="success"
            delay={200}
          />
          <MetricCard
            label="Strategy ROI"
            value={formatPercentage(roi)}
            subtext={`On ${formatCurrency(capitalAllocated)} capital allocated`}
            icon={null}
            cardType={roi > 0.5 ? 'success' : roi > 0.2 ? 'warning' : 'default'}
            delay={300}
          />
        </div>

        {/* Additional metrics row */}
        <div
          className="mt-6 bg-white/80 rounded-lg p-4 border border-blue-100 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Effective Tax Rate</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPercentage(optimizedTax / (baselineTax + totalSavings))}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Annual Savings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(totalSavings / (results.projections?.length || 1))}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Strategies Implemented</p>
                <p className="text-lg font-semibold text-gray-900">
                  {scenario?.enabledStrategies
                    ? Object.values(scenario.enabledStrategies).filter(Boolean).length
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ResultsDashboard;

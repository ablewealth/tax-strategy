import React from 'react';
import { formatCurrency, formatPercentage } from '../constants';

const ResultsDashboard = ({ results, scenario }) => {
  if (!results || !results.cumulative) return null;
  const { baselineTax, optimizedTax, totalSavings, capitalAllocated } = results.cumulative;
  const savingsPercentage = baselineTax > 0 ? totalSavings / baselineTax : 0;
  const roi = capitalAllocated > 0 ? totalSavings / capitalAllocated : 0;

  const MetricCard = ({ label, value, subtext, isHighlighted = false, icon, delay = 0 }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border ${
        isHighlighted 
          ? 'border-blue-200' 
          : 'border-gray-200'
      } p-5 sm:p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</h3>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 ${
          isHighlighted ? 'text-blue-600' : 'text-gray-900'
        } leading-tight`}
      >
        {value}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{subtext}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 lg:p-10 shadow-sm border border-blue-100 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-block bg-blue-600/10 px-4 py-1 rounded-full mb-3">
            <span className="text-xs font-semibold tracking-wider text-blue-700">EXECUTIVE DASHBOARD</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-gray-900">
            Tax Optimization Analysis
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl mx-auto">
            Comprehensive strategic tax planning results and optimization metrics for high-net-worth strategies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
          <MetricCard
            label="Baseline Tax Liability"
            value={formatCurrency(baselineTax)}
            subtext="Pre-optimization scenario"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            }
            delay={0}
          />
          <MetricCard
            label="Optimized Tax Liability"
            value={formatCurrency(optimizedTax)}
            subtext="Post-strategy implementation"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
              </svg>
            }
            delay={100}
          />
          <MetricCard
            label="Total Tax Optimization"
            value={formatCurrency(totalSavings)}
            subtext={`${formatPercentage(savingsPercentage)} effective reduction`}
            isHighlighted
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            }
            delay={200}
          />
          <MetricCard
            label="Strategy ROI"
            value={formatPercentage(roi)}
            subtext={`On ${formatCurrency(capitalAllocated)} capital allocated`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            }
            delay={300}
          />
        </div>
        
        {/* Additional metrics row */}
        <div className="mt-6 bg-white/80 rounded-lg p-4 border border-blue-100 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Effective Tax Rate</p>
                <p className="text-lg font-semibold text-gray-900">{formatPercentage(optimizedTax / (baselineTax + totalSavings))}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Annual Savings</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalSavings / (results.projections?.length || 1))}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Strategies Implemented</p>
                <p className="text-lg font-semibold text-gray-900">
                  {scenario?.enabledStrategies ? Object.values(scenario.enabledStrategies).filter(Boolean).length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
import React from 'react';
import Section from './Section';

const InsightsSection = ({ insights }) => {
  // Group insights by type
  const benefitInsights = insights?.filter((insight) => insight.type === 'success') || [];
  const considerationInsights = insights?.filter((insight) => insight.type === 'warning') || [];

  const InsightCard = ({ insight, index, type }) => {
    const isSuccess = type === 'success';

    return (
      <div
        className={`rounded-xl shadow-sm border p-5 animate-fade-in ${
          isSuccess ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex items-center mb-3">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          <h4 className={`font-semibold ${isSuccess ? 'text-green-800' : 'text-amber-800'}`}>
            {isSuccess ? 'Strategic Benefit' : 'Implementation Consideration'}
          </h4>
        </div>
        <div className={`ml-11 ${isSuccess ? 'text-green-700' : 'text-amber-700'}`}>
          {insight.text}
        </div>
      </div>
    );
  };

  return (
    <Section
      title="💡 Strategic Implementation Insights"
      description="Tax strategy analysis and optimization recommendations."
    >
      {!insights || insights.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.8 21H9.2a3.374 3.374 0 00-2.8-1.279l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Insights Available</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enable strategies to see personalized recommendations and considerations for your tax
            optimization plan.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Benefits Section */}
          {benefitInsights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Strategic Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefitInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} index={index} type="success" />
                ))}
              </div>
            </div>
          )}

          {/* Considerations Section */}
          {considerationInsights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-amber-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Implementation Considerations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {considerationInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} index={index} type="warning" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
};

export default InsightsSection;

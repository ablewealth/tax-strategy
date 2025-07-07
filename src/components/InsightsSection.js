import React from 'react';
import Section from './Section'; // Import Section component

const InsightsSection = ({ insights }) => (
    <Section title="💡 Strategic Implementation Insights" description="Tax strategy analysis and optimization recommendations.">
        <div className="space-y-4">
            {!insights || insights.length === 0 ? (
                <p className="text-text-muted text-center py-8">Enable strategies to see personalized recommendations and considerations.</p>
            ) : (
                insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg flex items-start gap-4 border-l-4 ${insight.type === 'success' ? 'bg-green-50 border-success' : 'bg-amber-50 border-warning'}`}>
                        <div className={`text-lg sm:text-xl flex-shrink-0 ${insight.type === 'success' ? '✅' : '⚠️'}`}>
                            {insight.type === 'success' ? '✅' : '⚠️'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className={`font-semibold text-sm sm:text-base ${insight.type === 'success' ? 'text-success' : 'text-warning'} leading-tight`}>
                                {insight.type === 'success' ? 'Strategic Benefit' : 'Implementation Consideration'}
                            </h4>
                            <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">{insight.text}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </Section>
);

export default InsightsSection;

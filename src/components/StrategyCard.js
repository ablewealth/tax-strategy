import React from 'react';

const StrategyCard = ({ strategy, scenario, toggleStrategy, updateClientData, children }) => {
    const isActive = scenario.enabledStrategies[strategy.id];
    return (
        <div className={`border rounded-lg p-4 sm:p-6 transition-all relative ${isActive ? 'border-accent-gold bg-gradient-to-br from-white to-amber-50' : 'border-border-primary bg-background-primary hover:border-primary-blue'}`}>
            {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-gold rounded-l-lg"></div>}
            <div className="flex items-start gap-4">
                <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => toggleStrategy(strategy.id)} 
                    className="mt-1 h-5 w-5 sm:h-6 sm:w-6 rounded accent-accent-gold touch-manipulation"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-text-primary leading-tight">{strategy.name}</h3>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">{strategy.category}</p>
                    <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">{strategy.description}</p>
                </div>
            </div>
            {/* Always render children (inputs) regardless of isActive status */}
            {children && <div className="mt-4 pl-0 sm:pl-9">{children}</div>} 
        </div>
    )
};

export default StrategyCard;

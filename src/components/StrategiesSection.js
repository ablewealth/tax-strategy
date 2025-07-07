import React from 'react';
import Section from './Section';
import StrategyCard from './StrategyCard';
import InputField from './InputField';
import SelectField from './SelectField';
import { DEALS_EXPOSURE_LEVELS, STRATEGY_LIBRARY, RETIREMENT_STRATEGIES } from '../constants';

const StrategiesSection = ({ scenario, toggleStrategy, updateClientData }) => {
    return (
        <Section title="💼 Strategic Tax Optimization Portfolio" description="Select advanced tax strategies and input corresponding investment or contribution amounts.">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3"> {/* Reduced gap here */}
                {STRATEGY_LIBRARY.map(strategy => (
                    <StrategyCard 
                        key={strategy.id} 
                        strategy={strategy}
                        scenario={scenario}
                        toggleStrategy={toggleStrategy}
                        updateClientData={updateClientData}
                    >
                        <div className="space-y-4">
                            <InputField 
                                label="Investment Amount" 
                                value={scenario.clientData[strategy.inputRequired]}
                                onChange={value => updateClientData(strategy.inputRequired, value)}
                                placeholder="Enter amount"
                            />
                            {strategy.id === 'QUANT_DEALS_01' && (
                                <SelectField 
                                    label="DEALS Exposure Level" 
                                    value={scenario.clientData.dealsExposure} 
                                    onChange={e => updateClientData('dealsExposure', e.target.value)}
                                >
                                    {Object.entries(DEALS_EXPOSURE_LEVELS).map(([key, value]) => (
                                        <option key={key} value={key}>{value.description}</option>
                                    ))}
                                </SelectField>
                            )}
                        </div>
                    </StrategyCard>
                ))}
                {RETIREMENT_STRATEGIES.map(strategy => (
                    <StrategyCard 
                        key={strategy.id} 
                        strategy={strategy}
                        scenario={scenario}
                        toggleStrategy={toggleStrategy}
                        updateClientData={updateClientData}
                    >
                        <InputField 
                            label="Contribution Amount" 
                            value={scenario.clientData[strategy.inputRequired]}
                            onChange={value => updateClientData(strategy.inputRequired, value)}
                            placeholder="Enter amount"
                        />
                    </StrategyCard>
                ))}
            </div>
        </Section>
    )
};

export default StrategiesSection;

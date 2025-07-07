import React from 'react';
import Section from './Section';
import InputField from './InputField';
import SelectField from './SelectField';

const ClientInputSection = ({ scenario, updateClientData }) => {
    return (
        <Section title="📋 Client Profile & Projections" description="Configure client financial parameters and multi-year projection settings.">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <InputField label="Client Name" value={scenario.clientData.clientName} onChange={e => updateClientData('clientName', e.target.value)} />
                <SelectField label="State of Residence" value={scenario.clientData.state} onChange={e => updateClientData('state', e.target.value)}>
                    <option value="NJ">New Jersey</option>
                    <option value="NY">New York</option>
                </SelectField>
                <InputField label="W-2 Income" value={scenario.clientData.w2Income} onChange={value => updateClientData('w2Income', value)} placeholder="$ 500,000" />
                <InputField label="Business Income" value={scenario.clientData.businessIncome} onChange={value => updateClientData('businessIncome', value)} placeholder="$ 2,000,000" />
                <InputField label="Short Term Gains" value={scenario.clientData.shortTermGains} onChange={value => updateClientData('shortTermGains', value)} placeholder="$ 150,000" />
                <InputField label="Long Term Gains" value={scenario.clientData.longTermGains} onChange={value => updateClientData('longTermGains', value)} placeholder="$ 850,000" />
                <SelectField label="Projection Years" value={scenario.clientData.projectionYears} onChange={e => updateClientData('projectionYears', parseInt(e.target.value))}>
                     <option value={0}>Current Year Only</option><option value={3}>3 Years</option><option value={5}>5 Years</option><option value={10}>10 Years</option>
                </SelectField>
                <InputField label="Income Growth Rate (%)" value={scenario.clientData.growthRate} onChange={value => updateClientData('growthRate', value)} placeholder="e.g., 3" />
            </div>
        </Section>
    )
};

export default ClientInputSection;

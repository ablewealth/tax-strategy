import React from 'react';
import Section from './Section';
import InputField from './InputField';
import SelectField from './SelectField';

const ClientInputSection = ({ scenario, updateClientData }) => {
  return (
    <Section
      title="📋 Client Profile & Projections"
      description="Configure client financial parameters and multi-year projection settings."
    >
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100 mb-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary-blue"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-primary-navy">Client Information</h3>
            <p className="text-sm text-gray-500">Enter client details and financial information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        <InputField
          label="Client Name"
          value={scenario.clientData.clientName}
          onChange={(value) => updateClientData('clientName', value)}
          placeholder="John & Jane Doe"
        />
        <SelectField
          label="State of Residence"
          value={scenario.clientData.state}
          onChange={(e) => updateClientData('state', e.target.value)}
        >
          <option value="NJ">New Jersey</option>
          <option value="NY">New York</option>
        </SelectField>

        <div className="xl:col-span-1 sm:col-span-2 xl:col-start-1">
          <div className="bg-gradient-to-r from-primary-blue-light/10 to-primary-blue/5 p-4 rounded-lg border border-primary-blue-light/20 mb-4">
            <h3 className="font-medium text-primary-blue mb-1">Income Information</h3>
            <p className="text-sm text-gray-600">
              Enter all income sources for accurate tax calculations
            </p>
          </div>
        </div>

        <InputField
          label="W-2 Income"
          value={scenario.clientData.w2Income}
          onChange={(value) => updateClientData('w2Income', value)}
          placeholder="500,000"
        />
        <InputField
          label="Business Income"
          value={scenario.clientData.businessIncome}
          onChange={(value) => updateClientData('businessIncome', value)}
          placeholder="2,000,000"
        />
        <InputField
          label="Short Term Gains"
          value={scenario.clientData.shortTermGains}
          onChange={(value) => updateClientData('shortTermGains', value)}
          placeholder="150,000"
        />
        <InputField
          label="Long Term Gains"
          value={scenario.clientData.longTermGains}
          onChange={(value) => updateClientData('longTermGains', value)}
          placeholder="850,000"
        />

        <div className="xl:col-span-1 sm:col-span-2 xl:col-start-1">
          <div className="bg-gradient-to-r from-accent-gold-light/20 to-accent-gold/10 p-4 rounded-lg border border-accent-gold/20 mb-4">
            <h3 className="font-medium text-accent-gold-dark mb-1">Projection Settings</h3>
            <p className="text-sm text-gray-600">Configure multi-year analysis parameters</p>
          </div>
        </div>

        <SelectField
          label="Projection Years"
          value={scenario.clientData.projectionYears}
          onChange={(e) => updateClientData('projectionYears', parseInt(e.target.value))}
        >
          <option value={0}>Current Year Only</option>
          <option value={3}>3 Years</option>
          <option value={5}>5 Years</option>
          <option value={10}>10 Years</option>
        </SelectField>
        <InputField
          label="Income Growth Rate (%)"
          value={scenario.clientData.growthRate}
          onChange={(value) => updateClientData('growthRate', value)}
          placeholder="3"
        />
      </div>
    </Section>
  );
};

export default ClientInputSection;

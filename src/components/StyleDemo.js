import React from 'react';

// This component has inline styles to ensure they're applied regardless of CSS conflicts
const StyleDemo = () => {
  // Define styles inline to avoid any external CSS conflicts
  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    margin: '24px 0',
    border: '1px solid #e2e8f0',
  };
  
  const headerStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#0f172a',
    borderBottom: '2px solid #3b82f6',
    paddingBottom: '8px',
  };
  
  const sectionStyle = {
    marginBottom: '24px',
  };
  
  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1e40af',
  };
  
  const cardContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  };
  
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
    padding: '16px',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };
  
  const premiumCardStyle = {
    ...cardStyle,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid #e2e8f0',
  };
  
  const successCardStyle = {
    ...cardStyle,
    backgroundColor: '#d1fae5',
    borderColor: '#059669',
    borderLeft: '4px solid #059669',
  };
  
  const warningCardStyle = {
    ...cardStyle,
    backgroundColor: '#fef3c7',
    borderColor: '#d97706',
    borderLeft: '4px solid #d97706',
  };
  
  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '16px',
  };
  
  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '8px 16px 8px 32px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '16px',
  };
  
  const currencySymbolStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    pointerEvents: 'none',
  };
  
  const buttonStyle = {
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };
  
  const buttonHoverStyle = {
    backgroundColor: '#1e3a8a',
  };
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>UI Enhancement Demo</h2>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>1. Modern Card Design</h3>
        <div style={cardContainerStyle}>
          <div style={cardStyle}>
            <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Standard Card</h4>
            <p style={{color: '#475569', fontSize: '14px'}}>This is a standard card with the new design</p>
          </div>
          
          <div style={premiumCardStyle}>
            <h4 style={{fontWeight: '600', marginBottom: '8px'}}>Premium Card</h4>
            <p style={{color: '#475569', fontSize: '14px'}}>This is a premium card with gradient background</p>
          </div>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>2. Enhanced Input Fields</h3>
        <div style={inputContainerStyle}>
          <span style={currencySymbolStyle}>$</span>
          <input 
            type="text" 
            placeholder="Enter amount" 
            style={inputStyle}
          />
        </div>
        
        <div style={inputContainerStyle}>
          <select style={{...inputStyle, paddingLeft: '16px'}}>
            <option>Select an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>3. Better Insights</h3>
        <div style={cardContainerStyle}>
          <div style={successCardStyle}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{marginRight: '8px', color: '#059669'}}>✓</span>
              <h4 style={{fontWeight: '600', color: '#059669'}}>Strategic Benefit</h4>
            </div>
            <p style={{color: '#065f46', fontSize: '14px'}}>
              This is a success insight card with enhanced styling for better visual hierarchy.
            </p>
          </div>
          
          <div style={warningCardStyle}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{marginRight: '8px', color: '#d97706'}}>⚠</span>
              <h4 style={{fontWeight: '600', color: '#d97706'}}>Implementation Consideration</h4>
            </div>
            <p style={{color: '#92400e', fontSize: '14px'}}>
              This is a warning insight card with enhanced styling for better visual hierarchy.
            </p>
          </div>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>4. Premium Button</h3>
        <button 
          style={{...buttonStyle, ...(isHovered ? buttonHoverStyle : {})}}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Generate Analysis
        </button>
      </div>
      
      <div style={{fontSize: '14px', color: '#64748b', marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
        <p><strong>Note:</strong> This component uses inline styles to demonstrate the UI enhancements, ensuring they're visible regardless of any CSS conflicts.</p>
      </div>
    </div>
  );
};

export default StyleDemo;
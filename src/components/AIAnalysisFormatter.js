import React from 'react';

/**
 * Formats AI analysis text for display in the strategy interaction section
 * @param {string} text - The raw text from AI analysis
 * @returns {JSX.Element} Formatted JSX elements
 */
export const formatAIAnalysis = (text) => {
  if (!text) return null;

  // Split text into lines and process each line
  const lines = text.split('\n').filter(line => line.trim());
  
  const formattedContent = lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Handle headers (lines starting with **)
    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      const headerText = trimmedLine.slice(2, -2);
      
      // Different styles for different header types
      if (headerText === 'Executive Summary') {
        return (
          <h3 key={index} className="text-xl font-bold text-blue-900 mt-6 mb-4 first:mt-0 pb-2 border-b border-blue-200">
            {headerText}
          </h3>
        );
      } else if (headerText.includes('Analysis') || headerText.includes('Optimization')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0 bg-gray-50 px-3 py-2 rounded-md">
            {headerText}
          </h3>
        );
      } else {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
            {headerText}
          </h3>
        );
      }
    }
    
    // Handle bullet points
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('" ')) {
      const bulletText = trimmedLine.substring(2);
      return (
        <li key={index} className="text-gray-700 leading-relaxed mb-2">
          {formatInlineText(bulletText)}
        </li>
      );
    }
    
    // Handle numbered lists
    if (/^\d+\.\s/.test(trimmedLine)) {
      const numberText = trimmedLine.replace(/^\d+\.\s/, '');
      return (
        <li key={index} className="text-gray-700 leading-relaxed mb-2">
          {formatInlineText(numberText)}
        </li>
      );
    }
    
    // Handle regular paragraphs
    if (trimmedLine.length > 0) {
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {formatInlineText(trimmedLine)}
        </p>
      );
    }
    
    return null;
  }).filter(Boolean);

  return (
    <div className="prose prose-sm max-w-none">
      {formattedContent}
    </div>
  );
};

/**
 * Formats inline text elements like bold text and currency values
 * @param {string} text - Text to format
 * @returns {JSX.Element|string} Formatted text with inline elements
 */
const formatInlineText = (text) => {
  // Handle bold text (**text**)
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  
  return parts.map((part, index) => {
    // Odd indices are the content inside ** markers
    if (index % 2 === 1) {
      return <strong key={index} className="font-semibold text-gray-900">{part}</strong>;
    }
    
    // Even indices are regular text - check for currency values
    if (part.includes('$')) {
      return formatCurrencyInText(part, index);
    }
    
    return part;
  });
};

/**
 * Formats currency values within text
 * @param {string} text - Text containing currency values
 * @param {number} index - Index for React key
 * @returns {JSX.Element|string} Text with highlighted currency values
 */
const formatCurrencyInText = (text, index) => {
  const currencyRegex = /\$[\d,]+/g;
  const parts = text.split(currencyRegex);
  const matches = text.match(currencyRegex) || [];
  
  const result = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      result.push(parts[i]);
    }
    if (matches[i]) {
      result.push(
        <span key={`${index}-${i}`} className="font-mono text-green-700 font-medium">
          {matches[i]}
        </span>
      );
    }
  }
  
  return result;
};

export default formatAIAnalysis;
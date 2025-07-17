import React from 'react';

/**
 * Formats AI analysis text for display in the strategy interaction section
 * @param {string} text - The raw text from AI analysis
 * @returns {JSX.Element} Formatted JSX elements
 */
export const formatAIAnalysis = (text) => {
  if (!text) return null;

  // Split text into blocks separated by double line breaks to preserve paragraph structure
  const blocks = text.split('\n\n').filter(block => block.trim());
  
  const formattedContent = blocks.map((block, index) => {
    const trimmedBlock = block.trim();
    
    // Handle headers (lines starting with **)
    if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**')) {
      const headerText = trimmedBlock.slice(2, -2);
      
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
    
    // Handle bullet point blocks (multiple lines starting with bullet points)
    if (trimmedBlock.includes('\n') && (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('• '))) {
      const bulletLines = trimmedBlock.split('\n').filter(line => line.trim());
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-4">
          {bulletLines.map((line, lineIndex) => {
            const bulletText = line.trim().replace(/^[-•]\s/, '');
            return (
              <li key={`${index}-${lineIndex}`} className="text-gray-700 leading-relaxed">
                {formatInlineText(bulletText)}
              </li>
            );
          })}
        </ul>
      );
    }
    
    // Handle numbered list blocks
    if (trimmedBlock.includes('\n') && /^\d+\.\s/.test(trimmedBlock)) {
      const numberLines = trimmedBlock.split('\n').filter(line => line.trim());
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 mb-4">
          {numberLines.map((line, lineIndex) => {
            const numberText = line.trim().replace(/^\d+\.\s/, '');
            return (
              <li key={`${index}-${lineIndex}`} className="text-gray-700 leading-relaxed">
                {formatInlineText(numberText)}
              </li>
            );
          })}
        </ol>
      );
    }
    
    // Handle single line bullet points
    if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('• ')) {
      const bulletText = trimmedBlock.substring(2);
      return (
        <ul key={index} className="list-disc list-inside mb-4">
          <li className="text-gray-700 leading-relaxed">
            {formatInlineText(bulletText)}
          </li>
        </ul>
      );
    }
    
    // Handle single line numbered items
    if (/^\d+\.\s/.test(trimmedBlock)) {
      const numberText = trimmedBlock.replace(/^\d+\.\s/, '');
      return (
        <ol key={index} className="list-decimal list-inside mb-4">
          <li className="text-gray-700 leading-relaxed">
            {formatInlineText(numberText)}
          </li>
        </ol>
      );
    }
    
    // Handle regular paragraphs (preserve line breaks within paragraphs)
    if (trimmedBlock.length > 0) {
      // Replace single line breaks with spaces to keep sentences together
      const paragraphText = trimmedBlock.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4">
          {formatInlineText(paragraphText)}
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
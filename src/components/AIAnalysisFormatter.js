import React from 'react';

/**
 * Formats AI analysis text for display in the strategy interaction section
 * @param {string} text - The raw text from AI analysis
 * @returns {JSX.Element} Formatted JSX elements
 */
export const formatAIAnalysis = (text) => {
  if (!text) return null;

  // Clean up any remaining asterisks that shouldn't be there
  const cleanedText = text
    .replace(/\*\*([^*]+)\*\*/g, '__$1__') // Convert remaining ** to __
    .replace(/\*([^*\n]+)\*/g, '$1') // Remove single asterisks
    .replace(/^\*\s+/gm, '• ') // Convert asterisk bullets to proper bullets
    .replace(/\*\s*$/gm, ''); // Remove trailing asterisks

  // Split text into blocks separated by double line breaks to preserve paragraph structure
  const blocks = cleanedText.split('\n\n').filter(block => block.trim());
  
  const formattedContent = blocks.map((block, index) => {
    const trimmedBlock = block.trim();
    
    // Handle SECTION headers (SECTION 1:, SECTION 2:, etc.)
    if (trimmedBlock.startsWith('**SECTION') || trimmedBlock.startsWith('SECTION')) {
      const headerText = trimmedBlock.replace(/^\*\*/, '').replace(/\*\*$/, '');
      
      const sectionNum = headerText.match(/SECTION (\d+)/)?.[1] || '1';
      const colors = [
        'from-slate-800 to-slate-900',
        'from-blue-900 to-indigo-900', 
        'from-indigo-900 to-purple-900',
        'from-purple-900 to-blue-900',
        'from-blue-900 to-slate-900',
        'from-slate-900 to-gray-900',
        'from-gray-900 to-blue-900'
      ];
      const gradientClass = colors[(parseInt(sectionNum) - 1) % colors.length];
      
      return (
        <div key={index} className="mt-8 mb-6 first:mt-0">
          <div className={`bg-gradient-to-r ${gradientClass} text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                {sectionNum}
              </span>
              {headerText.replace(/SECTION \d+:\s*/, '')}
            </h2>
          </div>
          <div className={`h-1 bg-gradient-to-r ${gradientClass} rounded-b`}></div>
        </div>
      );
    }
    
    // Handle headers (lines starting with ** or just text that looks like headers)
    if ((trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**')) || 
        /^[A-Z][A-Z\s]+:?\s*$/.test(trimmedBlock)) {
      const headerText = trimmedBlock.startsWith('**') ? 
        trimmedBlock.slice(2, -2) : 
        trimmedBlock;
      
      // Different styles for different header types
      if (headerText === 'Executive Summary') {
        return (
          <h3 key={index} className="text-xl font-bold text-blue-900 mt-8 mb-4 first:mt-0 pb-2 border-b-2 border-blue-800 font-serif">
            {headerText}
          </h3>
        );
      } else if (headerText.includes('Analysis') || headerText.includes('Optimization')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-blue-800 mt-8 mb-3 first:mt-0 bg-blue-50 px-4 py-3 rounded-md font-serif border-l-4 border-blue-800">
            {headerText}
          </h3>
        );
      } else {
        return (
          <h3 key={index} className="text-lg font-semibold text-blue-800 mt-8 mb-3 first:mt-0 font-serif border-b border-blue-300 pb-2">
            {headerText}
          </h3>
        );
      }
    }
    
    // Handle bullet point blocks (multiple lines starting with bullet points)
    if (trimmedBlock.includes('\n') && (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('• '))) {
      const bulletLines = trimmedBlock.split('\n').filter(line => line.trim());
      return (
        <ul key={index} className="list-disc list-inside space-y-3 mb-6 ml-4">
          {bulletLines.map((line, lineIndex) => {
            const bulletText = line.trim().replace(/^[-•]\s/, '');
            return (
              <li key={`${index}-${lineIndex}`} className="text-gray-700 leading-relaxed font-light text-base pl-2">
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
        <ol key={index} className="list-decimal list-inside space-y-3 mb-6 ml-4">
          {numberLines.map((line, lineIndex) => {
            const numberText = line.trim().replace(/^\d+\.\s/, '');
            return (
              <li key={`${index}-${lineIndex}`} className="text-gray-700 leading-relaxed font-light text-base pl-2">
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
        <p key={index} className="text-gray-700 leading-relaxed mb-6 text-base font-light text-justify">
          {formatInlineText(paragraphText)}
        </p>
      );
    }
    
    return null;
  }).filter(Boolean);

  return (
    <div className="max-w-none font-serif bg-white">
      <div className="space-y-6">
        {formattedContent}
      </div>
      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <div className="text-center text-sm text-gray-500 italic">
          Analysis Complete - Generated using Advanced AI Strategy Framework
        </div>
      </div>
    </div>
  );
};

/**
 * Formats inline text elements like bold text and currency values
 * @param {string} text - Text to format
 * @returns {JSX.Element|string} Formatted text with inline elements
 */
const formatInlineText = (text) => {
  // First, handle bold text with double underscores (__text__)
  const underscoreBoldRegex = /__(.*?)__/g;
  const boldParts = [];
  
  // Extract bold parts with underscores
  let match;
  while ((match = underscoreBoldRegex.exec(text)) !== null) {
    boldParts.push({
      content: match[1],
      start: match.index,
      end: match.index + match[0].length,
      isStrategy: isStrategyName(match[1])
    });
  }
  
  // Also handle legacy ** bold formatting if it still exists
  const asteriskBoldRegex = /\*\*(.*?)\*\*/g;
  while ((match = asteriskBoldRegex.exec(text)) !== null) {
    boldParts.push({
      content: match[1],
      start: match.index,
      end: match.index + match[0].length,
      isStrategy: isStrategyName(match[1])
    });
  }
  
  // Sort bold parts by position
  boldParts.sort((a, b) => a.start - b.start);
  
  // Split text and format
  if (boldParts.length === 0) {
    // No bold text, just check for currency
    if (text.includes('$')) {
      return formatCurrencyInText(text, 0);
    }
    return text;
  }
  
  const result = [];
  let lastEnd = 0;
  
  boldParts.forEach((boldPart, index) => {
    // Add text before this bold part
    if (boldPart.start > lastEnd) {
      const beforeText = text.substring(lastEnd, boldPart.start);
      if (beforeText.includes('$')) {
        result.push(formatCurrencyInText(beforeText, `before-${index}`));
      } else {
        result.push(beforeText);
      }
    }
    
    // Add the bold part with appropriate styling
    if (boldPart.isStrategy) {
      result.push(
        <span key={`bold-${index}`} className="font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded font-sans border border-blue-200">
          {boldPart.content}
        </span>
      );
    } else {
      result.push(
        <strong key={`bold-${index}`} className="font-bold text-gray-900 font-sans">
          {boldPart.content}
        </strong>
      );
    }
    
    lastEnd = boldPart.end;
  });
  
  // Add remaining text after last bold part
  if (lastEnd < text.length) {
    const afterText = text.substring(lastEnd);
    if (afterText.includes('$')) {
      result.push(formatCurrencyInText(afterText, 'after'));
    } else {
      result.push(afterText);
    }
  }
  
  return result;
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
        <span key={`${index}-${i}`} className="font-mono text-green-700 font-bold bg-green-50 px-1 py-0.5 rounded">
          {matches[i]}
        </span>
      );
    }
  }
  
  return result;
};

/**
 * Checks if a text string contains a known strategy name
 * @param {string} text - Text to check
 * @returns {boolean} True if the text contains a strategy name
 */
const isStrategyName = (text) => {
  const strategyNames = [
    'Quantinno DEALS',
    'DEALS',
    'Section 179',
    '179',
    'Oil & Gas',
    'Oil and Gas',
    'Film Financing',
    'Charitable CLAT',
    'CLAT',
    'QBI',
    'Qualified Business Income',
    'SEP-IRA',
    'Solo 401(k)',
    'Defined Benefit',
    'Cash Balance',
    'Depreciation',
    'Conservation Easement',
    'Solar Investment',
    'Equipment Financing'
  ];
  
  return strategyNames.some(strategyName => 
    text.toLowerCase().includes(strategyName.toLowerCase())
  );
};

export default formatAIAnalysis;
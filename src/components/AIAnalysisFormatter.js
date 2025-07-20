import React from 'react';

/**
 * Formats AI analysis text for display in the strategy interaction section
 * @param {string} text - The raw text from AI analysis
 * @returns {JSX.Element} Formatted JSX elements
 */
export const formatAIAnalysis = (text) => {
  if (!text) return null;

  // Clean up text and preserve the structured format
  const cleanedText = text
    .replace(/\*\*([^*]+)\*\*/g, '__$1__') // Convert ** to __ for bold formatting
    .replace(/^\*\s+/gm, '• ') // Convert any remaining asterisk bullets to proper bullets
    .replace(/\*\s*$/gm, ''); // Remove trailing asterisks

  // Split text into blocks separated by double line breaks to preserve paragraph structure
  const blocks = cleanedText.split('\n\n').filter(block => block.trim());
  
  const formattedContent = blocks.map((block, index) => {
    const trimmedBlock = block.trim();
    
    // Handle ALL CAPS section headers (EXECUTIVE SUMMARY, KEY INSIGHTS, etc.)
    if (/^[A-Z][A-Z\s]+[A-Z]$/.test(trimmedBlock) || 
        (trimmedBlock.startsWith('**') && /^[A-Z][A-Z\s]+[A-Z]$/.test(trimmedBlock.replace(/^\*\*/, '').replace(/\*\*$/, '')))) {
      
      const headerText = trimmedBlock.startsWith('**') ? 
        trimmedBlock.replace(/^\*\*/, '').replace(/\*\*$/, '') : 
        trimmedBlock;
      
      // Different styling for different header types
      if (headerText === 'EXECUTIVE SUMMARY') {
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  📊
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-b"></div>
          </div>
        );
      } else if (headerText.includes('KEY INSIGHTS')) {
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  💡
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-b"></div>
          </div>
        );
      } else if (headerText.includes('STRATEGY') || headerText.includes('SYNERGIES')) {
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  🔗
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-900 to-blue-900 rounded-b"></div>
          </div>
        );
      } else if (headerText.includes('IMPLEMENTATION') || headerText.includes('ROADMAP')) {
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-green-900 to-blue-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  🚀
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-900 to-blue-900 rounded-b"></div>
          </div>
        );
      } else if (headerText.includes('RISK') || headerText.includes('ASSESSMENT')) {
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-red-900 to-orange-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  ⚠️
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-900 to-orange-900 rounded-b"></div>
          </div>
        );
      } else {
        // Default styling for other ALL CAPS headers
        return (
          <div key={index} className="mt-8 mb-6 first:mt-0">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4 rounded-lg shadow-xl border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <h2 className="text-xl font-bold font-serif tracking-wide relative z-10 flex items-center">
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold mr-3">
                  📋
                </span>
                {headerText}
              </h2>
            </div>
            <div className="h-1 bg-gradient-to-r from-slate-800 to-slate-900 rounded-b"></div>
          </div>
        );
      }
    }
    
    // Handle sub-headers (mixed case headers with ** formatting)
    if (trimmedBlock.startsWith('**') && trimmedBlock.endsWith('**') && 
        !/^[A-Z][A-Z\s]+[A-Z]$/.test(trimmedBlock.slice(2, -2))) {
      const headerText = trimmedBlock.slice(2, -2);
      
      return (
        <h3 key={index} className="text-lg font-semibold text-blue-800 mt-8 mb-6 first:mt-0 bg-blue-50 px-6 py-4 rounded-md font-sans border-l-4 border-blue-800 shadow-sm">
          {headerText}
        </h3>
      );
    }
    
    // Handle bullet point blocks (multiple lines starting with bullet points)
    if (trimmedBlock.includes('\n') && (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('• '))) {
      const bulletLines = trimmedBlock.split('\n').filter(line => line.trim());
      return (
        <div key={index} className="mb-8 bg-gray-50 p-6 rounded-lg border-l-4 border-blue-200">
          <ul className="list-disc list-inside space-y-4 ml-2">
            {bulletLines.map((line, lineIndex) => {
              const bulletText = line.trim().replace(/^[-•]\s/, '');
              return (
                <li key={`${index}-${lineIndex}`} className="text-gray-800 leading-loose font-sans text-base pl-3 tracking-wide">
                  {formatInlineText(bulletText)}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    
    // Handle numbered list blocks
    if (trimmedBlock.includes('\n') && /^\d+\.\s/.test(trimmedBlock)) {
      const numberLines = trimmedBlock.split('\n').filter(line => line.trim());
      return (
        <div key={index} className="mb-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-300">
          <ol className="list-decimal list-inside space-y-4 ml-2">
            {numberLines.map((line, lineIndex) => {
              const numberText = line.trim().replace(/^\d+\.\s/, '');
              return (
                <li key={`${index}-${lineIndex}`} className="text-gray-800 leading-loose font-sans text-base pl-3 tracking-wide">
                  {formatInlineText(numberText)}
                </li>
              );
            })}
          </ol>
        </div>
      );
    }
    
    // Handle single line bullet points
    if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('• ')) {
      const bulletText = trimmedBlock.substring(2);
      return (
        <div key={index} className="mb-6 bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
          <ul className="list-disc list-inside">
            <li className="text-gray-800 leading-loose font-sans text-base tracking-wide">
              {formatInlineText(bulletText)}
            </li>
          </ul>
        </div>
      );
    }
    
    // Handle single line numbered items
    if (/^\d+\.\s/.test(trimmedBlock)) {
      const numberText = trimmedBlock.replace(/^\d+\.\s/, '');
      return (
        <div key={index} className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
          <ol className="list-decimal list-inside">
            <li className="text-gray-800 leading-loose font-sans text-base tracking-wide">
              {formatInlineText(numberText)}
            </li>
          </ol>
        </div>
      );
    }
    
    // Handle regular paragraphs (preserve line breaks within paragraphs)
    if (trimmedBlock.length > 0) {
      // Replace single line breaks with spaces to keep sentences together
      const paragraphText = trimmedBlock.replace(/\n/g, ' ').replace(/\s+/g, ' ');
      
      // Check if this is a long paragraph (likely from structured AI output)
      const isLongParagraph = paragraphText.length > 300;
      
      return (
        <div key={index} className={`mb-8 ${isLongParagraph ? 'bg-gray-50 p-6 rounded-lg border-l-4 border-blue-200 shadow-sm' : 'bg-white p-4 rounded-md border border-gray-100'}`}>
          <p className={`text-gray-800 leading-loose text-base font-sans ${isLongParagraph ? 'text-justify font-normal' : 'font-normal'} tracking-wide`}>
            {formatInlineText(paragraphText)}
          </p>
        </div>
      );
    }
    
    return null;
  }).filter(Boolean);

  return (
    <div className="max-w-none font-sans bg-white">
      <div className="space-y-8">
        {formattedContent}
      </div>
      <div className="mt-12 pt-8 border-t-2 border-gray-200">
        <div className="text-center text-sm text-gray-500 italic font-serif">
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
import React from 'react';

// Function to format inline text with enhanced markdown support
const formatInlineText = (text) => {
    if (!text) return '';
    
    // First, clean up any problematic asterisk patterns
    const processedText = text
        // Remove standalone asterisks (4 or more in a row)
        .replace(/\*{4,}/g, '')
        // Clean up any remaining stray asterisks that aren't part of proper markdown
        .replace(/\*{3}/g, '')
        // Fix spacing issues
        .replace(/\s+/g, ' ')
        .trim();
    
    const parts = [];
    let lastIndex = 0;
    
    // Regular expression to match various patterns
    const patterns = [
        { regex: /\*\*([^*]+)\*\*/g, type: 'bold' },
        { regex: /\*([^*]+)\*/g, type: 'italic' },
        { regex: /`([^`]+)`/g, type: 'code' },
        { regex: /\$([0-9,]+(?:\.[0-9]{2})?)/g, type: 'currency' },
        { regex: /([0-9]+(?:\.[0-9]+)?%)/g, type: 'percentage' },
        { regex: /\b(Section \d+|IRC \d+|Form \d+)\b/g, type: 'legal' },
        { regex: /\b(AGI|QBI|AMT|IRA|401k|IRS|LLC|S-Corp|C-Corp)\b/g, type: 'tax-term' }
    ];
    
    // Find all matches and their positions
    const matches = [];
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(processedText)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                content: match[1] || match[0],
                fullMatch: match[0],
                type: pattern.type
            });
        }
    });
    
    // Sort matches by position and remove overlapping matches
    matches.sort((a, b) => a.start - b.start);
    const filteredMatches = [];
    let lastEnd = 0;
    
    matches.forEach(match => {
        if (match.start >= lastEnd) {
            filteredMatches.push(match);
            lastEnd = match.end;
        }
    });
    
    // Process matches and build formatted output
    filteredMatches.forEach((match, index) => {
        // Add text before this match
        if (match.start > lastIndex) {
            parts.push(processedText.substring(lastIndex, match.start));
        }
        
        // Add formatted match
        switch (match.type) {
            case 'bold':
                parts.push(
                    <strong key={`bold-${index}`} className="font-semibold text-gray-900">
                        {match.content}
                    </strong>
                );
                break;
            case 'italic':
                parts.push(
                    <em key={`italic-${index}`} className="italic text-gray-800">
                        {match.content}
                    </em>
                );
                break;
            case 'code':
                parts.push(
                    <code key={`code-${index}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border">
                        {match.content}
                    </code>
                );
                break;
            case 'currency':
                parts.push(
                    <span key={`currency-${index}`} className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md whitespace-nowrap" style={{ display: 'inline-block' }}>
                        ${match.content}
                    </span>
                );
                break;
            case 'percentage':
                parts.push(
                    <span key={`percentage-${index}`} className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md whitespace-nowrap" style={{ display: 'inline-block' }}>
                        {match.content}
                    </span>
                );
                break;
            case 'legal':
                parts.push(
                    <span key={`legal-${index}`} className="font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                        {match.content}
                    </span>
                );
                break;
            case 'tax-term':
                parts.push(
                    <span key={`tax-term-${index}`} className="font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                        {match.content}
                    </span>
                );
                break;
            default:
                parts.push(match.content);
        }
        
        lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < processedText.length) {
        parts.push(processedText.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
};

// Function to format AI analysis text with professional styling
const formatAIAnalysis = (text) => {
    if (!text) return null;
    
    // Clean up the text by removing problematic asterisks
    const cleanedText = text
        .replace(/\*{4,}/g, '') // Remove 4+ asterisks
        .replace(/\*{3}/g, '')  // Remove triple asterisks
        .replace(/(\d+\.\s*)\*+\s*/g, '$1') // Remove asterisks after numbers
        .trim();
    
    // Split the text by section headings (like "**1. Strategy Effectiveness Ranking**")
    const sections = cleanedText.split(/(\*\*[\d\.\s]*[A-Za-z][^*]+\*\*)/g);
    
    // Create an array to hold our formatted sections
    const formattedSections = [];
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
        const part = sections[i].trim();
        
        // Skip empty parts
        if (!part) continue;
        
        // If this is a section heading
        if (part.startsWith('**') && part.endsWith('**')) {
            // Add the section heading as a styled element
            formattedSections.push(
                <div key={`section-${i}`} className="mt-8 mb-4">
                    <h3 className="text-xl font-semibold text-slate-900 pb-2 border-b border-slate-200">
                        {part.replace(/\*\*/g, '')}
                    </h3>
                </div>
            );
        } 
        // If this is section content
        else {
            // Split the content into paragraphs
            const paragraphs = part.split(/\n+/).filter(p => p.trim());
            
            // Process each paragraph
            paragraphs.forEach((paragraph, pIndex) => {
                const trimmedParagraph = paragraph.trim();
                
                // Skip empty paragraphs
                if (!trimmedParagraph) return;
                
                // Handle numbered items (like "1. Text")
                if (/^\d+\.\s/.test(trimmedParagraph)) {
                    const match = trimmedParagraph.match(/^(\d+\.\s*)(.*)$/);
                    if (match) {
                        const [, number, content] = match;
                        formattedSections.push(
                            <div key={`item-${i}-${pIndex}`} className="mb-4">
                                <div className="flex items-start">
                                    <span className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm mr-3 font-semibold mt-0.5">
                                        {number.replace('.', '').trim()}
                                    </span>
                                    <div className="text-slate-700 leading-relaxed flex-1">
                                        <p className="text-base">
                                            {formatInlineText(content)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                }
                // Handle bullet points (like "* Text")
                else if (/^\*\s/.test(trimmedParagraph)) {
                    const content = trimmedParagraph.replace(/^\*\s+/, '');
                    formattedSections.push(
                        <div key={`bullet-${i}-${pIndex}`} className="mb-3 ml-4">
                            <div className="flex items-start">
                                <span className="text-blue-600 mr-3 mt-1.5">•</span>
                                <div className="text-slate-700 leading-relaxed flex-1">
                                    {formatInlineText(content)}
                                </div>
                            </div>
                        </div>
                    );
                }
                // Handle regular paragraphs
                else {
                    formattedSections.push(
                        <div key={`para-${i}-${pIndex}`} className="mb-4">
                            <p className="text-slate-700 leading-relaxed">
                                {formatInlineText(trimmedParagraph)}
                            </p>
                        </div>
                    );
                }
            });
        }
    }
    
    return formattedSections;
};

export { formatAIAnalysis, formatInlineText };
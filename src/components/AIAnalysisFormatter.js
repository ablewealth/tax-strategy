import React from 'react';
import './SwissGridStyles.css';

// Function to format inline text with enhanced styling
const formatInlineText = (text) => {
    if (!text) return '';
    
    // Replace [object Object] with appropriate text based on context
    let processedText = text
        .replace(/\[object Object\] Resident/g, 'New York Resident')
        .replace(/\[object Object\] State Tax/g, 'New York State Tax')
        .replace(/\[object Object\] taxable income/g, 'New York taxable income')
        .replace(/\[object Object\] income tax/g, 'New York income tax')
        .replace(/\[object Object\] conforms/g, 'New York conforms')
        .replace(/\[object Object\] does not conform/g, 'New York does not conform')
        .replace(/\[object Object\]/g, 'New York')  // Replace remaining instances
        .replace(/\*\*/g, '')  // Remove all ** markdown
        .replace(/\*/g, '')     // Remove all * markdown
        .replace(/\s+/g, ' ')   // Fix spacing issues
        .trim();
    
    // Process currency values
    processedText = processedText.replace(/\$([0-9,]+(?:.[0-9]{2})?)/g, (match, amount) => {
        return `<span class="currency">${match}</span>`;
    });
    
    // Process percentages
    processedText = processedText.replace(/([0-9]+(?:.[0-9]+)?%)/g, (match) => {
        return `<span class="percentage">${match}</span>`;
    });
    
    // Process tax terms
    processedText = processedText.replace(/\b(AGI|QBI|AMT|IRA|401k|IRS|LLC|S-Corp|C-Corp)\b/g, (match) => {
        return `<span class="tax-term">${match}</span>`;
    });
    
    // Process legal references
    processedText = processedText.replace(/\b(Section \d+|IRC \d+|Form \d+)\b/g, (match) => {
        return `<span class="legal-ref">${match}</span>`;
    });
    
    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
};

// Function to format AI analysis text with Swiss grid design
const formatAIAnalysis = (text) => {
    if (!text) return null;
    
    // Clean up the text
    const cleanedText = text
        .replace(/\[object Object\]/g, 'New York')  // Replace with appropriate state name
        .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove ** markdown but keep content
        .replace(/\*([^*]+)\*/g, '$1')      // Remove * markdown but keep content
        .trim();
    
    // Split the text by section headings
    const sectionRegex = /^([\d\.\s]*[A-Za-z][^:]+):/gm;
    const sections = cleanedText.split(sectionRegex);
    
    // Create an array to hold our formatted sections
    const formattedSections = [];
    
    // Add the introduction if it exists (text before first section)
    if (sections[0].trim()) {
        formattedSections.push(
            <div key="intro" className="swiss-grid-analysis">
                <div className="section">
                    <div className="section-content">
                        <p className="text-base text-gray-700 leading-relaxed">
                            {formatInlineText(sections[0].trim())}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    
    // Process each section
    for (let i = 1; i < sections.length; i += 2) {
        if (sections[i] && sections[i+1]) {
            const sectionTitle = sections[i].trim();
            const sectionContent = sections[i+1].trim();
            
            // Split the content into paragraphs
            const paragraphs = sectionContent.split(/\n+/).filter(p => p.trim());
            
            formattedSections.push(
                <div key={`section-${i}`} className="swiss-grid-analysis">
                    <div className="section">
                        <div className="section-header">
                            <h3 className="section-title">{sectionTitle}</h3>
                        </div>
                        <div className="section-content">
                            {paragraphs.map((paragraph, pIndex) => {
                                const trimmedParagraph = paragraph.trim();
                                
                                // Skip empty paragraphs
                                if (!trimmedParagraph) return null;
                                
                                // Handle numbered items (like "1. Text")
                                if (/^\d+\.\s/.test(trimmedParagraph)) {
                                    const match = trimmedParagraph.match(/^(\d+\.\s*)(.*)$/);
                                    if (match) {
                                        const [, number, content] = match;
                                        return (
                                            <div key={`item-${i}-${pIndex}`} className="ranking-item">
                                                <div className="ranking-left">
                                                    <div className="ranking-number">{number.replace('.', '').trim()}</div>
                                                    <div className="ranking-strategy">{formatInlineText(content)}</div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    // If match fails, treat as regular paragraph
                                    return (
                                        <div key={`para-${i}-${pIndex}`} className="mb-4">
                                            <p className="text-base text-gray-700 leading-relaxed">
                                                {formatInlineText(trimmedParagraph)}
                                            </p>
                                        </div>
                                    );
                                }
                                // Handle bullet points (like "- Text")
                                else if (/^[-•]\s/.test(trimmedParagraph)) {
                                    const content = trimmedParagraph.replace(/^[-•]\s+/, '');
                                    return (
                                        <div key={`bullet-${i}-${pIndex}`} className="card">
                                            <div className="card-content">
                                                {formatInlineText(content)}
                                            </div>
                                        </div>
                                    );
                                }
                                // Handle regular paragraphs
                                else {
                                    return (
                                        <div key={`para-${i}-${pIndex}`} className="mb-4">
                                            <p className="text-base text-gray-700 leading-relaxed">
                                                {formatInlineText(trimmedParagraph)}
                                            </p>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            );
        }
    }
    
    return (
        <div className="swiss-grid-analysis">
            <style>
                {`
                .swiss-grid-analysis .currency {
                    font-weight: 600;
                    color: #059669;
                    background: #ecfdf5;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    border: 1px solid #d1fae5;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    display: inline-block;
                }
                .swiss-grid-analysis .percentage {
                    font-weight: 600;
                    color: #1e40af;
                    background: #eff6ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    border: 1px solid #bfdbfe;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    display: inline-block;
                }
                .swiss-grid-analysis .tax-term {
                    font-weight: 600;
                    color: #4f46e5;
                    background: #eef2ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    border: 1px solid #c7d2fe;
                    display: inline-block;
                }
                .swiss-grid-analysis .legal-ref {
                    font-weight: 600;
                    color: #7c3aed;
                    background: #f5f3ff;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    border: 1px solid #ddd6fe;
                    display: inline-block;
                }
                `}
            </style>
            <div className="grid-container">
                <div className="grid-full">
                    {formattedSections}
                </div>
            </div>
        </div>
    );
};

export { formatAIAnalysis, formatInlineText };
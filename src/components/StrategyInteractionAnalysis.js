import React, { useState, useEffect, useMemo } from 'react';
import { RETIREMENT_STRATEGIES, STRATEGY_LIBRARY } from '../constants';
import Section from './Section';

// Function to format AI analysis text with professional styling
const formatAIAnalysis = (text) => {
    if (!text) return null;
    
    // Split text into paragraphs and format each part
    const parts = text.split('\n').filter(part => part.trim());
    
    return parts.map((part, index) => {
        const trimmedPart = part.trim();
        
        // Handle numbered sections (1., 2., etc.) with bold titles
        if (/^\d+\.\s*\*\*/.test(trimmedPart)) {
            const match = trimmedPart.match(/^(\d+\.\s*)(\*\*[^*]+\*\*)(.*)$/);
            if (match) {
                const [, number, title, content] = match;
                return (
                    <div key={index} className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400 shadow-sm">
                        <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                            <span className="bg-blue-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm mr-3">
                                {number.replace('.', '')}
                            </span>
                            {title.replace(/\*\*/g, '')}
                        </h4>
                        <div className="text-gray-700 leading-relaxed pl-10">
                            {formatInlineText(content)}
                        </div>
                    </div>
                );
            }
        }
        
        // Handle main headings with **text**
        if (/^\*\*[^*]+\*\*/.test(trimmedPart) && !trimmedPart.includes(':')) {
            return (
                <div key={index} className="mb-5 mt-7">
                    <h3 className="text-xl font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-200 inline-block">
                        {trimmedPart.replace(/\*\*/g, '')}
                    </h3>
                </div>
            );
        }
        
        // Handle subheadings with **text:** pattern
        if (/^\*\*[^*]+:\*\*/.test(trimmedPart)) {
            const content = trimmedPart.replace(/^\*\*([^*]+):\*\*\s*/, '');
            const heading = trimmedPart.match(/^\*\*([^*]+):\*\*/)[1];
            return (
                <div key={index} className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h5 className="text-base font-semibold text-blue-800 mb-2 flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {heading}:
                    </h5>
                    <div className="text-gray-700 leading-relaxed pl-4">
                        {formatInlineText(content)}
                    </div>
                </div>
            );
        }
        
        // Handle quotes or important callouts (lines starting with ">")
        if (trimmedPart.startsWith('>')) {
            const content = trimmedPart.replace(/^>\s*/, '');
            return (
                <div key={index} className="mb-4 border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-yellow-800 leading-relaxed">
                            {formatInlineText(content)}
                        </div>
                    </div>
                </div>
            );
        }
        
        // Handle bullet points with enhanced styling
        if (trimmedPart.startsWith('*   ') || trimmedPart.startsWith('* ')) {
            const content = trimmedPart.replace(/^\*\s*/, '');
            return (
                <div key={index} className="flex items-start mb-3 pl-4">
                    <span className="text-blue-600 mr-3 mt-1 text-lg">•</span>
                    <div className="text-gray-700 leading-relaxed flex-1">
                        {formatInlineText(content)}
                    </div>
                </div>
            );
        }
        
        // Handle numbered lists
        if (/^\d+\.\s/.test(trimmedPart) && !trimmedPart.includes('**')) {
            const match = trimmedPart.match(/^(\d+\.\s)(.*)$/);
            if (match) {
                const [, number, content] = match;
                return (
                    <div key={index} className="flex items-start mb-3 pl-4">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5 font-medium">
                            {number.replace('.', '')}
                        </span>
                        <div className="text-gray-700 leading-relaxed flex-1">
                            {formatInlineText(content)}
                        </div>
                    </div>
                );
            }
        }
        
        // Handle regular paragraphs with better spacing
        if (trimmedPart.length > 0) {
            return (
                <div key={index} className="mb-4 p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed text-base">
                        {formatInlineText(trimmedPart)}
                    </p>
                </div>
            );
        }
        
        return null;
    }).filter(Boolean);
};

// Function to format inline text with enhanced markdown support
const formatInlineText = (text) => {
    if (!text) return '';
    
    // Handle multiple formatting patterns
    let processedText = text;
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
                    <span key={`currency-${index}`} className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        ${match.content}
                    </span>
                );
                break;
            case 'percentage':
                parts.push(
                    <span key={`percentage-${index}`} className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
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

const StrategyInteractionAnalysis = ({ scenario }) => {
    const [interactionExplanation, setInteractionExplanation] = useState('');
    const [loadingInteraction, setLoadingInteraction] = useState(false);
    const [interactionError, setInteractionError] = useState('');

    const allStrategies = useMemo(() => [...STRATEGY_LIBRARY, ...RETIREMENT_STRATEGIES], []);
    const enabledStrategies = useMemo(() => {
        return allStrategies.filter(strategy => {
            const isEnabled = scenario?.enabledStrategies?.[strategy.id];
            const inputValue = scenario?.clientData?.[strategy.inputRequired];
            return isEnabled && typeof inputValue === 'number' && inputValue > 0;
        });
    }, [allStrategies, scenario?.enabledStrategies, scenario?.clientData]);

    useEffect(() => {
        const fetchInteractionExplanation = async () => {
            if (enabledStrategies.length > 1) {
                setLoadingInteraction(true);
                setInteractionError('');
                try {
                    const strategyDetails = enabledStrategies.map(s => `${s.name}: ${s.description}`).join('\n');
                    const prompt = `Explain how the following tax strategies might interact with each other and their combined impact on tax optimization. Focus on potential synergies or conflicts. Strategies:\n${strategyDetails}\n\nProvide a concise explanation.`;
                    
                    const chatHistory = [];
                    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                    const payload = { contents: chatHistory };
                    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
                    
                    if (!apiKey) {
                        setInteractionError('AI analysis is not configured. To enable strategy interaction analysis, please set up your Gemini API key in the .env file.');
                        setLoadingInteraction(false);
                        return;
                    }
                    
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    if (result.candidates && result.candidates.length > 0 &&
                        result.candidates[0].content && result.candidates[0].content.parts &&
                        result.candidates[0].content.parts.length > 0) {
                        setInteractionExplanation(result.candidates[0].content.parts[0].text);
                    } else {
                        setInteractionError('Failed to generate interaction explanation.');
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        setInteractionError('Request timed out. Strategy interaction analysis is unavailable.');
                    } else {
                        setInteractionError(`Error fetching interaction explanation: ${error.message}`);
                    }
                } finally {
                    setLoadingInteraction(false);
                }
            } else {
                setInteractionExplanation('');
                setInteractionError('');
                setLoadingInteraction(false);
            }
        };

        fetchInteractionExplanation();
    }, [enabledStrategies]);

    // Don't render if no strategies or only one strategy
    if (enabledStrategies.length <= 1) {
        return null;
    }

    return (
        <Section 
            title="🤖 AI Strategy Analysis" 
            description="Understanding how your selected tax strategies work together"
        >
            {loadingInteraction ? (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
                    <div className="flex items-center justify-center py-8">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                            <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-spin" style={{animationDuration: '1.5s'}}></div>
                        </div>
                        <div className="ml-4">
                            <div className="text-lg font-semibold text-blue-900 mb-1">
                                AI Analysis in Progress
                            </div>
                            <div className="text-sm text-blue-700">
                                Analyzing strategy interactions and synergies...
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 bg-white rounded-lg p-4 border border-blue-100">
                        <div className="text-sm text-gray-600 mb-3">
                            <strong>Selected Strategies:</strong>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {enabledStrategies.map((strategy, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {strategy.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            ) : interactionError ? (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-red-900 mb-2">AI Analysis Unavailable</h4>
                            <p className="text-red-800 mb-4 leading-relaxed">{interactionError}</p>
                            
                            {interactionError.includes('API key') && (
                                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                                    <h5 className="font-medium text-red-900 mb-2">Setup Required</h5>
                                    <p className="text-sm text-red-800 mb-3">
                                        To enable AI-powered strategy analysis, you'll need to configure your Gemini API key.
                                    </p>
                                    <div className="text-xs text-red-700 space-y-1">
                                        <p>• Create a <code className="bg-red-200 px-1 rounded">.env</code> file in your project root</p>
                                        <p>• Add: <code className="bg-red-200 px-1 rounded">REACT_APP_GEMINI_API_KEY=your_api_key_here</code></p>
                                        <p>• Restart your development server</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                <h5 className="font-medium text-gray-900 mb-2">Selected Strategies:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {enabledStrategies.map((strategy, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            {strategy.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : interactionExplanation ? (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 shadow-lg">
                        <div className="mb-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-2 mr-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.953-1.382l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">AI Strategy Analysis</h3>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Advanced analysis of how your selected tax strategies complement each other
                            </p>
                        </div>
                        
                        <div className="prose prose-lg max-w-none">
                            <div className="ai-analysis-content space-y-4">
                                {formatAIAnalysis(interactionExplanation)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Analysis powered by Google Gemini AI</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secure & Private</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                    <div className="mb-6">
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a9 9 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.953-1.382l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Strategy Analysis</h3>
                        <p className="text-gray-600 mb-4">
                            Select multiple tax strategies to unlock AI-powered interaction analysis
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-md mx-auto">
                        <div className="text-sm text-gray-600 mb-4">
                            <strong>How it works:</strong>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                                <span>Choose 2 or more tax strategies</span>
                            </div>
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                                <span>AI analyzes potential synergies and conflicts</span>
                            </div>
                            <div className="flex items-start">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                                <span>Get professional insights on optimization</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Section>
    );
};

export default StrategyInteractionAnalysis;

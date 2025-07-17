const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');
const { parseTaxStrategyFramework, readTaxStrategyFramework, generateAIPrompt } = require('./taxStrategyFramework');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// Endpoint to get tax strategy framework data
app.get('/api/tax-framework', (req, res) => {
    try {
        const frameworkContent = readTaxStrategyFramework();
        const parsedFramework = parseTaxStrategyFramework(frameworkContent);
        
        if (!parsedFramework) {
            return res.status(404).json({ error: 'Tax strategy framework not found' });
        }
        
        res.json(parsedFramework);
    } catch (error) {
        console.error('Error retrieving tax framework:', error);
        res.status(500).json({ error: 'Failed to retrieve tax strategy framework' });
    }
});

// Enhanced Gemini API endpoint with tax framework integration
app.post('/api/gemini', async (req, res) => {
    const { prompt, clientState, enabledStrategies, useFramework } = req.body;

    if (!prompt && !useFramework) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'API key not configured on server',
                message: 'The Gemini API key is not configured on the server. Please add it to your .env file.'
            });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // Prepare the request payload
        const chatHistory = [];
        
        // If useFramework is true, generate a prompt based on the tax framework
        let finalPrompt;
        
        if (useFramework && clientState && enabledStrategies) {
            try {
                finalPrompt = generateAIPrompt(clientState, enabledStrategies);
                console.log('Generated framework-based prompt');
            } catch (error) {
                console.error('Error generating framework-based prompt:', error);
                // Fall back to the provided prompt
                finalPrompt = prompt || "You are a professional tax strategist analyzing multiple tax strategies for a client. Generate a concise, professional analysis focusing on strategy interactions, state-specific impacts, and optimal implementation sequencing.";
                console.log('Falling back to provided prompt');
            }
        } else {
            finalPrompt = prompt || "You are a professional tax strategist analyzing multiple tax strategies for a client. Generate a concise, professional analysis focusing on strategy interactions, state-specific impacts, and optimal implementation sequencing.";
            console.log('Using provided prompt');
        }
            
        if (!finalPrompt) {
            console.log('No prompt available after all attempts, using default prompt');
            finalPrompt = "You are a professional tax strategist analyzing multiple tax strategies for a client. Generate a concise, professional analysis focusing on strategy interactions, state-specific impacts, and optimal implementation sequencing.";
        }
        
        console.log('Final prompt ready for API call');
        
        chatHistory.push({ role: "user", parts: [{ text: finalPrompt }] });
        const payload = { contents: chatHistory };

        // Make the API call
        const response = await axios.post(apiUrl, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000 // 30 second timeout
        });

        // Extract and return the response
        if (response.data.candidates && response.data.candidates.length > 0 &&
            response.data.candidates[0].content && response.data.candidates[0].content.parts &&
            response.data.candidates[0].content.parts.length > 0) {
            res.json({ 
                response: response.data.candidates[0].content.parts[0].text,
                prompt: finalPrompt // Include the prompt used for debugging
            });
        } else {
            res.status(500).json({ error: 'Invalid response format from Gemini API' });
        }
    } catch (error) {
        console.error('Gemini API error:', error.message);
        
        // Provide helpful error messages based on error type
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            if (status === 403) {
                return res.status(403).json({ 
                    error: 'API key invalid or unauthorized',
                    message: 'The Gemini API key appears to be invalid or unauthorized. Please check your API key.'
                });
            } else if (status === 429) {
                return res.status(429).json({ 
                    error: 'Rate limit exceeded',
                    message: 'The Gemini API rate limit has been exceeded. Please try again later.'
                });
            }
            return res.status(status).json({ 
                error: `API error: ${status}`,
                message: error.response.data?.error?.message || 'Unknown API error'
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(504).json({ 
                error: 'API timeout',
                message: 'The Gemini API request timed out. Please try again later.'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({ 
                error: 'Request configuration error',
                message: error.message
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Root path handler
app.get('/', (req, res) => {
    res.send('Tax Strategy Optimizer API Server is running. Use /api/health to check status.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
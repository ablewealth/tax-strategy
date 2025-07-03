// api/anthropic.js - Vercel Serverless Function
export default async function handler(req, res) {
    // Enable CORS for your domain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, clientData, baseline, withStrategies } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return res.status(500).json({ 
                error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.' 
            });
        }

        console.log('Making request to Anthropic API...');
        
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 3000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!anthropicResponse.ok) {
            const errorText = await anthropicResponse.text();
            console.error('Anthropic API error:', anthropicResponse.status, errorText);
            throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
        }

        const data = await anthropicResponse.json();
        console.log('Successfully received response from Anthropic API');
        
        return res.status(200).json({
            success: true,
            content: data.content[0].text
        });

    } catch (error) {
        console.error('Error in API function:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

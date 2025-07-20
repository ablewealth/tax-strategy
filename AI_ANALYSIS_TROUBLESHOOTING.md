# AI Analysis Troubleshooting Guide

## Problem: "Analysis Error - AI analysis temporarily unavailable: Failed to fetch"

This error occurs when the AI analysis feature cannot connect to the backend server or the Gemini API. Here's how to diagnose and fix it:

## Quick Diagnosis

Run the diagnostic script to identify issues:

```bash
node debug-ai-analysis.js
```

## Common Issues and Solutions

### 1. Backend Server Not Running

**Symptoms:**
- "Failed to fetch" error
- AI analysis button shows error immediately

**Solution:**
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm start
```

The server should start on `http://localhost:3001`. You should see:
```
Server is running on http://localhost:3001
```

### 2. Missing Environment Configuration

**Symptoms:**
- "Backend URL not configured" error
- Server starts but API calls fail

**Solution:**

Create the frontend `.env` file:
```bash
# In project root
cp .env.example .env
```

Create the backend `.env` file:
```bash
# In project root
cp backend/.env.example backend/.env
```

### 3. Gemini API Key Not Configured

**Symptoms:**
- "API key not configured on server" error
- Backend server runs but API calls fail

**Solution:**

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Edit `backend/.env` and replace `your_api_key_here` with your actual API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

3. Restart the backend server:
```bash
cd backend
npm start
```

### 4. Port Conflicts

**Symptoms:**
- Backend server fails to start
- "Port already in use" error

**Solution:**

Check if port 3001 is in use:
```bash
lsof -i :3001
```

If another process is using port 3001, either:
- Kill the other process
- Change the port in `backend/.env`:
```env
PORT=3002
```
- Update frontend `.env` to match:
```env
REACT_APP_BACKEND_URL=http://localhost:3002
```

### 5. CORS Issues

**Symptoms:**
- "CORS policy" errors in browser console
- API calls blocked by browser

**Solution:**

The backend is configured to allow CORS, but if you're running on different ports or domains, update the CORS configuration in `backend/server.js`.

### 6. API Rate Limits

**Symptoms:**
- "Rate limit exceeded" error
- API works initially then fails

**Solution:**

The Gemini API has rate limits. If you hit them:
- Wait a few minutes before trying again
- Consider upgrading your API plan
- The app will automatically show a fallback analysis

## Step-by-Step Setup Process

### 1. Initial Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
```

### 2. Configure API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Edit `backend/.env`:
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
```

### 3. Start Services

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
npm start
```

### 4. Test the Setup

1. Open the app in your browser
2. Configure some client data and enable multiple tax strategies
3. Click "Generate AI Analysis"
4. You should see the analysis loading and then display results

## Debugging Commands

### Check Backend Health
```bash
curl http://localhost:3001/api/health
```

### Test API Directly
```bash
curl -X POST http://localhost:3001/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test connection"}'
```

### Check Environment Variables
```bash
# Frontend
cat .env

# Backend
cat backend/.env
```

### Check Running Processes
```bash
# Check if backend is running
ps aux | grep node | grep server.js

# Check port usage
lsof -i :3001
```

## Fallback Analysis

If the AI service is temporarily unavailable, the app provides a comprehensive fallback analysis. This includes:

- Strategy-specific calculations
- State tax implications
- Implementation recommendations
- Risk assessments

To manually trigger fallback analysis, click "Show Basic Analysis" when the AI service fails.

## Advanced Troubleshooting

### Network Issues

If you're behind a corporate firewall or proxy:

1. Check if `generativelanguage.googleapis.com` is accessible
2. Configure proxy settings if needed
3. Consider using a VPN if the API is blocked

### API Key Issues

Common API key problems:

1. **Invalid key format**: Ensure no extra spaces or characters
2. **Restricted key**: Check API key restrictions in Google Cloud Console
3. **Quota exceeded**: Monitor usage in Google Cloud Console

### Performance Issues

If analysis is slow:

1. Check your internet connection
2. Monitor API response times
3. Consider the complexity of your prompt (more strategies = longer analysis)

## Getting Help

If you're still experiencing issues:

1. Run the diagnostic script: `node debug-ai-analysis.js`
2. Check the browser console for JavaScript errors
3. Check the backend server logs for API errors
4. Verify your Gemini API key is valid and has quota remaining

## Security Notes

- Never commit API keys to version control
- Keep your `.env` files in `.gitignore`
- Regularly rotate your API keys
- Monitor API usage for unexpected activity

## Performance Optimization

- The backend caches framework data for better performance
- API calls timeout after 30 seconds to prevent hanging
- Fallback analysis is generated locally for reliability
- Multiple model fallbacks (gemini-2.5-pro → gemini-2.0-flash)
# Tax Strategy Optimizer Backend

This backend server provides a secure proxy for the Gemini API, ensuring that API keys are not exposed in the frontend code.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

3. Add your Gemini API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   ```

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### POST /api/gemini
Securely proxies requests to the Gemini API.

**Request Body:**
```json
{
  "prompt": "Your prompt text here"
}
```

**Response:**
```json
{
  "response": "AI-generated response text"
}
```

### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Security Features

- API keys are stored securely in environment variables
- CORS protection
- Error handling with informative messages
- Request timeout handling

## Integration with Frontend

The frontend should be configured to use this backend by setting the `REACT_APP_BACKEND_URL` environment variable in the frontend's `.env` file:

```
REACT_APP_BACKEND_URL=http://localhost:3001
```

This ensures that all AI analysis requests are securely proxied through the backend server.
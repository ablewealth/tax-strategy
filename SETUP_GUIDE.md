# Tax Strategy Optimizer Setup Guide

This guide provides step-by-step instructions for setting up and running the Tax Strategy Optimizer application with secure API key handling.

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- A Gemini API key (for AI analysis features)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ablewealth/tax-strategy.git
cd tax-strategy
```

### 2. Frontend Setup

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Create a frontend `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Configure the backend URL in the `.env` file:
   ```
   REACT_APP_BACKEND_URL=http://localhost:3001
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a backend `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your Gemini API key to the backend `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   ```

### 4. Start the Application

1. Start the backend server (in the backend directory):
   ```bash
   npm start
   ```

2. In a new terminal, start the frontend development server (in the project root):
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Verifying the Setup

1. The application should load with the Environment Configuration panel showing "Backend Connection: Connected ✅"
2. Try generating an AI analysis by selecting multiple tax strategies and clicking "Generate AI Analysis"

## Troubleshooting

### Backend Connection Issues

If the frontend cannot connect to the backend:

1. Verify the backend server is running
2. Check that the `REACT_APP_BACKEND_URL` in the frontend `.env` file matches the backend server address
3. Ensure there are no CORS issues (the backend is configured to allow requests from the frontend)

### AI Analysis Issues

If the AI analysis feature is not working:

1. Verify your Gemini API key is correctly set in the backend `.env` file
2. Check the backend console for any API-related errors
3. Ensure you have selected at least two tax strategies before generating an analysis

## Production Deployment

For production deployment:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set up the backend on your production server with the appropriate environment variables
3. Configure your web server to serve the frontend build files and proxy API requests to the backend

## Security Notes

- Never commit your `.env` files to version control
- For GitHub Actions deployment, use GitHub Secrets to store your API keys
- Consider setting up API key restrictions in the Google Cloud Console
# Professional Tax Strategy Calculator

A sophisticated tax optimization platform designed for wealth management firms and high-net-worth clients.

## Features

- 🧮 Real-time tax calculations and optimizations
- 🤖 AI-powered strategic insights using Anthropic Claude
- 📊 Interactive charts and analysis
- 💼 Professional wealth management interface
- ⚡ Multiple tax strategy implementations

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tax-strategy-calculator)

## Manual Deployment Steps

### 1. Fork/Clone this repository

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Import your repository
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Deploy!

### 3. Set up Environment Variables

In Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add: `ANTHROPIC_API_KEY` = `your_actual_api_key`

### 4. Get Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login
3. Go to API Keys section
4. Create new key
5. Copy the key to Vercel environment variables

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tax-strategy-calculator.git
cd tax-strategy-calculator
```

2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Create `.env.local` file:
```bash
ANTHROPIC_API_KEY=your_api_key_here
```

4. Run development server:
```bash
vercel dev
```

5. Open http://localhost:3000

## Alternative Deployment Options

### Netlify
- Connect GitHub repository
- Add environment variable: `ANTHROPIC_API_KEY`
- Use `netlify/functions/anthropic.js` instead of `api/anthropic.js`

### Railway
```bash
railway login
railway init
railway up
```

### Render
- Connect GitHub repository
- Set environment variable
- Deploy as static site with API routes

## Security Notes

- ✅ API keys are stored securely in environment variables
- ✅ No sensitive data exposed in frontend
- ✅ CORS properly configured
- ✅ Request validation implemented

## Support

For issues or questions, please open a GitHub issue or contact support.

## License

MIT License - see LICENSE file for details.

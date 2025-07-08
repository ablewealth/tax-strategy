# 🔐 Google API Key Security Guide

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Regenerate Your API Key
Your current API key has been exposed and should be regenerated immediately:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Delete the current key**: ``
3. **Create a new API key**
4. **Update your local `.env` file** with the new key

### 2. Verify .gitignore Protection
✅ Your `.gitignore` already includes `.env` - this prevents local environment files from being committed.

### 3. Set Up GitHub Secrets (for Production)
1. Go to your GitHub repository: `https://github.com/ablewealth/tax-strategy`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GEMINI_API_KEY`
5. Value: `[your new API key]`
6. Click **Add secret**

## 🛡️ SECURITY BEST PRACTICES

### Environment Variable Security
- ✅ Never commit API keys to version control
- ✅ Use `.env` files for local development
- ✅ Use GitHub Secrets for production deployment
- ✅ Use different API keys for development vs production

### API Key Restrictions
Set up API key restrictions in Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click **Edit**
4. Add **Application restrictions**:
   - HTTP referrers: `https://ablewealth.github.io/*`
   - HTTP referrers: `http://localhost:3000/*` (for development)
5. Add **API restrictions**:
   - Select **Restrict key**
   - Choose **Generative Language API**

### Monitor API Usage
- Set up billing alerts in Google Cloud Console
- Monitor API usage regularly
- Set daily quotas to prevent abuse

## 🚀 PRODUCTION DEPLOYMENT

### GitHub Actions Setup
Your workflow is now configured to use GitHub Secrets:

```yaml
env:
  REACT_APP_GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

### Testing the Setup
1. **Local Development**: Use `.env` file with new API key
2. **Production**: API key comes from GitHub Secrets
3. **Fallback**: App continues to work without API key (AI features disabled)

## 📝 NEXT STEPS

1. **Regenerate API key** (most important)
2. **Update local `.env` file**
3. **Add GitHub Secret**
4. **Test deployment**
5. **Set up API restrictions**

## 🔍 VERIFICATION

After completing these steps, verify:
- [ ] New API key generated
- [ ] Local `.env` updated
- [ ] GitHub Secret added
- [ ] API restrictions configured
- [ ] Application works in both dev and production
- [ ] AI features work with valid API key
- [ ] AI features gracefully fall back when API key is missing

## 📞 SUPPORT

If you need help with any of these steps, the security configuration is critical for protecting your API usage and preventing unauthorized access to your Gemini API key.

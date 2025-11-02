# Vercel Deployment Setup Guide

## Required Environment Variables

Add these environment variables in your Vercel dashboard:

### Steps to Add Environment Variables:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable below:

### Frontend Environment Variables:

```
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=https://your-backend-url.com
```

### Important Notes:

1. **VITE_ prefix required**: All environment variables for Vite must start with `VITE_`
2. **Redeploy after adding**: After adding environment variables, Vercel will automatically redeploy
3. **Environment selection**: You can set variables for:
   - Production
   - Preview
   - Development

### Getting Your API Keys:

1. **Google API Key** (for Gemini AI):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable "Generative Language API"
   - Create API key in "Credentials"

2. **Google Maps API Key**:
   - Same Google Cloud Console
   - Enable "Maps JavaScript API" and "Places API"
   - Use the same API key or create a separate one

3. **Google Client ID** (for OAuth):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add your Vercel domain to authorized redirect URIs

### Backend Deployment:

The backend (`server/`) needs to be deployed separately:

**Recommended Platforms:**
- **Render** (free tier): https://render.com
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com

After deploying backend, update `VITE_API_BASE_URL` with your backend URL.

### Troubleshooting:

**Error: "API Key not configured"**
- Check that `VITE_GOOGLE_API_KEY` is set in Vercel
- Ensure the variable name is correct (case-sensitive)
- Redeploy after adding environment variables

**404 Errors:**
- Check that `vercel.json` exists in your project root
- Ensure `dist` folder is being generated during build

**Chatbot not working:**
- Verify `VITE_GOOGLE_API_KEY` is set
- Check browser console for errors
- Ensure API key has proper permissions in Google Cloud Console


# Google API Key Setup for Vercel Deployment

## Issue: API Key HTTP Referrer Restriction (403 Error)

Your Google API key is restricted to specific HTTP referrers (domains), and your Vercel domain needs to be added to the allowed list.

## Step-by-Step Fix:

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Select Your Project
- Click the project dropdown at the top
- Select project: `807419033377` (or find your project)

### 3. Navigate to API Credentials
- Go to: **APIs & Services** → **Credentials**
- Find your API key: `AIzaSyCbt1BCE0vc9rGaiJxSSckNfm8pNVQIFhE`
- Click on the API key name to edit it

### 4. Update Application Restrictions
- Under **Application restrictions**, select: **HTTP referrers (web sites)**
- Click **Add an item**

### 5. Add Your Vercel Domains

Add these referrers (one per line):

```
https://arogya-ai-orcin.vercel.app/*
https://*.vercel.app/*
https://arogya-ai-orcin.vercel.app
```

**Important:** Add ALL of these patterns:
1. `https://arogya-ai-orcin.vercel.app/*` - Your specific Vercel preview URL
2. `https://*.vercel.app/*` - All Vercel preview deployments (wildcard)
3. `https://arogya-ai-orcin.vercel.app` - Without wildcard (if you have a custom domain)

### 6. Add Your Custom Domain (if you have one)
If you've connected a custom domain, also add:
```
https://yourdomain.com/*
https://www.yourdomain.com/*
```

### 7. Save Changes
- Click **Save** at the bottom
- Wait 1-2 minutes for changes to propagate

### 8. Test
- Go back to your Vercel site
- Refresh the page
- Try the chatbot again

## Quick Copy-Paste List for HTTP Referrers:

Copy and paste these into the "HTTP referrers" section:

```
https://arogya-ai-orcin.vercel.app/*
https://*.vercel.app/*
http://localhost:5173/*
http://localhost:5173
http://localhost:4000/*
http://localhost:4000
```

**Note:** The localhost entries allow local development to work.

## For Multiple Environments:

If you have production and preview URLs, add:
- `https://your-project-name.vercel.app/*`
- `https://your-project-name-git-main.vercel.app/*` (if you use branch-specific deployments)

## Troubleshooting:

**Still getting 403 error?**
1. Check that you clicked **Save** after adding referrers
2. Wait 2-3 minutes for Google to update restrictions
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Verify the exact domain in the error message matches what you added

**API Key not found?**
- Make sure you're in the correct Google Cloud project
- Check the API key value matches: `AIzaSyCbt1BCE0vc9rGaiJxSSckNfm8pNVQIFhE`

**Still not working?**
- Try removing all restrictions temporarily to test
- Then add restrictions back one by one
- Make sure there are no typos in the domain URLs


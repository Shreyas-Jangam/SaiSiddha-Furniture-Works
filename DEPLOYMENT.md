# Vercel Deployment Guide

This document provides instructions for deploying this React + Vite application to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Git repository connected to Vercel
- Supabase project credentials

## Environment Variables

Before deploying, ensure the following environment variables are set in your Vercel project settings:

```
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
```

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate value
4. Select the environments (Production, Preview, Development)

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

1. Connect your Git repository to Vercel
2. Push changes to your main branch
3. Vercel will automatically build and deploy

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Method 3: Manual Deployment

```bash
# Build the project locally
npm run build

# Deploy the dist folder using Vercel CLI
vercel --prod
```

## Build Configuration

The project uses the following build settings (configured in `vercel.json`):

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite
- **Node Version**: 18.x (recommended)

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test all routes (SPA routing is configured)
- [ ] Check admin authentication flow
- [ ] Verify Supabase connection
- [ ] Test responsive design on mobile devices
- [ ] Check browser console for errors
- [ ] Verify asset loading (images, fonts)

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: The `vercel.json` includes rewrites to handle SPA routing. Ensure it's committed to your repository.

### Issue: Environment variables not working
**Solution**: 
- Ensure variables are prefixed with `VITE_`
- Redeploy after adding/updating environment variables
- Check that variables are set for the correct environment

### Issue: Build fails
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

## Performance Optimization

The application includes:
- Code splitting for vendor, UI, and Supabase chunks
- Asset caching headers (1 year for static assets)
- Minification using Terser
- Tree shaking for unused code

## Monitoring

After deployment, monitor:
- Build times in Vercel dashboard
- Runtime errors in Vercel Analytics
- Performance metrics
- API response times from Supabase

## Support

For issues specific to:
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **Vite**: https://vitejs.dev/guide/

## Rollback

To rollback to a previous deployment:
1. Go to Vercel Dashboard → Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"

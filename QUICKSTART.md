# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_PROJECT_ID=ggjljustbsrnkaaxgzab
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnamxqdXN0YnNybmthYXhnemFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDEwNzgsImV4cCI6MjA4NDI3NzA3OH0.l3AO0hBH38-WNziK7l_7jxffkoYVEm45Ec7Ewsr2Uso
VITE_SUPABASE_URL=https://ggjljustbsrnkaaxgzab.supabase.co
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:8080` in your browser.

### Step 4: Build for Production
```bash
npm run build
```

### Step 5: Deploy to Vercel

#### Option A: Connect Git Repository (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Add environment variables in project settings
6. Deploy!

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
npm run deploy
```

## 📝 Important Notes

### Environment Variables in Vercel
After importing your project, add these environment variables in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
3. Select all environments (Production, Preview, Development)
4. Save and redeploy

### First Deployment Checklist
- [ ] Repository pushed to Git
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible
- [ ] Admin login working
- [ ] Supabase connection verified

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm test               # Run tests
npm run lint           # Check code quality

# Deployment
npm run deploy         # Deploy to production
npm run deploy:preview # Deploy preview
```

## 🌐 Access Points

After deployment:
- **Public Site**: `https://your-project.vercel.app/`
- **Admin Panel**: `https://your-project.vercel.app/admin/login`
- **About Page**: `https://your-project.vercel.app/about`
- **Treatments**: `https://your-project.vercel.app/treatments`
- **Terms**: `https://your-project.vercel.app/terms`

## 🆘 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Check [README.md](./README.md) for full documentation
- Review Vercel build logs for errors
- Verify environment variables are set correctly

## 🎉 You're Ready!

Your application is now ready to be deployed to Vercel. Follow the steps above and you'll be live in minutes!

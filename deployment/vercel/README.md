# Deploying CivicPulse Frontend on Vercel

Follow these steps for a zero-friction deployment to Vercel:

1. **Import Git Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
   - Select your repository: `jagannathnayak2008/civic-pulse`.

2. **Configure Project Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Configure Environment Variables**:
   Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com`
   - `VITE_WS_URL` = `wss://<your-render-backend-url>.onrender.com/ws/live-feed`

4. Click **Deploy**. Vercel will build and deploy the production bundle with automatic SSL and global CDN caching.


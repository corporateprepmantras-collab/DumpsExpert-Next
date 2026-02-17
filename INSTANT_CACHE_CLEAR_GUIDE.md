# 🚀 INSTANT CACHE CLEARING & DEPLOYMENT GUIDE

## ⚡ What Was Fixed

Your site was taking too long to show updates because of aggressive caching. Here's what was improved:

### 1. **Faster Revalidation** ⏱️

- **Before**: 60 seconds cache (updates took 1 minute to show)
- **After**: 10 seconds cache (updates show in 10 seconds)
- Pages automatically refresh every 10 seconds instead of 60

### 2. **Instant Cache Clearing** 🔄

Added an API endpoint to clear cache instantly without waiting!

### 3. **Less Aggressive Caching** 📦

- Changed from `force-cache` to `default-cache`
- Updated cache headers from 5 minutes to instant revalidation

---

## 🎯 How To Clear Cache INSTANTLY

### Method 1: Using Terminal (Recommended)

```bash
npm run clear-cache
```

Or clear a specific page:

```bash
npm run clear-cache /blogs
```

### Method 2: Using API (CURL)

```bash
curl -X POST https://www.prepmantras.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key-2026","path":"/"}'
```

### Method 3: Using Browser/Postman

**URL**: `https://www.prepmantras.com/api/revalidate`  
**Method**: `POST`  
**Headers**: `Content-Type: application/json`  
**Body**:

```json
{
  "secret": "your-secret-key-2026",
  "path": "/"
}
```

### Quick Cache Clear Examples:

```bash
# Clear homepage
npm run clear-cache /

# Clear blogs page
npm run clear-cache /blogs

# Clear specific blog
npm run clear-cache /blogs/my-blog-slug

# Clear all pages (run multiple times)
npm run clear-cache / && npm run clear-cache /blogs && npm run clear-cache /about
```

---

## 🔐 Environment Variables

Add this to your `.env.local` and Vercel/Hostinger:

```env
# Cache Revalidation Secret Key
REVALIDATE_SECRET=your-secret-key-2026

# Your site URL
NEXT_PUBLIC_BASE_URL=https://www.prepmantras.com
```

**⚠️ IMPORTANT**: Change `your-secret-key-2026` to a secure random string in production!

---

## 🌐 Deployment Issues (Hostinger)

Your live site is showing a **Hostinger placeholder page** instead of your actual website. This means:

### Possible Causes:

1. **Site not deployed yet** - Files haven't been uploaded
2. **Wrong directory** - Files uploaded to wrong folder
3. **Build not completed** - Next.js build didn't finish
4. **DNS not propagated** - Domain not pointing correctly

### How to Fix on Hostinger:

#### Option A: Deploy to Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Manual Hostinger Deployment

1. Build the project locally:

   ```bash
   npm run build
   ```

2. Upload these folders/files to Hostinger:
   - `.next/standalone/` folder → Upload entire contents
   - `public/` folder → Upload to `/public`
   - `package.json`
   - `next.config.mjs`

3. On Hostinger, set Node.js version to **18+**

4. Set start command:
   ```bash
   node server.js
   ```

#### Option C: Use Hostinger's Git Deploy

1. Push code to GitHub
2. Connect Hostinger to your GitHub repo
3. Set build command: `npm run build`
4. Set start command: `npm start`

---

## ✅ Quick Verification Checklist

After deployment, verify:

- [ ] Site loads (not showing Hostinger placeholder)
- [ ] Images load from Cloudinary
- [ ] Blog section shows posts
- [ ] Navigation works
- [ ] Admin panel accessible
- [ ] Environment variables set

---

## 🔥 Immediate Actions Needed

### 1. **Fix Hostinger Deployment**

Your site is NOT deployed correctly. Choose one option above and deploy properly.

### 2. **Set Environment Variables on Host**

Make sure these are set on Hostinger/Vercel:

```env
MONGODB_URI=your_mongodb_connection
NEXT_PUBLIC_BASE_URL=https://www.prepmantras.com
REVALIDATE_SECRET=your-secret-key-2026
NEXTAUTH_URL=https://www.prepmantras.com
NEXTAUTH_SECRET=your-nextauth-secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. **Test Cache Clearing**

Once deployed, test the cache clear:

```bash
# From your local terminal
curl -X POST https://www.prepmantras.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret-key-2026","path":"/"}'
```

You should see:

```json
{
  "revalidated": true,
  "message": "Homepage revalidated successfully",
  "timestamp": "2026-02-17T..."
}
```

---

## 📊 Current Cache Settings

| Page Type  | Revalidation Time | Cache Strategy                        |
| ---------- | ----------------- | ------------------------------------- |
| Homepage   | 10 seconds        | ISR (Incremental Static Regeneration) |
| Blog Pages | 10 seconds        | On-demand + ISR                       |
| API Routes | No cache          | Fresh data                            |
| Images     | 1 year            | Static (Cloudinary)                   |

---

## 🆘 Troubleshooting

### Updates Still Not Showing?

1. Clear your browser cache: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Run cache clear command: `npm run clear-cache`
3. Wait 10 seconds for revalidation
4. Check in incognito mode

### API Not Working?

- Verify `REVALIDATE_SECRET` matches in `.env` and API call
- Check site is actually deployed (not showing placeholder)
- Test API endpoint exists: `https://www.prepmantras.com/api/revalidate`

### Still Seeing Old Content?

- CDN cache: If using Cloudflare, purge CDN cache
- Browser cache: Clear browser cache and cookies
- Server cache: Restart Node.js server on Hostinger

---

## 📞 Need Help?

If you're still seeing the Hostinger placeholder:

1. Check Hostinger cPanel → File Manager → Verify files uploaded
2. Check Hostinger → Setup Node.js → Verify Node version 18+
3. Check Hostinger → Application Logs → Look for errors

**Priority**: Fix the deployment first, then worry about cache clearing!

---

## 🎉 Summary

**What Changed:**

- ✅ Cache time reduced: 60s → 10s
- ✅ Added instant cache clearing API
- ✅ Added `npm run clear-cache` command
- ✅ More flexible caching strategy

**What You Need To Do:**

1. **Fix Hostinger deployment** (site showing placeholder!)
2. Set `REVALIDATE_SECRET` environment variable
3. Test cache clearing once deployed

**Cache Clear Command:**

```bash
npm run clear-cache
```

**Update Visibility:**

- Automatic: 10 seconds
- Manual/Instant: Use `npm run clear-cache`

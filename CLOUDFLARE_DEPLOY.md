# Cloudflare Pages Deployment Guide

## 🚀 Quick Deploy to Cloudflare Pages

### Prerequisites
- GitHub account
- Cloudflare account (free tier works)
- Your code pushed to GitHub repository

---

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Ready for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/monera.git
git push -u origin main
```

---

## Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** → **Create Application** → **Pages**
3. Click **Connect to Git**
4. Select your **monera** repository
5. Click **Begin setup**

---

## Step 3: Build Configuration

**Framework preset**: `Next.js`

**Build settings**:
- Build command: `npm run build`
- Build output directory: `.next`
- Root directory: `/` (leave empty)
- Node version: `18` or `20`

---

## Step 4: Environment Variables

Add these in Cloudflare Pages settings:

### Required Variables:
```bash
# Database (Supabase)
DATABASE_URL=your_supabase_connection_string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=generate_random_32_char_string
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@monera.com

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
NEXT_PUBLIC_SITE_URL=https://your-domain.pages.dev
NEXT_PUBLIC_CALENDAR_URL=your_calendar_link

# Contact
NEXT_PUBLIC_WHATSAPP_NUMBER=6285161391439
NEXT_PUBLIC_WHATSAPP_MESSAGE=Hi%20Monera,%20I'm%20interested%20in%20building%20a%20remote%20team

# Social Media
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/monera
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/monera.official

# Environment
NODE_ENV=production
```

### Optional (add later):
```bash
GOOGLE_SITE_VERIFICATION=your_verification_code
GOOGLE_CLIENT_ID=your_google_oauth_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
```

---

## Step 5: Deploy

1. Click **Save and Deploy**
2. Wait 2-5 minutes for build to complete
3. Your site will be live at: `https://monera-xxx.pages.dev`

---

## Step 6: Custom Domain (Optional)

### If you have a domain:

1. Go to **Custom domains** in Cloudflare Pages
2. Click **Set up a custom domain**
3. Enter your domain: `monera.com`
4. Follow DNS instructions
5. Wait for SSL certificate (automatic, ~5 minutes)

### If you don't have a domain yet:
- Use the free `.pages.dev` subdomain for now
- Buy domain later from Cloudflare Registrar or Namecheap

---

## Step 7: Post-Deployment Checklist

### Immediate (5 minutes):
- [ ] Test website loads: `https://your-domain.pages.dev`
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Check WhatsApp button works
- [ ] Verify all pages load correctly

### Within 24 hours:
- [ ] Setup Google Search Console
- [ ] Submit sitemap: `https://your-domain.pages.dev/sitemap.xml`
- [ ] Replace placeholder images (og-image.png, apple-touch-icon.png)
- [ ] Test on mobile devices
- [ ] Share with 5 beta users for feedback

### Within 1 week:
- [ ] Add Google Analytics
- [ ] Setup newsletter integration (Mailchimp/SendGrid)
- [ ] Create LinkedIn company page
- [ ] Create Instagram business account
- [ ] Monitor error logs in Cloudflare dashboard

---

## 🔧 Troubleshooting

### Build fails?
- Check Node version is 18 or 20
- Verify all dependencies in package.json
- Check build logs in Cloudflare dashboard

### Environment variables not working?
- Make sure they're added in **Settings → Environment variables**
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Database connection fails?
- Verify Supabase connection string is correct
- Check Supabase project is not paused
- Ensure IP allowlist includes Cloudflare IPs (or set to allow all)

### Images not loading?
- Check images exist in `/public/images/`
- Verify image paths are correct
- Use relative paths starting with `/`

---

## 📊 Monitoring

### Cloudflare Analytics (Free):
- Go to **Analytics** tab in Cloudflare Pages
- Monitor page views, bandwidth, requests
- Check error rates

### Performance:
- Use [PageSpeed Insights](https://pagespeed.web.dev/)
- Target: 90+ score on mobile and desktop
- Current expected: 95+ (already optimized)

---

## 🎉 You're Live!

Your website is now:
- ✅ Deployed on Cloudflare's global CDN
- ✅ Auto-SSL enabled
- ✅ DDoS protected
- ✅ Fast worldwide (edge caching)
- ✅ Auto-deploys on git push

**Next steps:**
1. Share with beta users
2. Collect feedback
3. Iterate and improve
4. Scale when ready!

---

## 💡 Pro Tips

### Auto-deploy on push:
Every time you push to `main` branch, Cloudflare automatically rebuilds and deploys.

### Preview deployments:
Create a new branch → push → Cloudflare creates preview URL automatically.

### Rollback:
Go to **Deployments** → Click on previous deployment → **Rollback to this deployment**

### Custom 404 page:
Already handled by Next.js `not-found.tsx`

---

## 📞 Need Help?

- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

**Good luck with your launch! 🚀**

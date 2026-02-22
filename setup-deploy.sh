#!/bin/bash

echo "🚀 Monera - Quick Deployment Setup"
echo "=================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Copy .env.example to .env
echo "📝 Creating .env file..."
cp .env.example .env

echo ""
echo "✅ .env file created!"
echo ""
echo "⚠️  IMPORTANT: Edit .env file and update these values:"
echo "   1. DATABASE_URL (Supabase connection string)"
echo "   2. NEXT_PUBLIC_SUPABASE_URL"
echo "   3. SUPABASE_SERVICE_ROLE_KEY"
echo "   4. JWT_SECRET (generate random 32 characters)"
echo "   5. SMTP credentials (for email)"
echo "   6. Update NEXT_PUBLIC_SITE_URL to your domain"
echo ""
echo "📖 See CLOUDFLARE_DEPLOY.md for complete deployment guide"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your values"
echo "2. Test locally: npm run dev"
echo "3. Push to GitHub: git push origin main"
echo "4. Deploy on Cloudflare Pages"
echo ""

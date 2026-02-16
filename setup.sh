#!/bin/bash

# Monera Development Setup Script
echo "🚀 Setting up Monera Talent Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your database and API credentials"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - JWT_SECRET: A secure random string"
    echo "   - SMTP credentials for email functionality"
    echo "   - Google OAuth credentials (optional)"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if database is accessible
echo "🗄️ Checking database connection..."
if npm run test:supabase > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    
    # Run database migrations
    echo "🔄 Running database migrations..."
    npm run db:push
    
    # Seed demo data (optional)
    read -p "🌱 Would you like to seed demo data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run seed:demo
        echo "✅ Demo data seeded successfully"
    fi
else
    echo "⚠️ Database connection failed. Please check your DATABASE_URL in .env"
    echo "   Make sure your PostgreSQL database is running and accessible"
fi

echo ""
echo "🎉 Setup complete! Here's what you can do next:"
echo ""
echo "📋 Available commands:"
echo "   npm run dev          - Start development server"
echo "   npm run build        - Build for production"
echo "   npm run db:studio    - Open Prisma Studio (database GUI)"
echo "   npm run seed:admin   - Create admin user"
echo "   npm run seed:demo    - Seed demo accounts"
echo ""
echo "🌐 Key URLs (after starting dev server):"
echo "   http://localhost:3001         - Main application"
echo "   http://localhost:3001/admin   - Admin panel"
echo "   http://localhost:3001/talent  - Talent dashboard"
echo "   http://localhost:3001/client  - Client dashboard"
echo ""
echo "📚 Documentation:"
echo "   README.md           - General setup and usage"
echo "   SETUP_SUPABASE.md   - Supabase setup guide"
echo "   ADMIN_PANEL_SETUP.md - Admin panel configuration"
echo ""
echo "🚀 Ready to start? Run: npm run dev"
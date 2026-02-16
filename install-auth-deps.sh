#!/bin/bash

# Install required dependencies for authentication system
npm install next-auth @next-auth/prisma-adapter jsonwebtoken
npm install --save-dev @types/jsonwebtoken

echo "Dependencies installed successfully!"
echo "Please add these environment variables to your .env file:"
echo ""
echo "# Google OAuth"
echo "GOOGLE_CLIENT_ID=your_google_client_id"
echo "GOOGLE_CLIENT_SECRET=your_google_client_secret"
echo ""
echo "# NextAuth"
echo "NEXTAUTH_URL=http://localhost:3000"
echo "NEXTAUTH_SECRET=your_nextauth_secret"
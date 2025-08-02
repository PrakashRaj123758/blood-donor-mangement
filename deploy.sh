#!/bin/bash

# 🚀 Blood Bank Management System - Deployment Script
# This script helps prepare your project for deployment on Render

echo "🚀 Blood Bank Management System - Deployment Preparation"
echo "========================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if all required files exist
echo "📋 Checking required files..."

required_files=(
    "package.json"
    "server.js"
    "render.yaml"
    "Dockerfile"
    ".dockerignore"
    "DEPLOYMENT_GUIDE.md"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo ""
    echo "⚠️  Missing files: ${missing_files[*]}"
    echo "Please ensure all required files are present before deployment."
    exit 1
fi

echo ""
echo "✅ All required files are present!"

# Check package.json for required dependencies
echo ""
echo "📦 Checking package.json..."

if ! grep -q '"express"' package.json; then
    echo "❌ Express dependency missing in package.json"
    exit 1
fi

if ! grep -q '"mongoose"' package.json; then
    echo "❌ Mongoose dependency missing in package.json"
    exit 1
fi

echo "✅ Package.json looks good!"

# Check if .env file exists and warn about environment variables
echo ""
echo "🔐 Environment Variables Check:"
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "⚠️  Remember: Don't commit .env file to Git!"
    echo "   Use Render's environment variables instead."
else
    echo "ℹ️  No .env file found (this is okay for deployment)"
fi

echo ""
echo "📝 Required Environment Variables for Render:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=your_jwt_secret"
echo "   - EMAIL_USER=your_email@gmail.com"
echo "   - EMAIL_PASS=your_email_app_password"

echo ""
echo "🚀 Deployment Preparation Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "3. Set up MongoDB Atlas and get your connection string"
echo ""
echo "4. Configure email service (Gmail recommended)"
echo ""
echo "5. Deploy on Render using the guide"
echo ""
echo "🎉 Good luck with your deployment!" 
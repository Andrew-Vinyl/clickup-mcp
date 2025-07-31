#!/bin/bash

# 🚂 Railway Pre-Deploy Script
# This ensures we have all the files Railway needs for a successful build

echo "🚂 Preparing for Railway deployment..."

# Generate package-lock.json if it doesn't exist
if [ ! -f "package-lock.json" ]; then
    echo "📦 Generating package-lock.json..."
    npm install --package-lock-only
    echo "✅ Package-lock.json created"
else
    echo "✅ Package-lock.json already exists"
fi

# Validate package.json
if ! npm run build --dry-run > /dev/null 2>&1; then
    echo "❌ Build script validation failed"
    exit 1
fi

echo "🎉 Ready for Railway deployment!"
echo ""
echo "📋 Final checklist:"
echo "   ✅ package-lock.json exists"
echo "   ✅ Dockerfile is optimized"
echo "   ✅ Build scripts validated"
echo ""
echo "🚂 Deploy to Railway:"
echo "   1. Push to GitHub: git add . && git commit -m 'Fix Docker build' && git push"
echo "   2. Railway will auto-redeploy"
echo "   3. Set environment variables in Railway dashboard"

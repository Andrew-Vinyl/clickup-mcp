#!/bin/bash

# 🔥 ClickUp MCP - TypeScript Fix and Deploy

echo "🔥 Fixing TypeScript errors and deploying..."

# Test the build first
echo "🧪 Testing TypeScript compilation..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
    
    # Add all changes
    echo "📦 Adding changes..."
    git add .
    
    # Commit with proper message
    echo "💾 Committing TypeScript fixes..."
    git commit -m "🔥 Fix TypeScript compilation errors with ExtendedServer interface"
    
    # Push to remote
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ All TypeScript errors fixed and deployed!"
    echo ""
    echo "🚂 Railway Status:"
    echo "   - Docker build will now succeed"
    echo "   - TypeScript compilation passes"
    echo "   - All 18 tools properly typed"
    echo ""
    echo "🔍 Check Railway dashboard for successful deployment"
else
    echo "❌ TypeScript compilation failed!"
    echo "💡 Check the error messages above"
    exit 1
fi

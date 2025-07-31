#!/bin/bash

# 🔥 ClickUp MCP Server - Railway Deployment Setup Script
# Run this after cloning the repo to set up for Railway deployment

set -e

echo "🔥 ClickUp MCP Server - Railway Setup"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/index.ts" ]; then
    echo "❌ Please run this script from the clickup-mcp root directory"
    exit 1
fi

# Install dependencies and generate lockfile
echo "📦 Installing dependencies and generating lockfile..."
npm install

# Copy environment template
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env and add your CLICKUP_PERSONAL_TOKEN"
    echo "   Get your token from: https://app.clickup.com/settings/apps"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🏗️  Building TypeScript..."
npm run build

# Make bin file executable
chmod +x bin/clickup-mcp

# Test the build
echo "🧪 Running deployment test..."
if npm run test:quick; then
    echo ""
    echo "🎉 Setup complete! Your ClickUp MCP Server is ready."
    echo ""
    echo "📋 Next Steps for Railway Deployment:"
    echo ""
    echo "1. 🔑 Update your .env file with a real ClickUp token:"
    echo "   CLICKUP_PERSONAL_TOKEN=pk_your_token_here"
    echo ""
    echo "2. 🐙 Push to GitHub:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial ClickUp MCP Server'"
    echo "   git remote add origin https://github.com/yourusername/clickup-mcp.git"
    echo "   git push -u origin main"
    echo ""
    echo "3. 🚂 Deploy to Railway:"
    echo "   - Go to https://railway.app"
    echo "   - Click 'New Project' > 'Deploy from GitHub repo'"
    echo "   - Select your clickup-mcp repository"
    echo "   - Add environment variable: CLICKUP_PERSONAL_TOKEN"
    echo "   - Set SERVER_MODE=http for Railway deployment"
    echo "   - Deploy!"
    echo ""
    echo "4. 🔧 For local Claude usage:"
    echo "   Add to your MCP settings.json:"
    echo '   {'
    echo '     "clickup": {'
    echo '       "command": "npx",'
    echo '       "args": ["clickup-mcp"],'
    echo '       "env": {'
    echo '         "CLICKUP_PERSONAL_TOKEN": "your_token_here"'
    echo '       }'
    echo '     }'
    echo '   }'
    echo ""
    echo "🔗 Health check URL (after Railway deploy): https://your-app.railway.app/health"
else
    echo ""
    echo "❌ Setup test failed. Please check the error messages above."
    echo "💡 Make sure you have a valid CLICKUP_PERSONAL_TOKEN in your .env file"
    exit 1
fi

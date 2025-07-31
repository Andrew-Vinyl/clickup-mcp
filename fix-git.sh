#!/bin/bash

# 🔥 ClickUp MCP - Quick Fix Script

echo "🔥 Fixing git and deployment issues..."

# First, let's sync with remote
echo "📥 Syncing with remote repository..."
git pull origin main --no-edit

# Add all changes
echo "📦 Adding changes..."
git add .

# Commit with proper message
echo "💾 Committing fixes..."
git commit -m "🔥 Fix Docker build with multi-stage Dockerfile and package-lock.json"

# Push to remote
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Git sync complete!"
echo ""
echo "🚂 Railway Status:"
echo "   - Your repo is now synced"
echo "   - Railway will auto-redeploy with the fixed Dockerfile"
echo "   - The multi-stage build will resolve the npm ci issue"
echo ""
echo "🔍 Check Railway dashboard for the new deployment"

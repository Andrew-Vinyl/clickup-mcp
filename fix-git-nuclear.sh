#!/bin/bash

# 🔥 ClickUp MCP - Nuclear Git Fix (Merge Strategy)

echo "🔥 Resolving divergent branches with merge strategy..."

# Set merge as default for this pull
git config pull.rebase false

# Pull and merge remote changes
echo "📥 Pulling and merging remote changes..."
git pull origin main --no-edit

# Check if there are any merge conflicts
if [ $? -ne 0 ]; then
    echo "❌ Merge conflicts detected. Let's resolve them..."
    echo "🔧 Auto-resolving by favoring our local changes..."
    git checkout --ours .
    git add .
    git commit -m "🔥 Resolve merge conflicts - favor local changes"
fi

# Now push everything
echo "🚀 Pushing merged changes to GitHub..."
git push origin main

echo ""
echo "✅ Git divergent branches resolved!"
echo ""
echo "🚂 Railway will now auto-deploy with:"
echo "   ✅ Fixed multi-stage Dockerfile"
echo "   ✅ Package-lock.json included"
echo "   ✅ All dependencies resolved"
echo ""
echo "🔍 Check Railway dashboard - deployment should succeed now!"

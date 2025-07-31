# Generate package-lock.json for deterministic builds
npm install --package-lock-only

# This creates package-lock.json without installing node_modules
echo "package-lock.json generated for Railway deployment"

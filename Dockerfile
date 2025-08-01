# Nuclear option - run as root for Railway
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code  
COPY . .

# Build TypeScript
RUN npm run build

# Clean up dev dependencies
RUN npm prune --production

# Make sure our startup script is executable
RUN chmod +x debug-start.js

# Expose port
EXPOSE 3000

# Add some debug output and start
CMD echo "🔥 Container starting..." && \
    echo "Current user: $(whoami)" && \
    echo "Working directory: $(pwd)" && \
    echo "Files in /app:" && \
    ls -la && \
    echo "Starting debug script..." && \
    node debug-start.js

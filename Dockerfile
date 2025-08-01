# Force Railway to show startup logs
FROM node:18-alpine

WORKDIR /app

# Copy and install
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --production

# Make executable
RUN chmod +x debug-start.js

# Expose port
EXPOSE 3000

# Force Railway to show our logs by using exec
CMD ["sh", "-c", "echo '🔥 RAILWAY CONTAINER STARTING...' && echo 'Current time:' && date && echo 'Environment:' && env | grep -E '(NODE_ENV|CLICKUP|SERVER|PORT)' && echo 'Starting Node.js...' && exec node debug-start.js"]

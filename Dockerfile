# Use Node 18 Alpine for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Copy rest of the app
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S servoya -u 1001

# Change ownership to non-root user
RUN chown -R servoya:nodejs /usr/src/app
USER servoya

# Expose port
EXPOSE 8080

# Health check for cloud monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Run the app
CMD ["npm", "start"]

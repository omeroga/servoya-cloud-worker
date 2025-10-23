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

# Run the app - REMOVED HEALTHCHECK for Cloud Run compatibility
CMD ["npm", "start"]

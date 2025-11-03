# Multi-stage build for React/Vite application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code (excluding .env)
COPY . .

# Accept build arguments for API keys
ARG GEMINI_API_KEY
ARG OPENAI_API_KEY
ARG OPENROUTER_API_KEY
ARG ANTHROPIC_API_KEY

# Create .env file from build arguments
RUN echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > .env && \
    echo "OPENAI_API_KEY=${OPENAI_API_KEY}" >> .env && \
    echo "OPENROUTER_API_KEY=${OPENROUTER_API_KEY}" >> .env && \
    echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}" >> .env

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]


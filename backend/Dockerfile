FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
# Install dependencies (use npm install for reliability when lockfiles aren't present)
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build the NestJS project
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy runtime files
COPY --from=build /app/dist ./dist
COPY package.json ./package.json
# Include node_modules and prune dev dependencies for a slim runtime
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --production
EXPOSE 3000
CMD ["node", "dist/main.js"]



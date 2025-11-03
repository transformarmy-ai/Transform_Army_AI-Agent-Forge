# Docker Setup for Transform Army AI Agent Forge

This project is containerized and ready to run with Docker. The container serves the built web application on port 88.

---

## 🐳 Quick Start

### Prerequisites

- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose v2 (usually comes with Docker Desktop)

### Build and Run

```bash
# Build the container
docker-compose build

# Start the container
docker-compose up -d

# Access the application
open http://localhost:88
```

### Stop the Container

```bash
# Stop and remove the container
docker-compose down
```

---

## 📋 Manual Docker Commands

If you prefer not to use docker-compose:

```bash
# Build the image
docker build -t agent-forge .

# Run the container
docker run -d \
  --name agent-forge \
  -p 88:80 \
  --restart unless-stopped \
  agent-forge

# View logs
docker logs -f agent-forge

# Stop the container
docker stop agent-forge

# Remove the container
docker rm agent-forge
```

---

## 🌐 Access

Once running, access the application at:

- **Local:** http://localhost:88
- **Network:** http://0.0.0.0:88
- **Container IP:** http://<container-ip>:80

The port mapping is `88:80` (host:container) as requested.

---

## 🔧 Configuration

### Environment Variables

The application uses environment variables for LLM API keys. To provide them:

1. Create a `.env` file in the project root
2. Add your API keys:

```bash
# Example .env file
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

3. Rebuild if needed:

```bash
docker-compose down
docker-compose up --build
```

**Note:** Environment variables are baked into the build at build-time. After changing `.env`, you need to rebuild.

---

## 🏗️ Build Process

The Dockerfile uses a multi-stage build:

### Stage 1: Builder
- Uses `node:20-alpine` as base
- Installs npm dependencies
- Builds the React application with Vite
- Outputs to `/app/dist`

### Stage 2: Production
- Uses `nginx:alpine` as base
- Copies built files to nginx html directory
- Serves static files on port 80
- Lightweight and efficient

---

## 📦 Container Structure

```
agent-forge/
├── nginx.conf                 # Nginx server configuration
├── Dockerfile                 # Multi-stage build definition
├── docker-compose.yml         # Compose configuration
├── .dockerignore              # Files to exclude from build
└── dist/                      # Built application (created during build)
```

---

## 🔍 Health Checks

The container includes a health check endpoint:

```bash
# Check container health
curl http://localhost:88/health

# Should return: "healthy"
```

---

## 📊 Container Information

### Image Size
- **After build:** ~50-100MB (nginx:alpine base)
- **During build:** ~500MB+ (node:20-alpine builder)

### Ports
- **Host:** 88
- **Container:** 80

### Restart Policy
- `unless-stopped` - Automatically restart unless manually stopped

---

## 🛠️ Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs agent-forge

# Or with manual Docker
docker logs agent-forge
```

### Build fails

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Check Dockerfile syntax
docker-compose config
```

### Port already in use

```bash
# Check what's using port 88
sudo lsof -i :88
# or
sudo netstat -tulpn | grep 88

# Change port in docker-compose.yml:
#   ports:
#     - "YOUR_PORT:80"
```

### Permission denied

```bash
# Ensure Docker daemon is running
sudo systemctl status docker

# Add user to docker group (if needed)
sudo usermod -aG docker $USER
# Log out and back in
```

---

## 🧪 Testing

### Build locally without Docker

```bash
# Install dependencies
npm install

# Build
npm run build

# Preview
npm run preview
# Serves on http://localhost:4173
```

### Test Docker build

```bash
# Build test image
docker build -t test-forge .

# Run test
docker run --rm -p 88:80 test-forge

# In another terminal
curl http://localhost:88
```

---

## 🔄 Development vs Production

### Development (without Docker)
```bash
npm install
npm run dev
# Serves on http://localhost:3000 with HMR
```

### Production (with Docker)
```bash
docker-compose up
# Serves on http://localhost:88 as static files
```

---

## 📝 Docker Compose Commands

```bash
# Build and start
docker-compose up -d

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart
docker-compose restart

# Show status
docker-compose ps

# Execute command in container
docker-compose exec agent-forge sh
```

---

## 🚀 Deployment

### Deploy to Server

1. **Transfer files to server:**

```bash
rsync -avz --exclude node_modules . user@server:/path/to/app/
```

2. **SSH into server:**

```bash
ssh user@server
cd /path/to/app
```

3. **Build and run:**

```bash
docker-compose up -d --build
```

4. **Set up reverse proxy (optional):**

```nginx
# /etc/nginx/sites-available/agent-forge
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:88;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Deploy to Cloud Platforms

#### Docker Hub
```bash
# Tag and push
docker tag agent-forge username/agent-forge:latest
docker push username/agent-forge:latest

# Pull and run on server
docker pull username/agent-forge:latest
docker run -d -p 88:80 username/agent-forge:latest
```

#### AWS ECS / Google Cloud Run / Azure Container Instances
- Follow platform-specific documentation
- Ensure port 88 (or container port 80) is exposed

---

## 🔒 Security Notes

1. **No API keys in images:** Environment variables are build-time
2. **Nginx security headers:** Configured in `nginx.conf`
3. **Minimal base image:** Uses alpine for smaller attack surface
4. **No root user:** nginx runs as non-root

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)

---

## 🆘 Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs agent-forge`
2. Verify Docker is running: `docker info`
3. Check port availability: `lsof -i :88`
4. Try rebuilding: `docker-compose build --no-cache`
5. Check this README troubleshooting section

---

**Ready to deploy!** 🎉


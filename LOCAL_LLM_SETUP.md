# Local LLM Setup Guide

This guide explains how to set up and use local LLM providers (Ollama and LM Studio) with Transform Army AI Agent Forge.

---

## 🏠 Why Use Local LLMs?

**Benefits:**
- ✅ **Privacy**: Your data never leaves your machine
- ✅ **No API Costs**: Free to use once downloaded
- ✅ **Offline Access**: Works without internet connection
- ✅ **Customization**: Run fine-tuned or specialized models
- ✅ **Speed**: No network latency for local inference

**Trade-offs:**
- ⚠️ Requires sufficient RAM and/or GPU
- ⚠️ May be slower than cloud APIs (depending on hardware)
- ⚠️ Need to download models (can be large files)

---

## 🦙 Option 1: Ollama (Recommended for Beginners)

### Installation

**macOS/Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### Setup

1. **Install Ollama** (see above)

2. **Pull a model** (recommended: llama3.1):
```bash
ollama pull llama3.1
```

Other good models for agent generation:
```bash
ollama pull mistral       # Fast, good quality
ollama pull llama3.2      # Latest version
ollama pull codellama     # Optimized for code
ollama pull qwen2.5       # Strong reasoning
```

3. **Start Ollama server** (usually runs automatically):
```bash
ollama serve
```

4. **Configure in Agent Forge**:
   - Select "Ollama (Local)" as your LLM Provider
   - Enter model name (e.g., `llama3.1`)
   - Leave base URL as default: `http://localhost:11434`

### Verify Installation

Test that Ollama is working:
```bash
# Check if server is running
curl http://localhost:11434/api/tags

# Test generation
ollama run llama3.1 "Hello, can you generate JSON?"
```

---

## 🎨 Option 2: LM Studio

### Installation

1. **Download LM Studio**:
   - Visit https://lmstudio.ai/
   - Download for your OS (Windows, macOS, Linux)
   - Install the application

2. **Download a model**:
   - Open LM Studio
   - Go to the "Discover" tab
   - Search for models (recommendations below)
   - Click "Download" on your chosen model

**Recommended Models:**
- `TheBloke/Llama-2-13B-chat-GGUF` - Good balance
- `TheBloke/Mistral-7B-Instruct-v0.2-GGUF` - Fast
- `TheBloke/CodeLlama-13B-Instruct-GGUF` - For code
- `TheBloke/deepseek-coder-6.7b-instruct-GGUF` - Coding specialist

3. **Start the server**:
   - Click "Local Server" tab in LM Studio
   - Select your downloaded model
   - Click "Start Server"
   - Default port: `1234`

4. **Configure in Agent Forge**:
   - Select "LM Studio (Local)" as your LLM Provider
   - Enter model name shown in LM Studio (or leave as `local-model`)
   - Leave base URL as default: `http://localhost:1234`

### Verify Installation

Test that LM Studio server is running:
```bash
curl http://localhost:1234/v1/models
```

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` file (optional - has defaults):

```bash
# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434

# LM Studio configuration
LMSTUDIO_BASE_URL=http://localhost:1234
```

### Custom Ports

If you're running Ollama or LM Studio on different ports:

**Ollama:**
```bash
OLLAMA_HOST=0.0.0.0:8080 ollama serve
OLLAMA_BASE_URL=http://localhost:8080  # in .env
```

**LM Studio:**
- Change port in LM Studio settings
- Update `LMSTUDIO_BASE_URL` in `.env`

---

## 💻 Hardware Requirements

### Minimum (7B models):
- **RAM**: 8GB
- **CPU**: Modern multi-core processor
- **GPU**: Optional but recommended

### Recommended (13B models):
- **RAM**: 16GB
- **CPU**: 8+ cores
- **GPU**: NVIDIA GPU with 8GB+ VRAM (CUDA support)
- **Storage**: 20GB+ for models

### Optimal (30B+ models):
- **RAM**: 32GB+
- **CPU**: 16+ cores
- **GPU**: NVIDIA GPU with 24GB+ VRAM
- **Storage**: 50GB+ for models

---

## 🚀 Usage Tips

### Model Selection

**For Agent Generation:**
- **Best Quality**: `llama3.1:70b` (Ollama) or 13B+ models (LM Studio)
- **Fast**: `mistral:7b` (Ollama) or 7B models (LM Studio)
- **Balanced**: `llama3.1` (Ollama) or 13B models (LM Studio)

### Performance Optimization

1. **Use GPU acceleration** if available:
   - Ollama automatically uses GPU if detected
   - LM Studio: Enable in settings

2. **Adjust context length**:
   - Shorter contexts = faster responses
   - Agent generation needs ~4096 tokens

3. **Quantization**:
   - Q4 or Q5 quantized models are good balance
   - Q8 for better quality but slower
   - Q2/Q3 for fastest but lower quality

### Troubleshooting

**Ollama not responding:**
```bash
# Check if running
ps aux | grep ollama

# Restart
killall ollama
ollama serve
```

**LM Studio connection refused:**
- Ensure server is started in LM Studio
- Check port isn't blocked by firewall
- Verify model is loaded

**Slow generation:**
- Use smaller models (7B instead of 13B)
- Reduce context length in model settings
- Close other applications to free RAM
- Enable GPU acceleration

**Out of memory errors:**
- Use smaller quantized models (Q4)
- Close other applications
- Increase system swap space
- Use models appropriate for your RAM

---

## 🔄 Switching Between Providers

In Agent Forge, you can easily switch between providers:

1. **Web APIs** (OpenAI, Anthropic, OpenRouter):
   - Best for production
   - Consistent performance
   - Require API keys and internet

2. **Local LLMs** (Ollama, LM Studio):
   - Best for development and privacy
   - No costs or API limits
   - Require local resources

Simply select the provider from the dropdown when creating agents!

---

## 📚 Additional Resources

**Ollama:**
- Official Docs: https://github.com/ollama/ollama/blob/main/README.md
- Model Library: https://ollama.com/library
- Discord: https://discord.gg/ollama

**LM Studio:**
- Official Site: https://lmstudio.ai/
- Documentation: https://lmstudio.ai/docs
- Community: https://discord.gg/lmstudio

**Model Rankings:**
- Hugging Face Leaderboard: https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard
- LMSYS Chatbot Arena: https://chat.lmsys.org/?arena

---

## 🎯 Quick Start Checklist

### For Ollama:
- [ ] Install Ollama
- [ ] Pull a model: `ollama pull llama3.1`
- [ ] Verify server: `curl http://localhost:11434/api/tags`
- [ ] Select "Ollama (Local)" in Agent Forge
- [ ] Enter model name and forge!

### For LM Studio:
- [ ] Download and install LM Studio
- [ ] Download a model from "Discover" tab
- [ ] Start server in "Local Server" tab
- [ ] Verify: `curl http://localhost:1234/v1/models`
- [ ] Select "LM Studio (Local)" in Agent Forge
- [ ] Forge your agents!

---

**Need help?** Check the troubleshooting section or create an issue in the repository.

Happy local LLM forging! 🦙🎨🚀


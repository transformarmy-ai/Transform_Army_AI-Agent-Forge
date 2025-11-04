# System Tools Guide: DuckDuckGo & GitHub Integration

**Transform Army AI** provides system-level tools to the Orchestrator and System agents, enabling internet research and code repository operations.

---

## Overview

System tools are available to all System-level agents:
- **Orchestrator**: Coordinates and orchestrates missions
- **Red Team Armory**: Manages red team operations and resources
- **Blue Team Garrison**: Manages blue team operations and resources
- **Intelligence Analyst**: Performs intelligence gathering and analysis

These tools are NOT available to tactical Red/Blue agents.

---

## 1.0 DuckDuckGo Search Tool

### 1.1 What It Does

The DuckDuckGo search tool allows agents to perform internet searches without requiring an API key. It's free and respects privacy.

### 1.2 Configuration

**No API key required** for basic searches. Optional token for advanced features:

```bash
# In .env (optional)
DUCKDUCKGO_API_KEY=optional_token_for_rate_limiting
```

### 1.3 Usage Example

```typescript
import { getSystemToolsService } from './services/systemToolsService';

const tools = getSystemToolsService();

// Search the internet
const results = await tools.duckduckgoSearch('AI security threats 2025', 10);
console.log(results);
// Returns:
// [
//   {
//     title: "AI Security Report 2025",
//     description: "Latest threats and vulnerabilities in AI systems...",
//     url: "https://example.com/ai-security-2025",
//     source: "DuckDuckGo"
//   },
//   ...
// ]
```

### 1.4 Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `maxResults` | number | 10 | Maximum number of results |

### 1.5 Use Cases

- **Intelligence Analyst**: Research threat intel, CVEs, exploit details
- **Orchestrator**: Gather context before deploying agents
- **Red Team Armory**: Research targets, techniques, POCs
- **Blue Team Garrison**: Look up vulnerability patches, incident reports

---

## 2.0 GitHub Tools

### 2.1 What They Do

GitHub tools enable agents to search for repositories, fetch repository metadata, and retrieve user information.

### 2.2 Configuration (Required for GitHub Tools)

Create a Personal Access Token on GitHub:

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name: `Transform Army AI`
4. Scopes: Select `repo` (full control of private/public repos), `user` (read user profile), `read:org` (if accessing org repos)
5. Copy the token (starts with `ghp_`)

Add to `.env`:

```bash
GITHUB_API_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your_github_username
```

### 2.3 GitHub Query Tool

**Search for repositories**

```typescript
const results = await tools.githubQuery('security scanning tools python', 5);
console.log(results);
// Returns:
// [
//   {
//     name: "bandit",
//     owner: "PyCQA",
//     url: "https://github.com/PyCQA/bandit",
//     description: "Security issue scanner for Python code",
//     stars: 4200,
//     language: "Python",
//     lastUpdated: "2025-01-15T10:30:00Z"
//   },
//   ...
// ]
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query (repo name, topic, language) |
| `maxResults` | number | 10 | Max repositories to return (1-100) |

### 2.4 GitHub Clone Tool

**Fetch repository metadata and clone URL**

```typescript
const repoInfo = await tools.githubClone('github-user', 'repository-name');
console.log(repoInfo);
// Returns:
// {
//   cloneUrl: "https://github.com/github-user/repository-name.git",
//   repoUrl: "https://github.com/github-user/repository-name",
//   info: {
//     name: "repository-name",
//     owner: "github-user",
//     description: "A cool project",
//     stars: 1200,
//     forks: 150,
//     language: "JavaScript",
//     topics: ["security", "testing"],
//     lastPush: "2025-01-14T15:45:00Z",
//     defaultBranch: "main"
//   }
// }
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `owner` | string | GitHub username or organization |
| `repo` | string | Repository name |

**Note:** This tool returns clone information only. Actual git cloning is handled by the agent's execution environment.

### 2.5 GitHub User Profile Tool

**Fetch user profile information**

```typescript
const profile = await tools.githubGetUserProfile('github-user');
console.log(profile);
// Returns:
// {
//   username: "github-user",
//   name: "Full Name",
//   bio: "Security researcher",
//   location: "San Francisco, CA",
//   profileUrl: "https://github.com/github-user",
//   followers: 500,
//   following: 100,
//   publicRepos: 42,
//   createdAt: "2015-03-10T12:30:00Z"
// }
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string | GitHub username (no token required for public profiles) |

---

## 3.0 Agent Manifest Integration

### 3.1 System Tool Declaration

When forging a System agent, these tools are **automatically included** in the manifest:

```json
{
  "tools": [
    {
      "name": "duckduckgo_search",
      "description": "Search the internet using DuckDuckGo",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Search query" },
          "maxResults": { "type": "number", "description": "Max results (default 10)" }
        },
        "required": ["query"]
      }
    },
    {
      "name": "github_query",
      "description": "Search GitHub repositories",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": { "type": "string", "description": "Search query" },
          "maxResults": { "type": "number", "description": "Max results (default 10)" }
        },
        "required": ["query"]
      }
    },
    {
      "name": "github_clone",
      "description": "Get GitHub repository metadata and clone URL",
      "inputSchema": {
        "type": "object",
        "properties": {
          "owner": { "type": "string", "description": "Repository owner" },
          "repo": { "type": "string", "description": "Repository name" }
        },
        "required": ["owner", "repo"]
      }
    }
  ]
}
```

### 3.2 Environment Variables

Agents automatically receive these as `env.required`:

```json
{
  "env": {
    "required": ["GITHUB_API_TOKEN", "GITHUB_USERNAME"],
    "optional": ["DUCKDUCKGO_API_KEY"]
  }
}
```

---

## 4.0 Examples

### 4.1 Red Team Armory: Research Attack Vectors

```python
# Agent prompt includes:
# "Use duckduckgo_search to research the latest CVEs and attack techniques"

results = await duckduckgo_search("CVE-2024 privilege escalation Linux", maxResults=5)
for result in results:
    print(f"{result['title']}: {result['description']}")
    print(f"  URL: {result['url']}\n")
```

### 4.2 Intelligence Analyst: Find Security Tools

```python
# "Search GitHub for security scanning tools and assess which to recommend"

repos = await github_query("security scanning python", maxResults=3)
for repo in repos:
    info = await github_clone(repo['owner'], repo['name'])
    print(f"{repo['name']} ({repo['stars']} ⭐)")
    print(f"  Description: {repo['description']}")
    print(f"  Clone: {info['cloneUrl']}")
```

### 4.3 Orchestrator: Research Target Infrastructure

```python
# "Gather intelligence on the target company"

# Search for their GitHub repos
company_repos = await github_query("company-name", maxResults=5)

# Search for public information
intel = await duckduckgo_search("company-name technology stack security", maxResults=10)

# Get team info
for developer_name in company_repos:
    profile = await github_user_profile(developer_name)
    print(f"Team member: {profile['name']} ({profile['followers']} followers)")
```

---

## 5.0 Troubleshooting

### Issue: GitHub API Token Invalid

**Cause:** Token expired, revoked, or has insufficient scopes

**Fix:**
1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Delete old token
3. Create new token with `repo` + `user` + `read:org` scopes
4. Update `.env` with new token
5. Restart agents

### Issue: GitHub Rate Limiting

**Cause:** Too many requests to GitHub API (limit: 5,000/hour for authenticated requests)

**Fix:**
```bash
# Add optional token for rate limiting
DUCKDUCKGO_API_KEY=your_optional_token

# Cache results to avoid repeated queries
# Implement backoff: if rate limited, wait before retrying
```

### Issue: DuckDuckGo Search Returns Empty

**Cause:** Query is too specific or results unavailable

**Fix:**
- Use simpler, broader search terms
- Try alternative queries
- Check internet connectivity

---

## 6.0 Security & Privacy

### 6.1 GitHub Token Security

- ✅ Store token in `.env` (never commit to git)
- ✅ Rotate token quarterly: Settings → Regenerate
- ✅ Use separate tokens for dev/prod
- ❌ Never paste token in logs or errors
- ❌ Don't share `.env` file

### 6.2 DuckDuckGo Privacy

- ✅ DuckDuckGo doesn't track searches or collect IP data
- ✅ No API token required for basic searches
- ✅ Privacy-respecting alternative to Google

### 6.3 Data Handling

- Search results are cached temporarily to reduce API calls
- Results are sanitized before being passed to agents
- Sensitive information should be logged to secure audit trails only

---

## 7.0 Limits & Rate Limiting

| Service | Limit | Notes |
|---------|-------|-------|
| **DuckDuckGo** | ~50 req/min | No key needed; optional token for higher limit |
| **GitHub API** | 5,000 req/hour | Per authenticated user; 60 req/hour for unauthenticated |
| **GitHub Search** | 30 req/min | Across all search endpoints |

---

## 8.0 Future Enhancements

Planned additions to system tools:
- [ ] Wikipedia search integration
- [ ] Shodan integration (for infrastructure reconnaissance)
- [ ] NVD (National Vulnerability Database) search
- [ ] WHOIS lookups for domain information
- [ ] Censys integration for asset discovery
- [ ] Twitter/X API integration for threat intelligence

---

**End of System Tools Guide**

For questions or issues, check the configuration in `README.env.example` and verify your API tokens are valid.

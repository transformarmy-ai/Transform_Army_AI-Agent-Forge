/**
 * System Tools Service
 * Provides tools available to Orchestrator and System-level agents:
 * - DuckDuckGo Search: Internet searching
 * - GitHub Tools: Repository search and operations
 */

export interface SearchResult {
  title: string;
  description: string;
  url: string;
  source: string;
}

export interface GitHubRepository {
  name: string;
  owner: string;
  url: string;
  description: string;
  stars: number;
  language: string;
  lastUpdated: string;
}

export class SystemToolsService {
  private githubToken: string;
  private githubUsername: string;
  private duckduckgoKey?: string;

  constructor(
    githubToken?: string,
    githubUsername?: string,
    duckduckgoKey?: string
  ) {
    this.githubToken = githubToken || process.env.REACT_APP_GITHUB_API_TOKEN || '';
    this.githubUsername = githubUsername || process.env.REACT_APP_GITHUB_USERNAME || '';
    this.duckduckgoKey = duckduckgoKey || process.env.REACT_APP_DUCKDUCKGO_API_KEY;
  }

  /**
   * Search the internet using DuckDuckGo
   */
  async duckduckgoSearch(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    try {
      console.log(`🔍 DuckDuckGo search: "${query}"`);

      // DuckDuckGo API endpoint (uses their public API)
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      // Parse DuckDuckGo results
      if (data.Results && Array.isArray(data.Results)) {
        data.Results.slice(0, maxResults).forEach((result: any) => {
          results.push({
            title: result.FirstURL || 'Result',
            description: result.Text || 'No description available',
            url: result.FirstURL || '',
            source: 'DuckDuckGo',
          });
        });
      }

      // Add abstraction if available
      if (data.AbstractText) {
        results.unshift({
          title: data.AbstractTitle || 'Summary',
          description: data.AbstractText,
          url: data.AbstractURL || '',
          source: 'DuckDuckGo Abstract',
        });
      }

      console.log(`✅ Found ${results.length} results`);
      return results.slice(0, maxResults);
    } catch (error) {
      console.error('DuckDuckGo search failed:', error);
      throw new Error(`DuckDuckGo search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search GitHub repositories
   */
  async githubQuery(query: string, maxResults: number = 10): Promise<GitHubRepository[]> {
    if (!this.githubToken) {
      throw new Error('GitHub API token not configured. Set GITHUB_API_TOKEN in .env');
    }

    try {
      console.log(`📦 GitHub search: "${query}"`);

      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=${maxResults}`;

      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Transform-Army-AI',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid GitHub API token');
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: GitHubRepository[] = [];

      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((repo: any) => {
          results.push({
            name: repo.name,
            owner: repo.owner.login,
            url: repo.html_url,
            description: repo.description || 'No description',
            stars: repo.stargazers_count,
            language: repo.language || 'Unknown',
            lastUpdated: repo.updated_at,
          });
        });
      }

      console.log(`✅ Found ${results.length} repositories`);
      return results;
    } catch (error) {
      console.error('GitHub search failed:', error);
      throw new Error(`GitHub search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clone a GitHub repository information (metadata only - actual cloning happens on agent side)
   */
  async githubClone(owner: string, repo: string): Promise<{ cloneUrl: string; repoUrl: string; info: any }> {
    if (!this.githubToken) {
      throw new Error('GitHub API token not configured. Set GITHUB_API_TOKEN in .env');
    }

    try {
      console.log(`📥 Getting GitHub repo info: ${owner}/${repo}`);

      const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(repoUrl, {
        headers: {
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Transform-Army-AI',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository not found: ${owner}/${repo}`);
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        cloneUrl: data.clone_url,
        repoUrl: data.html_url,
        info: {
          name: data.name,
          owner: data.owner.login,
          description: data.description,
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language,
          topics: data.topics,
          lastPush: data.pushed_at,
          defaultBranch: data.default_branch,
        },
      };
    } catch (error) {
      console.error('GitHub clone info failed:', error);
      throw new Error(`GitHub clone failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get GitHub user profile and recent repos
   */
  async githubGetUserProfile(username: string): Promise<any> {
    try {
      console.log(`👤 Getting GitHub user profile: ${username}`);

      const userUrl = `https://api.github.com/users/${username}`;
      const response = await fetch(userUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Transform-Army-AI',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub user not found: ${username}`);
        }
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        username: data.login,
        name: data.name,
        bio: data.bio,
        location: data.location,
        profileUrl: data.html_url,
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('GitHub user profile failed:', error);
      throw new Error(`GitHub profile fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
let systemToolsService: SystemToolsService | null = null;

export function getSystemToolsService(): SystemToolsService {
  if (!systemToolsService) {
    systemToolsService = new SystemToolsService(
      process.env.REACT_APP_GITHUB_API_TOKEN,
      process.env.REACT_APP_GITHUB_USERNAME,
      process.env.REACT_APP_DUCKDUCKGO_API_KEY
    );
  }
  return systemToolsService;
}

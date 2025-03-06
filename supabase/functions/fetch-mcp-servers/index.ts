
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client initialization
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const githubToken = Deno.env.get("GITHUB_ACCESS_TOKEN")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List of MCP server repositories to track
const repos = [
  { owner: "blackwhite084", name: "playwright-plus-python-mcp", language: "python", categories: ["browser-automation"], description: "An MCP python server using Playwright for browser automation, more suitable for llm" },
  { owner: "executeautomation", name: "playwright-mcp-server", language: "typescript", categories: ["browser-automation", "web-scraping"], description: "An MCP server using Playwright for browser automation and webscrapping" },
  { owner: "automatalabs", name: "mcp-server-playwright", language: "typescript", categories: ["browser-automation"], description: "An MCP server for browser automation using Playwright" },
  { owner: "modelcontextprotocol", name: "server-puppeteer", language: "typescript", categories: ["browser-automation", "web-scraping"], description: "Browser automation for web scraping and interaction" },
  { owner: "kimtaeyoon83", name: "mcp-server-youtube-transcript", language: "typescript", categories: ["media", "youtube"], description: "Fetch YouTube subtitles and transcripts for AI analysis" },
  { owner: "recursechat", name: "mcp-server-apple-shortcuts", language: "typescript", categories: ["integration", "apple"], description: "An MCP Server Integration with Apple Shortcuts" },
  { owner: "kimtth", name: "mcp-aoai-web-browsing", language: "python", categories: ["browser-automation", "azure"], description: "A minimal server/client MCP implementation using Azure OpenAI and Playwright" },
  { owner: "pskill9", name: "web-search", language: "typescript", categories: ["search", "google"], description: "An MCP server that enables free web searching using Google search results, with no API keys required" },
];

// Map GitHub language to our programming language enum
function mapLanguageToEnum(language: string): string {
  const languageMap: Record<string, string> = {
    "TypeScript": "typescript",
    "JavaScript": "typescript", // Grouping JavaScript with TypeScript
    "Python": "python",
    "Go": "go",
    "Rust": "rust",
    "C#": "csharp",
    "Java": "java",
  };
  
  return languageMap[language] || "other";
}

// Get deployment type emoji
function getDeploymentType(repo: string): "cloud" | "local" | "both" {
  if (repo.includes("🏠") && repo.includes("☁️")) return "both";
  if (repo.includes("🏠")) return "local";
  if (repo.includes("☁️")) return "cloud";
  return "local"; // Default
}

// Get OS compatibility from emoji
function getOsCompatibility(repo: string): string[] {
  const os: string[] = [];
  if (repo.includes("🍎")) os.push("macos");
  if (repo.includes("🪟")) os.push("windows");
  if (repo.includes("🐧")) os.push("linux");
  
  // Default to all if none specified
  if (os.length === 0) return ["macos", "windows", "linux"];
  return os;
}

// Extract license information from GitHub API response
function extractLicense(data: any): string {
  if (!data.license) return "Not specified";
  return data.license.spdx_id || data.license.name || "Not specified";
}

// Function to fetch the README content
async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    });
    
    if (!response.ok) {
      console.log(`README not found or error for ${owner}/${repo}: ${response.status}`);
      return "";
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error);
    return "";
  }
}

// Function to fetch contributors count
async function fetchContributorsCount(owner: string, repo: string): Promise<number> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      console.log(`Contributors not found or error for ${owner}/${repo}: ${response.status}`);
      return 0;
    }
    
    // Get total count from Link header
    const linkHeader = response.headers.get('Link');
    if (linkHeader && linkHeader.includes('rel="last"')) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // If no Link header with last page, count the contributors in the response
    const contributors = await response.json();
    return Array.isArray(contributors) ? contributors.length : 0;
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error);
    return 0;
  }
}

// Function to fetch package.json if available
async function fetchPackageJson(owner: string, repo: string): Promise<any> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    });
    
    if (!response.ok) {
      console.log(`package.json not found for ${owner}/${repo}`);
      return null;
    }
    
    const content = await response.text();
    return JSON.parse(content);
  } catch (error) {
    console.log(`Error or no package.json for ${owner}/${repo}`);
    return null;
  }
}

// Main function to fetch repository data
async function fetchRepoData(repo: { 
  owner: string; 
  name: string; 
  language: string; 
  categories: string[];
  description: string;
}) {
  console.log(`Fetching data for ${repo.owner}/${repo.name}`);
  
  try {
    // Fetch basic repository information
    const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Fetch additional information in parallel
    const [readme, contributorsCount, packageJson] = await Promise.all([
      fetchReadme(repo.owner, repo.name),
      fetchContributorsCount(repo.owner, repo.name),
      fetchPackageJson(repo.owner, repo.name)
    ]);
    
    // Extract version from package.json if available
    const version = packageJson ? packageJson.version || "N/A" : "N/A";
    
    // Determine deployment type based on repo description
    const fullDescription = `${repo.name} ${repo.description}`;
    const deploymentType = getDeploymentType(fullDescription);
    
    // Determine OS compatibility
    const os = getOsCompatibility(fullDescription);
    
    // Determine status (stable vs experimental)
    const status = data.description && 
                  (data.description.toLowerCase().includes("experimental") || 
                   data.description.toLowerCase().includes("alpha") || 
                   data.description.toLowerCase().includes("beta"))
                  ? "experimental" : "stable";
    
    // Extract tags from topics
    const tags = data.topics || [];
    if (tags.length === 0) {
      // Add basic tags based on categories
      tags.push('mcp', 'server', ...repo.categories);
    }
    
    // Format the data for our database schema
    const serverData = {
      id: `${repo.owner}-${repo.name}`.toLowerCase(),
      name: repo.name,
      description: repo.description || data.description || "MCP Server Implementation",
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || repo.language,
      programming_language: mapLanguageToEnum(data.language || repo.language),
      tags: tags.slice(0, 6),
      owner: repo.owner,
      last_updated: new Date(data.updated_at || new Date()).toISOString(),
      category: repo.categories[0] || "general",
      categories: repo.categories,
      implementation: "community",
      deployment_type: deploymentType,
      os,
      repo_url: data.html_url,
      status,
      readme: readme,
      issues_count: data.open_issues_count || 0,
      contributors_count: contributorsCount,
      license: extractLicense(data),
      version: version,
      homepage_url: data.homepage || null,
      repo_size: data.size || 0,
      watchers: data.watchers_count || 0,
      package_json: packageJson ? JSON.stringify(packageJson) : null
    };
    
    return serverData;
  } catch (error) {
    console.error(`Error fetching data for ${repo.owner}/${repo.name}:`, error);
    
    // Create a fallback server entry with minimal data
    return {
      id: `${repo.owner}-${repo.name}`.toLowerCase(),
      name: repo.name,
      description: repo.description || "MCP Server Implementation",
      stars: 0,
      forks: 0,
      language: repo.language,
      programming_language: mapLanguageToEnum(repo.language),
      tags: ['mcp', 'server', ...repo.categories],
      owner: repo.owner,
      last_updated: new Date().toISOString(),
      category: repo.categories[0] || "general",
      categories: repo.categories,
      implementation: "community",
      deployment_type: "local" as "local" | "cloud" | "both",
      os: ["macos", "windows", "linux"],
      repo_url: `https://github.com/${repo.owner}/${repo.name}`,
      status: "stable" as "stable" | "experimental",
      readme: "",
      issues_count: 0,
      contributors_count: 0,
      license: "Not specified",
      version: "N/A",
      homepage_url: null,
      repo_size: 0,
      watchers: 0,
      package_json: null
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting MCP servers fetch");
    const results = await Promise.all(repos.map(fetchRepoData));
    
    console.log(`Successfully fetched data for ${results.length} repositories`);
    
    // Store data in Supabase
    if (results.length > 0) {
      const { error } = await supabase
        .from('mock_servers')
        .upsert(results, { onConflict: 'id' });
      
      if (error) {
        console.error(`Error storing data in Supabase: ${error.message}`);
        throw new Error(`Error storing data in Supabase: ${error.message}`);
      }
      
      console.log(`Successfully stored data for ${results.length} repositories`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully fetched and stored data for ${results.length} repositories` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in fetch-mcp-servers function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

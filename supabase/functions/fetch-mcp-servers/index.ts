
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

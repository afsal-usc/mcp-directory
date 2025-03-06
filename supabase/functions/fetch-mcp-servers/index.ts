
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
  { owner: "openai", name: "mcp-server-ts", language: "typescript", categories: ["official"] },
  { owner: "anthropic", name: "claude-mcp", language: "python", categories: ["official"] },
  { owner: "mistralai", name: "mistral-mcp", language: "python", categories: ["official"] },
  { owner: "cohere-ai", name: "mcp-server-py", language: "python", categories: ["official"] },
  { owner: "google-gemini", name: "gemini-mcp", language: "python", categories: ["official"] },
  { owner: "fastchat-mcp", name: "fastchat-mcp", language: "python", categories: ["open-source", "self-hosted"] },
  { owner: "langchain-mcp", name: "langchain-mcp", language: "typescript", categories: ["framework"] },
  { owner: "llama-mcp", name: "llama-mcp-server", language: "python", categories: ["open-source", "self-hosted"] },
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

// Main function to fetch repository data
async function fetchRepoData(repo: { owner: string; name: string; language: string; categories: string[] }) {
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
    
    // Get README content to extract additional info
    const readmeResponse = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}/readme`, {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    
    let readmeContent = "";
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      const content = atob(readmeData.content); // Decode base64 content
      readmeContent = content;
    }
    
    // Extract tags from topics or readme
    const tags = data.topics || [];
    if (tags.length === 0) {
      // Extract potential tags from README
      const potentialTags = ['mcp', 'llm', 'server', 'ai', 'inference', 'deployment'];
      potentialTags.forEach(tag => {
        if (readmeContent.toLowerCase().includes(tag.toLowerCase())) {
          tags.push(tag);
        }
      });
    }
    
    // Determine deployment type based on readme content
    let deploymentType = "local"; // Default
    if (readmeContent.toLowerCase().includes("cloud") && readmeContent.toLowerCase().includes("local")) {
      deploymentType = "both";
    } else if (readmeContent.toLowerCase().includes("cloud") || 
               readmeContent.toLowerCase().includes("hosted") || 
               readmeContent.toLowerCase().includes("saas")) {
      deploymentType = "cloud";
    }
    
    // Determine implementation type
    const implementation = repo.categories.includes("official") ? "official" : "community";
    
    // Determine status (stable vs experimental)
    const status = readmeContent.toLowerCase().includes("experimental") || 
                  readmeContent.toLowerCase().includes("alpha") || 
                  readmeContent.toLowerCase().includes("beta") 
                  ? "experimental" : "stable";
    
    // Detect OS compatibility
    const os: string[] = [];
    if (readmeContent.toLowerCase().includes("macos") || 
        readmeContent.toLowerCase().includes("mac os") || 
        readmeContent.toLowerCase().includes("osx")) {
      os.push("macos");
    }
    if (readmeContent.toLowerCase().includes("windows")) {
      os.push("windows");
    }
    if (readmeContent.toLowerCase().includes("linux") || 
        readmeContent.toLowerCase().includes("ubuntu") || 
        readmeContent.toLowerCase().includes("debian")) {
      os.push("linux");
    }
    
    // If no OS is explicitly mentioned, assume all are supported
    if (os.length === 0) {
      os.push("macos", "windows", "linux");
    }
    
    // Format the data for our database schema
    const serverData = {
      id: `${repo.owner}-${repo.name}`.toLowerCase(),
      name: repo.name,
      description: data.description || "MCP Server Implementation",
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      language: data.language || repo.language,
      programmingLanguage: mapLanguageToEnum(data.language || repo.language),
      tags: tags.length > 0 ? tags.slice(0, 6) : ["mcp", "server"],
      owner: repo.owner,
      lastUpdated: new Date(data.updated_at || new Date()).toISOString(),
      category: repo.categories[0] || "general",
      categories: repo.categories,
      implementation,
      deploymentType,
      os,
      repoUrl: data.html_url,
      status,
    };
    
    return serverData;
  } catch (error) {
    console.error(`Error fetching data for ${repo.owner}/${repo.name}:`, error);
    return null;
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
    const validResults = results.filter(Boolean);
    
    console.log(`Successfully fetched data for ${validResults.length} repositories`);
    
    // Store data in Supabase
    if (validResults.length > 0) {
      const { error } = await supabase
        .from('mock_servers')
        .upsert(validResults, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Error storing data in Supabase: ${error.message}`);
      }
      
      console.log(`Successfully stored data for ${validResults.length} repositories`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully fetched and stored data for ${validResults.length} repositories` 
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

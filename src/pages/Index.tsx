
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { ServerCard, ServerData } from "@/components/ServerCard";
import { filterCategories } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { fetchMcpServers } from "@/lib/fetchMcpServers";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load servers from database
  useEffect(() => {
    const loadServers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('mock_servers')
          .select('*');
        
        if (error) {
          console.error('Error loading servers:', error);
          toast({
            title: "Error loading servers",
            description: error.message,
            variant: "destructive"
          });
          return;
        }
        
        // Transform database results to match ServerData type
        const transformedData: ServerData[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          stars: item.stars || 0,
          forks: item.forks || 0,
          language: item.language || "",
          tags: item.tags || [],
          owner: item.owner || "",
          lastUpdated: formatDateToRelative(item.last_updated),
          category: item.category || "",
          implementation: item.implementation as "official" | "community",
          deploymentType: item.deployment_type as "cloud" | "local" | "both",
          os: item.os as ("macos" | "windows" | "linux")[],
          repoUrl: item.repo_url || "",
          status: item.status as "stable" | "experimental",
          categories: item.categories || [],
          programmingLanguage: item.programming_language as any || "other",
        }));
        
        setServers(transformedData);
      } catch (err) {
        console.error('Unexpected error loading servers:', err);
        toast({
          title: "Error loading servers",
          description: "Failed to load server data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadServers();
  }, [toast]);
  
  // Function to manually trigger server data fetch
  const handleRefreshServers = async () => {
    toast({
      title: "Refreshing servers",
      description: "Fetching the latest data from GitHub...",
    });
    
    const result = await fetchMcpServers();
    
    if (result.success) {
      toast({
        title: "Servers refreshed",
        description: "The latest data has been fetched from GitHub",
      });
      
      // Reload the server data
      const { data, error } = await supabase
        .from('mock_servers')
        .select('*');
      
      if (!error && data) {
        // Transform database results to match ServerData type
        const transformedData: ServerData[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          stars: item.stars || 0,
          forks: item.forks || 0,
          language: item.language || "",
          tags: item.tags || [],
          owner: item.owner || "",
          lastUpdated: formatDateToRelative(item.last_updated),
          category: item.category || "",
          implementation: item.implementation as "official" | "community",
          deploymentType: item.deployment_type as "cloud" | "local" | "both",
          os: item.os as ("macos" | "windows" | "linux")[],
          repoUrl: item.repo_url || "",
          status: item.status as "stable" | "experimental",
          categories: item.categories || [],
          programmingLanguage: item.programming_language as any || "other",
        }));
        
        setServers(transformedData);
      }
    } else {
      toast({
        title: "Error refreshing servers",
        description: result.error?.message || "Failed to fetch server data",
        variant: "destructive"
      });
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleFilter = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
  };
  
  // Helper function to format dates
  const formatDateToRelative = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };
  
  const filteredServers = servers.filter(server => {
    // Search filter
    if (searchQuery && !server.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !server.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !server.categories.some(category => category.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Category filters
    for (const [category, selectedOptions] of Object.entries(activeFilters)) {
      if (selectedOptions.length === 0) continue;
      
      if (category === "Programming Language") {
        const languageMap: Record<string, ServerData["programmingLanguage"]> = {
          "TypeScript": "typescript",
          "Python": "python",
          "Go": "go",
          "Rust": "rust",
          "C#": "csharp",
          "Java": "java"
        };
        
        const matchedLanguages = selectedOptions.map(opt => languageMap[opt] || "other");
        if (!matchedLanguages.includes(server.programmingLanguage)) return false;
      }
      
      if (category === "Deployment") {
        const deploymentMap: Record<string, ServerData["deploymentType"]> = {
          "Cloud": "cloud",
          "Local": "local",
          "Both": "both"
        };
        
        const matchedDeployments = selectedOptions.map(opt => deploymentMap[opt]);
        if (!matchedDeployments.includes(server.deploymentType)) return false;
      }
      
      if (category === "Implementation") {
        const impMap: Record<string, ServerData["implementation"]> = {
          "Official": "official",
          "Community": "community"
        };
        
        const matchedImplementations = selectedOptions.map(opt => impMap[opt]);
        if (!matchedImplementations.includes(server.implementation)) return false;
      }
      
      if (category === "Status") {
        const statusMap: Record<string, ServerData["status"]> = {
          "Stable": "stable",
          "Experimental": "experimental"
        };
        
        const matchedStatuses = selectedOptions.map(opt => statusMap[opt]);
        if (!matchedStatuses.includes(server.status)) return false;
      }
      
      if (category === "Category") {
        if (!selectedOptions.some(option => server.categories.includes(option.toLowerCase()))) return false;
      }
      
      if (category === "Operating System") {
        if (!server.os) return false;
        
        const osMap: Record<string, "macos" | "windows" | "linux"> = {
          "macOS": "macos",
          "Windows": "windows",
          "Linux": "linux"
        };
        
        const matchedOS = selectedOptions.map(opt => osMap[opt]);
        if (!matchedOS.some(os => server.os?.includes(os))) return false;
      }
      
      // Simplified last updated filter implementation
      if (category === "Last Updated") {
        // This is simplified; in a real app you would check actual timestamps
        if (selectedOptions.includes("This week") && !server.lastUpdated.includes("day") && !server.lastUpdated.includes("week")) {
          return false;
        }
        if (selectedOptions.includes("This month") && server.lastUpdated.includes("month")) {
          return false;
        }
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="mt-20 pt-12 pb-16 flex flex-col items-center justify-center bg-gradient-to-b from-secondary/50 to-background border-b border-border">
        <div className="text-center mb-10 max-w-3xl mx-auto px-4">
          <div className="inline-block mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {servers.length}+ MCP Servers
          </div>
          <h1 className="text-4xl sm:text-5xl font-mono font-semibold mb-4">MCP Server Directory</h1>
          <p className="text-lg text-muted-foreground">
            Find, compare and deploy MCP servers for browser automation and integrations
          </p>
          <button 
            onClick={handleRefreshServers}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            Refresh GitHub Data
          </button>
        </div>
        
        <SearchBar onSearch={handleSearch} />
      </div>
      
      <Container className="flex-1 py-12">
        <FilterBar categories={filterCategories} onFilter={handleFilter} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[320px] rounded-xl bg-secondary/30 animate-pulse"></div>
            ))
          ) : filteredServers.length > 0 ? (
            filteredServers.map(server => (
              <div key={server.id} className="animate-slide-in">
                <ServerCard server={server} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No servers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilters({});
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </Container>
      
      <footer className="border-t border-border bg-card py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-mono font-bold text-lg">M</span>
                </div>
                <span className="font-mono font-semibold text-xl">MCP Directory</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The comprehensive directory for MCP server implementations.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">MCP Protocol</a></li>
                <li><a href="https://modelcontextprotocol.io/llms-full.txt" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">LLM Instructions</a></li>
                <li><a href="https://github.com/punkpeye/awesome-mcp-servers" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Awesome MCP Servers</a></li>
                <li><a href="https://github.com/punkpeye/awesome-mcp-clients" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Awesome MCP Clients</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://glama.ai/mcp/discord" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Discord</a></li>
                <li><a href="https://www.reddit.com/r/mcp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">Reddit</a></li>
                <li><a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookies</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Licenses</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MCP Directory. All rights reserved.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="https://discord.gg/modelcontextprotocol" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3857-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
              <a href="https://www.reddit.com/r/mcp" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22.25c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10zm6.5-10c0-.828-.671-1.5-1.5-1.5-.403 0-.768.156-1.05.418-1.028-.693-2.41-1.13-3.95-1.184l.675-3.21 2.226.47c.043.783.689 1.406 1.474 1.406.828 0 1.5-.672 1.5-1.5 0-.829-.672-1.5-1.5-1.5-.587 0-1.092.343-1.332.836l-2.474-.52a.375.375 0 0 0-.446.287l-.75 3.57c-1.573.031-2.99.475-4.04 1.18A1.485 1.485 0 0 0 5.5 10.75a1.49 1.49 0 0 0 1.5 1.5c.223 0 .433-.049.622-.134a3.22 3.22 0 0 0-.122.984c0 2.485 2.917 4.5 6.5 4.5s6.5-2.015 6.5-4.5c0-.337-.043-.662-.122-.984.19.085.399.134.622.134a1.49 1.49 0 0 0 1.5-1.5c0-.828-.671-1.5-1.5-1.5zm-10 1.5c-.828 0-1.5-.671-1.5-1.5 0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5zm5.5 4c-1.667 0-3.333-.5-4.667-1.5a.5.5 0 0 1 .667-.75c1 .75 2.333 1.25 4 1.25 1.667 0 3-.5 4-1.25a.5.5 0 0 1 .667.75c-1.333 1-3 1.5-4.667 1.5zm2.5-4c-.828 0-1.5-.671-1.5-1.5 0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;

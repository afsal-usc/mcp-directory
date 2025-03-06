
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/ui/container";
import { ServerDetail } from "@/components/ServerDetail";
import { ServerData } from "@/components/ServerCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ServerView = () => {
  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('mock_servers')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching server data:', error);
          toast.error("Failed to load server data", {
            description: error.message
          });
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.log('Server not found with ID:', id);
          setServer(null);
          setLoading(false);
          return;
        }
        
        // Map Supabase data to ServerData format
        const serverData: ServerData = {
          id: data.id,
          name: data.name,
          description: data.description || "",
          stars: data.stars || 0,
          forks: data.forks || 0,
          language: data.language || "JavaScript",
          tags: data.tags || [],
          owner: data.owner || "Unknown",
          lastUpdated: data.last_updated ? new Date(data.last_updated).toLocaleDateString() : "Unknown",
          category: data.category || "general",
          implementation: data.implementation as "official" | "community" || "community",
          deploymentType: data.deployment_type as "cloud" | "local" | "both" || "both",
          os: data.os as ("macos" | "windows" | "linux")[] || [],
          repoUrl: data.repo_url || `https://github.com/${data.owner}/${data.name}`,
          status: data.status as "stable" | "experimental" || "stable",
          categories: data.categories || [data.category || "general"],
          programmingLanguage: data.programming_language as ServerData["programmingLanguage"] || "typescript",
        };
        
        console.log('Fetched server data:', serverData);
        setServer(serverData);
      } catch (err) {
        console.error('Unexpected error fetching server:', err);
        toast.error("Failed to load server data", {
          description: "An unexpected error occurred"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchServerData();
    }
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 mt-20">
        <Container>
          {loading ? (
            <div className="py-12 space-y-4 animate-pulse">
              <div className="w-32 h-4 bg-secondary rounded"></div>
              <div className="h-40 bg-secondary rounded-xl"></div>
            </div>
          ) : server ? (
            <div className="py-12">
              <ServerDetail server={server} />
            </div>
          ) : (
            <div className="py-24 text-center">
              <h2 className="text-2xl font-medium mb-4">Server not found</h2>
              <p className="text-muted-foreground mb-8">
                The server you're looking for doesn't exist or has been removed.
              </p>
              <a 
                href="/"
                className="inline-flex items-center px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium"
              >
                Return to directory
              </a>
            </div>
          )}
        </Container>
      </div>
      
      <footer className="border-t border-border bg-card py-8">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MCP Directory. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default ServerView;

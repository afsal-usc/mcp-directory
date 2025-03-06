
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Container } from "@/components/ui/container";
import { ServerDetail } from "@/components/ServerDetail";
import { ServerData } from "@/components/ServerCard";
import { mockServers } from "@/lib/mockData";

const ServerView = () => {
  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch with a small delay
    const timer = setTimeout(() => {
      const foundServer = mockServers.find(s => s.id === id) || null;
      setServer(foundServer);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
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

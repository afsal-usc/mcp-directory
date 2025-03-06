
import { ArrowLeft, Star, GitFork, ExternalLink, Download, BookOpen, Code, Tag, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { ServerData } from "./ServerCard";
import { Button } from "@/components/ui/button";

interface ServerDetailProps {
  server: ServerData;
}

export function ServerDetail({ server }: ServerDetailProps) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Link 
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to directory
        </Link>
      </div>
      
      <div className="glass-card rounded-xl border border-border overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mr-4">
                  <span className="font-mono text-xl font-semibold text-primary">{server.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-mono font-semibold">{server.name}</h1>
                  <p className="text-muted-foreground">by {server.owner}</p>
                </div>
              </div>
              
              <p className="text-base mb-6">
                {server.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {server.tags.map(tag => (
                  <span key={tag} className="code-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 md:min-w-48">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-amber-500" />
                  <span>Stars</span>
                </div>
                <span className="font-mono font-medium">{server.stars}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <GitFork className="w-4 h-4 mr-2" />
                  <span>Forks</span>
                </div>
                <span className="font-mono font-medium">{server.forks}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  <span>Language</span>
                </div>
                <span className="font-mono font-medium">{server.language}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Updated</span>
                </div>
                <span className="font-mono font-medium">{server.lastUpdated}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            
            <Button
              variant="outline"
              size="lg"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            
            <Button
              variant="outline"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
          
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-mono font-medium mb-4">Installation</h2>
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6">
              <pre>npm install {server.name}</pre>
            </div>
            
            <h2 className="text-xl font-mono font-medium mb-4">Basic Usage</h2>
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`import { createMcpServer } from '${server.name}'

const server = createMcpServer({
  port: 8000,
  models: ['gpt-4', 'claude-3-opus']
})

server.start()`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

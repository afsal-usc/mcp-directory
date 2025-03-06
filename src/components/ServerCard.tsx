
import { Star, GitFork, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface ServerData {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  tags: string[];
  owner: string;
  lastUpdated: string;
  category: string;
}

interface ServerCardProps {
  server: ServerData;
}

export function ServerCard({ server }: ServerCardProps) {
  return (
    <Link
      to={`/server/${server.id}`}
      className="block h-full"
    >
      <div className="h-full glass-card hover-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 flex-grow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mr-3">
                <span className="font-mono text-sm font-semibold text-primary">{server.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-mono text-base font-medium">{server.name}</h3>
                <p className="text-xs text-muted-foreground">{server.owner}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-3.5 h-3.5 mr-1" />
                <span>{server.stars}</span>
              </div>
              <div className="flex items-center">
                <GitFork className="w-3.5 h-3.5 mr-1" />
                <span>{server.forks}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {server.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {server.tags.map(tag => (
              <span key={tag} className="code-badge">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-secondary/50">
          <span className="text-xs text-muted-foreground">
            Updated {server.lastUpdated}
          </span>
          <span className="text-xs font-mono flex items-center text-primary">
            View details
            <ArrowUpRight className="ml-1 w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

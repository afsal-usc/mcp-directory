
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
  // New fields
  implementation: "official" | "community";
  deploymentType: "cloud" | "local" | "both";
  os?: ("macos" | "windows" | "linux")[];
  repoUrl: string;
  status: "stable" | "experimental";
  categories: string[];
  programmingLanguage: "typescript" | "python" | "go" | "rust" | "csharp" | "java" | "other";
}

interface ServerCardProps {
  server: ServerData;
}

export function ServerCard({ server }: ServerCardProps) {
  // Get language display info
  const languageInfo = getLanguageInfo(server.programmingLanguage);

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
          
          <div className="flex flex-wrap gap-2 mb-3">
            {server.implementation === "official" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Official
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center" 
              style={{ backgroundColor: languageInfo.bgColor, color: languageInfo.textColor }}>
              {languageInfo.icon}
              <span className="ml-1">{languageInfo.name}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {server.deploymentType === "both" ? "Cloud/Local" : server.deploymentType}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {server.tags.slice(0, 3).map(tag => (
              <span key={tag} className="code-badge">
                {tag}
              </span>
            ))}
            {server.tags.length > 3 && (
              <span className="code-badge">+{server.tags.length - 3}</span>
            )}
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

// Helper function to get language display information
function getLanguageInfo(language: ServerData["programmingLanguage"]) {
  switch (language) {
    case "typescript":
      return { name: "TypeScript", bgColor: "#3178c6", textColor: "#fff", icon: "📇" };
    case "python":
      return { name: "Python", bgColor: "#3776AB", textColor: "#fff", icon: "🐍" };
    case "go":
      return { name: "Go", bgColor: "#00ADD8", textColor: "#fff", icon: "🏎️" };
    case "rust":
      return { name: "Rust", bgColor: "#DEA584", textColor: "#000", icon: "🦀" };
    case "csharp":
      return { name: "C#", bgColor: "#178600", textColor: "#fff", icon: "#️⃣" };
    case "java":
      return { name: "Java", bgColor: "#B07219", textColor: "#fff", icon: "☕" };
    default:
      return { name: "Other", bgColor: "#6e6e6e", textColor: "#fff", icon: "🧩" };
  }
}


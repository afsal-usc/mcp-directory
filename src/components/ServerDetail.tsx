
import { ArrowLeft, Star, GitFork, ExternalLink, Download, BookOpen, Code, Tag, Calendar, Cloud, Home, Globe, Server, Users, AlertCircle, Scale, FileCode, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { ServerData } from "./ServerCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";

interface ServerDetailProps {
  server: ServerData;
  readmeContent?: string | null;
}

export function ServerDetail({ server, readmeContent }: ServerDetailProps) {
  // Get language display info
  const languageInfo = getLanguageInfo(server.programmingLanguage);
  
  // Format categories for display
  const formatCategories = (categories: string[]) => {
    return categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(", ");
  };

  // Get deployment type icon
  const getDeploymentIcon = (type: string) => {
    if (type === "cloud") return <Cloud className="w-4 h-4 mr-2 text-blue-500" />;
    if (type === "local") return <Home className="w-4 h-4 mr-2 text-green-500" />;
    return <Globe className="w-4 h-4 mr-2 text-purple-500" />;
  };

  // Get OS compatibility badges
  const getOSBadges = (os?: ("macos" | "windows" | "linux")[]) => {
    if (!os || os.length === 0) return null;
    
    return (
      <div className="flex gap-2 my-4">
        {os.includes("macos") && (
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            🍎 macOS
          </span>
        )}
        {os.includes("windows") && (
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            🪟 Windows
          </span>
        )}
        {os.includes("linux") && (
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
            🐧 Linux
          </span>
        )}
      </div>
    );
  };

  // Format file size from bytes to KB/MB
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
                  <div className="flex items-center">
                    <h1 className="text-2xl font-mono font-semibold">{server.name}</h1>
                    {server.implementation === "official" && (
                      <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Official
                      </span>
                    )}
                    {server.version && server.version !== "N/A" && (
                      <span className="ml-3 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        v{server.version}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">by {server.owner}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center" 
                  style={{ backgroundColor: languageInfo.bgColor, color: languageInfo.textColor }}>
                  {languageInfo.icon}
                  <span className="ml-1">{languageInfo.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center">
                  {getDeploymentIcon(server.deploymentType)}
                  {server.deploymentType === "both" ? "Cloud/Local" : server.deploymentType.charAt(0).toUpperCase() + server.deploymentType.slice(1)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                </span>
                {server.license && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center">
                    <Scale className="w-3 h-3 mr-1" />
                    {server.license}
                  </span>
                )}
              </div>
              
              {getOSBadges(server.os)}
              
              <p className="text-base mb-6">
                {server.description}
              </p>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {server.categories.map(category => (
                    <span key={category} className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              
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
                  <Eye className="w-4 h-4 mr-2" />
                  <span>Watchers</span>
                </div>
                <span className="font-mono font-medium">{server.watchers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                  <span>Issues</span>
                </div>
                <span className="font-mono font-medium">{server.issuesCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-500" />
                  <span>Contributors</span>
                </div>
                <span className="font-mono font-medium">{server.contributorsCount || 0}</span>
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
                  <FileCode className="w-4 h-4 mr-2 text-green-500" />
                  <span>Size</span>
                </div>
                <span className="font-mono font-medium">{formatFileSize(server.repoSize)}</span>
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
              onClick={() => window.open(server.repoUrl, "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`${server.repoUrl}#readme`, "_blank")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            
            {server.homepageUrl ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(server.homepageUrl!, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Homepage
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(server.repoUrl, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            )}
          </div>
          
          <Tabs defaultValue="installation" className="border-t border-border pt-8">
            <TabsList className="mb-6">
              <TabsTrigger value="installation">Installation</TabsTrigger>
              <TabsTrigger value="usage">Basic Usage</TabsTrigger>
              {readmeContent && <TabsTrigger value="readme">README</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="installation">
              <h2 className="text-xl font-mono font-medium mb-4">Installation</h2>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6">
                <pre>npm install {server.name}</pre>
              </div>
              
              {server.packageJson && server.packageJson.dependencies && (
                <div className="mt-8">
                  <h3 className="text-lg font-mono font-medium mb-4">Dependencies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(server.packageJson.dependencies).map(([dep, ver]: [string, any]) => (
                      <div key={dep} className="bg-secondary/50 rounded-lg p-3">
                        <div className="font-mono text-sm">{dep}</div>
                        <div className="text-xs text-muted-foreground">{ver}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="usage">
              <h2 className="text-xl font-mono font-medium mb-4">Basic Usage</h2>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`import { createMcpServer } from '${server.name}'

const server = createMcpServer({
  port: 8000,
  models: ['gpt-4', 'claude-3-opus']
})

server.start()`}</pre>
              </div>
            </TabsContent>
            
            {readmeContent && (
              <TabsContent value="readme">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{readmeContent}</ReactMarkdown>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
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

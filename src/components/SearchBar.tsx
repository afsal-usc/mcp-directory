
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto animate-fade-in"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/5 rounded-xl blur-xl group-hover:bg-primary/10 transition-colors duration-500 opacity-0 group-hover:opacity-100"></div>
        <div className="relative flex items-center overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <Search className="h-5 w-5 text-muted-foreground ml-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for MCP servers by name, features, or capabilities..."
            className="flex-1 border-0 bg-transparent py-4 px-4 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-0 sm:text-sm"
          />
          <button
            type="submit"
            className="mr-2 h-10 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

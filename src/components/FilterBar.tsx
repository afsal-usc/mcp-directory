
import { useState } from "react";
import { Filter, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterCategory = {
  name: string;
  options: string[];
};

interface FilterBarProps {
  categories: FilterCategory[];
  onFilter: (filters: Record<string, string[]>) => void;
}

export function FilterBar({ categories, onFilter }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (categoryName: string) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  const toggleFilter = (category: string, option: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[category]) {
        newFilters[category] = [];
      }
      
      if (newFilters[category].includes(option)) {
        newFilters[category] = newFilters[category].filter(item => item !== option);
        if (newFilters[category].length === 0) {
          delete newFilters[category];
        }
      } else {
        newFilters[category] = [...newFilters[category], option];
      }
      
      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    onFilter(activeFilters);
    setOpenCategory(null);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    onFilter({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, options) => count + options.length, 0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4 animate-fade-in">
      <div className="flex items-center mr-4 text-sm font-medium">
        <Filter className="w-4 h-4 mr-2" />
        <span>Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {getActiveFilterCount()}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div key={category.name} className="relative">
            <button
              type="button"
              className={cn(
                "flex items-center space-x-1 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                openCategory === category.name
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card hover:bg-secondary",
                activeFilters[category.name]?.length
                  ? "font-medium text-primary"
                  : "font-normal text-foreground"
              )}
              onClick={() => toggleCategory(category.name)}
            >
              <span>{category.name}</span>
              {activeFilters[category.name]?.length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {activeFilters[category.name]?.length}
                </span>
              )}
              {openCategory === category.name ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            
            {openCategory === category.name && (
              <div className="absolute z-10 mt-2 min-w-[240px] max-h-[300px] overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg animate-scale-in">
                <div className="space-y-1 py-1">
                  {category.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-secondary"
                      onClick={() => toggleFilter(category.name, option)}
                    >
                      <span>{option}</span>
                      {activeFilters[category.name]?.includes(option) ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleClearFilters}
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={handleApplyFilters}
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {getActiveFilterCount() > 0 && (
        <button
          type="button"
          className="ml-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={handleClearFilters}
        >
          Clear all
        </button>
      )}
    </div>
  );
}

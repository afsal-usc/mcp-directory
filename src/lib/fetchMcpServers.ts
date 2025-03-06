
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function fetchMcpServers() {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-mcp-servers');
    
    if (error) {
      console.error('Error fetching MCP servers:', error);
      toast.error("Failed to refresh server data", {
        description: error.message || "An unexpected error occurred"
      });
      return { success: false, error };
    }
    
    toast.success("GitHub data refreshed", {
      description: "The latest MCP server data has been fetched successfully"
    });
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching MCP servers:', err);
    toast.error("Failed to refresh server data", {
      description: "An unexpected error occurred"
    });
    return { success: false, error: err };
  }
}

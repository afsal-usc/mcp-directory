
import { supabase } from "@/integrations/supabase/client";

export async function fetchMcpServers() {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-mcp-servers');
    
    if (error) {
      console.error('Error fetching MCP servers:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error fetching MCP servers:', err);
    return { success: false, error: err };
  }
}

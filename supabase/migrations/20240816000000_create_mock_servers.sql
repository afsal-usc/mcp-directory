
-- Create table to store MCP server data
CREATE TABLE IF NOT EXISTS public.mock_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  language TEXT,
  programming_language TEXT CHECK (programming_language IN ('typescript', 'python', 'go', 'rust', 'csharp', 'java', 'other')),
  tags TEXT[] DEFAULT '{}',
  owner TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  category TEXT,
  categories TEXT[] DEFAULT '{}',
  implementation TEXT CHECK (implementation IN ('official', 'community')),
  deployment_type TEXT CHECK (deployment_type IN ('cloud', 'local', 'both')),
  os TEXT[] DEFAULT '{}',
  repo_url TEXT,
  status TEXT CHECK (status IN ('stable', 'experimental'))
);

-- Create RLS policies for mock_servers table
ALTER TABLE public.mock_servers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to mock_servers
CREATE POLICY "Allow public read access to mock_servers"
  ON public.mock_servers
  FOR SELECT 
  USING (true);

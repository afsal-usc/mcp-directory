export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      mcp_servers: {
        Row: {
          categories: string[] | null
          created_at: string | null
          deployment_type: string | null
          description: string | null
          forks: number | null
          id: string
          is_official: boolean | null
          language: string | null
          last_updated: string | null
          name: string
          os: string[] | null
          readme: string | null
          repo_full_name: string
          stars: number | null
          status: string | null
          topics: string[] | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          deployment_type?: string | null
          description?: string | null
          forks?: number | null
          id?: string
          is_official?: boolean | null
          language?: string | null
          last_updated?: string | null
          name: string
          os?: string[] | null
          readme?: string | null
          repo_full_name: string
          stars?: number | null
          status?: string | null
          topics?: string[] | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          deployment_type?: string | null
          description?: string | null
          forks?: number | null
          id?: string
          is_official?: boolean | null
          language?: string | null
          last_updated?: string | null
          name?: string
          os?: string[] | null
          readme?: string | null
          repo_full_name?: string
          stars?: number | null
          status?: string | null
          topics?: string[] | null
        }
        Relationships: []
      }
      mock_servers: {
        Row: {
          categories: string[] | null
          category: string | null
          contributors_count: number | null
          deployment_type: string | null
          description: string | null
          forks: number | null
          homepage_url: string | null
          id: string
          implementation: string | null
          issues_count: number | null
          language: string | null
          last_updated: string | null
          license: string | null
          name: string
          os: string[] | null
          owner: string | null
          package_json: Json | null
          programming_language: string | null
          readme: string | null
          repo_size: number | null
          repo_url: string | null
          stars: number | null
          status: string | null
          tags: string[] | null
          version: string | null
          watchers: number | null
        }
        Insert: {
          categories?: string[] | null
          category?: string | null
          contributors_count?: number | null
          deployment_type?: string | null
          description?: string | null
          forks?: number | null
          homepage_url?: string | null
          id: string
          implementation?: string | null
          issues_count?: number | null
          language?: string | null
          last_updated?: string | null
          license?: string | null
          name: string
          os?: string[] | null
          owner?: string | null
          package_json?: Json | null
          programming_language?: string | null
          readme?: string | null
          repo_size?: number | null
          repo_url?: string | null
          stars?: number | null
          status?: string | null
          tags?: string[] | null
          version?: string | null
          watchers?: number | null
        }
        Update: {
          categories?: string[] | null
          category?: string | null
          contributors_count?: number | null
          deployment_type?: string | null
          description?: string | null
          forks?: number | null
          homepage_url?: string | null
          id?: string
          implementation?: string | null
          issues_count?: number | null
          language?: string | null
          last_updated?: string | null
          license?: string | null
          name?: string
          os?: string[] | null
          owner?: string | null
          package_json?: Json | null
          programming_language?: string | null
          readme?: string | null
          repo_size?: number | null
          repo_url?: string | null
          stars?: number | null
          status?: string | null
          tags?: string[] | null
          version?: string | null
          watchers?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analysis_runs: {
        Row: {
          agent_progress: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          initiated_by: string
          script_id: string
          stakeholder_lens: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["analysis_status"]
        }
        Insert: {
          agent_progress?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by: string
          script_id: string
          stakeholder_lens?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
        }
        Update: {
          agent_progress?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          initiated_by?: string
          script_id?: string
          stakeholder_lens?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
        }
        Relationships: [
          {
            foreignKeyName: "analysis_runs_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          arc_summary: string | null
          created_at: string
          description: string | null
          dialogue_count: number | null
          first_appearance: number | null
          id: string
          name: string
          relationships: Json | null
          scene_count: number | null
          script_id: string
        }
        Insert: {
          arc_summary?: string | null
          created_at?: string
          description?: string | null
          dialogue_count?: number | null
          first_appearance?: number | null
          id?: string
          name: string
          relationships?: Json | null
          scene_count?: number | null
          script_id: string
        }
        Update: {
          arc_summary?: string | null
          created_at?: string
          description?: string | null
          dialogue_count?: number | null
          first_appearance?: number | null
          id?: string
          name?: string
          relationships?: Json | null
          scene_count?: number | null
          script_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          actionable: boolean | null
          analysis_run_id: string
          category: string
          created_at: string
          description: string
          id: string
          priority: number | null
          related_parameters: string[] | null
          supporting_evidence: Json | null
          title: string
        }
        Insert: {
          actionable?: boolean | null
          analysis_run_id: string
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: number | null
          related_parameters?: string[] | null
          supporting_evidence?: Json | null
          title: string
        }
        Update: {
          actionable?: boolean | null
          analysis_run_id?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: number | null
          related_parameters?: string[] | null
          supporting_evidence?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lens_weights: {
        Row: {
          id: string
          lens: Database["public"]["Enums"]["stakeholder_lens"]
          parameter_id: string
          weight: number
        }
        Insert: {
          id?: string
          lens: Database["public"]["Enums"]["stakeholder_lens"]
          parameter_id: string
          weight?: number
        }
        Update: {
          id?: string
          lens?: Database["public"]["Enums"]["stakeholder_lens"]
          parameter_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "lens_weights_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      narrative_graphs: {
        Row: {
          created_at: string
          edges: Json
          graph_type: string
          id: string
          metadata: Json | null
          nodes: Json
          script_id: string
        }
        Insert: {
          created_at?: string
          edges?: Json
          graph_type: string
          id?: string
          metadata?: Json | null
          nodes?: Json
          script_id: string
        }
        Update: {
          created_at?: string
          edges?: Json
          graph_type?: string
          id?: string
          metadata?: Json | null
          nodes?: Json
          script_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "narrative_graphs_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      parameter_scores: {
        Row: {
          agent_name: string
          analysis_run_id: string
          confidence: number | null
          created_at: string
          evidence: Json | null
          id: string
          parameter_id: string
          rationale: string | null
          score: number
        }
        Insert: {
          agent_name: string
          analysis_run_id: string
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          parameter_id: string
          rationale?: string | null
          score: number
        }
        Update: {
          agent_name?: string
          analysis_run_id?: string
          confidence?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          parameter_id?: string
          rationale?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "parameter_scores_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parameter_scores_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      parameters: {
        Row: {
          agent_source: string
          category: string
          created_at: string
          default_weight: number | null
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          agent_source: string
          category: string
          created_at?: string
          default_weight?: number | null
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          agent_source?: string
          category?: string
          created_at?: string
          default_weight?: number | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_organization_id: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_organization_id?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          analysis_run_id: string
          created_at: string
          executive_summary: string | null
          full_report_data: Json
          id: string
          lens_scores: Json | null
          organization_id: string
          overall_score: number | null
          pdf_url: string | null
          script_id: string
          title: string
        }
        Insert: {
          analysis_run_id: string
          created_at?: string
          executive_summary?: string | null
          full_report_data?: Json
          id?: string
          lens_scores?: Json | null
          organization_id: string
          overall_score?: number | null
          pdf_url?: string | null
          script_id: string
          title: string
        }
        Update: {
          analysis_run_id?: string
          created_at?: string
          executive_summary?: string | null
          full_report_data?: Json
          id?: string
          lens_scores?: Json | null
          organization_id?: string
          overall_score?: number | null
          pdf_url?: string | null
          script_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scenes: {
        Row: {
          created_at: string
          description: string | null
          emotional_tone: string | null
          heading: string
          id: string
          int_ext: string | null
          location: string | null
          page_end: number | null
          page_start: number | null
          scene_number: number
          script_id: string
          time_of_day: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          emotional_tone?: string | null
          heading: string
          id?: string
          int_ext?: string | null
          location?: string | null
          page_end?: number | null
          page_start?: number | null
          scene_number: number
          script_id: string
          time_of_day?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          emotional_tone?: string | null
          heading?: string
          id?: string
          int_ext?: string | null
          location?: string | null
          page_end?: number | null
          page_start?: number | null
          scene_number?: number
          script_id?: string
          time_of_day?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenes_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      script_versions: {
        Row: {
          created_at: string
          created_by: string
          file_url: string
          id: string
          notes: string | null
          script_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by: string
          file_url: string
          id?: string
          notes?: string | null
          script_id: string
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          file_url?: string
          id?: string
          notes?: string | null
          script_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "script_versions_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          created_at: string
          file_size_bytes: number | null
          file_url: string
          format: Database["public"]["Enums"]["script_format"]
          genre: string | null
          id: string
          logline: string | null
          organization_id: string
          page_count: number | null
          script_type: Database["public"]["Enums"]["script_type"]
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_size_bytes?: number | null
          file_url: string
          format: Database["public"]["Enums"]["script_format"]
          genre?: string | null
          id?: string
          logline?: string | null
          organization_id: string
          page_count?: number | null
          script_type?: Database["public"]["Enums"]["script_type"]
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_size_bytes?: number | null
          file_url?: string
          format?: Database["public"]["Enums"]["script_format"]
          genre?: string | null
          id?: string
          logline?: string | null
          organization_id?: string
          page_count?: number | null
          script_type?: Database["public"]["Enums"]["script_type"]
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholder_reports: {
        Row: {
          created_at: string
          executive_summary: string | null
          generated_at: string
          id: string
          is_stale: boolean | null
          relevant_insights: Json | null
          relevant_parameters: Json | null
          report_id: string
          stakeholder_lens: string
          stakeholder_score: number | null
        }
        Insert: {
          created_at?: string
          executive_summary?: string | null
          generated_at?: string
          id?: string
          is_stale?: boolean | null
          relevant_insights?: Json | null
          relevant_parameters?: Json | null
          report_id: string
          stakeholder_lens: string
          stakeholder_score?: number | null
        }
        Update: {
          created_at?: string
          executive_summary?: string | null
          generated_at?: string
          id?: string
          is_stale?: boolean | null
          relevant_insights?: Json | null
          relevant_parameters?: Json | null
          report_id?: string
          stakeholder_lens?: string
          stakeholder_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholder_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_current_org: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      analysis_status: "pending" | "processing" | "completed" | "failed"
      app_role: "admin" | "analyst" | "viewer"
      script_format: "pdf" | "fdx" | "fountain" | "highland" | "txt" | "docx"
      script_type:
        | "feature"
        | "pilot"
        | "episode"
        | "short"
        | "documentary"
        | "comic"
      stakeholder_lens:
        | "studio_executive"
        | "producer"
        | "actor"
        | "director"
        | "writer"
        | "financier"
        | "ott_platform"
        | "theatrical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_status: ["pending", "processing", "completed", "failed"],
      app_role: ["admin", "analyst", "viewer"],
      script_format: ["pdf", "fdx", "fountain", "highland", "txt", "docx"],
      script_type: [
        "feature",
        "pilot",
        "episode",
        "short",
        "documentary",
        "comic",
      ],
      stakeholder_lens: [
        "studio_executive",
        "producer",
        "actor",
        "director",
        "writer",
        "financier",
        "ott_platform",
        "theatrical",
      ],
    },
  },
} as const

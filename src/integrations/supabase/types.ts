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
      agent_configurations: {
        Row: {
          agent_name: string
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          organization_id: string | null
          parameters: string[]
          system_prompt: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          agent_name: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          organization_id?: string | null
          parameters?: string[]
          system_prompt: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          agent_name?: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          organization_id?: string | null
          parameters?: string[]
          system_prompt?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_model_mappings: {
        Row: {
          agent_name: string
          config_id: string | null
          created_at: string | null
          id: string
          max_retries: number | null
          model: string
          retry_delay_ms: number | null
          temperature: number | null
        }
        Insert: {
          agent_name: string
          config_id?: string | null
          created_at?: string | null
          id?: string
          max_retries?: number | null
          model: string
          retry_delay_ms?: number | null
          temperature?: number | null
        }
        Update: {
          agent_name?: string
          config_id?: string | null
          created_at?: string | null
          id?: string
          max_retries?: number | null
          model?: string
          retry_delay_ms?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_model_mappings_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "model_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompt_versions: {
        Row: {
          agent_config_id: string
          change_summary: string | null
          created_at: string
          created_by: string
          description: string | null
          display_name: string
          id: string
          parameters: string[]
          system_prompt: string
          version_number: number
        }
        Insert: {
          agent_config_id: string
          change_summary?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          display_name: string
          id?: string
          parameters?: string[]
          system_prompt: string
          version_number?: number
        }
        Update: {
          agent_config_id?: string
          change_summary?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          display_name?: string
          id?: string
          parameters?: string[]
          system_prompt?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_prompt_versions_agent_config_id_fkey"
            columns: ["agent_config_id"]
            isOneToOne: false
            referencedRelation: "agent_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_runs: {
        Row: {
          agent_progress: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          initiated_by: string
          max_retries: number
          parent_run_id: string | null
          quality_mode: string | null
          retry_count: number
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
          max_retries?: number
          parent_run_id?: string | null
          quality_mode?: string | null
          retry_count?: number
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
          max_retries?: number
          parent_run_id?: string | null
          quality_mode?: string | null
          retry_count?: number
          script_id?: string
          stakeholder_lens?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
        }
        Relationships: [
          {
            foreignKeyName: "analysis_runs_parent_run_id_fkey"
            columns: ["parent_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
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
      model_config_audit_log: {
        Row: {
          agent_name: string | null
          change_type: string
          changed_by: string
          config_id: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          summary: string | null
        }
        Insert: {
          agent_name?: string | null
          change_type: string
          changed_by: string
          config_id: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          summary?: string | null
        }
        Update: {
          agent_name?: string | null
          change_type?: string
          changed_by?: string
          config_id?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_config_audit_log_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "model_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      model_configurations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      parser_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          updated_at: string
          value: string
          value_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          updated_at?: string
          value: string
          value_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          updated_at?: string
          value?: string
          value_type?: string
        }
        Relationships: []
      }
      parser_stopwords: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          word: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          word: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          word?: string
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
          episode_length_class: string | null
          file_size_bytes: number | null
          file_url: string
          format: Database["public"]["Enums"]["script_format"]
          genre: string | null
          id: string
          logline: string | null
          organization_id: string
          page_count: number | null
          script_type: Database["public"]["Enums"]["script_type"]
          subgenre: string | null
          theme: string | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          episode_length_class?: string | null
          file_size_bytes?: number | null
          file_url: string
          format: Database["public"]["Enums"]["script_format"]
          genre?: string | null
          id?: string
          logline?: string | null
          organization_id: string
          page_count?: number | null
          script_type?: Database["public"]["Enums"]["script_type"]
          subgenre?: string | null
          theme?: string | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          episode_length_class?: string | null
          file_size_bytes?: number | null
          file_url?: string
          format?: Database["public"]["Enums"]["script_format"]
          genre?: string | null
          id?: string
          logline?: string | null
          organization_id?: string
          page_count?: number | null
          script_type?: Database["public"]["Enums"]["script_type"]
          subgenre?: string | null
          theme?: string | null
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
          adapted_insights: Json | null
          adapted_recommendations: Json | null
          created_at: string
          executive_summary: string | null
          generated_at: string
          id: string
          is_stale: boolean | null
          key_metrics: Json | null
          relevant_insights: Json | null
          relevant_parameters: Json | null
          report_id: string
          stakeholder_lens: string
          stakeholder_score: number | null
          vocabulary_version: string | null
        }
        Insert: {
          adapted_insights?: Json | null
          adapted_recommendations?: Json | null
          created_at?: string
          executive_summary?: string | null
          generated_at?: string
          id?: string
          is_stale?: boolean | null
          key_metrics?: Json | null
          relevant_insights?: Json | null
          relevant_parameters?: Json | null
          report_id: string
          stakeholder_lens: string
          stakeholder_score?: number | null
          vocabulary_version?: string | null
        }
        Update: {
          adapted_insights?: Json | null
          adapted_recommendations?: Json | null
          created_at?: string
          executive_summary?: string | null
          generated_at?: string
          id?: string
          is_stale?: boolean | null
          key_metrics?: Json | null
          relevant_insights?: Json | null
          relevant_parameters?: Json | null
          report_id?: string
          stakeholder_lens?: string
          stakeholder_score?: number | null
          vocabulary_version?: string | null
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
      invitations_safe: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string | null
          invited_by: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
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
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      get_user_current_org: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_agent_progress: {
        Args: {
          p_agent_name: string
          p_analysis_run_id: string
          p_error?: string
          p_model?: string
          p_section_content?: Json
          p_status: string
        }
        Returns: undefined
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
        | "web_series"
        | "micro_drama"
        | "stage_play"
        | "audio_drama"
        | "podcast_fiction"
        | "game_narrative"
      stakeholder_lens:
        | "studio_executive"
        | "producer"
        | "actor"
        | "director"
        | "writer"
        | "financier"
        | "ott_platform"
        | "theatrical"
        | "investor"
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
        "web_series",
        "micro_drama",
        "stage_play",
        "audio_drama",
        "podcast_fiction",
        "game_narrative",
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
        "investor",
      ],
    },
  },
} as const

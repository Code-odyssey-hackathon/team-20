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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          correct_count: number
          duration_seconds: number
          finished_at: string
          game_type: string
          id: string
          mode: string
          room_id: string | null
          score: number
          topic_id: string | null
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct_count?: number
          duration_seconds?: number
          finished_at?: string
          game_type?: string
          id?: string
          mode?: string
          room_id?: string | null
          score?: number
          topic_id?: string | null
          total_questions?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          correct_count?: number
          duration_seconds?: number
          finished_at?: string
          game_type?: string
          id?: string
          mode?: string
          room_id?: string | null
          score?: number
          topic_id?: string | null
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          coins: number
          created_at: string
          display_name: string | null
          id: string
          level: number
          tier: string
          total_xp: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          id: string
          level?: number
          tier?: string
          total_xp?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          tier?: string
          total_xp?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      question_history: {
        Row: {
          created_at: string
          feedback: Json | null
          id: string
          level: number
          prompt: Json
          submitted_at: string | null
          topics: string[]
          track: Database["public"]["Enums"]["track_kind"]
          user_code: string | null
          user_id: string
          verdict: string | null
          xp_awarded: number
        }
        Insert: {
          created_at?: string
          feedback?: Json | null
          id?: string
          level: number
          prompt: Json
          submitted_at?: string | null
          topics?: string[]
          track: Database["public"]["Enums"]["track_kind"]
          user_code?: string | null
          user_id: string
          verdict?: string | null
          xp_awarded?: number
        }
        Update: {
          created_at?: string
          feedback?: Json | null
          id?: string
          level?: number
          prompt?: Json
          submitted_at?: string | null
          topics?: string[]
          track?: Database["public"]["Enums"]["track_kind"]
          user_code?: string | null
          user_id?: string
          verdict?: string | null
          xp_awarded?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_index: number
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          options: Json
          question: string
          source: string
          topic_id: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
          source?: string
          topic_id: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          source?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          correct_count: number
          finished: boolean
          finished_at: string | null
          joined_at: string
          room_id: string
          score: number
          user_id: string
        }
        Insert: {
          correct_count?: number
          finished?: boolean
          finished_at?: string | null
          joined_at?: string
          room_id: string
          score?: number
          user_id: string
        }
        Update: {
          correct_count?: number
          finished?: boolean
          finished_at?: string | null
          joined_at?: string
          room_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          game_type: string
          host_id: string
          id: string
          party_size: number
          questions: Json | null
          started_at: string | null
          status: string
          topic_id: string
        }
        Insert: {
          code: string
          created_at?: string
          game_type: string
          host_id: string
          id?: string
          party_size: number
          questions?: Json | null
          started_at?: string | null
          status?: string
          topic_id: string
        }
        Update: {
          code?: string
          created_at?: string
          game_type?: string
          host_id?: string
          id?: string
          party_size?: number
          questions?: Json | null
          started_at?: string | null
          status?: string
          topic_id?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          kind: string
          name: string
          payload: Json
          price: number
          slug: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          kind: string
          name: string
          payload?: Json
          price: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          kind?: string
          name?: string
          payload?: Json
          price?: number
          slug?: string
        }
        Relationships: []
      }
      story_progress: {
        Row: {
          language: string
          max_level: number
          total_solved: number
          updated_at: string
          user_id: string
        }
        Insert: {
          language?: string
          max_level?: number
          total_solved?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          language?: string
          max_level?: number
          total_solved?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topic_mastery: {
        Row: {
          attempts: number
          correct: number
          id: string
          mastery_score: number
          topic: string
          track: Database["public"]["Enums"]["track_kind"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          correct?: number
          id?: string
          mastery_score?: number
          topic: string
          track: Database["public"]["Enums"]["track_kind"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          correct?: number
          id?: string
          mastery_score?: number
          topic?: string
          track?: Database["public"]["Enums"]["track_kind"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          acquired_at: string
          active: boolean
          id: string
          item_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          active?: boolean
          id?: string
          item_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          active?: boolean
          id?: string
          item_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string
          current_center: string | null
          id: string
          last_active_at: string | null
          level: number
          streak: number
          track: Database["public"]["Enums"]["track_kind"]
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_center?: string | null
          id?: string
          last_active_at?: string | null
          level?: number
          streak?: number
          track: Database["public"]["Enums"]["track_kind"]
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_center?: string | null
          id?: string
          last_active_at?: string | null
          level?: number
          streak?: number
          track?: Database["public"]["Enums"]["track_kind"]
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          id: string | null
          level: number | null
          matches_played: number | null
          total_correct: number | null
          total_xp: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_coins: { Args: { p_coins: number }; Returns: undefined }
      add_xp: { Args: { p_xp: number }; Returns: undefined }
      purchase_item: { Args: { p_item_id: string }; Returns: Json }
    }
    Enums: {
      track_kind: "python" | "cpp"
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
      track_kind: ["python", "cpp"],
    },
  },
} as const

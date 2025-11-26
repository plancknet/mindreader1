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
      coupon_redemptions: {
        Row: {
          amount: number
          coupon_code: string
          created_at: string
          id: string
          influencer_id: string
          redeemed_at: string
        }
        Insert: {
          amount?: number
          coupon_code: string
          created_at?: string
          id?: string
          influencer_id: string
          redeemed_at?: string
        }
        Update: {
          amount?: number
          coupon_code?: string
          created_at?: string
          id?: string
          influencer_id?: string
          redeemed_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_videos: {
        Row: {
          created_at: string
          id: string
          mask_offset_x: number | null
          mask_offset_y: number | null
          user_id: string
          video_data: string
        }
        Insert: {
          created_at?: string
          id?: string
          mask_offset_x?: number | null
          mask_offset_y?: number | null
          user_id: string
          video_data: string
        }
        Update: {
          created_at?: string
          id?: string
          mask_offset_x?: number | null
          mask_offset_y?: number | null
          user_id?: string
          video_data?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          coupon_code: string | null
          coupon_generated: boolean
          created_at: string
          current_period_end: string | null
          email: string | null
          has_seen_welcome: boolean | null
          id: string
          is_premium: boolean
          jogo1_count: number
          jogo2_count: number
          jogo3_count: number
          jogo4_count: number
          last_accessed_at: string | null
          last_subscription_check: string | null
          plan_confirmed: boolean
          premium_type: string | null
          purchase_date: string | null
          stripe_customer_id: string | null
          stripe_latest_invoice_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          subscription_tier: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          coupon_generated?: boolean
          created_at?: string
          current_period_end?: string | null
          email?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          is_premium?: boolean
          jogo1_count?: number
          jogo2_count?: number
          jogo3_count?: number
          jogo4_count?: number
          last_accessed_at?: string | null
          last_subscription_check?: string | null
          plan_confirmed?: boolean
          premium_type?: string | null
          purchase_date?: string | null
          stripe_customer_id?: string | null
          stripe_latest_invoice_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          coupon_generated?: boolean
          created_at?: string
          current_period_end?: string | null
          email?: string | null
          has_seen_welcome?: boolean | null
          id?: string
          is_premium?: boolean
          jogo1_count?: number
          jogo2_count?: number
          jogo3_count?: number
          jogo4_count?: number
          last_accessed_at?: string | null
          last_subscription_check?: string | null
          plan_confirmed?: boolean
          premium_type?: string | null
          purchase_date?: string | null
          stripe_customer_id?: string | null
          stripe_latest_invoice_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_count: {
        Args: { user_row: Database["public"]["Tables"]["users"]["Row"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      now_sao_paulo: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

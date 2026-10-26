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
      admin_logs: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          id: string
          user_email: string
          user_id: string | null
          user_role: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_email: string
          user_id?: string | null
          user_role: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          id?: string
          user_email?: string
          user_id?: string | null
          user_role?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          media_url: string
          mensagem: string | null
          ordem: number
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          media_url: string
          mensagem?: string | null
          ordem?: number
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          media_url?: string
          mensagem?: string | null
          ordem?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          cor_fundo_1: string | null
          cor_fundo_2: string | null
          created_at: string
          icon: string | null
          id: string
          mostrar_banner: boolean
          nome: string
          slug: string | null
          subtitulo_customizado: string | null
          tipo_fundo: string | null
          titulo_customizado: string | null
          updated_at: string
        }
        Insert: {
          cor_fundo_1?: string | null
          cor_fundo_2?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          mostrar_banner?: boolean
          nome: string
          slug?: string | null
          subtitulo_customizado?: string | null
          tipo_fundo?: string | null
          titulo_customizado?: string | null
          updated_at?: string
        }
        Update: {
          cor_fundo_1?: string | null
          cor_fundo_2?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          mostrar_banner?: boolean
          nome?: string
          slug?: string | null
          subtitulo_customizado?: string | null
          tipo_fundo?: string | null
          titulo_customizado?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      custom_role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_update: boolean | null
          can_view: boolean | null
          created_at: string | null
          custom_role_id: string
          id: string
          resource: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_update?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          custom_role_id: string
          id?: string
          resource: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_update?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          custom_role_id?: string
          id?: string
          resource?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_role_permissions_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      footer_blocks: {
        Row: {
          created_at: string
          description: string
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          media_type: string | null
          order_index: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          media_type?: string | null
          order_index?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          media_type?: string | null
          order_index?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          mensagem: string
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          mensagem: string
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          mensagem?: string
          ordem?: number
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_update: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_update?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_update?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          categoria_id: string
          created_at: string
          descricao: string
          destaque: boolean
          id: string
          imagem_url: string
          ingredientes: string[]
          nome: string
          preco: number
          promocao_ativa: boolean
          promocao_percentual: number | null
          updated_at: string
        }
        Insert: {
          categoria_id: string
          created_at?: string
          descricao: string
          destaque?: boolean
          id?: string
          imagem_url: string
          ingredientes?: string[]
          nome: string
          preco: number
          promocao_ativa?: boolean
          promocao_percentual?: number | null
          updated_at?: string
        }
        Update: {
          categoria_id?: string
          created_at?: string
          descricao?: string
          destaque?: boolean
          id?: string
          imagem_url?: string
          ingredientes?: string[]
          nome?: string
          preco?: number
          promocao_ativa?: boolean
          promocao_percentual?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_logs: {
        Row: {
          created_at: string | null
          fail_count: number | null
          id: string
          message: string | null
          recipients_count: number | null
          success_count: number | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          fail_count?: number | null
          id?: string
          message?: string | null
          recipients_count?: number | null
          success_count?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          fail_count?: number | null
          id?: string
          message?: string | null
          recipients_count?: number | null
          success_count?: number | null
          title?: string | null
        }
        Relationships: []
      }
      push_notifications_history: {
        Row: {
          body: string
          category_id: string | null
          duration_ms: number | null
          failure_count: number | null
          id: string
          image_url: string | null
          sent_at: string | null
          sent_by: string | null
          success_count: number | null
          target: string
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          category_id?: string | null
          duration_ms?: number | null
          failure_count?: number | null
          id?: string
          image_url?: string | null
          sent_at?: string | null
          sent_by?: string | null
          success_count?: number | null
          target: string
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          category_id?: string | null
          duration_ms?: number | null
          failure_count?: number | null
          id?: string
          image_url?: string | null
          sent_at?: string | null
          sent_by?: string | null
          success_count?: number | null
          target?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_history_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          cor_fundo_claro: string | null
          cor_fundo_escuro: string | null
          cor_primaria: string | null
          cor_secundaria: string | null
          created_at: string
          delivery_url: string | null
          email: string | null
          endereco: string
          facebook: string | null
          favicon_url: string | null
          header_logo_url: string | null
          horario_funcionamento: string
          id: string
          instagram: string | null
          intervalo_notificacao: number
          logo_url: string | null
          mostrar_logo_banner: boolean
          tempo_rotacao_banner: number
          texto_principal_home: string
          tiktok: string | null
          updated_at: string
          usar_logo_header: boolean
          whatsapp: string
        }
        Insert: {
          cor_fundo_claro?: string | null
          cor_fundo_escuro?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          delivery_url?: string | null
          email?: string | null
          endereco?: string
          facebook?: string | null
          favicon_url?: string | null
          header_logo_url?: string | null
          horario_funcionamento?: string
          id?: string
          instagram?: string | null
          intervalo_notificacao?: number
          logo_url?: string | null
          mostrar_logo_banner?: boolean
          tempo_rotacao_banner?: number
          texto_principal_home?: string
          tiktok?: string | null
          updated_at?: string
          usar_logo_header?: boolean
          whatsapp?: string
        }
        Update: {
          cor_fundo_claro?: string | null
          cor_fundo_escuro?: string | null
          cor_primaria?: string | null
          cor_secundaria?: string | null
          created_at?: string
          delivery_url?: string | null
          email?: string | null
          endereco?: string
          facebook?: string | null
          favicon_url?: string | null
          header_logo_url?: string | null
          horario_funcionamento?: string
          id?: string
          instagram?: string | null
          intervalo_notificacao?: number
          logo_url?: string | null
          mostrar_logo_banner?: boolean
          tempo_rotacao_banner?: number
          texto_principal_home?: string
          tiktok?: string | null
          updated_at?: string
          usar_logo_header?: boolean
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          custom_role_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_role_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_role_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: { Args: { text_input: string }; Returns: string }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "dono" | "gerente" | "midias"
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
      app_role: ["dono", "gerente", "midias"],
    },
  },
} as const

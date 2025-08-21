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
      attendance: {
        Row: {
          date: string | null
          id: string
          lesson_number: number
          status: string
          student_id: string
          student_name: string
          time: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          lesson_number: number
          status: string
          student_id: string
          student_name: string
          time?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          lesson_number?: number
          status?: string
          student_id?: string
          student_name?: string
          time?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          grade: string
          id: string
          title: string
          upload_date: string | null
          url: string
        }
        Insert: {
          grade: string
          id?: string
          title: string
          upload_date?: string | null
          url: string
        }
        Update: {
          grade?: string
          id?: string
          title?: string
          upload_date?: string | null
          url?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          date: string | null
          exam_name: string
          group_name: string | null
          id: string
          lesson_number: number
          performance_indicator: string
          score: number
          student_id: string
          student_name: string
          total_score: number
        }
        Insert: {
          date?: string | null
          exam_name: string
          group_name?: string | null
          id?: string
          lesson_number: number
          performance_indicator: string
          score: number
          student_id: string
          student_name: string
          total_score: number
        }
        Update: {
          date?: string | null
          exam_name?: string
          group_name?: string | null
          id?: string
          lesson_number?: number
          performance_indicator?: string
          score?: number
          student_id?: string
          student_name?: string
          total_score?: number
        }
        Relationships: []
      }
      paid_months: {
        Row: {
          date: string | null
          id: string
          month: string
          payment_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          month: string
          payment_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          month?: string
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paid_months_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          created_at: string | null
          id: string
          password: string
          phone: string
          student_code: string
          student_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password: string
          phone: string
          student_code: string
          student_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password?: string
          phone?: string
          student_code?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_student_code_fkey"
            columns: ["student_code"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["code"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          month: string
          student_code: string
          student_group: string
          student_id: string
          student_name: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          month: string
          student_code: string
          student_group: string
          student_id: string
          student_name: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          month?: string
          student_code?: string
          student_group?: string
          student_id?: string
          student_name?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          code: string
          created_at: string | null
          grade: string
          group_name: string | null
          id: string
          name: string
          parent_phone: string | null
          password: string
          phone: string
        }
        Insert: {
          code: string
          created_at?: string | null
          grade: string
          group_name?: string | null
          id?: string
          name: string
          parent_phone?: string | null
          password: string
          phone: string
        }
        Update: {
          code?: string
          created_at?: string | null
          grade?: string
          group_name?: string | null
          id?: string
          name?: string
          parent_phone?: string | null
          password?: string
          phone?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          grade: string
          id: string
          is_youtube: boolean | null
          title: string
          upload_date: string | null
          url: string
        }
        Insert: {
          grade: string
          id?: string
          is_youtube?: boolean | null
          title: string
          upload_date?: string | null
          url: string
        }
        Update: {
          grade?: string
          id?: string
          is_youtube?: boolean | null
          title?: string
          upload_date?: string | null
          url?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      learning_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          last_position: number
          quiz_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          last_position: number
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          last_position?: number
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string
          category: string
          required_points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url: string
          category: string
          required_points: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string
          category?: string
          required_points?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          avatar_url: string | null
          role: 'parent' | 'child'
          created_at: string
          updated_at: string
          birthday: string | null
          parent_id: string | null
          child_number: number | null
        }
      }
      sel_responses: {
        Row: {
          id: string
          user_id: string
          emotion: string
          quest_id: string
          intensity: number
          created_at: string
        }
      }
    }
  }
}
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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          learning_level: string
          preferred_language: string
          accessibility_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          learning_level?: string
          preferred_language?: string
          accessibility_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          learning_level?: string
          preferred_language?: string
          accessibility_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: number | null
          prerequisites: string[] | null
          learning_objectives: string[] | null
          content: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category: string
          difficulty_level: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: number | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          content?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: number | null
          prerequisites?: string[] | null
          learning_objectives?: string[] | null
          content?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_skills: string[] | null
          generated_by_ai: boolean
          path_data: Json
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_skills?: string[] | null
          generated_by_ai?: boolean
          path_data?: Json
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_skills?: string[] | null
          generated_by_ai?: boolean
          path_data?: Json
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          learning_path_id: string
          progress_percentage: number
          completed_sections: string[] | null
          time_spent: number
          last_accessed: string
          status: 'not_started' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          learning_path_id: string
          progress_percentage?: number
          completed_sections?: string[] | null
          time_spent?: number
          last_accessed?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          learning_path_id?: string
          progress_percentage?: number
          completed_sections?: string[] | null
          time_spent?: number
          last_accessed?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          learning_path_id: string
          certificate_data: Json
          issued_at: string
          certificate_url: string | null
          verification_code: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          learning_path_id: string
          certificate_data?: Json
          issued_at?: string
          certificate_url?: string | null
          verification_code: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          learning_path_id?: string
          certificate_data?: Json
          issued_at?: string
          certificate_url?: string | null
          verification_code?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          learning_path_id: string | null
          rating: number
          comment: string | null
          feedback_type: 'course' | 'path' | 'platform'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          learning_path_id?: string | null
          rating: number
          comment?: string | null
          feedback_type?: 'course' | 'path' | 'platform'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          learning_path_id?: string | null
          rating?: number
          comment?: string | null
          feedback_type?: 'course' | 'path' | 'platform'
          created_at?: string
        }
      }
    }
    Functions: {
      execute_sql_script: {
        Args: {
          sql_script: string
        }
        Returns: void
      }
    }
  }
}

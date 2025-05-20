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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          currency: string
          theme: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          currency?: string
          theme?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          currency?: string
          theme?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          description: string | null
          date: string
          type: 'income' | 'expense'
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string | null
          date: string
          type: 'income' | 'expense'
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string | null
          date?: string
          type?: 'income' | 'expense'
          is_recurring?: boolean
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          amount?: number
          period?: 'weekly' | 'monthly' | 'yearly'
          created_at?: string
        }
      }
    }
  }
}
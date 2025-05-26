export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          currency?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          currency?: string
          theme?: string
          created_at?: string
          updated_at?: string
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
          type: "income" | "expense"
          isRecurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string | null
          date: string
          type: "income" | "expense"
          isRecurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string | null
          date?: string
          type?: "income" | "expense"
          isRecurring?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          period: "weekly" | "monthly" | "yearly"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          amount: number
          period: "weekly" | "monthly" | "yearly"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          amount?: number
          period?: "weekly" | "monthly" | "yearly"
          created_at?: string
          updated_at?: string
        }
      }
      savings: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_amount: number
          current_amount: number
          target_date: string | null
          category: string
          priority: "Low" | "Medium" | "High"
          status: "Active" | "Completed" | "Paused"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_amount: number
          current_amount?: number
          target_date?: string | null
          category?: string
          priority?: "Low" | "Medium" | "High"
          status?: "Active" | "Completed" | "Paused"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          category?: string
          priority?: "Low" | "Medium" | "High"
          status?: "Active" | "Completed" | "Paused"
          created_at?: string
          updated_at?: string
        }
      }
      savings_transactions: {
        Row: {
          id: string
          savings_id: string
          user_id: string
          amount: number
          transaction_type: "deposit" | "withdrawal"
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          savings_id: string
          user_id: string
          amount: number
          transaction_type: "deposit" | "withdrawal"
          description?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          savings_id?: string
          user_id?: string
          amount?: number
          transaction_type?: "deposit" | "withdrawal"
          description?: string | null
          date?: string
          created_at?: string
        }
      }
    }
  }
}

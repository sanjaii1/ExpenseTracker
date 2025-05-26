export interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  date: string
  type: "income" | "expense"
  isRecurring?: boolean
}

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  period: "weekly" | "monthly" | "yearly"
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: "income" | "expense" | "both"
}

export interface User {
  id: string
  name: string
  email: string
  currency: string
  theme: "light" | "dark"
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

export interface Savings {
  id: string
  title: string
  description?: string
  target_amount: number
  current_amount: number
  target_date?: string
  category: string
  priority: "Low" | "Medium" | "High"
  status: "Active" | "Completed" | "Paused"
  created_at: string
  updated_at: string
}

export interface SavingsTransaction {
  id: string
  savings_id: string
  amount: number
  transaction_type: "deposit" | "withdrawal"
  description?: string
  date: string
  created_at: string
}

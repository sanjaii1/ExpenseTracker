"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Budget } from "../types"
import { budgetService } from "../lib/supabase"
import { useTransactions } from "./TransactionContext"
import toast from "react-hot-toast"

interface BudgetContextType {
  budgets: Budget[]
  loading: boolean
  error: string | null
  addBudget: (budget: Omit<Budget, "id" | "spent">) => Promise<void>
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  getBudgetByCategory: (category: string) => Budget | undefined
  calculateBudgetProgress: (budgetId: string) => number
  isBudgetExceeded: (budgetId: string) => boolean
  refetchBudgets: () => Promise<void>
}

const BudgetContext = createContext<BudgetContextType>({
  budgets: [],
  loading: false,
  error: null,
  addBudget: async () => {},
  updateBudget: async () => {},
  deleteBudget: async () => {},
  getBudgetByCategory: () => undefined,
  calculateBudgetProgress: () => 0,
  isBudgetExceeded: () => false,
  refetchBudgets: async () => {},
})

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useTransactions()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(false) // Start with false to avoid blocking
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    try {
      console.log("Fetching budgets...")
      setLoading(true)
      setError(null)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5000))

      const dataPromise = budgetService.getAll()
      const data = (await Promise.race([dataPromise, timeoutPromise])) as any[]

      console.log("Fetched budgets:", data.length)

      // Transform database data to match our Budget interface
      const transformedData: Budget[] = data.map((item) => ({
        id: item.id,
        category: item.category,
        amount: Number(item.amount),
        period: item.period as "weekly" | "monthly" | "yearly",
        spent: 0, // Will be calculated from transactions
      }))

      setBudgets(transformedData)
    } catch (error: any) {
      console.error("Error fetching budgets:", error)

      // Handle specific error cases without showing toast for initial load
      if (error.message?.includes("timeout")) {
        setError("Request timed out")
        console.log("Budget fetch timed out - continuing without data")
      } else if (error.message?.includes("User not authenticated")) {
        setError("User not authenticated")
        // Don't show toast for auth errors
      } else {
        setError(error.message || "Failed to load budgets")
        // Only show toast for unexpected errors
        if (!error.message?.includes("relation") && !error.message?.includes("permission")) {
          toast.error("Failed to load budgets")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Delay initial fetch to avoid blocking app load
    const timer = setTimeout(() => {
      fetchBudgets()
    }, 200) // Slight delay after transactions

    return () => clearTimeout(timer)
  }, [])

  // Update spent amount based on transactions
  useEffect(() => {
    if (budgets.length > 0 && transactions.length > 0) {
      const updatedBudgets = budgets.map((budget) => {
        const categoryTransactions = transactions.filter((t) => t.category === budget.category && t.type === "expense")
        const spent = categoryTransactions.reduce((total, t) => total + t.amount, 0)
        return { ...budget, spent }
      })
      setBudgets(updatedBudgets)
    }
  }, [transactions])

  const addBudget = async (budget: Omit<Budget, "id" | "spent">) => {
    try {
      const dbBudget = {
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
      }

      const newBudget = await budgetService.create(dbBudget)

      const transformedBudget: Budget = {
        id: newBudget.id,
        category: newBudget.category,
        amount: Number(newBudget.amount),
        period: newBudget.period as "weekly" | "monthly" | "yearly",
        spent: 0,
      }

      setBudgets((prev) => [...prev, transformedBudget])
      toast.success("Budget added successfully")
    } catch (error: any) {
      console.error("Error adding budget:", error)
      toast.error("Failed to add budget")
      throw error
    }
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const dbUpdates: any = {}
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount
      if (updates.period !== undefined) dbUpdates.period = updates.period

      const updatedBudget = await budgetService.update(id, dbUpdates)

      const transformedBudget: Budget = {
        id: updatedBudget.id,
        category: updatedBudget.category,
        amount: Number(updatedBudget.amount),
        period: updatedBudget.period as "weekly" | "monthly" | "yearly",
        spent: budgets.find((b) => b.id === id)?.spent || 0,
      }

      setBudgets((prev) => prev.map((budget) => (budget.id === id ? transformedBudget : budget)))
      toast.success("Budget updated successfully")
    } catch (error: any) {
      console.error("Error updating budget:", error)
      toast.error("Failed to update budget")
      throw error
    }
  }

  const deleteBudget = async (id: string) => {
    try {
      await budgetService.delete(id)
      setBudgets((prev) => prev.filter((budget) => budget.id !== id))
      toast.success("Budget deleted successfully")
    } catch (error: any) {
      console.error("Error deleting budget:", error)
      toast.error("Failed to delete budget")
      throw error
    }
  }

  const getBudgetByCategory = (category: string) => {
    return budgets.find((budget) => budget.category === category)
  }

  const calculateBudgetProgress = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (!budget) return 0
    return Math.min(100, Math.round((budget.spent / budget.amount) * 100))
  }

  const isBudgetExceeded = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (!budget) return false
    return budget.spent > budget.amount
  }

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        loading,
        error,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetByCategory,
        calculateBudgetProgress,
        isBudgetExceeded,
        refetchBudgets: fetchBudgets,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

export const useBudgets = () => useContext(BudgetContext)

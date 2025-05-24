"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Transaction } from "../types"
import { transactionService } from "../lib/supabase"
import toast from "react-hot-toast"

interface TransactionContextType {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getTransactionsByType: (type: "income" | "expense") => Transaction[]
  getTransactionsByCategory: (category: string) => Transaction[]
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[]
  getTotalByType: (type: "income" | "expense") => number
  getFilteredTransactions: (filters: TransactionFilters) => Transaction[]
  refetchTransactions: () => Promise<void>
}

export interface TransactionFilters {
  type?: "income" | "expense"
  category?: string
  startDate?: string
  endDate?: string
  search?: string
  minAmount?: number
  maxAmount?: number
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  loading: false,
  error: null,
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  getTransactionsByType: () => [],
  getTransactionsByCategory: () => [],
  getTransactionsByDateRange: () => [],
  getTotalByType: () => 0,
  getFilteredTransactions: () => [],
  refetchTransactions: async () => {},
})

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false) // Start with false to avoid blocking
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      console.log("Fetching transactions...")
      setLoading(true)
      setError(null)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5000))

      const dataPromise = transactionService.getAll()
      const data = (await Promise.race([dataPromise, timeoutPromise])) as any[]

      console.log("Fetched transactions:", data.length)

      // Transform database data to match our Transaction interface
      const transformedData: Transaction[] = data.map((item) => ({
        id: item.id,
        amount: Number(item.amount),
        category: item.category,
        description: item.description || "",
        date: item.date,
        type: item.type as "income" | "expense",
        isRecurring: item.isRecurring || false,
      }))

      setTransactions(transformedData)
    } catch (error: any) {
      console.error("Error fetching transactions:", error)

      // Handle specific error cases without showing toast for initial load
      if (error.message?.includes("timeout")) {
        setError("Request timed out")
        console.log("Transaction fetch timed out - continuing without data")
      } else if (error.message?.includes("User not authenticated")) {
        setError("User not authenticated")
        // Don't show toast for auth errors
      } else {
        setError(error.message || "Failed to load transactions")
        // Only show toast for unexpected errors
        if (!error.message?.includes("relation") && !error.message?.includes("permission")) {
          toast.error("Failed to load transactions")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Delay initial fetch to avoid blocking app load
    const timer = setTimeout(() => {
      fetchTransactions()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const dbTransaction = {
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        isRecurring: transaction.isRecurring || false,
      }

      const newTransaction = await transactionService.create(dbTransaction)

      const transformedTransaction: Transaction = {
        id: newTransaction.id,
        amount: Number(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description || "",
        date: newTransaction.date,
        type: newTransaction.type as "income" | "expense",
        isRecurring: newTransaction.isRecurring || false,
      }

      setTransactions((prev) => [transformedTransaction, ...prev])
      toast.success("Transaction added successfully")
    } catch (error: any) {
      console.error("Error adding transaction:", error)
      toast.error("Failed to add transaction")
      throw error
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const dbUpdates: any = {}
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.date !== undefined) dbUpdates.date = updates.date
      if (updates.type !== undefined) dbUpdates.type = updates.type
      if (updates.isRecurring !== undefined) dbUpdates.isRecurring = updates.isRecurring

      const updatedTransaction = await transactionService.update(id, dbUpdates)

      const transformedTransaction: Transaction = {
        id: updatedTransaction.id,
        amount: Number(updatedTransaction.amount),
        category: updatedTransaction.category,
        description: updatedTransaction.description || "",
        date: updatedTransaction.date,
        type: updatedTransaction.type as "income" | "expense",
        isRecurring: updatedTransaction.isRecurring || false,
      }

      setTransactions((prev) =>
        prev.map((transaction) => (transaction.id === id ? transformedTransaction : transaction)),
      )
      toast.success("Transaction updated successfully")
    } catch (error: any) {
      console.error("Error updating transaction:", error)
      toast.error("Failed to update transaction")
      throw error
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id)
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
      toast.success("Transaction deleted successfully")
    } catch (error: any) {
      console.error("Error deleting transaction:", error)
      toast.error("Failed to delete transaction")
      throw error
    }
  }

  const getTransactionsByType = (type: "income" | "expense") => {
    return transactions.filter((transaction) => transaction.type === type)
  }

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter((transaction) => transaction.category === category)
  }

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter((transaction) => transaction.date >= startDate && transaction.date <= endDate)
  }

  const getTotalByType = (type: "income" | "expense") => {
    return getTransactionsByType(type).reduce((total, transaction) => total + transaction.amount, 0)
  }

  const getFilteredTransactions = (filters: TransactionFilters) => {
    return transactions.filter((transaction) => {
      if (filters.type && transaction.type !== filters.type) return false
      if (filters.category && transaction.category !== filters.category) return false
      if (filters.startDate && transaction.date < filters.startDate) return false
      if (filters.endDate && transaction.date > filters.endDate) return false
      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) return false
      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) return false
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByType,
        getTransactionsByCategory,
        getTransactionsByDateRange,
        getTotalByType,
        getFilteredTransactions,
        refetchTransactions: fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactions = () => useContext(TransactionContext)

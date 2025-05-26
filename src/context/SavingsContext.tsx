"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Savings, SavingsTransaction } from "../types"
import { savingsService } from "../lib/supabase"
import toast from "react-hot-toast"

interface SavingsContextType {
  savings: Savings[]
  savingsTransactions: SavingsTransaction[]
  loading: boolean
  error: string | null
  tableExists: boolean
  addSavings: (savings: Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">) => Promise<void>
  updateSavings: (id: string, savings: Partial<Savings>) => Promise<void>
  deleteSavings: (id: string) => Promise<void>
  addSavingsTransaction: (transaction: Omit<SavingsTransaction, "id" | "created_at">) => Promise<void>
  getSavingsById: (id: string) => Savings | undefined
  getSavingsTransactionsBySavingsId: (savingsId: string) => SavingsTransaction[]
  getTotalSavings: () => number
  getActiveSavings: () => Savings[]
  getCompletedSavings: () => Savings[]
  refetchSavings: () => Promise<void>
  updateAllStatuses: () => Promise<void>
}

const SavingsContext = createContext<SavingsContextType>({
  savings: [],
  savingsTransactions: [],
  loading: false,
  error: null,
  tableExists: true,
  addSavings: async () => {},
  updateSavings: async () => {},
  deleteSavings: async () => {},
  addSavingsTransaction: async () => {},
  getSavingsById: () => undefined,
  getSavingsTransactionsBySavingsId: () => [],
  getTotalSavings: () => 0,
  getActiveSavings: () => [],
  getCompletedSavings: () => [],
  refetchSavings: async () => {},
  updateAllStatuses: async () => {},
})

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [savings, setSavings] = useState<Savings[]>([])
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)

  const fetchSavings = async () => {
    try {
      console.log("Fetching savings...")
      setLoading(true)
      setError(null)
      setTableExists(true)

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 5000))

      const dataPromise = savingsService.getAll()
      const data = (await Promise.race([dataPromise, timeoutPromise])) as any[]

      console.log("Fetched savings:", data.length)

      const transformedData: Savings[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        target_amount: Number(item.target_amount),
        current_amount: Number(item.current_amount),
        target_date: item.target_date,
        category: item.category,
        priority: item.priority as "Low" | "Medium" | "High",
        status: item.status as "Active" | "Completed" | "Paused",
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      setSavings(transformedData)

      // After fetching, update statuses for any goals that should be completed
      await updateAllStatuses()
    } catch (error: any) {
      console.error("Error fetching savings:", error)

      if (
        error.message?.includes("Savings table does not exist") ||
        error.message?.includes("relation") ||
        error.message?.includes("does not exist")
      ) {
        setTableExists(false)
        setError("Savings feature is not set up yet. Please run the database migration.")
        console.log("Savings table doesn't exist - this is expected for new installations")
      } else if (error.message?.includes("timeout")) {
        setError("Request timed out")
      } else if (error.message?.includes("User not authenticated")) {
        setError("User not authenticated")
      } else {
        setError(error.message || "Failed to load savings")
        if (!error.message?.includes("relation") && !error.message?.includes("permission")) {
          toast.error("Failed to load savings")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSavingsTransactions = async () => {
    if (!tableExists) return

    try {
      const data = await savingsService.getAllTransactions()
      const transformedData: SavingsTransaction[] = data.map((item) => ({
        id: item.id,
        savings_id: item.savings_id,
        amount: Number(item.amount),
        transaction_type: item.transaction_type as "deposit" | "withdrawal",
        description: item.description,
        date: item.date,
        created_at: item.created_at,
      }))
      setSavingsTransactions(transformedData)
    } catch (error: any) {
      console.error("Error fetching savings transactions:", error)
      if (error.message?.includes("does not exist")) {
        setTableExists(false)
      }
    }
  }

  const updateAllStatuses = async () => {
    if (!tableExists) return

    try {
      await savingsService.updateAllSavingsStatuses()
      // Refetch savings to get updated statuses
      const data = await savingsService.getAll()
      const transformedData: Savings[] = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        target_amount: Number(item.target_amount),
        current_amount: Number(item.current_amount),
        target_date: item.target_date,
        category: item.category,
        priority: item.priority as "Low" | "Medium" | "High",
        status: item.status as "Active" | "Completed" | "Paused",
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))
      setSavings(transformedData)
    } catch (error: any) {
      console.error("Error updating all statuses:", error)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSavings()
      fetchSavingsTransactions()
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const addSavings = async (savingsData: Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">) => {
    if (!tableExists) {
      throw new Error("Savings table does not exist. Please run the database migration first.")
    }

    try {
      const dbSavings = {
        title: savingsData.title,
        description: savingsData.description,
        target_amount: savingsData.target_amount,
        target_date: savingsData.target_date,
        category: savingsData.category,
        priority: savingsData.priority,
        status: savingsData.status,
      }

      const newSavings = await savingsService.create(dbSavings)

      const transformedSavings: Savings = {
        id: newSavings.id,
        title: newSavings.title,
        description: newSavings.description,
        target_amount: Number(newSavings.target_amount),
        current_amount: Number(newSavings.current_amount),
        target_date: newSavings.target_date,
        category: newSavings.category,
        priority: newSavings.priority as "Low" | "Medium" | "High",
        status: newSavings.status as "Active" | "Completed" | "Paused",
        created_at: newSavings.created_at,
        updated_at: newSavings.updated_at,
      }

      setSavings((prev) => [transformedSavings, ...prev])
      toast.success("Savings goal added successfully")
    } catch (error: any) {
      console.error("Error adding savings:", error)
      if (error.message?.includes("does not exist")) {
        setTableExists(false)
        toast.error("Savings feature is not set up. Please run the database migration.")
      } else {
        toast.error("Failed to add savings goal")
      }
      throw error
    }
  }

  const updateSavings = async (id: string, updates: Partial<Savings>) => {
    if (!tableExists) {
      throw new Error("Savings table does not exist. Please run the database migration first.")
    }

    try {
      const dbUpdates: any = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.target_amount !== undefined) dbUpdates.target_amount = updates.target_amount
      if (updates.target_date !== undefined) dbUpdates.target_date = updates.target_date
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.status !== undefined) dbUpdates.status = updates.status

      const updatedSavings = await savingsService.update(id, dbUpdates)

      const transformedSavings: Savings = {
        id: updatedSavings.id,
        title: updatedSavings.title,
        description: updatedSavings.description,
        target_amount: Number(updatedSavings.target_amount),
        current_amount: Number(updatedSavings.current_amount),
        target_date: updatedSavings.target_date,
        category: updatedSavings.category,
        priority: updatedSavings.priority as "Low" | "Medium" | "High",
        status: updatedSavings.status as "Active" | "Completed" | "Paused",
        created_at: updatedSavings.created_at,
        updated_at: updatedSavings.updated_at,
      }

      setSavings((prev) => prev.map((s) => (s.id === id ? transformedSavings : s)))
      toast.success("Savings goal updated successfully")

      // Refresh to get any automatic status updates
      await fetchSavings()
    } catch (error: any) {
      console.error("Error updating savings:", error)
      if (error.message?.includes("does not exist")) {
        setTableExists(false)
        toast.error("Savings feature is not set up. Please run the database migration.")
      } else {
        toast.error("Failed to update savings goal")
      }
      throw error
    }
  }

  const deleteSavings = async (id: string) => {
    if (!tableExists) {
      throw new Error("Savings table does not exist. Please run the database migration first.")
    }

    try {
      await savingsService.delete(id)
      setSavings((prev) => prev.filter((s) => s.id !== id))
      setSavingsTransactions((prev) => prev.filter((t) => t.savings_id !== id))
      toast.success("Savings goal deleted successfully")
    } catch (error: any) {
      console.error("Error deleting savings:", error)
      if (error.message?.includes("does not exist")) {
        setTableExists(false)
        toast.error("Savings feature is not set up. Please run the database migration.")
      } else {
        toast.error("Failed to delete savings goal")
      }
      throw error
    }
  }

  const addSavingsTransaction = async (transactionData: Omit<SavingsTransaction, "id" | "created_at">) => {
    if (!tableExists) {
      throw new Error("Savings table does not exist. Please run the database migration first.")
    }

    try {
      const dbTransaction = {
        savings_id: transactionData.savings_id,
        amount: transactionData.amount,
        transaction_type: transactionData.transaction_type,
        description: transactionData.description,
        date: transactionData.date,
      }

      const newTransaction = await savingsService.createTransaction(dbTransaction)

      const transformedTransaction: SavingsTransaction = {
        id: newTransaction.id,
        savings_id: newTransaction.savings_id,
        amount: Number(newTransaction.amount),
        transaction_type: newTransaction.transaction_type as "deposit" | "withdrawal",
        description: newTransaction.description,
        date: newTransaction.date,
        created_at: newTransaction.created_at,
      }

      setSavingsTransactions((prev) => [transformedTransaction, ...prev])

      // Refresh savings to get updated current_amount and status
      await fetchSavings()

      toast.success(`${transactionData.transaction_type === "deposit" ? "Deposit" : "Withdrawal"} added successfully`)
    } catch (error: any) {
      console.error("Error adding savings transaction:", error)
      if (error.message?.includes("does not exist")) {
        setTableExists(false)
        toast.error("Savings feature is not set up. Please run the database migration.")
      } else {
        toast.error("Failed to add transaction")
      }
      throw error
    }
  }

  const getSavingsById = (id: string) => {
    return savings.find((s) => s.id === id)
  }

  const getSavingsTransactionsBySavingsId = (savingsId: string) => {
    return savingsTransactions.filter((t) => t.savings_id === savingsId)
  }

  const getTotalSavings = () => {
    return savings.reduce((total, s) => total + s.current_amount, 0)
  }

  const getActiveSavings = () => {
    return savings.filter((s) => s.status === "Active")
  }

  const getCompletedSavings = () => {
    return savings.filter((s) => s.status === "Completed")
  }

  return (
    <SavingsContext.Provider
      value={{
        savings,
        savingsTransactions,
        loading,
        error,
        tableExists,
        addSavings,
        updateSavings,
        deleteSavings,
        addSavingsTransaction,
        getSavingsById,
        getSavingsTransactionsBySavingsId,
        getTotalSavings,
        getActiveSavings,
        getCompletedSavings,
        refetchSavings: fetchSavings,
        updateAllStatuses,
      }}
    >
      {children}
    </SavingsContext.Provider>
  )
}

export const useSavings = () => useContext(SavingsContext)

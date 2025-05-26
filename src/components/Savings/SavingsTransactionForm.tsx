"use client"

import type React from "react"
import { useState } from "react"
import { DollarSign, Calendar, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import Input from "../UI/Input"
import Button from "../UI/Button"
import type { SavingsTransaction } from "../../types"

interface SavingsTransactionFormProps {
  savingsId: string
  onSubmit: (data: Omit<SavingsTransaction, "id" | "created_at">) => void
  onCancel?: () => void
}

function SavingsTransactionForm({ savingsId, onSubmit, onCancel }: SavingsTransactionFormProps) {
  const [formData, setFormData] = useState<Omit<SavingsTransaction, "id" | "created_at">>({
    savings_id: savingsId,
    amount: 0,
    transaction_type: "deposit",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, transaction_type: "deposit" }))}
              className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                formData.transaction_type === "deposit"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowUpCircle size={18} className="mr-2" />
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, transaction_type: "withdrawal" }))}
              className={`flex items-center justify-center p-3 rounded-lg border transition-colors ${
                formData.transaction_type === "withdrawal"
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <ArrowDownCircle size={18} className="mr-2" />
              Withdrawal
            </button>
          </div>
        </div>

        <Input
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          fullWidth
          icon={<DollarSign size={18} className="text-gray-500" />}
        />

        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          fullWidth
          icon={<Calendar size={18} className="text-gray-500" />}
        />

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Add a note about this transaction..."
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant={formData.transaction_type === "deposit" ? "success" : "danger"}>
          Add {formData.transaction_type === "deposit" ? "Deposit" : "Withdrawal"}
        </Button>
      </div>
    </form>
  )
}

export default SavingsTransactionForm

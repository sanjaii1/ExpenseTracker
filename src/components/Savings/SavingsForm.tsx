"use client"

import type React from "react"
import { useState } from "react"
import { Target, Calendar, DollarSign, FileText, Flag, Activity } from "lucide-react"
import Input from "../UI/Input"
import Button from "../UI/Button"
import type { Savings } from "../../types"

interface SavingsFormProps {
  onSubmit: (data: Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">) => void
  initialData?: Savings | null
  onCancel?: () => void
}

function SavingsForm({ onSubmit, initialData, onCancel }: SavingsFormProps) {
  const [formData, setFormData] = useState<Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    target_amount: initialData?.target_amount || 0,
    target_date: initialData?.target_date || "",
    category: initialData?.category || "General",
    priority: initialData?.priority || "Medium",
    status: initialData?.status || "Active",
  })

  const categories = [
    "General",
    "Emergency Fund",
    "Vacation",
    "Car",
    "House",
    "Education",
    "Retirement",
    "Wedding",
    "Electronics",
    "Health",
    "Investment",
    "Other",
  ]

  const priorities = ["Low", "Medium", "High"] as const
  const statuses = ["Active", "Completed", "Paused"] as const

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "target_amount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Goal Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Emergency Fund, Vacation to Europe"
            required
            fullWidth
            icon={<Target size={18} className="text-gray-500" />}
          />
        </div>

        <Input
          label="Target Amount"
          type="number"
          name="target_amount"
          value={formData.target_amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          fullWidth
          icon={<DollarSign size={18} className="text-gray-500" />}
        />

        <Input
          label="Target Date (Optional)"
          type="date"
          name="target_date"
          value={formData.target_date || ""}
          onChange={handleChange}
          fullWidth
          icon={<Calendar size={18} className="text-gray-500" />}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={18} className="text-gray-500" />
            </div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Flag size={18} className="text-gray-500" />
            </div>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        {initialData && (
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Activity size={18} className="text-gray-500" />
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Add any notes or details about this savings goal..."
            rows={3}
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
        <Button type="submit" variant="primary">
          {initialData ? "Update" : "Create"} Savings Goal
        </Button>
      </div>
    </form>
  )
}

export default SavingsForm

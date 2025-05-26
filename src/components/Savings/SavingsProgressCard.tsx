"use client"

import { Edit2, Trash2, Plus, Calendar } from "lucide-react"
import type { Savings, SavingsTransaction } from "../../types"
import { formatCurrency, formatDate } from "../../utils/formatters"
import Button from "../UI/Button"
import Card from "../UI/Card"

interface SavingsProgressCardProps {
  savings: Savings
  transactions: SavingsTransaction[]
  onEdit: () => void
  onDelete: () => void
  onAddTransaction: () => void
}

function SavingsProgressCard({ savings, transactions, onEdit, onDelete, onAddTransaction }: SavingsProgressCardProps) {
  const progress = savings.target_amount > 0 ? Math.min(100, (savings.current_amount / savings.target_amount) * 100) : 0
  const isCompleted = progress >= 100
  const daysLeft = savings.target_date
    ? Math.ceil((new Date(savings.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "Medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "Low":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
      case "Completed":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      case "Paused":
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const recentTransactions = transactions.slice(0, 3)

  return (
    <Card className="h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{savings.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{savings.category}</p>
          </div>
          <div className="flex space-x-1 ml-2">
            <Button variant="outline" size="sm" className="p-1" onClick={onEdit} aria-label="Edit savings goal">
              <Edit2 size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="p-1 text-red-500 hover:text-red-700"
              onClick={onDelete}
              aria-label="Delete savings goal"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(savings.status)}`}
          >
            {savings.status}
          </span>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(savings.priority)}`}
          >
            {savings.priority} Priority
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{formatCurrency(savings.current_amount)}</span>
            <span className="text-gray-600 dark:text-gray-400">{formatCurrency(savings.target_amount)}</span>
          </div>
        </div>

        {/* Target Date */}
        {savings.target_date && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar size={14} className="mr-1" />
            <span>Target: {formatDate(savings.target_date)}</span>
            {daysLeft !== null && (
              <span
                className={`ml-2 ${daysLeft < 0 ? "text-red-500" : daysLeft < 30 ? "text-yellow-500" : "text-green-500"}`}
              >
                ({daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`})
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {savings.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{savings.description}</p>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Activity</h4>
            <div className="space-y-1">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</span>
                  <span
                    className={`font-medium ${
                      transaction.transaction_type === "deposit" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction.transaction_type === "deposit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" fullWidth onClick={onAddTransaction} iconLeft={<Plus size={14} />}>
            Add Transaction
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default SavingsProgressCard

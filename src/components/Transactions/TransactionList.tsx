"use client"

import { Edit, Trash2 } from "lucide-react"
import type { Transaction } from "../../types"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { getCategoryColor } from "../../data/mockData"
import Button from "../UI/Button"

interface TransactionListProps {
  transactions: Transaction[]
  showActions?: boolean
  onEdit?: (transaction: Transaction) => void
  onDelete?: (id: string) => void
}

function TransactionList({ transactions, showActions = true, onEdit, onDelete }: TransactionListProps) {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === "income"
        const categoryColor = getCategoryColor(transaction.category)

        return (
          <div key={transaction.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: categoryColor + "33" }} // Apply color with transparency
              >
                <span style={{ color: categoryColor }}>{transaction.category.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{transaction.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.category} • {formatDate(transaction.date)}
                  {transaction.isRecurring && " • Recurring"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`font-medium mr-4 ${isIncome ? "text-green-500" : "text-red-500"}`}>
                {isIncome ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>

              {showActions && (
                <div className="flex space-x-1">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-1"
                      onClick={() => onEdit(transaction)}
                      aria-label="Edit transaction"
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => onDelete(transaction.id)}
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {transactions.length === 0 && (
        <div className="py-6 text-center text-gray-500 dark:text-gray-400">No transactions found</div>
      )}
    </div>
  )
}

export default TransactionList

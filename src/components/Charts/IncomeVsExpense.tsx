"use client"

import { useMemo } from "react"
import { useTransactions } from "../../context/TransactionContext"
import ChartWrapper from "./ChartWrapper"
import Card from "../UI/Card"

interface IncomeVsExpenseProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function IncomeVsExpense({ dateRange }: IncomeVsExpenseProps) {
  const { getFilteredTransactions } = useTransactions()

  const chartData = useMemo(() => {
    const transactions = getFilteredTransactions({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    })

    // Group by month
    const monthlyData = transactions.reduce(
      (acc, transaction) => {
        const month = new Date(transaction.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        if (!acc[month]) {
          acc[month] = { income: 0, expense: 0 }
        }
        acc[month][transaction.type] += transaction.amount
        return acc
      },
      {} as Record<string, { income: number; expense: number }>,
    )

    const months = Object.keys(monthlyData).sort()
    const incomeData = months.map((month) => monthlyData[month].income)
    const expenseData = months.map((month) => monthlyData[month].expense)

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: "Expenses",
          data: expenseData,
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    }
  }, [getFilteredTransactions, dateRange])

  if (chartData.labels.length === 0) {
    return (
      <Card title="Income vs Expenses">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No data available for the selected period
        </div>
      </Card>
    )
  }

  return (
    <Card title="Income vs Expenses">
      <ChartWrapper type="bar" data={chartData} height={300} />
    </Card>
  )
}

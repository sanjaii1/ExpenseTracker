"use client"

import { useMemo } from "react"
import { useTransactions } from "../../context/TransactionContext"
import ChartWrapper from "./ChartWrapper"
import Card from "../UI/Card"

interface ExpenseByCategoryProps {
  dateRange: {
    startDate: string
    endDate: string
  }
}

export default function ExpenseByCategory({ dateRange }: ExpenseByCategoryProps) {
  const { getFilteredTransactions } = useTransactions()

  const chartData = useMemo(() => {
    const expenses = getFilteredTransactions({
      type: "expense",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    })

    const categoryTotals = expenses.reduce(
      (acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categories = Object.keys(categoryTotals)
    const amounts = Object.values(categoryTotals)

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6384",
      "#C9CBCF",
      "#4BC0C0",
      "#FF6384",
    ]

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map((color) => color + "80"),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    }
  }, [getFilteredTransactions, dateRange])

  const options = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed * 100) / total).toFixed(1)
            return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
  }

  if (chartData.labels.length === 0) {
    return (
      <Card title="Expenses by Category">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No expense data available for the selected period
        </div>
      </Card>
    )
  }

  return (
    <Card title="Expenses by Category">
      <ChartWrapper type="doughnut" data={chartData} options={options} height={250} />
    </Card>
  )
}

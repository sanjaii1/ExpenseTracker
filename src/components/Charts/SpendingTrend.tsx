"use client"

import { useMemo } from "react"
import { useTransactions } from "../../context/TransactionContext"
import ChartWrapper from "./ChartWrapper"
import Card from "../UI/Card"

export default function SpendingTrend() {
  const { transactions } = useTransactions()

  const chartData = useMemo(() => {
    // Get last 6 months of data
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0],
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0],
      })
    }

    const monthlyExpenses = months.map((month) => {
      const monthTransactions = transactions.filter(
        (t) => t.type === "expense" && t.date >= month.start && t.date <= month.end,
      )
      return monthTransactions.reduce((total, t) => total + t.amount, 0)
    })

    return {
      labels: months.map((m) => m.label),
      datasets: [
        {
          label: "Monthly Expenses",
          data: monthlyExpenses,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(239, 68, 68, 1)",
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }
  }, [transactions])

  return (
    <Card title="Spending Trend (Last 6 Months)">
      <ChartWrapper type="line" data={chartData} height={250} />
    </Card>
  )
}

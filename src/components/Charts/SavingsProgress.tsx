"use client"

import { useMemo } from "react"
import { useSavings } from "../../context/SavingsContext"
import ChartWrapper from "./ChartWrapper"
import Card from "../UI/Card"

export default function SavingsProgress() {
  const { savings } = useSavings()

  const chartData = useMemo(() => {
    const activeSavings = savings.filter((s) => s.status === "Active").slice(0, 6) // Show top 6

    const labels = activeSavings.map((s) => s.title)
    const currentAmounts = activeSavings.map((s) => s.current_amount)
    const targetAmounts = activeSavings.map((s) => s.target_amount)

    return {
      labels,
      datasets: [
        {
          label: "Current Amount",
          data: currentAmounts,
          backgroundColor: "rgba(147, 51, 234, 0.8)",
          borderColor: "rgba(147, 51, 234, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: "Target Amount",
          data: targetAmounts,
          backgroundColor: "rgba(203, 213, 225, 0.8)",
          borderColor: "rgba(203, 213, 225, 1)",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    }
  }, [savings])

  if (chartData.labels.length === 0) {
    return (
      <Card title="Savings Goals Progress">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No active savings goals
        </div>
      </Card>
    )
  }

  return (
    <Card title="Savings Goals Progress">
      <ChartWrapper type="bar" data={chartData} height={300} />
    </Card>
  )
}

"use client"

import { useMemo } from "react"
import { useTransactions } from "../../context/TransactionContext"
import { useBudgets } from "../../context/BudgetContext"
import { useSavings } from "../../context/SavingsContext"
import Card from "../UI/Card"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"

export default function FinancialHealthIndicator() {
  const { getTotalByType } = useTransactions()
  const { budgets } = useBudgets()
  const { getTotalSavings } = useSavings()

  const healthScore = useMemo(() => {
    const totalIncome = getTotalByType("income")
    const totalExpenses = getTotalByType("expense")
    const totalSavings = getTotalSavings()

    let score = 0
    const indicators = []

    // Income vs Expenses (40% weight)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    if (savingsRate >= 20) {
      score += 40
      indicators.push({ text: "Excellent savings rate", type: "good" })
    } else if (savingsRate >= 10) {
      score += 25
      indicators.push({ text: "Good savings rate", type: "okay" })
    } else if (savingsRate >= 0) {
      score += 10
      indicators.push({ text: "Low savings rate", type: "warning" })
    } else {
      indicators.push({ text: "Spending exceeds income", type: "bad" })
    }

    // Budget adherence (30% weight)
    const budgetAdherence = budgets.length > 0
    if (budgetAdherence) {
      const exceededBudgets = budgets.filter((b) => b.spent > b.amount).length
      const adherenceRate = ((budgets.length - exceededBudgets) / budgets.length) * 100

      if (adherenceRate >= 80) {
        score += 30
        indicators.push({ text: "Staying within budgets", type: "good" })
      } else if (adherenceRate >= 60) {
        score += 20
        indicators.push({ text: "Mostly within budgets", type: "okay" })
      } else {
        score += 10
        indicators.push({ text: "Exceeding budgets", type: "warning" })
      }
    } else {
      score += 15
      indicators.push({ text: "No budgets set", type: "warning" })
    }

    // Emergency fund (30% weight)
    const monthlyExpenses = totalExpenses / 12 // Rough monthly estimate
    const emergencyFundMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : 0

    if (emergencyFundMonths >= 6) {
      score += 30
      indicators.push({ text: "Strong emergency fund", type: "good" })
    } else if (emergencyFundMonths >= 3) {
      score += 20
      indicators.push({ text: "Adequate emergency fund", type: "okay" })
    } else if (emergencyFundMonths >= 1) {
      score += 10
      indicators.push({ text: "Building emergency fund", type: "warning" })
    } else {
      indicators.push({ text: "No emergency fund", type: "bad" })
    }

    return { score: Math.min(100, score), indicators, savingsRate: Math.round(savingsRate) }
  }, [getTotalByType, budgets, getTotalSavings])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case "good":
        return <CheckCircle className="text-green-500" size={16} />
      case "okay":
        return <TrendingUp className="text-yellow-500" size={16} />
      case "warning":
        return <AlertTriangle className="text-orange-500" size={16} />
      case "bad":
        return <TrendingDown className="text-red-500" size={16} />
      default:
        return null
    }
  }

  return (
    <Card title="Financial Health Score">
      <div className="space-y-4">
        {/* Score Display */}
        <div className={`text-center p-4 rounded-lg ${getScoreBackground(healthScore.score)}`}>
          <div className={`text-3xl font-bold ${getScoreColor(healthScore.score)}`}>{healthScore.score}/100</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Savings Rate: {healthScore.savingsRate}%</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              healthScore.score >= 80 ? "bg-green-500" : healthScore.score >= 60 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${healthScore.score}%` }}
          />
        </div>

        {/* Indicators */}
        <div className="space-y-2">
          {healthScore.indicators.map((indicator, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {getIndicatorIcon(indicator.type)}
              <span className="text-gray-700 dark:text-gray-300">{indicator.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

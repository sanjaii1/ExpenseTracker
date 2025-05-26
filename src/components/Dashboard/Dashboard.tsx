"use client"

import { useState } from "react"
import { ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, ChevronDown, Target } from "lucide-react"
import Card from "../UI/Card"
import { useTransactions } from "../../context/TransactionContext"
import { useBudgets } from "../../context/BudgetContext"
import { useSavings } from "../../context/SavingsContext"
import { formatCurrency } from "../../utils/formatters"
import TransactionList from "../Transactions/TransactionList"
import BudgetProgressList from "../Budget/BudgetProgressList"
import ExpenseByCategory from "../Charts/ExpenseByCategory"
import IncomeVsExpense from "../Charts/IncomeVsExpense"
import SavingsProgress from "../Charts/SavingsProgress"
import SpendingTrend from "../Charts/SpendingTrend"
import FinancialHealthIndicator from "./FinancialHealthIndicator"

type FilterPeriod = "day" | "week" | "month" | "year" | "custom"

interface DateRange {
  startDate: string
  endDate: string
}

function Dashboard() {
  const { transactions, getTotalByType, loading: transactionsLoading, getFilteredTransactions } = useTransactions()
  const { budgets, loading: budgetsLoading } = useBudgets()
  const { savings, getTotalSavings, getActiveSavings, loading: savingsLoading } = useSavings()

  // Default to current month
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
    return { startDate, endDate }
  }

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("month")
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange())
  const [showDropdown, setShowDropdown] = useState(false)

  // Calculate date ranges based on filter period
  const getDateRangeForPeriod = (period: FilterPeriod): DateRange => {
    const now = new Date()

    switch (period) {
      case "day":
        const today = now.toISOString().split("T")[0]
        return { startDate: today, endDate: today }

      case "week":
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        return {
          startDate: startOfWeek.toISOString().split("T")[0],
          endDate: endOfWeek.toISOString().split("T")[0],
        }

      case "month":
        return getCurrentMonthRange()

      case "year":
        const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]
        const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0]
        return { startDate: startOfYear, endDate: endOfYear }

      case "custom":
        return dateRange

      default:
        return getCurrentMonthRange()
    }
  }

  // Handle filter period change
  const handleFilterChange = (period: FilterPeriod) => {
    setFilterPeriod(period)
    if (period !== "custom") {
      setDateRange(getDateRangeForPeriod(period))
    }
    setShowDropdown(false)
  }

  // Handle custom date range change
  const handleCustomDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Get current date range
  const currentRange = filterPeriod === "custom" ? dateRange : getDateRangeForPeriod(filterPeriod)

  // Filter transactions based on current date range
  const filteredTransactions = getFilteredTransactions({
    startDate: currentRange.startDate,
    endDate: currentRange.endDate,
  })

  // Calculate totals for filtered data
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((total, t) => total + t.amount, 0)

  const filteredExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((total, t) => total + t.amount, 0)

  const balance = filteredIncome - filteredExpenses
  const totalSavings = getTotalSavings()
  const activeSavingsCount = getActiveSavings().length

  // Get recent transactions from filtered data
  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Get period label for display
  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case "day":
        return "Today"
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      case "year":
        return "This Year"
      case "custom":
        return "Custom"
      default:
        return "This Month"
    }
  }

  const summaryCards = [
    {
      title: "Total Income",
      value: formatCurrency(filteredIncome),
      icon: <ArrowUpCircle className="text-green-500" size={24} />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-500 dark:text-green-400",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(filteredExpenses),
      icon: <ArrowDownCircle className="text-red-500" size={24} />,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-500 dark:text-red-400",
    },
    {
      title: "Balance",
      value: formatCurrency(balance),
      icon: <Wallet className="text-blue-500" size={24} />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-500 dark:text-blue-400",
    },
    {
      title: "Total Savings",
      value: formatCurrency(totalSavings),
      icon: <Target className="text-purple-500" size={24} />,
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-500 dark:text-purple-400",
    },
  ]

  if (transactionsLoading || budgetsLoading || savingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>

        {/* Compact Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
          >
            <Calendar size={12} />
            <span className="text-gray-700 dark:text-gray-300">{getPeriodLabel()}</span>
            <span className="text-gray-500">({filteredTransactions.length})</span>
            <ChevronDown size={12} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
              <div className="p-2 space-y-1">
                {[
                  { key: "day", label: "Today" },
                  { key: "week", label: "This Week" },
                  { key: "month", label: "This Month" },
                  { key: "year", label: "This Year" },
                  { key: "custom", label: "Custom Range" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(key as FilterPeriod)}
                    className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      filterPeriod === key
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range in Dropdown */}
              {filterPeriod === "custom" && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-2">
                  <div className="flex items-center space-x-1">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFilterPeriod("custom")
                      setShowDropdown(false)
                    }}
                    className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Click outside to close */}
          {showDropdown && <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center">
              <div className="mr-4">{card.icon}</div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">{card.title}</h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpense dateRange={currentRange} />
        <ExpenseByCategory dateRange={currentRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpendingTrend />
        <SavingsProgress />
        <FinancialHealthIndicator />
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Recent Transactions (${filteredTransactions.length} total)`}>
          {recentTransactions.length > 0 ? (
            <TransactionList transactions={recentTransactions} showActions={false} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No transactions found for the selected period
            </p>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Budget Overview">
            {budgets.length > 0 ? (
              <BudgetProgressList budgets={budgets} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No budgets set</p>
            )}
          </Card>

          {/* Savings Overview */}
          <Card title="Savings Overview">
            {savings.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Saved</span>
                  <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalSavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Goals</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{activeSavingsCount}</span>
                </div>
                {getActiveSavings()
                  .slice(0, 3)
                  .map((savingsItem) => {
                    const progress =
                      savingsItem.target_amount > 0
                        ? Math.min(100, (savingsItem.current_amount / savingsItem.target_amount) * 100)
                        : 0
                    return (
                      <div key={savingsItem.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {savingsItem.title}
                          </span>
                          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No savings goals set</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

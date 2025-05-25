export const formatCurrency = (amount: number, currency = "INR"): string => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export const formatMonthYear = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(date)
}

export const getCurrentMonth = (): string => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
}

export const getCurrentMonthEnd = (): string => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]
}

export const getLastNMonths = (n: number): string[] => {
  const months = []
  const now = new Date()

  for (let i = 0; i < n; i++) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(new Intl.DateTimeFormat("en-US", { month: "short" }).format(month))
  }

  return months.reverse()
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export const getDateRangeLabel = (startDate: string, endDate: string): string => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Check if it's the same day
  if (startDate === endDate) {
    return formatDate(startDate)
  }

  // Check if it's the same month
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}-${end.getDate()} ${new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(start)}`
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

"use client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

interface ChartWrapperProps {
  type: "line" | "bar" | "doughnut"
  data: any
  options?: any
  height?: number
}

export default function ChartWrapper({ type, data, options = {}, height = 300 }: ChartWrapperProps) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales:
      type !== "doughnut"
        ? {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
              },
            },
            y: {
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                font: {
                  size: 11,
                },
                callback: (value: any) => "₹" + value.toLocaleString(),
              },
            },
          }
        : undefined,
    ...options,
  }

  const chartStyle = {
    height: `${height}px`,
  }

  switch (type) {
    case "line":
      return (
        <div style={chartStyle}>
          <Line data={data} options={defaultOptions} />
        </div>
      )
    case "bar":
      return (
        <div style={chartStyle}>
          <Bar data={data} options={defaultOptions} />
        </div>
      )
    case "doughnut":
      return (
        <div style={chartStyle}>
          <Doughnut data={data} options={defaultOptions} />
        </div>
      )
    default:
      return null
  }
}

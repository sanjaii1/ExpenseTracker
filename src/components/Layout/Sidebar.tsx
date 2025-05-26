"use client"

import type React from "react"

import { useState } from "react"
import {
  Home,
  CreditCard,
  PieChart,
  BarChart,
  Wallet,
  Settings,
  LogOut,
  DollarSign,
  Sun,
  Moon,
  Menu,
  X,
  Target,
} from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function SidebarItem({ icon, label, isActive, onClick }: SidebarItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-lg transition-colors ${
          isActive
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </button>
    </li>
  )
}

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  session: any
}

function Sidebar({ activeTab, onTabChange, session }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { id: "expenses", label: "Expenses", icon: <CreditCard size={20} /> },
    { id: "income", label: "Income", icon: <Wallet size={20} /> },
    { id: "budget", label: "Budget", icon: <DollarSign size={20} /> },
    { id: "savings", label: "Savings", icon: <Target size={20} /> },
    { id: "reports", label: "Reports", icon: <BarChart size={20} /> },
    { id: "analytics", label: "Analytics", icon: <PieChart size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ]

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Error signing out")
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 ml-2">ExpenseTracker</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out md:transition-none h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 w-64 ${
          isMobileMenuOpen ? "mt-16" : ""
        } md:mt-0`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 hidden md:block">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center">
            <Wallet className="mr-2" size={24} />
            ExpenseTracker
          </h1>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setIsMobileMenuOpen(false)
                }}
              />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut size={20} className="mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar

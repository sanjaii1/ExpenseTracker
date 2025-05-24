"use client"

import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import Sidebar from "./components/Layout/Sidebar"
import Dashboard from "./components/Dashboard/Dashboard"
import ExpensesPage from "./components/Expenses/ExpensesPage"
import IncomePage from "./components/Income/IncomePage"
import BudgetPage from "./components/Budget/BudgetPage"
import ReportsPage from "./components/Reports/ReportsPage"
import SettingsPage from "./components/Settings/SettingsPage"
import AuthForm from "./components/Auth/AuthForm"
import { ThemeProvider } from "./context/ThemeContext"
import { TransactionProvider } from "./context/TransactionContext"
import { BudgetProvider } from "./context/BudgetContext"
import { supabase, ensureUserProfile } from "./lib/supabase"

interface Session {
  user: {
    id: string
    email?: string
  }
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    let authTimeout: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log("Starting quick auth check...")

        // Set a shorter timeout for initial auth check
        authTimeout = setTimeout(() => {
          if (mounted && !authChecked) {
            console.log("Auth check timeout, proceeding without session")
            setSession(null)
            setAuthChecked(true)
            setLoading(false)
          }
        }, 3000) // 3 second timeout instead of 10

        // Quick session check
        const { data, error } = await supabase.auth.getSession()

        if (mounted) {
          clearTimeout(authTimeout)

          if (error) {
            console.error("Auth error:", error)
            setSession(null)
          } else {
            console.log("Session check complete:", data.session ? "authenticated" : "not authenticated")
            setSession(data.session)

            // Only ensure profile if we have a session - don't block loading
            if (data.session?.user) {
              // Run profile creation in background, don't await
              ensureUserProfile().catch((error) => {
                console.error("Profile creation failed:", error)
                // Don't block the app for profile creation failures
              })
            }
          }

          setAuthChecked(true)
          setLoading(false)
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          clearTimeout(authTimeout)
          setSession(null)
          setAuthChecked(true)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      if (mounted) {
        setSession(session)
        setAuthChecked(true)
        setLoading(false)

        // Handle profile creation in background for sign-in events
        if (session?.user && event === "SIGNED_IN") {
          ensureUserProfile().catch((error) => {
            console.error("Profile creation failed on sign in:", error)
          })
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "expenses":
        return <ExpensesPage />
      case "income":
        return <IncomePage />
      case "budget":
        return <BudgetPage />
      case "reports":
      case "analytics":
        return <ReportsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard />
    }
  }

  // Show loading screen with shorter timeout
  if (loading && !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth form if no session
  if (!session) {
    return (
      <ThemeProvider>
        <AuthForm
          onSuccess={() => {
            console.log("Auth success - refreshing session")
            // Quick session refresh without blocking
            supabase.auth.getSession().then(({ data: { session } }) => {
              setSession(session)
            })
          }}
        />
        <Toaster position="top-right" />
      </ThemeProvider>
    )
  }

  // Show main app
  return (
    <ThemeProvider>
      <TransactionProvider>
        <BudgetProvider>
          <div className="h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} session={session} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16 md:mt-0">
                <div className="max-w-6xl mx-auto">{renderContent()}</div>
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </BudgetProvider>
      </TransactionProvider>
    </ThemeProvider>
  )
}

export default App

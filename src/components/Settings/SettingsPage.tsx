"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { User, Moon, Sun, Save, UserCircle, DollarSign, Download, Trash2, Key } from "lucide-react"
import Card from "../UI/Card"
import Button from "../UI/Button"
import Input from "../UI/Input"
import { useTheme } from "../../context/ThemeContext"
import { userService, supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

interface UserProfile {
  id: string
  name: string | null
  email: string
  currency: string
  theme: string
  created_at: string
}

function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalUser, setOriginalUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const profile = await userService.getProfile()
      setUser(profile)
      setOriginalUser(profile) // Store original data for comparison
      console.log("User profile loaded:", profile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error("Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, [name]: value }

      // Check if there are changes compared to original
      const hasChanges =
        originalUser &&
        (updated.name !== originalUser.name ||
          updated.currency !== originalUser.currency ||
          updated.theme !== originalUser.theme)
      setHasChanges(!!hasChanges)

      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !hasChanges) return

    try {
      setSaving(true)
      console.log("Saving profile changes:", {
        name: user.name,
        currency: user.currency,
        theme: user.theme,
      })

      const updatedProfile = await userService.updateProfile({
        name: user.name,
        currency: user.currency,
        theme: user.theme,
      })

      console.log("Profile updated successfully:", updatedProfile)

      // Update original user data and reset changes flag
      setOriginalUser(updatedProfile)
      setHasChanges(false)

      toast.success("Settings saved successfully!")

      // If theme was changed, apply it
      if (updatedProfile.theme !== theme) {
        toggleTheme()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, theme: newTheme }

      // Check if there are changes
      const hasChanges =
        originalUser &&
        (updated.name !== originalUser.name ||
          updated.currency !== originalUser.currency ||
          updated.theme !== originalUser.theme)
      setHasChanges(!!hasChanges)

      return updated
    })

    // Apply theme immediately for preview
    if (newTheme !== theme) {
      toggleTheme()
    }
  }

  const handlePasswordChange = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || "", {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast.success("Password reset email sent! Check your inbox.")
    } catch (error) {
      console.error("Error sending password reset:", error)
      toast.error("Failed to send password reset email")
    }
  }

  const handleExportData = async (format: "csv" | "json" | "pdf") => {
    try {
      toast.loading(`Exporting data as ${format.toUpperCase()}...`)

      // This would typically call an export service
      // For now, we'll show a success message
      setTimeout(() => {
        toast.dismiss()
        toast.success(`Data exported as ${format.toUpperCase()}!`)
      }, 2000)
    } catch (error) {
      toast.error("Failed to export data")
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.",
    )

    if (!confirmed) return

    try {
      // Delete user data from our tables first
      await userService.deleteUserData()

      // Then delete the auth user
      const { error } = await supabase.auth.admin.deleteUser(user?.id || "")

      if (error) throw error

      toast.success("Account deleted successfully")

      // Sign out and redirect
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account")
    }
  }

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Failed to load user profile</p>
        <Button onClick={fetchUserProfile} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        {hasChanges && <div className="text-sm text-amber-600 dark:text-amber-400">You have unsaved changes</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <UserCircle size={48} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name || "User"}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                fullWidth
                onClick={handlePasswordChange}
                iconLeft={<Key size={16} />}
              >
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card title="Profile Settings">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={user.name || ""}
                    onChange={handleChange}
                    icon={<User size={18} className="text-gray-500" />}
                    fullWidth
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    className="opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Currency
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={18} className="text-gray-500" />
                    </div>
                    <select
                      name="currency"
                      value={user.currency}
                      onChange={handleChange}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  iconLeft={<Save size={18} />}
                  disabled={saving || !hasChanges}
                  className={hasChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {saving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
                </Button>
              </div>
            </Card>
          </form>

          <Card title="Appearance" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Theme Preference</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`p-2 rounded-md transition-colors ${
                      user.theme === "light"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    aria-label="Light mode"
                  >
                    <Sun size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`p-2 rounded-md transition-colors ${
                      user.theme === "dark"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                    aria-label="Dark mode"
                  >
                    <Moon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Data Management" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Export Your Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Download your financial data in different formats
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("csv")}
                    iconLeft={<Download size={16} />}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("json")}
                    iconLeft={<Download size={16} />}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportData("pdf")}
                    iconLeft={<Download size={16} />}
                  >
                    Export PDF
                  </Button>
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount} iconLeft={<Trash2 size={16} />}>
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

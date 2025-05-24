"use client"

import type React from "react"
import { useState } from "react"
import { supabase, testConnection } from "../../lib/supabase"
import Button from "../UI/Button"
import Input from "../UI/Input"
import { Mail, Lock, User } from "lucide-react"
import toast from "react-hot-toast"

interface AuthFormProps {
  onSuccess: () => void
}

function AuthForm({ onSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const result = await testConnection()
      if (result.success) {
        toast.success("Supabase connection successful!")
      } else {
        toast.error(`Connection failed: ${result.message}`)
      }
    } catch (error: any) {
      toast.error(`Connection test failed: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log(`Attempting to ${isSignUp ? "sign up" : "sign in"}...`)

      if (isSignUp) {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        })

        if (signUpError) {
          console.error("Sign up error:", signUpError)
          throw signUpError
        }

        console.log("Sign up successful:", data)

        if (data.user && data.session) {
          // User is immediately signed in
          toast.success("Account created successfully!")
          onSuccess()
        } else if (data.user && !data.session) {
          // User needs email confirmation
          toast.success("Account created! Please check your email to verify your account.")
        }
      } else {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          console.error("Sign in error:", signInError)
          throw signInError
        }

        console.log("Sign in successful:", data)
        toast.success("Logged in successfully!")
        onSuccess()
      }
    } catch (error: any) {
      console.error("Auth error:", error)

      // Handle specific error messages
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password")
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please check your email and confirm your account")
      } else if (error.message?.includes("User already registered")) {
        toast.error("Email already registered. Please sign in instead.")
      } else if (error.message?.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error(error.message || "Authentication failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ET</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">ExpenseTracker</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Connection Test Button */}
        <div className="text-center">
          <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} disabled={testing}>
            {testing ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <Input
                label="Name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                icon={<User size={18} className="text-gray-500" />}
                fullWidth
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={18} className="text-gray-500" />}
              fullWidth
            />

            <Input
              label="Password"
              name="password"
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={18} className="text-gray-500" />}
              fullWidth
            />
          </div>

          <div>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>

        {/* Debug info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            For testing: Use any email and password (min 6 chars)
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm

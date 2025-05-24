import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/supabase"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("Environment check:")
console.log("VITE_SUPABASE_URL:", supabaseUrl)
console.log("VITE_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)
console.log("VITE_SUPABASE_ANON_KEY length:", supabaseAnonKey?.length)

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push("VITE_SUPABASE_URL")
  if (!supabaseAnonKey) missingVars.push("VITE_SUPABASE_ANON_KEY")

  throw new Error(`Missing Supabase environment variables: ${missingVars.join(", ")}`)
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL format: ${supabaseUrl}`)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    if (error) throw error
    return { success: true, message: "Connection successful" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to ensure user profile exists
export const ensureUserProfile = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error("User not authenticated")

  try {
    // Try to get existing profile
    const { data: existingProfile, error: getError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (getError && getError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if profile doesn't exist
      throw getError
    }

    if (existingProfile) {
      console.log("User profile exists:", existingProfile)
      return existingProfile
    }

    // Profile doesn't exist, create it
    console.log("Creating user profile for:", user.id)
    const { data: newProfile, error: createError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        currency: "USD",
        theme: "light",
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user profile:", createError)
      throw createError
    }

    console.log("User profile created successfully:", newProfile)
    return newProfile
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    throw error
  }
}

// Transaction operations
export const transactionService = {
  async getAll() {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Ensure user profile exists before querying transactions
    await ensureUserProfile()

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(transaction: Omit<Database["public"]["Tables"]["transactions"]["Insert"], "user_id">) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Ensure user profile exists before creating transaction
    await ensureUserProfile()

    console.log("Creating transaction for user:", user.id)
    console.log("Transaction data:", transaction)

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...transaction,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating transaction:", error)

      // If it's still a foreign key error, try to create profile again
      if (error.code === "23503") {
        console.log("Foreign key error, attempting to create user profile...")
        try {
          await ensureUserProfile()
          // Retry the transaction creation
          const { data: retryData, error: retryError } = await supabase
            .from("transactions")
            .insert({
              ...transaction,
              user_id: user.id,
            })
            .select()
            .single()

          if (retryError) throw retryError
          return retryData
        } catch (retryError) {
          console.error("Retry failed:", retryError)
          throw new Error("Failed to create transaction. User profile could not be created.")
        }
      }

      throw error
    }

    console.log("Transaction created successfully:", data)
    return data
  },

  async update(id: string, updates: Partial<Database["public"]["Tables"]["transactions"]["Update"]>) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error
  },
}

// Budget operations
export const budgetService = {
  async getAll() {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Ensure user profile exists before querying budgets
    await ensureUserProfile()

    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async create(budget: Omit<Database["public"]["Tables"]["budgets"]["Insert"], "user_id">) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Ensure user profile exists before creating budget
    await ensureUserProfile()

    const { data, error } = await supabase
      .from("budgets")
      .insert({
        ...budget,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Database["public"]["Tables"]["budgets"]["Update"]>) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("budgets")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id)

    if (error) throw error
  },
}

// User operations
export const userService = {
  async getProfile() {
    return await ensureUserProfile()
  },

  async updateProfile(updates: Partial<Database["public"]["Tables"]["users"]["Update"]>) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Ensure profile exists first
    await ensureUserProfile()

    const { data, error } = await supabase.from("users").update(updates).eq("id", user.id).select().single()

    if (error) throw error
    return data
  },

  async createProfile(profile: Omit<Database["public"]["Tables"]["users"]["Insert"], "id">) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Use upsert to handle cases where profile might already exist
    const { data, error } = await supabase
      .from("users")
      .upsert({
        ...profile,
        id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}

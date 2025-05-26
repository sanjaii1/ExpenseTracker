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

// Savings operations with better error handling
export const savingsService = {
  async getAll() {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    await ensureUserProfile()

    console.log("Fetching savings for user:", user.id)

    try {
      const { data, error } = await supabase
        .from("savings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error fetching savings:", error)

        // Check if table doesn't exist
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          throw new Error("Savings table does not exist. Please run the database migration first.")
        }

        throw error
      }

      console.log("Successfully fetched savings:", data?.length || 0)
      return data || []
    } catch (error: any) {
      console.error("Error in savingsService.getAll:", error)
      throw error
    }
  },

  async create(savings: Omit<Database["public"]["Tables"]["savings"]["Insert"], "user_id">) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    await ensureUserProfile()

    console.log("Creating savings for user:", user.id, savings)

    try {
      const { data, error } = await supabase
        .from("savings")
        .insert({
          ...savings,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error creating savings:", error)

        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          throw new Error("Savings table does not exist. Please run the database migration first.")
        }

        throw error
      }

      console.log("Successfully created savings:", data)
      return data
    } catch (error: any) {
      console.error("Error in savingsService.create:", error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Database["public"]["Tables"]["savings"]["Update"]>) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("savings")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        throw new Error("Savings table does not exist. Please run the database migration first.")
      }
      throw error
    }
    return data
  },

  async delete(id: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("savings").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        throw new Error("Savings table does not exist. Please run the database migration first.")
      }
      throw error
    }
  },

  async getAllTransactions() {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error } = await supabase
        .from("savings_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          throw new Error("Savings transactions table does not exist. Please run the database migration first.")
        }
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error("Error in savingsService.getAllTransactions:", error)
      throw error
    }
  },

  async createTransaction(
    transaction: Omit<Database["public"]["Tables"]["savings_transactions"]["Insert"], "user_id">,
  ) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error } = await supabase
        .from("savings_transactions")
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          throw new Error("Savings transactions table does not exist. Please run the database migration first.")
        }
        throw error
      }

      return data
    } catch (error: any) {
      console.error("Error in savingsService.createTransaction:", error)
      throw error
    }
  },

  async getTransactionsBySavingsId(savingsId: string) {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    try {
      const { data, error } = await supabase
        .from("savings_transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("savings_id", savingsId)
        .order("date", { ascending: false })

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.includes("relation") ||
          error.message?.includes("does not exist")
        ) {
          throw new Error("Savings transactions table does not exist. Please run the database migration first.")
        }
        throw error
      }

      return data || []
    } catch (error: any) {
      console.error("Error in savingsService.getTransactionsBySavingsId:", error)
      throw error
    }
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

    console.log("Updating user profile with:", updates)

    // Create a clean update object without undefined values
    const cleanUpdates: any = {}
    if (updates.name !== undefined) cleanUpdates.name = updates.name
    if (updates.currency !== undefined) cleanUpdates.currency = updates.currency
    if (updates.theme !== undefined) cleanUpdates.theme = updates.theme

    console.log("Clean updates:", cleanUpdates)

    const { data, error } = await supabase.from("users").update(cleanUpdates).eq("id", user.id).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }

    console.log("Profile updated successfully:", data)
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

  async deleteUserData() {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    // Delete all user data in order (due to foreign key constraints)
    await supabase.from("savings_transactions").delete().eq("user_id", user.id)
    await supabase.from("savings").delete().eq("user_id", user.id)
    await supabase.from("transactions").delete().eq("user_id", user.id)
    await supabase.from("budgets").delete().eq("user_id", user.id)
    await supabase.from("users").delete().eq("id", user.id)
  },
}

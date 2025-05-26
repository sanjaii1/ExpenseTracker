"use client"
import { useState } from "react"
import { Plus, Target, TrendingUp, Calendar, DollarSign } from "lucide-react"
import Card from "../UI/Card"
import Button from "../UI/Button"
import Modal from "../UI/Modal"
import { useSavings } from "../../context/SavingsContext"
import type { Savings, SavingsTransaction } from "../../types"
import { formatCurrency } from "../../utils/formatters"
import SavingsForm from "./SavingsForm"
import SavingsTransactionForm from "./SavingsTransactionForm"
import SavingsProgressCard from "./SavingsProgressCard"

function SavingsPage() {
  const {
    savings,
    savingsTransactions,
    loading,
    addSavings,
    updateSavings,
    deleteSavings,
    addSavingsTransaction,
    getSavingsTransactionsBySavingsId,
    getTotalSavings,
    getActiveSavings,
    getCompletedSavings,
  } = useSavings()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [currentSavings, setCurrentSavings] = useState<Savings | null>(null)
  const [selectedSavingsId, setSelectedSavingsId] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all")

  const handleAddSavings = async (data: Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">) => {
    await addSavings(data)
    setIsModalOpen(false)
  }

  const handleEditSavings = (savingsItem: Savings) => {
    setCurrentSavings(savingsItem)
    setIsModalOpen(true)
  }

  const handleUpdateSavings = async (data: Omit<Savings, "id" | "current_amount" | "created_at" | "updated_at">) => {
    if (currentSavings) {
      await updateSavings(currentSavings.id, data)
      setCurrentSavings(null)
      setIsModalOpen(false)
    }
  }

  const handleDeleteSavings = async (id: string) => {
    if (
      confirm("Are you sure you want to delete this savings goal? This will also delete all associated transactions.")
    ) {
      await deleteSavings(id)
    }
  }

  const handleAddTransaction = (savingsId: string) => {
    setSelectedSavingsId(savingsId)
    setIsTransactionModalOpen(true)
  }

  const handleSubmitTransaction = async (data: Omit<SavingsTransaction, "id" | "created_at">) => {
    await addSavingsTransaction(data)
    setIsTransactionModalOpen(false)
    setSelectedSavingsId("")
  }

  const getFilteredSavings = () => {
    switch (activeTab) {
      case "active":
        return getActiveSavings()
      case "completed":
        return getCompletedSavings()
      default:
        return savings
    }
  }

  const filteredSavings = getFilteredSavings()
  const totalSavings = getTotalSavings()
  const activeSavingsCount = getActiveSavings().length
  const completedSavingsCount = getCompletedSavings().length

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "Medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
      case "Low":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
      case "Completed":
        return "text-green-500 bg-green-50 dark:bg-green-900/20"
      case "Paused":
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        <Button
          onClick={() => {
            setCurrentSavings(null)
            setIsModalOpen(true)
          }}
          iconLeft={<Plus size={18} />}
          variant="primary"
        >
          Add Savings Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="mr-4">
              <DollarSign className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Savings</h3>
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="mr-4">
              <Target className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Active Goals</h3>
              <p className="text-2xl font-bold text-green-500 dark:text-green-400">{activeSavingsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center">
            <div className="mr-4">
              <TrendingUp className="text-purple-500" size={24} />
            </div>
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Completed</h3>
              <p className="text-2xl font-bold text-purple-500 dark:text-purple-400">{completedSavingsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center">
            <div className="mr-4">
              <Calendar className="text-orange-500" size={24} />
            </div>
            <div>
              <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Goals</h3>
              <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">{savings.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium ${
              activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            All Goals ({savings.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium ${
              activeTab === "active"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Active ({activeSavingsCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 sm:flex-none px-4 py-3 text-sm font-medium ${
              activeTab === "completed"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Completed ({completedSavingsCount})
          </button>
        </div>

        <div className="p-6">
          {filteredSavings.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSavings.map((savingsItem) => (
                <SavingsProgressCard
                  key={savingsItem.id}
                  savings={savingsItem}
                  transactions={getSavingsTransactionsBySavingsId(savingsItem.id)}
                  onEdit={() => handleEditSavings(savingsItem)}
                  onDelete={() => handleDeleteSavings(savingsItem.id)}
                  onAddTransaction={() => handleAddTransaction(savingsItem.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No savings goals</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activeTab === "all"
                  ? "Get started by creating your first savings goal."
                  : `No ${activeTab} savings goals found.`}
              </p>
              {activeTab === "all" && (
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      setCurrentSavings(null)
                      setIsModalOpen(true)
                    }}
                    iconLeft={<Plus size={18} />}
                    variant="primary"
                  >
                    Add Savings Goal
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setCurrentSavings(null)
        }}
        title={currentSavings ? "Edit Savings Goal" : "Add New Savings Goal"}
        size="lg"
      >
        <SavingsForm
          onSubmit={currentSavings ? handleUpdateSavings : handleAddSavings}
          initialData={currentSavings}
          onCancel={() => {
            setIsModalOpen(false)
            setCurrentSavings(null)
          }}
        />
      </Modal>

      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false)
          setSelectedSavingsId("")
        }}
        title="Add Transaction"
      >
        <SavingsTransactionForm
          savingsId={selectedSavingsId}
          onSubmit={handleSubmitTransaction}
          onCancel={() => {
            setIsTransactionModalOpen(false)
            setSelectedSavingsId("")
          }}
        />
      </Modal>
    </div>
  )
}

export default SavingsPage

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { useBudgets } from '../../context/BudgetContext';
import { Budget } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { mockCategories } from '../../data/mockData';
import BudgetProgressList from './BudgetProgressList';

interface BudgetFormData {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

const BudgetPage: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: 0,
    period: 'monthly',
  });

  const expenseCategories = mockCategories.filter(cat => 
    cat.type === 'expense' || cat.type === 'both'
  );

  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setCurrentBudget(budget);
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
      });
    } else {
      setCurrentBudget(null);
      setFormData({
        category: '',
        amount: 0,
        period: 'monthly',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentBudget(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentBudget) {
      updateBudget(currentBudget.id, formData);
    } else {
      addBudget(formData);
    }
    
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
        <Button
          onClick={() => handleOpenModal()}
          iconLeft={<Plus size={18} />}
          variant="primary"
        >
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Budget Overview">
          {budgets.length > 0 ? (
            <BudgetProgressList budgets={budgets} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No budgets set</p>
          )}
        </Card>

        <Card title="Budget Details">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {budgets.map(budget => (
              <div key={budget.id} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{budget.category}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatCurrency(budget.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(budget.spent)} spent
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-1"
                      onClick={() => handleOpenModal(budget)}
                      aria-label="Edit budget"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(budget.id)}
                      aria-label="Delete budget"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {budgets.length === 0 && (
              <p className="py-4 text-gray-500 dark:text-gray-400 text-center">
                No budgets created yet
              </p>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentBudget ? 'Edit Budget' : 'Create New Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="">Select a category</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Budget Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {currentBudget ? 'Update' : 'Create'} Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetPage;
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Budget, Transaction } from '../types';
import { mockBudgets } from '../data/mockData';
import { useTransactions } from './TransactionContext';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetByCategory: (category: string) => Budget | undefined;
  calculateBudgetProgress: (budgetId: string) => number;
  isBudgetExceeded: (budgetId: string) => boolean;
}

const BudgetContext = createContext<BudgetContextType>({
  budgets: [],
  addBudget: () => {},
  updateBudget: () => {},
  deleteBudget: () => {},
  getBudgetByCategory: () => undefined,
  calculateBudgetProgress: () => 0,
  isBudgetExceeded: () => false,
});

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { transactions } = useTransactions();
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const savedBudgets = localStorage.getItem('budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : mockBudgets;
  });

  // Update spent amount based on transactions
  useEffect(() => {
    const updatedBudgets = budgets.map(budget => {
      const categoryTransactions = transactions.filter(
        t => t.category === budget.category && t.type === 'expense'
      );
      
      // Calculate spent amount from transactions
      const spent = categoryTransactions.reduce((total, t) => total + t.amount, 0);
      
      return {
        ...budget,
        spent
      };
    });
    
    setBudgets(updatedBudgets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  // Save budgets to localStorage
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id: string, updatedBudget: Partial<Budget>) => {
    setBudgets(prev =>
      prev.map(budget => (budget.id === id ? { ...budget, ...updatedBudget } : budget))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id));
  };

  const getBudgetByCategory = (category: string) => {
    return budgets.find(budget => budget.category === category);
  };

  const calculateBudgetProgress = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;
    return Math.min(100, Math.round((budget.spent / budget.amount) * 100));
  };

  const isBudgetExceeded = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return false;
    return budget.spent > budget.amount;
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getBudgetByCategory,
        calculateBudgetProgress,
        isBudgetExceeded,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);
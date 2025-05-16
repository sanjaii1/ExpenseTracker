import React, { createContext, useState, useContext, useEffect } from 'react';
import { Transaction } from '../types';
import { mockTransactions } from '../data/mockData';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByType: (type: 'income' | 'expense') => Transaction[];
  getTransactionsByCategory: (category: string) => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTotalByType: (type: 'income' | 'expense') => number;
  getFilteredTransactions: (filters: TransactionFilters) => Transaction[];
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  getTransactionsByType: () => [],
  getTransactionsByCategory: () => [],
  getTransactionsByDateRange: () => [],
  getTotalByType: () => 0,
  getFilteredTransactions: () => [],
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : mockTransactions;
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const getTransactionsByType = (type: 'income' | 'expense') => {
    return transactions.filter(transaction => transaction.type === type);
  };

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter(transaction => transaction.category === category);
  };

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter(
      transaction => transaction.date >= startDate && transaction.date <= endDate
    );
  };

  const getTotalByType = (type: 'income' | 'expense') => {
    return getTransactionsByType(type).reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getFilteredTransactions = (filters: TransactionFilters) => {
    return transactions.filter(transaction => {
      // Type filter
      if (filters.type && transaction.type !== filters.type) return false;
      
      // Category filter
      if (filters.category && transaction.category !== filters.category) return false;
      
      // Date range filter
      if (filters.startDate && transaction.date < filters.startDate) return false;
      if (filters.endDate && transaction.date > filters.endDate) return false;
      
      // Amount range filter
      if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) return false;
      
      // Search filter (check in description)
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByType,
        getTransactionsByCategory,
        getTransactionsByDateRange,
        getTotalByType,
        getFilteredTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
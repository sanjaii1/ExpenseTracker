import React, { useState } from 'react';
import { BarChart3, PieChart, Calendar } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useTransactions } from '../../context/TransactionContext';
import { formatCurrency, getLastNMonths } from '../../utils/formatters';
import { mockCategories } from '../../data/mockData';

const ReportsPage: React.FC = () => {
  const { transactions, getTransactionsByType } = useTransactions();
  const [activeTab, setActiveTab] = useState<'spending' | 'income' | 'comparison'>('spending');
  
  const months = getLastNMonths(6);
  const expensesByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};
  
  // Calculate totals by category
  const expenses = getTransactionsByType('expense');
  const income = getTransactionsByType('income');
  
  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.amount;
  });
  
  income.forEach(income => {
    if (!incomeByCategory[income.category]) {
      incomeByCategory[income.category] = 0;
    }
    incomeByCategory[income.category] += income.amount;
  });
  
  // Get top categories
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  const topIncomeCategories = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calculate monthly data
  const monthlyExpenses: Record<string, number> = {};
  const monthlyIncome: Record<string, number> = {};
  
  months.forEach(month => {
    monthlyExpenses[month] = 0;
    monthlyIncome[month] = 0;
  });
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    
    if (months.includes(monthName)) {
      if (transaction.type === 'expense') {
        monthlyExpenses[monthName] += transaction.amount;
      } else {
        monthlyIncome[monthName] += transaction.amount;
      }
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('spending')}
            className={`flex items-center px-4 py-3 ${
              activeTab === 'spending'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <BarChart3 size={18} className="mr-2" />
            Spending Analysis
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center px-4 py-3 ${
              activeTab === 'income'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <PieChart size={18} className="mr-2" />
            Income Analysis
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center px-4 py-3 ${
              activeTab === 'comparison'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Calendar size={18} className="mr-2" />
            Monthly Comparison
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'spending' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Top Spending Categories
                </h3>
                <div className="space-y-4">
                  {topExpenseCategories.length > 0 ? (
                    topExpenseCategories.map(([category, amount], index) => {
                      const categoryData = mockCategories.find(c => c.name === category);
                      const color = categoryData?.color || '#6B7280';
                      const percentage = Math.round((amount / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100);
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(amount)} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{ width: `${percentage}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No expense data available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Monthly Spending
                </h3>
                <div className="h-64 flex items-end space-x-2">
                  {Object.entries(monthlyExpenses).map(([month, amount], index) => {
                    const maxAmount = Math.max(...Object.values(monthlyExpenses));
                    const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-blue-500 rounded-t-md"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'income' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Income Sources
                </h3>
                <div className="space-y-4">
                  {topIncomeCategories.length > 0 ? (
                    topIncomeCategories.map(([category, amount], index) => {
                      const categoryData = mockCategories.find(c => c.name === category);
                      const color = categoryData?.color || '#10B981';
                      const percentage = Math.round((amount / income.reduce((sum, inc) => sum + inc.amount, 0)) * 100);
                      
                      return (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCurrency(amount)} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{ width: `${percentage}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No income data available</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Monthly Income
                </h3>
                <div className="h-64 flex items-end space-x-2">
                  {Object.entries(monthlyIncome).map(([month, amount], index) => {
                    const maxAmount = Math.max(...Object.values(monthlyIncome));
                    const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-green-500 rounded-t-md"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Income vs. Expenses
              </h3>
              <div className="h-64 flex items-end space-x-4">
                {months.map((month, index) => {
                  const monthIncome = monthlyIncome[month] || 0;
                  const monthExpense = monthlyExpenses[month] || 0;
                  const maxValue = Math.max(
                    ...Object.values(monthlyIncome),
                    ...Object.values(monthlyExpenses)
                  );
                  
                  const incomeHeight = maxValue > 0 ? (monthIncome / maxValue) * 100 : 0;
                  const expenseHeight = maxValue > 0 ? (monthExpense / maxValue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1">
                      <div className="flex space-x-1 h-full items-end">
                        <div className="w-1/2 flex flex-col items-center">
                          <div
                            className="w-full bg-green-500 rounded-t-md"
                            style={{ height: `${incomeHeight}%` }}
                          ></div>
                        </div>
                        <div className="w-1/2 flex flex-col items-center">
                          <div
                            className="w-full bg-red-500 rounded-t-md"
                            style={{ height: `${expenseHeight}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-center text-gray-600 dark:text-gray-400 mt-2">
                        {month}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {months.map((month, index) => {
                  const monthIncome = monthlyIncome[month] || 0;
                  const monthExpense = monthlyExpenses[month] || 0;
                  const balance = monthIncome - monthExpense;
                  
                  return (
                    <Card key={index} className="text-center">
                      <h4 className="font-medium mb-2">{month}</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          Income: <span className="font-medium text-green-500">{formatCurrency(monthIncome)}</span>
                        </p>
                        <p>
                          Expenses: <span className="font-medium text-red-500">{formatCurrency(monthExpense)}</span>
                        </p>
                        <p>
                          Balance:{' '}
                          <span className={`font-medium ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(balance)}
                          </span>
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
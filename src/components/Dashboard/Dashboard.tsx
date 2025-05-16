import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Landmark } from 'lucide-react';
import Card from '../UI/Card';
import { useTransactions } from '../../context/TransactionContext';
import { useBudgets } from '../../context/BudgetContext';
import { formatCurrency, getCurrentMonth, getCurrentMonthEnd } from '../../utils/formatters';
import TransactionList from '../Transactions/TransactionList';
import BudgetProgressList from '../Budget/BudgetProgressList';

const Dashboard: React.FC = () => {
  const { transactions, getTotalByType } = useTransactions();
  const { budgets } = useBudgets();
  const [dateRange] = useState({
    startDate: getCurrentMonth(),
    endDate: getCurrentMonthEnd(),
  });

  const totalIncome = getTotalByType('income');
  const totalExpenses = getTotalByType('expense');
  const balance = totalIncome - totalExpenses;
  const savings = balance > 0 ? balance : 0;

  // Get recent transactions
  const recentTransactions = transactions
    .filter(t => t.date >= dateRange.startDate && t.date <= dateRange.endDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const summaryCards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: <ArrowUpCircle className="text-green-500" size={24} />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-500 dark:text-green-400',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <ArrowDownCircle className="text-red-500" size={24} />,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-500 dark:text-red-400',
    },
    {
      title: 'Balance',
      value: formatCurrency(balance),
      icon: <Wallet className="text-blue-500" size={24} />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-500 dark:text-blue-400',
    },
    {
      title: 'Savings',
      value: formatCurrency(savings),
      icon: <Landmark className="text-purple-500" size={24} />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-500 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className={`${card.bgColor} border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center">
              <div className="mr-4">{card.icon}</div>
              <div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">{card.title}</h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Transactions">
          {recentTransactions.length > 0 ? (
            <TransactionList 
              transactions={recentTransactions} 
              showActions={false} 
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent transactions</p>
          )}
        </Card>

        <Card title="Budget Overview">
          {budgets.length > 0 ? (
            <BudgetProgressList budgets={budgets} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No budgets set</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
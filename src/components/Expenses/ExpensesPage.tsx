import React, { useState } from 'react';
import { Plus, Search, Filter, FileSpreadsheet, File as FilePdf, Calendar } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import * as XLSX from 'xlsx';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import TransactionList from '../Transactions/TransactionList';
import TransactionForm from '../Transactions/TransactionForm';
import { useTransactions, TransactionFilters } from '../../context/TransactionContext';
import { Transaction } from '../../types';
import { mockCategories } from '../../data/mockData';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const ExpensesPage: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getFilteredTransactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'expense',
    search: '',
    category: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<'month' | 'year' | 'custom'>('month');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const expenseCategories = mockCategories.filter(cat => 
    cat.type === 'expense' || cat.type === 'both'
  );

  const filteredTransactions = getFilteredTransactions(filters);

  const handleAddExpense = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data);
    setIsModalOpen(false);
  };

  const handleEditExpense = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateExpense = (data: Omit<Transaction, 'id'>) => {
    if (currentTransaction) {
      updateTransaction(currentTransaction.id, data);
      setCurrentTransaction(undefined);
      setIsModalOpen(false);
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteTransaction(id);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    let exportTransactions = filteredTransactions;
    const now = new Date();
    let fileName = 'expenses';

    if (exportDateRange === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      exportTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= firstDay && new Date(t.date) <= lastDay
      );
      fileName = `expenses_${now.toLocaleString('default', { month: 'long' })}_${now.getFullYear()}`;
    } else if (exportDateRange === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      exportTransactions = filteredTransactions.filter(t => 
        new Date(t.date) >= firstDay && new Date(t.date) <= lastDay
      );
      fileName = `expenses_${now.getFullYear()}`;
    } else if (exportDateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      exportTransactions = filteredTransactions.filter(t => 
        t.date >= customDateRange.startDate && t.date <= customDateRange.endDate
      );
      fileName = `expenses_${customDateRange.startDate}_to_${customDateRange.endDate}`;
    }

    if (format === 'excel') {
      exportToExcel(exportTransactions, fileName);
    } else {
      exportToPDF(exportTransactions);
    }
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setIsExportModalOpen(true)}
            variant="secondary"
            iconLeft={<FileSpreadsheet size={18} />}
          >
            Export
          </Button>
          <Button
            onClick={() => {
              setCurrentTransaction(undefined);
              setIsModalOpen(true);
            }}
            iconLeft={<Plus size={18} />}
            variant="primary"
          >
            Add Expense
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              name="search"
              placeholder="Search expenses..."
              value={filters.search || ''}
              onChange={handleFilterChange}
              fullWidth
              icon={<Search size={18} className="text-gray-500" />}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            iconLeft={<Filter size={18} />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category || ''}
                onChange={handleFilterChange}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              >
                <option value="">All Categories</option>
                {expenseCategories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate || ''}
                onChange={handleFilterChange}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate || ''}
                onChange={handleFilterChange}
                fullWidth
              />
            </div>
          </div>
        )}

        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTransaction(undefined);
        }}
        title={currentTransaction ? 'Edit Expense' : 'Add New Expense'}
      >
        <TransactionForm
          type="expense"
          onSubmit={currentTransaction ? handleUpdateExpense : handleAddExpense}
          initialData={currentTransaction}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentTransaction(undefined);
          }}
        />
      </Modal>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Expenses"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date Range
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="month"
                  name="dateRange"
                  value="month"
                  checked={exportDateRange === 'month'}
                  onChange={(e) => setExportDateRange(e.target.value as 'month')}
                  className="text-blue-600"
                />
                <label htmlFor="month">This Month</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="year"
                  name="dateRange"
                  value="year"
                  checked={exportDateRange === 'year'}
                  onChange={(e) => setExportDateRange(e.target.value as 'year')}
                  className="text-blue-600"
                />
                <label htmlFor="year">This Year</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom"
                  name="dateRange"
                  value="custom"
                  checked={exportDateRange === 'custom'}
                  onChange={(e) => setExportDateRange(e.target.value as 'custom')}
                  className="text-blue-600"
                />
                <label htmlFor="custom">Custom Range</label>
              </div>
            </div>
          </div>

          {exportDateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                fullWidth
              />
              <Input
                type="date"
                label="End Date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                fullWidth
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('excel')}
              iconLeft={<FileSpreadsheet size={18} />}
            >
              Export to Excel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('pdf')}
              iconLeft={<FilePdf size={18} />}
            >
              Export to PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
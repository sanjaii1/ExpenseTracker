import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import TransactionList from '../Transactions/TransactionList';
import TransactionForm from '../Transactions/TransactionForm';
import { useTransactions, TransactionFilters } from '../../context/TransactionContext';
import { Transaction } from '../../types';
import { mockCategories } from '../../data/mockData';

const IncomePage: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, getFilteredTransactions } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | undefined>(undefined);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'income',
    search: '',
    category: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const incomeCategories = mockCategories.filter(cat => 
    cat.type === 'income' || cat.type === 'both'
  );

  const filteredTransactions = getFilteredTransactions(filters);

  const handleAddIncome = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data);
    setIsModalOpen(false);
  };

  const handleEditIncome = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleUpdateIncome = (data: Omit<Transaction, 'id'>) => {
    if (currentTransaction) {
      updateTransaction(currentTransaction.id, data);
      setCurrentTransaction(undefined);
      setIsModalOpen(false);
    }
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      deleteTransaction(id);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Income</h1>
        <Button
          onClick={() => {
            setCurrentTransaction(undefined);
            setIsModalOpen(true);
          }}
          iconLeft={<Plus size={18} />}
          variant="success"
        >
          Add Income
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              name="search"
              placeholder="Search income..."
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
                {incomeCategories.map(category => (
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
          onEdit={handleEditIncome}
          onDelete={handleDeleteIncome}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentTransaction(undefined);
        }}
        title={currentTransaction ? 'Edit Income' : 'Add New Income'}
      >
        <TransactionForm
          type="income"
          onSubmit={currentTransaction ? handleUpdateIncome : handleAddIncome}
          initialData={currentTransaction}
          onCancel={() => {
            setIsModalOpen(false);
            setCurrentTransaction(undefined);
          }}
        />
      </Modal>
    </div>
  );
};

export default IncomePage;
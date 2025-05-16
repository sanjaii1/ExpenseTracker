import React, { useState, useEffect } from 'react';
import { Calendar, Tag, DollarSign } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { Transaction } from '../../types';
import { mockCategories } from '../../data/mockData';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSubmit,
  initialData,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type,
    isRecurring: initialData?.isRecurring || false,
  });

  // Filter categories based on transaction type
  const filteredCategories = mockCategories.filter(
    cat => cat.type === type || cat.type === 'both'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          fullWidth
          icon={<DollarSign size={18} className="text-gray-500" />}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag size={18} className="text-gray-500" />
            </div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
            >
              <option value="">Select a category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Input
        label="Description"
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter description"
        required
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          fullWidth
          icon={<Calendar size={18} className="text-gray-500" />}
        />

        <div className="flex items-center mt-8">
          <input
            type="checkbox"
            id="isRecurring"
            name="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="isRecurring"
            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Recurring {type}
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant={type === 'income' ? 'success' : 'primary'}>
          {initialData ? 'Update' : 'Add'} {type}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
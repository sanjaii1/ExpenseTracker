import { Transaction, Budget, Category, User } from '../types';
import { 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car, 
  Utensils, 
  Smartphone, 
  Briefcase, 
  Gift, 
  HeartPulse, 
  GraduationCap, 
  Plane, 
  DollarSign
} from 'lucide-react';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  currency: 'USD',
  theme: 'light'
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Shopping', color: '#F87171', icon: 'ShoppingBag', type: 'expense' },
  { id: '2', name: 'Food & Dining', color: '#FBBF24', icon: 'Utensils', type: 'expense' },
  { id: '3', name: 'Housing', color: '#60A5FA', icon: 'Home', type: 'expense' },
  { id: '4', name: 'Transportation', color: '#34D399', icon: 'Car', type: 'expense' },
  { id: '5', name: 'Entertainment', color: '#A78BFA', icon: 'Coffee', type: 'expense' },
  { id: '6', name: 'Utilities', color: '#F472B6', icon: 'Smartphone', type: 'expense' },
  { id: '7', name: 'Healthcare', color: '#6EE7B7', icon: 'HeartPulse', type: 'expense' },
  { id: '8', name: 'Education', color: '#93C5FD', icon: 'GraduationCap', type: 'expense' },
  { id: '9', name: 'Travel', color: '#C4B5FD', icon: 'Plane', type: 'expense' },
  { id: '10', name: 'Salary', color: '#10B981', icon: 'Briefcase', type: 'income' },
  { id: '11', name: 'Gifts', color: '#EC4899', icon: 'Gift', type: 'income' },
  { id: '13', name: 'Insurance', color: '#F59E42', icon: 'Shield', type: 'expense' },
  { id: '14', name: 'Pets', color: '#FCD34D', icon: 'HeartPulse', type: 'expense' },
  { id: '15', name: 'Childcare', color: '#F472B6', icon: 'Gift', type: 'expense' },
  { id: '16', name: 'Subscriptions', color: '#818CF8', icon: 'Smartphone', type: 'expense' },
  { id: '17', name: 'Investments', color: '#34D399', icon: 'DollarSign', type: 'income' },
  { id: '18', name: 'Bonuses', color: '#FBBF24', icon: 'Briefcase', type: 'income' },
  { id: '19', name: 'Interest', color: '#60A5FA', icon: 'DollarSign', type: 'income' },
  { id: '20', name: 'Charity', color: '#A78BFA', icon: 'Gift', type: 'expense' },
  { id: '21', name: 'Personal Care', color: '#F87171', icon: 'ShoppingBag', type: 'expense' },
  { id: '22', name: 'Savings', color: '#10B981', icon: 'DollarSign', type: 'both' },
  { id: '12', name: 'Other', color: '#6B7280', icon: 'DollarSign', type: 'both' },

];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 1200,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2025-03-01',
    type: 'income',
    isRecurring: true
  },
  {
    id: '2',
    amount: 500,
    category: 'Housing',
    description: 'Rent payment',
    date: '2025-03-05',
    type: 'expense',
    isRecurring: true
  },
  {
    id: '3',
    amount: 85,
    category: 'Food & Dining',
    description: 'Grocery shopping',
    date: '2025-03-07',
    type: 'expense'
  },
  {
    id: '4',
    amount: 45,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: '2025-03-09',
    type: 'expense'
  },
  {
    id: '5',
    amount: 200,
    category: 'Gifts',
    description: 'Birthday gift from mom',
    date: '2025-03-10',
    type: 'income'
  },
  {
    id: '6',
    amount: 60,
    category: 'Transportation',
    description: 'Gas',
    date: '2025-03-12',
    type: 'expense'
  },
  {
    id: '7',
    amount: 120,
    category: 'Shopping',
    description: 'New clothes',
    date: '2025-03-15',
    type: 'expense'
  },
  {
    id: '8',
    amount: 35,
    category: 'Food & Dining',
    description: 'Dinner',
    date: '2025-03-18',
    type: 'expense'
  },
  {
    id: '9',
    amount: 300,
    category: 'Other',
    description: 'Freelance work',
    date: '2025-03-20',
    type: 'income'
  },
  {
    id: '10',
    amount: 75,
    category: 'Utilities',
    description: 'Internet bill',
    date: '2025-03-22',
    type: 'expense',
    isRecurring: true
  },
  {
    id: '11',
    amount: 50,
    category: 'Healthcare',
    description: 'Medication',
    date: '2025-03-25',
    type: 'expense'
  },
  {
    id: '12',
    amount: 90,
    category: 'Entertainment',
    description: 'Concert tickets',
    date: '2025-03-28',
    type: 'expense'
  }
];

export const mockBudgets: Budget[] = [
  { id: '1', category: 'Food & Dining', amount: 400, spent: 120, period: 'monthly' },
  { id: '2', category: 'Entertainment', amount: 200, spent: 135, period: 'monthly' },
  { id: '3', category: 'Shopping', amount: 300, spent: 120, period: 'monthly' },
  { id: '4', category: 'Transportation', amount: 150, spent: 60, period: 'monthly' },
  { id: '5', category: 'Utilities', amount: 200, spent: 75, period: 'monthly' },
];

export const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, React.FC> = {
    ShoppingBag,
    Coffee,
    Home,
    Car,
    Utensils,
    Smartphone,
    Briefcase,
    Gift,
    HeartPulse,
    GraduationCap,
    Plane,
    DollarSign
  };
  
  return icons[iconName] || DollarSign;
};

export const getCategoryColor = (categoryName: string): string => {
  const category = mockCategories.find(cat => cat.name === categoryName);
  return category?.color || '#6B7280';
};

export const getCategoryByName = (name: string): Category | undefined => {
  return mockCategories.find(cat => cat.name === name);
};
import React, { useState } from 'react';
import { User, Moon, Sun, Save, UserCircle, DollarSign } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { useTheme } from '../../context/ThemeContext';
import { mockUser } from '../../data/mockData';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(mockUser);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save to a database here
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <UserCircle size={48} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <Button className="mt-4" variant="outline" fullWidth>
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card title="Profile Settings">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
                    icon={<User size={18} className="text-gray-500" />}
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    fullWidth
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={18} className="text-gray-500" />
                    </div>
                    <select
                      name="currency"
                      value={user.currency}
                      onChange={handleChange}
                      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Button type="submit" iconLeft={<Save size={18} />}>
                  Save Changes
                </Button>
                
                {isSaved && (
                  <p className="text-green-500 mt-2">Settings saved successfully!</p>
                )}
              </div>
            </Card>
          </form>

          <Card title="Appearance" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`p-2 rounded-md ${
                      theme === 'light'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-label="Light mode"
                  >
                    <Sun size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`p-2 rounded-md ${
                      theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-label="Dark mode"
                  >
                    <Moon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Data Management" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">Export Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Download your financial data in different formats
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">CSV</Button>
                  <Button variant="outline" size="sm">JSON</Button>
                  <Button variant="outline" size="sm">PDF</Button>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white text-red-500">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Permanently delete your account and all your data
                </p>
                <Button variant="danger" size="sm">Delete Account</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
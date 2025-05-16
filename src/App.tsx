import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ExpensesPage from './components/Expenses/ExpensesPage';
import IncomePage from './components/Income/IncomePage';
import BudgetPage from './components/Budget/BudgetPage';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpensesPage />;
      case 'income':
        return <IncomePage />;
      case 'budget':
        return <BudgetPage />;
      case 'reports':
      case 'analytics':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <TransactionProvider>
        <BudgetProvider>
          <div className="h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-16 md:mt-0">
                <div className="max-w-6xl mx-auto">{renderContent()}</div>
              </main>
            </div>
          </div>
        </BudgetProvider>
      </TransactionProvider>
    </ThemeProvider>
  );
}

export default App;
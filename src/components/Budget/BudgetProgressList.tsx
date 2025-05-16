import React from 'react';
import { Budget } from '../../types';
import { useBudgets } from '../../context/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import { getCategoryColor } from '../../data/mockData';

interface BudgetProgressListProps {
  budgets: Budget[];
}

const BudgetProgressList: React.FC<BudgetProgressListProps> = ({ budgets }) => {
  const { calculateBudgetProgress, isBudgetExceeded } = useBudgets();

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const progress = calculateBudgetProgress(budget.id);
        const exceeded = isBudgetExceeded(budget.id);
        const categoryColor = getCategoryColor(budget.category);
        
        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">{budget.category}</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </div>
              </div>
              <div className={`text-sm font-medium ${exceeded ? 'text-red-500' : 'text-green-500'}`}>
                {progress}%
              </div>
            </div>
            <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${
                  exceeded ? 'bg-red-500' : `bg-[${categoryColor}]`
                }`}
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: exceeded ? '' : categoryColor 
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetProgressList;
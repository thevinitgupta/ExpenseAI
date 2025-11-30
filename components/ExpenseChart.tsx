'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Expense } from '@/lib/storage';

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

interface ExpenseChartProps {
  expenses: Expense[];
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  // Calculate total by category
  const getCategoryData = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.spentOn;
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amountSpent;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100, // Round to 2 decimals
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  };

  // Calculate total by payment method
  const getPaymentMethodData = () => {
    const methodTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const method = expense.spentThrough;
      methodTotals[method] = (methodTotals[method] || 0) + expense.amountSpent;
    });

    return Object.entries(methodTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value * 100) / 100,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate statistics
  const getTotalExpense = () => {
    return expenses.reduce((sum, exp) => sum + exp.amountSpent, 0);
  };

  const getAverageExpense = () => {
    if (expenses.length === 0) return 0;
    return getTotalExpense() / expenses.length;
  };

  const getHighestExpense = () => {
    if (expenses.length === 0) return 0;
    return Math.max(...expenses.map(e => e.amountSpent));
  };

  const categoryData = getCategoryData();
  const paymentMethodData = getPaymentMethodData();
  const totalExpense = getTotalExpense();
  const avgExpense = getAverageExpense();
  const highestExpense = getHighestExpense();

  // Custom label for pie chart
  const renderCustomLabel = ({ name, percent }: any) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-blue-600 font-bold">₹{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Expense Overview</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-blue-900">₹{totalExpense.toFixed(2)}</p>
          <p className="text-xs text-blue-600 mt-1">{expenses.length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium mb-1">Average Expense</p>
          <p className="text-2xl font-bold text-green-900">₹{avgExpense.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">per transaction</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium mb-1">Highest Expense</p>
          <p className="text-2xl font-bold text-purple-900">₹{highestExpense.toFixed(2)}</p>
          <p className="text-xs text-purple-600 mt-1">single transaction</p>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Spending by Category</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => `${value}: ₹${entry.payload.value}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Methods</h3>
        <div className="space-y-3">
          {paymentMethodData.map((method, index) => {
            const percentage = (method.value / totalExpense) * 100;
            return (
              <div key={method.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                  <span className="text-sm font-bold text-gray-900">₹{method.value.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Category</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Amount</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">% of Total</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Count</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category, index) => {
                const count = expenses.filter(e => e.spentOn === category.name).length;
                const percentage = (category.value / totalExpense) * 100;
                
                return (
                  <tr key={category.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-gray-800">{category.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-gray-900">
                      ₹{category.value.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-600">
                      {percentage.toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-3 text-gray-600">
                      {count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-bold">
                <td className="py-3 px-3 text-gray-800">Total</td>
                <td className="text-right py-3 px-3 text-gray-900">₹{totalExpense.toFixed(2)}</td>
                <td className="text-right py-3 px-3 text-gray-900">100%</td>
                <td className="text-right py-3 px-3 text-gray-900">{expenses.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
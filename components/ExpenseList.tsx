'use client';

import { useState } from 'react';
import { Trash2, Calendar, CreditCard, User, Filter, SortAsc, SortDesc } from 'lucide-react';
import type { Expense } from '@/lib/storage';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const PAYMENT_METHODS = ['All', 'Cash', 'UPI', 'Card'];

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('All');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort expenses
  const getFilteredAndSortedExpenses = () => {
    let filtered = [...expenses];

    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(exp => exp.spentOn === filterCategory);
    }

    // Apply payment method filter
    if (filterPaymentMethod !== 'All') {
      filtered = filtered.filter(exp => exp.spentThrough === filterPaymentMethod);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp =>
        exp.description.toLowerCase().includes(query) ||
        exp.spentOn.toLowerCase().includes(query) ||
        exp.amountSpent.toString().includes(query) ||
        exp.paidTo?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.dateSpent).getTime() - new Date(b.dateSpent).getTime();
          break;
        case 'amount':
          comparison = a.amountSpent - b.amountSpent;
          break;
        case 'category':
          comparison = a.spentOn.localeCompare(b.spentOn);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-blue-100 text-blue-800 border-blue-300',
      Travel: 'bg-green-100 text-green-800 border-green-300',
      Shopping: 'bg-purple-100 text-purple-800 border-purple-300',
      Bills: 'bg-red-100 text-red-800 border-red-300',
      Entertainment: 'bg-pink-100 text-pink-800 border-pink-300',
      Other: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[category] || colors.Other;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return '💵';
      case 'UPI':
        return '📱';
      case 'Card':
        return '💳';
      default:
        return '💰';
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Start adding expenses to see them here!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">All Expenses</h2>
        <div className="text-sm text-gray-600">
          {filteredExpenses.length} of {expenses.length} expenses
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full text-gray-900 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 ">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleSort('date')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortField === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Date
            {sortField === 'date' && (
              sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => toggleSort('amount')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortField === 'amount'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Amount
            {sortField === 'amount' && (
              sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => toggleSort('category')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              sortField === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Category
            {sortField === 'category' && (
              sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No expenses match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header Row */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{expense.amountSpent.toFixed(2)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(expense.spentOn)}`}>
                      {expense.spentOn}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(expense.dateSpent)}
                  </p>
                </div>

                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete expense"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                {expense.description}
              </p>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span>{getPaymentMethodIcon(expense.spentThrough)}</span>
                  <span>via {expense.spentThrough}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{expense.selfOrOthersIncluded}</span>
                </div>
                <span>•</span>
                <span className="text-gray-400">
                  Added {new Date(expense.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredExpenses.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Filtered Total:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{filteredExpenses.reduce((sum, exp) => sum + exp.amountSpent, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
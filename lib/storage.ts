export interface Expense {
    id: string;
    dateSpent: string;
    amountSpent: number;
    spentOn: string;
    spentThrough: string;
    selfOrOthersIncluded: string;
    description: string;
    createdAt: string;
  }
  
  export function saveExpenses(expenses: Expense[]): void {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }
  
  export function loadExpenses(): Expense[] {
    const stored = localStorage.getItem('expenses');
    return stored ? JSON.parse(stored) : [];
  }
  
  export function exportToCSV(expenses: Expense[]): string {
    const headers = ['Date', 'Amount', 'Category', 'Payment Method', 'For', 'Description', 'Created At'];
    const rows = expenses.map(e => [
      e.dateSpent,
      e.amountSpent.toString(),
      e.spentOn,
      e.spentThrough,
      e.selfOrOthersIncluded,
      `"${e.description.replace(/"/g, '""')}"`,
      e.createdAt,
    ]);
  
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  export function downloadCSV(expenses: Expense[]): void {
    const csv = exportToCSV(expenses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
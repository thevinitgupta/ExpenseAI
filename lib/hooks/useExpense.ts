// lib/hooks/useExpenses.ts
import { useEffect, useState, useCallback } from "react";
import type { Expense } from '@/lib/storage';
import { logError, logWarn } from "../logger";

export function useExpenses(selectedYear: number, selectedMonth: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const key = `expenses-${selectedYear}-${selectedMonth}`;

  useEffect(() => {
    async function init() {
      setLoading(true);

      try {
        // 1. Fetch filtered data from DB
        const res = await fetch(
          `/api/expenses?year=${selectedYear}&month=${selectedMonth}`
        );

        if (res.ok) {
          const data = await res.json();
          setExpenses(data);

          // override localStorage
          localStorage.setItem(key, JSON.stringify(data));

          setLoading(false);
          return;
        }
      } catch (e) {
        logWarn("DB unavailable; falling back to localStorage");
      }

      const local = localStorage.getItem(key);
      setExpenses(local ? JSON.parse(local) : []);

      setLoading(false);
    }

    init();
  }, [selectedYear, selectedMonth]);


  const saveLocal = (data: Expense[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const syncToDB = async (expense: Expense) => {
    let attempts = 0;

    while (attempts < 3) {
      try {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expense }),
        });

        if (res.ok) return true; // success

        attempts++;
      } catch {
        attempts++;
      }
    }

    logWarn("Failed to sync to DB after 3 retries:", {expense});
    return false;
  };

  const addExpense = async (exp: Expense) => {
    // 1. Immediate UI update
    setExpenses((prev) => {
      const updated = [...prev, exp];
      saveLocal(updated);
      return updated;
    });

    // 2. Async DB write, non-blocking
    (async () => {
      const success = await syncToDB(exp);

      if (!success) {
        // Add to server cache for retry later
        try {
          await fetch("/api/cache", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expense: exp }),
          });
        } catch {
          logError("Failed to add to server-side cache", {expense: exp} );
        }
      } else {
        // remove from cache if exists
        await fetch("/api/cache", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: exp.id }),
        });
      }
    })();
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      saveLocal(updated);
      return updated;
    });

    // non-blocking DB call
    fetch(`/api/expenses`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }).catch(() => logWarn("DB delete failed"));
  };

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
  };
}

// components/MonthSelector.tsx
interface MonthSelectorProps {
    year: number;
    month: number;
    onChange: (year: number, month: number) => void;
  }
export function MonthSelector({ year, month, onChange } : MonthSelectorProps) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
  
    return (
      <div className="flex gap-4 items-center">
        <select
          value={month}
          onChange={(e) => onChange(year, Number(e.target.value))}
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
  
        <select
          value={year}
          onChange={(e) => onChange(Number(e.target.value), month)}
        >
          {Array.from({ length: 5 }, (_, i) => 2023 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    );
  }
  
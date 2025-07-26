import { cn } from "@/lib/utils";
import { getSegmentLabel, allCategories } from "@/utils/calendar";

interface WeekSummaryProps {
  weekTotals: {
    easy: number;
    tempo: number;
    interval: number;
    time_trial: number;
  };
}

export const WeekSummary = ({ weekTotals }: WeekSummaryProps) => {
  const totalAll = Object.values(weekTotals).reduce((sum, val) => sum + val, 0);

  // Group segments by label and sum their values
  const groupedTotals = Object.entries(weekTotals).reduce(
    (acc, [type, total]) => {
      const label = getSegmentLabel(type);
      acc[label] = (acc[label] || 0) + total;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="text-xs space-y-0.5">
      {allCategories.map(({ label, color }) => {
        const total = groupedTotals[label] || 0;
        const percentage = totalAll > 0 ? (total / totalAll) * 100 : 0;

        return (
          <div key={label} className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-gray-600">
              {totalAll > 0 && total > 0 ? `${percentage.toFixed(0)}%` : "brak"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

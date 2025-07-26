import { cn } from "@/lib/utils";
import { getSegmentLabel, allCategories } from "@/utils/calendar";

interface MonthlyStatsProps {
  segmentTotals: {
    easy: number;
    tempo: number;
    interval: number;
    time_trial: number;
  };
}

export const MonthlyStats = ({ segmentTotals }: MonthlyStatsProps) => {
  // Group segments by label and sum their values for the bars
  const groupedTotals = Object.entries(segmentTotals).reduce(
    (acc, [type, total]) => {
      const label = getSegmentLabel(type);
      acc[label] = (acc[label] || 0) + total;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalAll = Object.values(segmentTotals).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="my-4">
      <div className="flex gap-1 rounded-full overflow-hidden mb-2">
        {totalAll > 0 ? (
          allCategories
            .filter(({ label }) => groupedTotals[label] > 0)
            .map(({ label, color }) => {
              const total = groupedTotals[label];
              const percentage = (total / totalAll) * 100;
              return (
                <div
                  key={label}
                  className={cn(color, "h-3 relative group")}
                  style={{ width: `${percentage}%` }}
                  title={`${label}: ${percentage.toFixed(0)}%`}
                />
              );
            })
        ) : (
          <div className="w-full h-3 bg-gray-300" />
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {allCategories.map(({ label, color }) => {
          const total = groupedTotals[label] || 0;
          const percentage = totalAll > 0 ? (total / totalAll) * 100 : 0;

          return (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("w-2 h-2 rounded-full", color)} />
              <span className="text-gray-600">
                {label}:{" "}
                {totalAll > 0 && total > 0
                  ? `${percentage.toFixed(0)}%`
                  : "brak"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

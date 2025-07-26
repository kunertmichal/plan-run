import { isSameDay } from "date-fns";

export const MONDAY_INDEX = 1;
export const TOTAL_ROWS_TO_DISPLAY = 7;

export const monthNames = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

// Segment color mapping
export const getSegmentColor = (type: string) => {
  switch (type) {
    case "easy":
      return "bg-green-500";
    case "tempo":
      return "bg-orange-400";
    case "interval":
      return "bg-orange-600";
    case "time_trial":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
};

// Segment label mapping for main legend
export const getSegmentLabel = (type: string) => {
  switch (type) {
    case "easy":
      return "Łatwy";
    case "tempo":
      return "Średni";
    case "interval":
    case "time_trial":
      return "Trudny";
    default:
      return type;
  }
};

// Helper function to group days into weeks
export const getWeeks = (days: Date[]) => {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};

// Helper function to find which week a date belongs to
export const findWeekForDate = (date: Date, weeks: Date[][]): Date[] | null => {
  for (const week of weeks) {
    if (week.some((day) => isSameDay(day, date))) {
      return week;
    }
  }
  return null;
};

export const allCategories = [
  { label: "Łatwy", color: "bg-green-500" },
  { label: "Średni", color: "bg-orange-400" },
  { label: "Trudny", color: "bg-red-500" },
];

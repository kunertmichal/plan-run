import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { monthNames } from "@/utils/calendar";

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">
        <time dateTime={currentDate.toISOString().slice(0, 7)}>
          {monthNames[currentDate.getMonth()]} {format(currentDate, "yyyy")}
        </time>
      </h1>
      <div className="flex items-center gap-2">
        <Button onClick={onPreviousMonth} size="icon">
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <Button disabled={isSameDay(currentDate, new Date())} onClick={onToday}>
          Dzisiaj
        </Button>
        <Button onClick={onNextMonth} size="icon">
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

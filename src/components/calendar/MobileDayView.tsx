import type { Doc } from "../../../convex/_generated/dataModel";
import { WeekSummary } from "./WeekSummary";
import { SegmentDots } from "./SegmentDots";
import { Button } from "@/components/ui/button";
import { findWeekForDate, getWeekSegmentTotals } from "@/utils/calendar";
import { isSameDay } from "date-fns";
import { PlusIcon, EditIcon } from "lucide-react";

interface MobileDayViewProps {
  selectedDate: Date;
  weeks: Date[][];
  events: Doc<"scheduledWorkouts">[] | undefined;
  selectedDayEvents: Doc<"scheduledWorkouts">[];
  onOpenSheet: (date: Date) => void;
  onOpenEventSheet: (event: Doc<"scheduledWorkouts">, date: Date) => void;
}

export const MobileDayView = ({
  selectedDate,
  weeks,
  events,
  selectedDayEvents,
  onOpenSheet,
  onOpenEventSheet,
}: MobileDayViewProps) => {
  const getEventsForDay = (date: Date) => {
    return (
      events?.filter((event) => {
        return isSameDay(new Date(event.date), date);
      }) ?? []
    );
  };

  const selectedWeek = findWeekForDate(selectedDate, weeks);
  const weekTotals = selectedWeek
    ? getWeekSegmentTotals(selectedWeek, getEventsForDay)
    : null;

  return (
    <div className="py-10 lg:hidden">
      {weekTotals && (
        <div className="mb-6 bg-white p-4 shadow-sm ring-1 ring-black/5 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Podsumowanie tygodnia
          </h3>
          <WeekSummary weekTotals={weekTotals} />
        </div>
      )}

      <div className="mb-4">
        <Button
          onClick={() => onOpenSheet(selectedDate)}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Dodaj nowy trening
        </Button>
      </div>

      {selectedDayEvents?.length > 0 && (
        <ol className="divide-y divide-gray-100 overflow-hidden bg-white text-sm shadow-sm ring-1 ring-black/5">
          {selectedDayEvents.map((event) => (
            <li
              key={event._id}
              className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50 cursor-pointer"
              onClick={() => onOpenEventSheet(event, selectedDate)}
            >
              <div className="flex-auto">
                <SegmentDots segments={event.segments} />
                <p className="font-semibold text-gray-900 group-hover:text-orange-600">
                  {event.name}
                </p>
              </div>
              <div className="flex items-center">
                <EditIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

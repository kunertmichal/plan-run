import { format, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { SegmentDots } from "./SegmentDots";
import { WeekSummary } from "./WeekSummary";
import type { Doc } from "../../../convex/_generated/dataModel";
import {
  getWeeks,
  TOTAL_ROWS_TO_DISPLAY,
  getWeekSegmentTotals,
} from "@/utils/calendar";

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  selectedDate: Date | null;
  events: Doc<"scheduledWorkouts">[] | undefined;
  onOpenSheet: (date: Date) => void;
  onOpenEventSheet: (event: Doc<"scheduledWorkouts">, date: Date) => void;
  onSelectDate: (date: Date) => void;
}

export const CalendarGrid = ({
  days,
  currentDate,
  selectedDate,
  events,
  onOpenSheet,
  onOpenEventSheet,
  onSelectDate,
}: CalendarGridProps) => {
  const numberOfWeeks = Math.ceil(days.length / TOTAL_ROWS_TO_DISPLAY);
  const weeks = getWeeks(days);

  const getEventsForDay = (date: Date) => {
    return (
      events?.filter((event) => {
        return isSameDay(new Date(event.date), date);
      }) ?? []
    );
  };

  const isCurrentDay = (date: Date) => isToday(date);
  const isSelectedDay = (date: Date) =>
    selectedDate && isSameDay(date, selectedDate);
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  return (
    <div className="shadow-sm ring-1 ring-black/5 lg:flex lg:flex-auto lg:flex-col">
      <div className="flex">
        <div className="flex-1">
          <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none">
            <div className="bg-white py-2">Pn</div>
            <div className="bg-white py-2">Wt</div>
            <div className="bg-white py-2">Śr</div>
            <div className="bg-white py-2">Czw</div>
            <div className="bg-white py-2">Pt</div>
            <div className="bg-white py-2">Sb</div>
            <div className="bg-white py-2">Ndz</div>
          </div>
        </div>
        <div className="w-24 border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none hidden lg:block">
          <div className="bg-white py-2 border-l border-gray-200">Suma</div>
        </div>
      </div>
      <div className="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto">
        <div className="flex-1">
          {/* Desktop view */}
          <div
            className="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px"
            style={{ gridTemplateRows: `repeat(${numberOfWeeks}, 1fr)` }}
          >
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    isCurrentMonth(day)
                      ? "bg-white"
                      : "bg-gray-50 text-gray-500",
                    "relative px-3 py-2 min-h-24 cursor-pointer hover:bg-orange-50"
                  )}
                  onClick={() => onOpenSheet(day)}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={
                      isCurrentDay(day)
                        ? "flex size-6 items-center justify-center rounded-full bg-orange-600 font-semibold text-white"
                        : undefined
                    }
                  >
                    {format(day, "d")}
                  </time>
                  {dayEvents.length > 0 && (
                    <ol className="mt-2">
                      {dayEvents.map((event) => (
                        <li
                          key={event._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEventSheet(event, day);
                          }}
                          className="cursor-pointer"
                        >
                          <SegmentDots segments={event.segments} />
                          <div className="group flex">
                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-orange-600">
                              {event.name}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile view */}
          <div
            className="isolate grid w-full grid-cols-7 gap-px lg:hidden"
            style={{ gridTemplateRows: `repeat(${numberOfWeeks}, 1fr)` }}
          >
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={cn(
                    isCurrentMonth(day) ? "bg-white" : "bg-gray-50",
                    (isSelectedDay(day) || isCurrentDay(day)) &&
                      "font-semibold",
                    isSelectedDay(day) && "text-white",
                    !isSelectedDay(day) &&
                      isCurrentDay(day) &&
                      "text-orange-600",
                    !isSelectedDay(day) &&
                      isCurrentMonth(day) &&
                      !isCurrentDay(day) &&
                      "text-gray-900",
                    !isSelectedDay(day) &&
                      !isCurrentMonth(day) &&
                      !isCurrentDay(day) &&
                      "text-gray-500",
                    "flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10"
                  )}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={cn(
                      isSelectedDay(day) &&
                        "flex size-6 items-center justify-center rounded-full",
                      isSelectedDay(day) &&
                        isCurrentDay(day) &&
                        "bg-orange-600",
                      isSelectedDay(day) && !isCurrentDay(day) && "bg-gray-900",
                      "ml-auto"
                    )}
                  >
                    {format(day, "d")}
                  </time>
                  <span className="sr-only">{dayEvents.length} events</span>
                  {dayEvents.length > 0 && (
                    <span className="-mx-0.5 mt-auto flex flex-wrap-reverse">
                      {dayEvents.map((event) => (
                        <span
                          key={event._id}
                          className="mx-0.5 mb-1 size-1.5 rounded-full bg-gray-400"
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Week summaries for desktop */}
        <div className="w-24 hidden lg:flex flex-col gap-px">
          {weeks.map((week, weekIndex) => {
            const weekTotals = getWeekSegmentTotals(week, getEventsForDay);
            return (
              <div
                key={weekIndex}
                className="bg-white px-3 py-2 min-h-24 border-l border-gray-300"
              >
                <WeekSummary weekTotals={weekTotals} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

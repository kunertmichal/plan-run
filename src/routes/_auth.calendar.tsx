import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MONDAY_INDEX = 1;
const TOTAL_ROWS_TO_DISPLAY = 7;

const monthNames = [
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

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { CreateWorkoutForm } from "@/components/workouts/create-workout-form";

// Segment color mapping
const getSegmentColor = (type: string) => {
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
const getSegmentLabel = (type: string) => {
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

// Component to display segment dots
const SegmentDots = ({ segments }: { segments: Array<{ type: string }> }) => {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="flex gap-1">
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn("w-2 h-2 rounded-full", getSegmentColor(segment.type))}
          title={segment.type}
        />
      ))}
    </div>
  );
};

// Helper function to group days into weeks
const getWeeks = (days: Date[]) => {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
};



// Component to display week summary
const WeekSummary = ({ 
  weekTotals 
}: { 
  weekTotals: { easy: number; tempo: number; interval: number; time_trial: number } 
}) => {
  const totalAll = Object.values(weekTotals).reduce((sum, val) => sum + val, 0);
  
  // Group segments by label and sum their values
  const groupedTotals = Object.entries(weekTotals).reduce((acc, [type, total]) => {
    const label = getSegmentLabel(type);
    acc[label] = (acc[label] || 0) + total;
    return acc;
  }, {} as Record<string, number>);

  const allCategories = [
    { label: 'Łatwy', color: 'bg-green-500' },
    { label: 'Średni', color: 'bg-orange-400' },
    { label: 'Trudny', color: 'bg-red-500' }
  ];

  return (
    <div className="text-xs space-y-0.5">
      {allCategories.map(({ label, color }) => {
        const total = groupedTotals[label] || 0;
        const percentage = totalAll > 0 ? (total / totalAll) * 100 : 0;
        
        return (
          <div key={label} className="flex items-center gap-1">
            <div className={cn("w-2 h-2 rounded-full", color)} />
            <span className="text-gray-600">
              {totalAll > 0 && total > 0 ? `${percentage.toFixed(0)}%` : 'brak'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to find which week a date belongs to
const findWeekForDate = (date: Date, weeks: Date[][]): Date[] | null => {
  for (const week of weeks) {
    if (week.some(day => isSameDay(day, date))) {
      return week;
    }
  }
  return null;
};

export const Route = createFileRoute("/_auth/calendar")({
  component: Calendar,
});

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<Doc<"scheduledWorkouts"> | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const events = useQuery(api.scheduledWorkouts.getScheduledWorkouts, {
    dateFrom: format(calendarStart, "yyyy-MM-dd"),
    dateTo: format(calendarEnd, "yyyy-MM-dd"),
  });

  const segmentTotals = events?.reduce(
    (acc, event) => {
      event.segments.forEach((segment) => {
        acc[segment.type] += segment.distance;
      });
      return acc;
    },
    {
      easy: 0,
      tempo: 0,
      interval: 0,
      time_trial: 0,
    }
  ) || { easy: 0, tempo: 0, interval: 0, time_trial: 0 };

  const handleOpenSheet = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsSheetOpen(true);
  };

  const handleOpenEventSheet = (
    event: Doc<"scheduledWorkouts">,
    date: Date
  ) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsSheetOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, MONDAY_INDEX));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, MONDAY_INDEX));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const numberOfWeeks = Math.ceil(days.length / TOTAL_ROWS_TO_DISPLAY);
  
  const weeks = getWeeks(days);

  const getEventsForDay = (date: Date) => {
    return (
      events?.filter((event) => {
        return isSameDay(new Date(event.date), date);
      }) ?? []
    );
  };

  // Helper function to calculate segment totals for a week
const getWeekSegmentTotals = (
  week: Date[], 
) => {
  const weekTotals = { easy: 0, tempo: 0, interval: 0, time_trial: 0 };
  
  week.forEach(day => {
    const dayEvents = getEventsForDay(day);
    dayEvents.forEach(event => {
      event.segments.forEach(segment => {
        if (segment.type in weekTotals) {
          weekTotals[segment.type as keyof typeof weekTotals] += segment.distance;
        }
      });
    });
  });
  
  return weekTotals;
};

  const isCurrentDay = (date: Date) => isToday(date);

  const isSelectedDay = (date: Date) =>
    selectedDate && isSameDay(date, selectedDate);

  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          <time dateTime={currentDate.toISOString().slice(0, 7)}>
            {monthNames[currentDate.getMonth()]} {format(currentDate, "yyyy")}
          </time>
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={goToPreviousMonth} size="icon">
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            disabled={isSameDay(currentDate, new Date())}
            onClick={goToToday}
          >
            Dzisiaj
          </Button>
          <Button onClick={goToNextMonth} size="icon">
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="my-4">
        <div className="flex gap-1 rounded-full overflow-hidden mb-2">
          {(() => {
            // Group segments by label and sum their values for the bars
            const groupedTotals = Object.entries(segmentTotals).reduce((acc, [type, total]) => {
              const label = getSegmentLabel(type);
              acc[label] = (acc[label] || 0) + total;
              return acc;
            }, {} as Record<string, number>);

            const totalAll = Object.values(segmentTotals).reduce((sum, val) => sum + val, 0);
            const allCategories = [
              { label: 'Łatwy', color: 'bg-green-500' },
              { label: 'Średni', color: 'bg-orange-400' },
              { label: 'Trudny', color: 'bg-red-500' }
            ];

            return totalAll > 0 ? (
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
            );
          })()}
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {(() => {
            // Group segments by label and sum their values
            const groupedTotals = Object.entries(segmentTotals).reduce((acc, [type, total]) => {
              const label = getSegmentLabel(type);
              acc[label] = (acc[label] || 0) + total;
              return acc;
            }, {} as Record<string, number>);

            const totalAll = Object.values(segmentTotals).reduce((sum, val) => sum + val, 0);
            const allCategories = [
              { label: 'Łatwy', color: 'bg-green-500' },
              { label: 'Średni', color: 'bg-orange-400' },
              { label: 'Trudny', color: 'bg-red-500' }
            ];

            return allCategories.map(({ label, color }) => {
              const total = groupedTotals[label] || 0;
              const percentage = totalAll > 0 ? (total / totalAll) * 100 : 0;
              
              return (
                <div key={label} className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-full", color)} />
                  <span className="text-gray-600">
                    {label}: {totalAll > 0 && total > 0 ? `${percentage.toFixed(0)}%` : 'brak'}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>

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
                      "relative px-3 py-2 min-h-24 cursor-pointer hover:bg-orange-100"
                    )}
                    onClick={() => handleOpenSheet(day)}
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
                              handleOpenEventSheet(event, day);
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
                    onClick={() => setSelectedDate(day)}
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
          <div className="w-24 hidden lg:flex flex-col gap-px">
            {weeks.map((week, weekIndex) => {
              const weekTotals = getWeekSegmentTotals(week);
              return (
                <div
                  key={weekIndex}
                  className="bg-white px-2 py-4 min-h-24 border-l border-gray-300"
                > 
                  <WeekSummary weekTotals={weekTotals} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="py-10 lg:hidden">
          {(() => {
            const selectedWeek = findWeekForDate(selectedDate, weeks);
            const weekTotals = selectedWeek ? getWeekSegmentTotals(selectedWeek) : null;
            
            return (
              <>
                {weekTotals && (
                  <div className="mb-6 bg-white p-4 shadow-sm ring-1 ring-black/5 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Podsumowanie tygodnia
                    </h3>
                    <WeekSummary weekTotals={weekTotals} />
                  </div>
                )}
                
                {selectedDayEvents?.length > 0 && (
                  <ol className="divide-y divide-gray-100 overflow-hidden bg-white text-sm shadow-sm ring-1 ring-black/5">
                    {selectedDayEvents.map((event) => (
                      <li
                        key={event._id}
                        className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
                      >
                        <div className="flex-auto">
                          <SegmentDots segments={event.segments} />
                          <p className="font-semibold text-gray-900">{event.name}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            );
          })()}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>
              {selectedEvent ? "Edytuj trening" : "Dodaj trening"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <CreateWorkoutForm
              date={selectedDate!}
              event={selectedEvent || undefined}
              onCancel={() => {
                setIsSheetOpen(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

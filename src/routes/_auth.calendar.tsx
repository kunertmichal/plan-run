import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
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
import { useQuery } from "convex/react";
import { CreateWorkoutForm } from "@/components/workouts/create-workout-form";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthlyStats } from "@/components/calendar/MonthlyStats";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { WeekSummary } from "@/components/calendar/WeekSummary";
import { SegmentDots } from "@/components/calendar/SegmentDots";
import { MONDAY_INDEX, findWeekForDate, getWeeks } from "@/utils/calendar";

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
        const repetitions = segment.repetitions || 1;
        acc[segment.type] += segment.distance * repetitions;
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
  const weeks = getWeeks(days);

  const getEventsForDay = (date: Date) => {
    return (
      events?.filter((event) => {
        return isSameDay(new Date(event.date), date);
      }) ?? []
    );
  };

  // Helper function to calculate segment totals for a week
  const getWeekSegmentTotals = (week: Date[]) => {
    const weekTotals = { easy: 0, tempo: 0, interval: 0, time_trial: 0 };

    week.forEach((day) => {
      const dayEvents = getEventsForDay(day);
      dayEvents.forEach((event) => {
        event.segments.forEach((segment) => {
          if (segment.type in weekTotals) {
            const repetitions = segment.repetitions || 1;
            weekTotals[segment.type as keyof typeof weekTotals] +=
              segment.distance * repetitions;
          }
        });
      });
    });

    return weekTotals;
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <MonthlyStats segmentTotals={segmentTotals} />

      <CalendarGrid
        days={days}
        currentDate={currentDate}
        selectedDate={selectedDate}
        events={events}
        onOpenSheet={handleOpenSheet}
        onOpenEventSheet={handleOpenEventSheet}
        onSelectDate={setSelectedDate}
      />

      {selectedDate && (
        <div className="py-10 lg:hidden">
          {(() => {
            const selectedWeek = findWeekForDate(selectedDate, weeks);
            const weekTotals = selectedWeek
              ? getWeekSegmentTotals(selectedWeek)
              : null;

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
                          <p className="font-semibold text-gray-900">
                            {event.name}
                          </p>
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

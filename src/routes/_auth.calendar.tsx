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
import { MobileDayView } from "@/components/calendar/MobileDayView";
import { MONDAY_INDEX, getWeeks } from "@/utils/calendar";

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
        <MobileDayView
          selectedDate={selectedDate}
          weeks={weeks}
          events={events}
          selectedDayEvents={selectedDayEvents}
        />
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

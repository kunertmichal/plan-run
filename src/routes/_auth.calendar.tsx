import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
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

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Mapowanie nazw miesięcy w formie mianownika
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

export const Route = createFileRoute("/_auth/calendar")({
  component: Calendar,
});

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const events = [
    {
      id: 1,
      name: "Design review",
      time: "10AM",
      datetime: "2025-01-03T10:00",
      href: "#",
      date: new Date(2025, 6, 3), // 3 stycznia 2025
    },
    {
      id: 2,
      name: "Sales meeting",
      time: "2PM",
      datetime: "2025-01-03T14:00",
      href: "#",
      date: new Date(2025, 6, 3), // 3 stycznia 2025
    },
    {
      id: 3,
      name: "Date night",
      time: "6PM",
      datetime: "2025-01-08T18:00",
      href: "#",
      date: new Date(2025, 6, 8), // 8 stycznia 2025
    },
    {
      id: 4,
      name: "Maple syrup museum",
      time: "3PM",
      datetime: "2025-01-22T15:00",
      href: "#",
      date: new Date(2025, 6, 22), // 22 stycznia 2025
    },
    {
      id: 5,
      name: "Hockey game",
      time: "7PM",
      datetime: "2025-01-22T19:00",
      href: "#",
      date: new Date(2025, 6, 22), // 22 stycznia 2025
    },
    {
      id: 6,
      name: "Sam's birthday party",
      time: "2PM",
      datetime: "2025-01-25T14:00",
      href: "#",
      date: new Date(2025, 6, 25), // 25 stycznia 2025
    },
  ];

  const handleOpenSheet = () => {
    setIsSheetOpen(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Generowanie dni kalendarza
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Obliczanie rzeczywistej liczby tygodni potrzebnych dla kalendarza
  const numberOfWeeks = Math.ceil(days.length / 7);

  // Funkcja do pobierania wydarzeń dla danego dnia
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      return isSameDay(event.date, date);
    });
  };

  // Funkcja do sprawdzania czy dzień jest dzisiejszy
  const isCurrentDay = (date: Date) => isToday(date);

  // Funkcja do sprawdzania czy dzień jest wybrany
  const isSelectedDay = (date: Date) =>
    selectedDate && isSameDay(date, selectedDate);

  // Funkcja do sprawdzania czy dzień należy do aktualnego miesiąca
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentDate);

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900">
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
      <div className="shadow-sm ring-1 ring-black/5 lg:flex lg:flex-auto lg:flex-col">
        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none">
          <div className="bg-white py-2">Pn</div>
          <div className="bg-white py-2">Wt</div>
          <div className="bg-white py-2">Śr</div>
          <div className="bg-white py-2">Czw</div>
          <div className="bg-white py-2">Pt</div>
          <div className="bg-white py-2">Sb</div>
          <div className="bg-white py-2">Ndz</div>
        </div>
        <div className="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto">
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
                    "relative px-3 py-2 min-h-24 cursor-pointer hover:bg-green-100"
                  )}
                  onClick={handleOpenSheet}
                >
                  <time
                    dateTime={format(day, "yyyy-MM-dd")}
                    className={
                      isCurrentDay(day)
                        ? "flex size-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white"
                        : undefined
                    }
                  >
                    {format(day, "d")}
                  </time>
                  {dayEvents.length > 0 && (
                    <ol className="mt-2">
                      {dayEvents.map((event) => (
                        <li key={event.id}>
                          <a href={event.href} className="group flex">
                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-blue-600">
                              {event.name}
                            </p>
                          </a>
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
                    !isSelectedDay(day) && isCurrentDay(day) && "text-blue-600",
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
                      isSelectedDay(day) && isCurrentDay(day) && "bg-blue-600",
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
                          key={event.id}
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
      </div>
      {selectedDayEvents?.length > 0 && (
        <div className="py-10 lg:hidden">
          <ol className="divide-y divide-gray-100 overflow-hidden bg-white text-sm shadow-sm ring-1 ring-black/5">
            {selectedDayEvents.map((event) => (
              <li
                key={event.id}
                className="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50"
              >
                <div className="flex-auto">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <time
                    dateTime={event.datetime}
                    className="mt-2 flex items-center text-gray-700"
                  >
                    <ClockIcon
                      className="mr-2 size-5 text-gray-400"
                      aria-hidden="true"
                    />
                    {event.time}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Dodaj trening</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4 flex-1 flex flex-col">
            <ul>
              <li>nazwa</li>
              <li>Data</li>
              <li>Typ</li>
              <li>Tempo</li>
              <li>Dystans</li>
              <li>Czas</li>
            </ul>
            <div className="flex flex-col gap-2 mt-auto">
              <Button className="w-full">Zapisz</Button>
              <Button variant="outline" className="w-full">
                Anuluj
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

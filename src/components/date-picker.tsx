"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDateInput, parseDateInput } from "@/lib/date";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  min,
  max,
  required = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le calendrier si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Selectionner une date";
    const date = parseDateInput(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Ajouter les jours vides avant le début du mois (commencer par lundi)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    const formattedDate = formatDateInput(selectedDate);

    // Vérifier les contraintes min/max
    if (min && formattedDate < min) return;
    if (max && formattedDate > max) return;

    onChange(formattedDate);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = formatDateInput(date);

    if (min && formattedDate < min) return true;
    if (max && formattedDate > max) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    if (!value) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = formatDateInput(date);
    return formattedDate === value;
  };

  const isToday = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="mb-2.5 block text-sm font-semibold text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full
          min-h-[44px]
          flex items-center justify-between gap-2.5
          px-3.5 py-2.5
          rounded-lg
          border border-gray-300
          bg-white
          text-left
          transition-all duration-200
          hover:border-teal-400 hover:bg-teal-50
          focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400
          active:scale-[0.98]
          shadow-sm hover:shadow-md
          text-gray-900
        "
        aria-label="Sélectionner une date"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex-shrink-0">
            <Calendar className="h-4 w-4 text-teal-500" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-gray-900 whitespace-normal">
            {value ? formatDisplayDate(value) : <span className="text-gray-500">Sélectionner une date</span>}
          </span>
        </div>
        <div className="flex-shrink-0">
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute z-[9999] mt-2 w-full min-w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-2xl sm:w-[380px] md:w-[400px] lg:w-[420px] xl:w-[450px]"
          style={{ top: "100%", left: 0 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={previousMonth}
              className="
                p-2
                rounded-lg
                hover:bg-teal-50
                text-teal-600
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-300
                disabled:cursor-not-allowed disabled:opacity-30
              "
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="px-4 text-base font-bold capitalize text-gray-900 lg:text-lg">{monthYear}</h3>

            <button
              type="button"
              onClick={nextMonth}
              className="
                p-2
                rounded-lg
                hover:bg-teal-50
                text-teal-600
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-300
                disabled:cursor-not-allowed disabled:opacity-30
              "
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-bold uppercase text-gray-600 lg:text-sm">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && handleDayClick(day)}
                  disabled={disabled}
                  className={`
                    aspect-square
                    rounded-lg
                    text-sm
                    lg:text-base
                    font-semibold
                    transition-all duration-150
                    flex items-center justify-center
                    ${
                      disabled
                        ? "cursor-not-allowed bg-gray-50 text-gray-300"
                        : selected
                        ? "scale-105 bg-teal-500 text-white shadow-lg hover:bg-teal-600"
                        : today
                        ? "border-2 border-teal-300 bg-teal-50 text-teal-600 hover:bg-teal-100"
                        : "text-gray-900 hover:bg-teal-50 hover:text-teal-600"
                    }
                    ${!disabled && !selected ? "hover:scale-110" : ""}
                  `}
                  aria-label={`${day} ${monthYear}`}
                  aria-selected={selected}
                  aria-disabled={disabled}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => {
                const today = formatDateInput();
                if ((!min || today >= min) && (!max || today <= max)) {
                  onChange(today);
                  setIsOpen(false);
                }
              }}
              className="
                w-full
                rounded-lg
                border border-teal-200
                px-4 py-2.5
                text-sm
                font-semibold
                text-teal-600
                transition-colors
                hover:border-teal-300 hover:bg-teal-50
                focus:outline-none focus:ring-2 focus:ring-teal-300
              "
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  className = ""
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
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Sélectionner une date";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formater la date en format court pour mobile
  const formatShortDate = (dateString: string) => {
    if (!dateString) return "Choisir une date";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
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
    const formattedDate = date.toISOString().split('T')[0];
    
    if (min && formattedDate < min) return true;
    if (max && formattedDate > max) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    if (!value) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = date.toISOString().split('T')[0];
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
  const monthYear = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Bouton trigger - Amélioré pour les grands écrans */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full 
          min-h-[56px]
          flex items-center justify-between gap-3
          px-5 py-3.5
          rounded-xl 
          border-2 border-gray-300
          bg-white
          text-left
          transition-all duration-200
          hover:border-teal-400 hover:bg-teal-50
          focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400
          active:scale-[0.98]
          shadow-sm hover:shadow-md
        "
        style={{ color: 'inherit' }}
        aria-label="Sélectionner une date"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Calendar className="h-5 w-5 text-teal-500" aria-hidden="true" />
          </div>
          <span 
            className="text-base font-medium truncate"
            style={{ color: '#111827', fontWeight: 500 }}
          >
            {value ? (
              <>
                <span className="hidden md:inline" style={{ color: '#111827' }}>{formatDisplayDate(value)}</span>
                <span className="md:hidden" style={{ color: '#111827' }}>{formatShortDate(value)}</span>
              </>
            ) : (
              <span style={{ color: '#6B7280' }}>Sélectionner une date</span>
            )}
          </span>
        </div>
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Calendar dropdown - Amélioré pour les grands écrans avec meilleur positionnement */}
      {isOpen && (
        <div 
          className="absolute z-[9999] mt-2 w-full min-w-[320px] sm:w-[380px] md:w-[400px] lg:w-[420px] xl:w-[450px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-gray-200 bg-white p-4 md:p-5 lg:p-6 shadow-2xl"
          style={{ top: '100%', left: 0 }}
        >
          {/* Header avec navigation */}
          <div className="flex items-center justify-between mb-5">
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
                disabled:opacity-30 disabled:cursor-not-allowed
              "
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <h3 className="text-base lg:text-lg font-bold text-gray-900 capitalize px-4">
              {monthYear}
            </h3>
            
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
                disabled:opacity-30 disabled:cursor-not-allowed
              "
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day) => (
              <div 
                key={day} 
                className="text-center text-xs lg:text-sm font-bold text-gray-600 uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
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
                        ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                        : selected
                        ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg scale-105 font-bold'
                        : today
                        ? 'bg-teal-50 text-teal-600 border-2 border-teal-300 hover:bg-teal-100 font-bold'
                        : 'text-gray-900 hover:bg-teal-50 hover:text-teal-600'
                    }
                    ${!disabled && !selected ? 'hover:scale-110' : ''}
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

          {/* Footer avec bouton "Aujourd'hui" */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                if ((!min || today >= min) && (!max || today <= max)) {
                  onChange(today);
                  setIsOpen(false);
                }
              }}
              className="
                w-full 
                py-2.5 px-4 
                rounded-lg 
                text-sm 
                lg:text-base
                font-semibold 
                text-teal-600 
                hover:bg-teal-50 
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-300
                border border-teal-200 hover:border-teal-300
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


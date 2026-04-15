import { useState, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, isAfter, startOfToday, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BookingCalendar({ selectedDate, setSelectedDate, duration, bookedDates }) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const today = startOfToday();

  // Basic Helper for haptics
  const triggerHaptic = (ms = 10) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    triggerHaptic(5);
  };
  
  const prevMonth = () => {
    // Prevent going past current real world month 
    if (isBefore(currentMonth, startOfMonth(today))) return;
    setCurrentMonth(addMonths(currentMonth, -1));
    triggerHaptic(5);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Calculate disabled dates based on firebase `bookedDates`
  // BookedDates array items should look like: { startDate: Date, duration: Number }
  const isDateBooked = (day) => {
    return bookedDates.some(booking => {
      const end = addDays(booking.startDate, booking.duration); 
      return (isSameDay(day, booking.startDate) || isAfter(day, booking.startDate)) && (isSameDay(day, end) || isBefore(day, end));
    });
  };

  // Check if a range starting on 'day' and lasting 'duration' overlaps with any booked dates
  const overlapsBooked = (day) => {
    for (let i = 0; i < duration; i++) {
       const checkDay = addDays(day, i);
       if (isDateBooked(checkDay)) return true;
    }
    return false;
  };

  const handleSelect = (day) => {
    if (isBefore(day, today)) return;
    if (isDateBooked(day)) return;
    if (overlapsBooked(day)) {
       alert(`Cannot select this date. The ${duration} day period overlaps with an existing booking.`);
       return;
    }
    
    triggerHaptic(10);
    setSelectedDate(day);
  };

  // UI state for showing selected range
  const isDateInSelectedRange = (day) => {
    if (!selectedDate) return false;
    const end = addDays(selectedDate, duration);
    return (isSameDay(day, selectedDate) || isAfter(day, selectedDate)) && (isSameDay(day, end) || isBefore(day, end));
  };
  
  const isRangeStart = (day) => selectedDate && isSameDay(day, selectedDate);
  const isRangeEnd = (day) => selectedDate && isSameDay(day, addDays(selectedDate, duration));

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Pad the calendar to align days correctly
  const startDayOfWeek = startOfMonth(currentMonth).getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  return (
    <div className="glass p-8 border border-border h-full flex flex-col">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">STEP 01</p>
          <h2 className="text-2xl font-bold tracking-tight uppercase">Select Dates</h2>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest">
          <button onClick={prevMonth} className="p-1 hover:text-accent transition-colors disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
          <span className="w-32 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="p-1 hover:text-accent transition-colors"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-muted tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map(i => <div key={`pad-${i}`} className="h-10 md:h-12" />)}
          
          {days.map(day => {
            const isPast = isBefore(day, today);
            const isBooked = isDateBooked(day);
            const disabled = isPast || isBooked;
            const inRange = isDateInSelectedRange(day);
            const start = isRangeStart(day);
            const end = isRangeEnd(day);

            return (
              <button
                key={day.toString()}
                disabled={disabled}
                onClick={() => handleSelect(day)}
                className={`
                  h-10 md:h-12 flex items-center justify-center text-sm font-medium transition-all
                  ${disabled ? 'opacity-20 cursor-not-allowed bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvcGF0aD4KPC9zdmc+")] bg-repeat' : 'hover:bg-accent/10 hover:text-accent'}
                  ${start ? 'bg-accent text-white rounded-l-md !hover:bg-accent' : ''}
                  ${end ? 'bg-accent text-white rounded-r-md !hover:bg-accent' : ''}
                  ${inRange && !start && !end ? 'bg-accent/20 text-foreground' : ''}
                  ${!inRange && !disabled ? 'bg-card' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50">
        <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">SELECTED PERIOD</p>
        <p className="text-sm font-medium">
          {selectedDate ? (
            <span className="flex flex-col gap-1 mt-1">
              <span>{format(selectedDate, 'MMM dd, yyyy')} (10:00 AM)</span>
              <span className="text-muted text-xs mx-1">UNTIL</span>
              <span>{format(addDays(selectedDate, duration), 'MMM dd, yyyy')} (10:00 AM)</span>
              <span className="text-accent mt-1 tracking-widest text-[10px] font-bold">({duration} DAY{duration > 1 ? 'S' : ''})</span>
            </span>
          ) : (
            <span className="text-muted/50">Select a start date...</span>
          )}
        </p>
      </div>
    </div>
  );
}


import React from 'react';
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears, set, isValid } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DateStepper = ({ children }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-900/50 space-y-1 w-20 h-20">
    {children}
  </div>
);

export default function CustomDatePicker({ date, onDateChange }) {
  const handleDayChange = (direction) => {
    onDateChange(direction === 'up' ? addDays(date, 1) : subDays(date, 1));
  };
  
  const handleMonthChange = (direction) => {
    onDateChange(direction === 'up' ? addMonths(date, 1) : subMonths(date, 1));
  };

  const handleYearChange = (direction) => {
    onDateChange(direction === 'up' ? addYears(date, 1) : subYears(date, 1));
  };

  const handleManualDayChange = (e) => {
    const newDay = parseInt(e.target.value, 10);
    if (!isNaN(newDay) && newDay > 0 && newDay < 32) { // Basic validation for day 1-31
      const newDate = set(date, { date: newDay });
      // Validate if the new date is a valid date (e.g., prevents Feb 30)
      if (isValid(newDate)) {
        onDateChange(newDate);
      }
    }
  };

  return (
    <div>
      <div className="bg-white/5 p-4 rounded-xl h-[120px] flex items-center gap-3" dir="rtl">
        <div className="flex gap-3">
          <DateStepper>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleDayChange('up')}><ChevronUp className="w-3 h-3" /></Button>
            <Input
              type="number"
              value={format(date, 'd')}
              onChange={handleManualDayChange}
              className="text-xl font-bold text-white bg-transparent border-none text-center h-6 p-0 w-10 focus-visible:ring-0"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleDayChange('down')}><ChevronDown className="w-3 h-3" /></Button>
          </DateStepper>
          
          <DateStepper>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleMonthChange('up')}><ChevronUp className="w-3 h-3" /></Button>
            <span className="text-sm font-bold text-white">{format(date, 'MMM', { locale: he })}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleMonthChange('down')}><ChevronDown className="w-3 h-3" /></Button>
          </DateStepper>

          <DateStepper>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleYearChange('up')}><ChevronUp className="w-3 h-3" /></Button>
            <span className="text-lg font-bold text-white">{format(date, 'yyyy')}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleYearChange('down')}><ChevronDown className="w-3 h-3" /></Button>
          </DateStepper>
        </div>

        <div className="w-px h-full bg-white/20"></div>

        <div className="text-right">
          <p className="text-gray-400 text-sm mb-1">תאריך נבחר</p>
          <p className="text-lg font-semibold text-white leading-tight whitespace-nowrap">
            {format(date, "EEEE, d MMM yyyy", { locale: he })}
          </p>
        </div>
      </div>
    </div>
  );
}

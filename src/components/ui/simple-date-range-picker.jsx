"use client"

import React, { useState } from 'react';
import { CalendarDate } from '@internationalized/date';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SimpleDateRangePicker = ({ value, onChange, className }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatCalendarDateToInput = (calendarDate) => {
    if (!calendarDate) return '';
    const month = calendarDate.month.toString().padStart(2, '0');
    const day = calendarDate.day.toString().padStart(2, '0');
    const year = calendarDate.year.toString();
    return `${month}/${day}/${year}`;
  };

  const parseInputToCalendarDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    if (year < 1000 || year > 9999) return null;
    
    try {
      return new CalendarDate(year, month, day);
    } catch {
      return null;
    }
  };

  // Initialize input values from the prop value
  React.useEffect(() => {
    if (value?.start) {
      const formattedStart = formatCalendarDateToInput(value.start);
      setStartDate(formattedStart);
    }
    if (value?.end) {
      const formattedEnd = formatCalendarDateToInput(value.end);
      setEndDate(formattedEnd);
    }
  }, [value]);

  const formatDateInput = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    if (digits.length >= 6) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else if (digits.length >= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handleStartDateChange = (e) => {
    const formatted = formatDateInput(e.target.value);
    setStartDate(formatted);
    updateDateRange(formatted, endDate);
  };

  const handleEndDateChange = (e) => {
    const formatted = formatDateInput(e.target.value);
    setEndDate(formatted);
    updateDateRange(startDate, formatted);
  };

  const handleStartKeyPress = (e) => {
    if (e.key === 'Enter') {
      updateDateRange(startDate, endDate);
    }
  };

  const handleEndKeyPress = (e) => {
    if (e.key === 'Enter') {
      updateDateRange(startDate, endDate);
    }
  };

  const handleStartBlur = () => {
    updateDateRange(startDate, endDate);
  };

  const handleEndBlur = () => {
    updateDateRange(startDate, endDate);
  };

  const updateDateRange = (startStr, endStr) => {
    // Update when both dates are complete and valid
    if (startStr.length === 10 && endStr.length === 10) {
      const startCalendarDate = parseInputToCalendarDate(startStr);
      const endCalendarDate = parseInputToCalendarDate(endStr);
      
      if (startCalendarDate && endCalendarDate) {
        console.log('Updating date range:', { start: startCalendarDate, end: endCalendarDate });
        onChange({
          start: startCalendarDate,
          end: endCalendarDate
        });
      }
    } else {
      // Also try to update if one field is complete and valid, using existing value for the other
      const startCalendarDate = startStr.length === 10 ? parseInputToCalendarDate(startStr) : value?.start;
      const endCalendarDate = endStr.length === 10 ? parseInputToCalendarDate(endStr) : value?.end;
      
      if (startCalendarDate && endCalendarDate) {
        console.log('Updating date range (partial):', { start: startCalendarDate, end: endCalendarDate });
        onChange({
          start: startCalendarDate,
          end: endCalendarDate
        });
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Date range
      </label>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <input
            type="text"
            placeholder="mm / dd / yyyy"
            value={startDate}
            onChange={handleStartDateChange}
            onKeyPress={handleStartKeyPress}
            onBlur={handleStartBlur}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            maxLength={10}
          />
          <span className="mx-3 text-gray-400">-</span>
          <input
            type="text"
            placeholder="mm / dd / yyyy"
            value={endDate}
            onChange={handleEndDateChange}
            onKeyPress={handleEndKeyPress}
            onBlur={handleEndBlur}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
            maxLength={10}
          />
          <CalendarIcon className="ml-3 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export { SimpleDateRangePicker };
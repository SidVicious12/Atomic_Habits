"use client"

import React from 'react';
import { CalendarDate } from '@internationalized/date';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { JollyDateRangePicker, DatePickerContent } from './date-range-picker';
import { DialogTrigger } from 'react-aria-components';

const QuickDateRangePicker = ({ value, onChange, className, dataSpan = "Jan 2024 - Dec 2024" }) => {
  
  // Quick select options - can be customized based on available data
  const quickOptions = [
    {
      label: "📅 All My Data",
      value: {
        start: new CalendarDate(2024, 1, 1),
        end: new CalendarDate(2024, 12, 31)
      },
      featured: true
    },
    {
      label: "2024 Only",
      value: {
        start: new CalendarDate(2024, 1, 1),
        end: new CalendarDate(2024, 12, 31)
      }
    },
    {
      label: "Q1 2024",
      value: {
        start: new CalendarDate(2024, 1, 1),
        end: new CalendarDate(2024, 3, 31)
      }
    },
    {
      label: "Q2 2024", 
      value: {
        start: new CalendarDate(2024, 4, 1),
        end: new CalendarDate(2024, 6, 30)
      }
    },
    {
      label: "Q3 2024",
      value: {
        start: new CalendarDate(2024, 7, 1),
        end: new CalendarDate(2024, 9, 30)
      }
    },
    {
      label: "Q4 2024",
      value: {
        start: new CalendarDate(2024, 10, 1),
        end: new CalendarDate(2024, 12, 31)
      }
    },
    {
      label: "Recent 6 Months",
      value: {
        start: new CalendarDate(2024, 7, 1),
        end: new CalendarDate(2024, 12, 31)
      }
    },
    {
      label: "Recent 3 Months",
      value: {
        start: new CalendarDate(2024, 10, 1),
        end: new CalendarDate(2024, 12, 31)
      }
    }
  ];

  const formatDateRange = (dateRange) => {
    if (!dateRange?.start || !dateRange?.end) return "Select date range";
    
    const startStr = `${dateRange.start.month}/${dateRange.start.day}/${dateRange.start.year}`;
    const endStr = `${dateRange.end.month}/${dateRange.end.day}/${dateRange.end.year}`;
    
    // Check if it matches any quick option
    const matchingOption = quickOptions.find(option => 
      option.value.start.compare(dateRange.start) === 0 &&
      option.value.end.compare(dateRange.end) === 0
    );
    
    if (matchingOption) {
      return matchingOption.label.replace('📅 ', '');
    }
    
    return `${startStr} - ${endStr}`;
  };

  const handleQuickSelect = (option) => {
    onChange(option.value);
  };

  const displayDataSpan = `Your data spans ${dataSpan}`;

  return (
    <DialogTrigger>
      <Button
        variant="outline"
        className={cn(
          "w-[300px] justify-between text-left font-normal",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span>{formatDateRange(value)}</span>
        <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      <DatePickerContent className="w-auto p-0">
        <div className="p-4 space-y-4">
          {/* Quick Select Section */}
          <div>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Quick Select</h3>
            
            {/* Featured Option */}
            <Button
              variant="default"
              className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleQuickSelect(quickOptions[0])}
            >
              {quickOptions[0].label}
            </Button>
            
            {/* Regular Options in Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickOptions.slice(1).map((option, index) => (
                <Button
                  key={index}
                  variant="ghost" 
                  className="text-left justify-start h-auto py-2"
                  onClick={() => handleQuickSelect(option)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            {/* Data Span Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <div className="w-3 h-3 bg-orange-600 rounded"></div>
              </div>
              <span>{displayDataSpan}</span>
            </div>
          </div>

          {/* Custom Range Section */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-sm text-gray-900 mb-3">Custom Range</h3>
            <div className="space-y-3">
              <JollyDateRangePicker
                value={value}
                onChange={onChange}
                className="w-full"
                aria-label="Select date range"
              />
            </div>
          </div>
        </div>
      </DatePickerContent>
    </DialogTrigger>
  );
};

export { QuickDateRangePicker };
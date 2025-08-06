"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import {
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  Dialog as AriaDialog,
  Popover as AriaPopover,
  composeRenderProps,
  Text,
} from "react-aria-components"

import { cn } from "../../lib/utils"

import { Popover } from "./popover"
import { Button } from "./button"
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  RangeCalendar,
} from "./calendar"
import { DateInput } from "./datefield"
import { FieldError, FieldGroup, Label } from "./field"

const DatePicker = AriaDatePicker

const DateRangePicker = AriaDateRangePicker

const DatePickerContent = ({
  className,
  popoverClassName,
  ...props
}) => (
  <Popover
    className={composeRenderProps(popoverClassName, (className) =>
      cn("w-auto p-3", className)
    )}
  >
    <AriaDialog
      className={cn(
        "flex w-full flex-col space-y-4 outline-none sm:flex-row sm:space-x-4 sm:space-y-0",
        className
      )}
      {...props}
    />
  </Popover>
)

function JollyDatePicker({
  label,
  description,
  errorMessage,
  className,
  ...props
}) {
  return (
    <DatePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput className="flex-1" variant="ghost" />
        <Button
          variant="ghost"
          size="icon"
          className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
        >
          <CalendarIcon aria-hidden className="size-4" />
        </Button>
      </FieldGroup>
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent>
        <Calendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </DatePickerContent>
    </DatePicker>
  )
}

function JollyDateRangePicker({
  label,
  description,
  errorMessage,
  className,
  value,
  onChange,
  ...props
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const presets = [
    { 
      label: "All time", 
      getValue: () => {
        const today = new Date();
        return {
          start: { year: 2016, month: 1, day: 1 }, // Start from 2016 to include your historical data
          end: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }
        };
      },
      primary: true
    },
    { 
      label: "2016 Data", 
      getValue: () => {
        return {
          start: { year: 2016, month: 1, day: 1 },
          end: { year: 2016, month: 12, day: 31 }
        };
      }
    },
    { 
      label: "2017-2020", 
      getValue: () => {
        return {
          start: { year: 2017, month: 1, day: 1 },
          end: { year: 2020, month: 12, day: 31 }
        };
      }
    },
    { 
      label: "Recent (2020+)", 
      getValue: () => {
        const today = new Date();
        return {
          start: { year: 2020, month: 1, day: 1 },
          end: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }
        };
      }
    },
    { 
      label: "Last Year", 
      getValue: () => {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return {
          start: { year: oneYearAgo.getFullYear(), month: oneYearAgo.getMonth() + 1, day: oneYearAgo.getDate() },
          end: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }
        };
      }
    },
    { 
      label: "Last 6 Months", 
      getValue: () => {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        return {
          start: { year: sixMonthsAgo.getFullYear(), month: sixMonthsAgo.getMonth() + 1, day: sixMonthsAgo.getDate() },
          end: { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() }
        };
      }
    }
  ];

  const formatDateRange = (dateRange) => {
    if (!dateRange?.start || !dateRange?.end) return "Select date range";
    
    const formatDate = (date) => {
      if (date.toDate) {
        // Handle Internationalized date objects
        const jsDate = date.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
        return jsDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else if (date.year && date.month) {
        // Handle plain objects
        const jsDate = new Date(date.year, date.month - 1, date.day || 1);
        return jsDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      return "";
    };
    
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  const handlePresetClick = (preset) => {
    const newRange = preset.getValue();
    
    // Convert to the format expected by the parent component
    if (onChange) {
      // Try to maintain the same date object format as the current value
      if (value?.start?.year !== undefined) {
        // Already in the right format
        onChange(newRange);
      } else {
        // Need to convert to internationalized date objects (if that's what's expected)
        // For now, just pass the plain object and let the parent handle conversion
        onChange(newRange);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col gap-2">
        {label && <Label className="text-sm font-medium">{label}</Label>}
        
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between text-left font-normal min-w-[280px]"
          >
            <span className="truncate">{formatDateRange(value)}</span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
          
          {isOpen && (
            <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg">
              {/* Quick Presets */}
              <div className="p-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
                
                {/* Primary preset - All time */}
                <div className="mb-3">
                  {presets.filter(p => p.primary).map((preset) => (
                    <Button
                      key={preset.label}
                      variant="default"
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full justify-center text-sm h-9 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      📅 {preset.label}
                    </Button>
                  ))}
                </div>
                
                {/* Other presets */}
                <div className="grid grid-cols-2 gap-2">
                  {presets.filter(p => !p.primary).map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePresetClick(preset)}
                      className="justify-start text-xs h-8 hover:bg-gray-100"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  📊 Your data is primarily from 2016
                </p>
              </div>
              
              {/* Custom Date Range */}
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Range</h4>
                <DateRangePicker
                  value={value}
                  onChange={onChange}
                  {...props}
                >
                  <FieldGroup className="mb-3">
                    <DateInput variant="ghost" slot="start" className="text-xs" />
                    <span className="px-2 text-xs text-gray-400">to</span>
                    <DateInput variant="ghost" slot="end" className="text-xs" />
                  </FieldGroup>
                  <DatePickerContent popoverClassName="relative w-full border-0 shadow-none p-0">
                    <RangeCalendar>
                      <CalendarHeading />
                      <CalendarGrid>
                        <CalendarGridHeader>
                          {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                        </CalendarGridHeader>
                        <CalendarGridBody>
                          {(date) => <CalendarCell date={date} />}
                        </CalendarGridBody>
                      </CalendarGrid>
                    </RangeCalendar>
                  </DatePickerContent>
                </DateRangePicker>
              </div>
              
              {/* Close button */}
              <div className="p-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {description && (
          <Text className="text-sm text-muted-foreground">
            {description}
          </Text>
        )}
        {errorMessage && <FieldError>{errorMessage}</FieldError>}
      </div>
      
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export {
  DatePicker,
  DatePickerContent,
  DateRangePicker,
  JollyDatePicker,
  JollyDateRangePicker,
}

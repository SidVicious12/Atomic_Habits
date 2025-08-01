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
  ...props
}) {
  return (
    <DateRangePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <DateInput variant="ghost" slot={"start"} />
        <span aria-hidden className="px-2 text-sm text-muted-foreground">
          -
        </span>
        <DateInput className="flex-1" variant="ghost" slot={"end"} />

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
  )
}

export {
  DatePicker,
  DatePickerContent,
  DateRangePicker,
  JollyDatePicker,
  JollyDateRangePicker,
}

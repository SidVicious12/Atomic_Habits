"use client"

import { useState } from "react"
import { CalendarDays, CalendarCheck2 } from "lucide-react"
import { MenuBar } from "./ui/glow-menu"

const yearItems = [
  {
    icon: CalendarCheck2,
    label: "2017",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: CalendarCheck2,
    label: "2016",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(124,58,237,0.06) 50%, rgba(109,40,217,0) 100%)",
    iconColor: "text-purple-500",
  },
]

const monthItems = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
].map((label) => ({
  icon: CalendarDays,
  label,
  href: "#",
  gradient:
    "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
  iconColor: "text-blue-500",
}))

export function HabitMenuBar({
  onYearSelect,
  onMonthSelect,
}: {
  onYearSelect: (year: string) => void
  onMonthSelect: (month: string) => void
}) {
  const [activeYear, setActiveYear] = useState("2017")
  const [activeMonth, setActiveMonth] = useState("Dec")

  return (
    <div className="flex flex-col gap-4">
      <MenuBar
        items={yearItems}
        activeItem={activeYear}
        onItemClick={(label) => {
          setActiveYear(label)
          onYearSelect(label)
        }}
      />
      <MenuBar
        items={monthItems}
        activeItem={activeMonth}
        onItemClick={(label) => {
          setActiveMonth(label)
          onMonthSelect(label)
        }}
      />
    </div>
  )
}

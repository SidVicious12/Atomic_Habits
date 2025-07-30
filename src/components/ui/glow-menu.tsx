"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { LucideIcon } from 'lucide-react';

interface MenuItem {
  icon?: LucideIcon;
  label: string;
  href?: string;
  gradient?: string;
  iconColor?: string;
}

interface MenuBarProps {
  items: MenuItem[];
  onItemClick: (label: string) => void;
  activeItem: string;
}

export function MenuBar({ items, onItemClick, activeItem }: MenuBarProps) {
  return (
    <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-full">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => onItemClick(item.label)}
          className={cn(
            "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeItem === item.label
              ? "text-white"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {activeItem === item.label && (
            <motion.div
              layoutId="glow-menu-bar"
              className="absolute inset-0 bg-blue-500 rounded-full"
              style={{ originY: "0px" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {item.icon && <item.icon className={cn("h-4 w-4", item.iconColor)} />}
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

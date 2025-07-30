import React from "react";
import { motion } from "framer-motion";
import { AreaChartXs, DataPoint } from "./area-chart-xs";
import { cn } from "../../lib/utils";

export interface HabitButtonCardProps {
  habitName: string;
  countLastMonth: number;
  chartData: DataPoint[];
  onClick?: () => void;
  className?: string;
  duration?: number;
}

export const HabitButtonCard: React.FC<HabitButtonCardProps> = ({
  habitName,
  countLastMonth,
  chartData,
  onClick,
  className,
  duration = 5000,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-transparent relative h-full w-full p-[1px] overflow-hidden rounded-xl",
        className
      )}
      style={{
        transform: "translateZ(0)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: "inherit" }}
      >
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
          }}
          className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      </div>

      <div className="relative bg-white dark:bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-xl h-full w-full p-4 text-left flex flex-col">
        <div className="flex-grow flex items-center justify-center mb-2">
          <AreaChartXs
            id={`${habitName.replace(/\s+/g, '-')}-chart`}
            data={chartData}
            width={120}
            height={60}
            showXAxisTicks={false}
            showYAxisTicks={false}
          />
        </div>
        <div className="mt-auto">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">{habitName}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Total last month: <strong>{countLastMonth}</strong>
          </p>
        </div>
      </div>
    </button>
  );
};

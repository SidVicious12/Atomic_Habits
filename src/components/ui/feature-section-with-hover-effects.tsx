import { cn } from "../../lib/utils";
import React from "react";
import { AreaChartXs, DataPoint } from "./area-chart-xs";

// Helper to generate sample data for the last month
const generateSampleData = (points: number, maxVal: number): DataPoint[] => {
  const data: DataPoint[] = [];
  const today = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (points - i) * (30 / points));
    data.push({
      key: date,
      data: Math.floor(Math.random() * maxVal) + 1,
    });
  }
  return data;
};

export function FeaturesSectionWithHoverEffects() {
  const habits = [
    { title: "Pages Read", chartData: generateSampleData(5, 10), countThisMonth: 25 },
    { title: "Netflix in Bed", chartData: generateSampleData(5, 1), countThisMonth: 10 },
    { title: "Smoke", chartData: generateSampleData(5, 5), countThisMonth: 30 },
    { title: "Relax", chartData: generateSampleData(5, 60), countThisMonth: 15 },
    { title: "# of Dabs", chartData: generateSampleData(5, 10), countThisMonth: 60 },
    { title: "Drink", chartData: generateSampleData(5, 3), countThisMonth: 8 },
    { title: "Phone Use in Morning", chartData: generateSampleData(5, 1), countThisMonth: 28 },
    { title: "Breakfast", chartData: generateSampleData(5, 1), countThisMonth: 29 },
    { title: "Coffee", chartData: generateSampleData(5, 3), countThisMonth: 30 },
    { title: "Brush Teeth at Night", chartData: generateSampleData(5, 1), countThisMonth: 22 },
    { title: "Wash Face at Night", chartData: generateSampleData(5, 1), countThisMonth: 18 },
    { title: "Green Tea", chartData: generateSampleData(5, 2), countThisMonth: 20 },
    { title: "Water Bottles", chartData: generateSampleData(5, 8), countThisMonth: 50 },
    { title: "Weight", chartData: generateSampleData(5, 5), countThisMonth: 182 },
    { title: "Morning Walk", chartData: generateSampleData(5, 1), countThisMonth: 12 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {habits.map((habit, index) => (
        <Feature key={habit.title} {...habit} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  chartData,
  index,
  countThisMonth,
}: {
  title: string;
  chartData: DataPoint[];
  index: number;
  countThisMonth?: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        index % 4 === 0 && "lg:border-l dark:border-neutral-800",
        index < 12 && "lg:border-b dark:border-neutral-800"
      )}
    >
      <div className="mb-4 relative z-10 px-10 flex justify-center items-center h-[60px]">
        <AreaChartXs
          id={`${title.replace(/\s+/g, '-')}-mini-chart`}
          data={chartData}
          width={120}
          height={60}
          showXAxisTicks={false}
          showYAxisTicks={false}
        />
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-tr-full rounded-br-full bg-neutral-300 group-hover/feature:bg-blue-500 transition-all duration-200" />
        <span className="text-neutral-800 group-hover/feature:translate-x-2 transition duration-200 inline-block dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-xs relative z-10 px-10">
        Total last month: <strong>{countThisMonth ?? 0}</strong>
      </p>
    </div>
  );
};

import React from "react";

export interface FeatureType {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeaturesSectionWithHoverEffects({ features }: { features: FeatureType[] }) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y border dark:border-neutral-800 dark:divide-neutral-800">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-6 text-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          >
            <div className="w-6 h-6 text-neutral-600 dark:text-neutral-400">{feature.icon}</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">{feature.title}</h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

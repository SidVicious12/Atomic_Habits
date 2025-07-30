// transformOutput.js
// Usage: node transformOutput.js output.json habitsByCategory.json
//
// Reads daily logs from output.json and produces a grouped summary by habit and category.
//
// Output format:
// {
//   "Key Habits": [
//     {
//       habit_name: "Pages Read",
//       total: 142,
//       streak: 5,
//       history: [12, 10, 8, ...],
//       status: "Done" // or "Missed"
//     }, ...
//   ], ...
// }

import fs from "fs";
import path from "path";

const [,, inputPath = "output.json", outputPath = "habitsByCategory.json"] = process.argv;

// --- CATEGORY MAP: edit as needed --- //
const CANONICAL_HABITS = [
  "pages_read",
  "netflix_in_bed",
  "smoked",
  "relaxed",
  "dabs",
  "drank",
  "phone_in_morning",
  "breakfast",
  "coffee",
  "brushed_teeth",
  "washed_face",
  "green_tea",
  "water_bottles",
  "weight",
  "morning_walk"
];

const HABIT_CATEGORY_MAP = {
  "pages_read": "Key Habits",
  "netflix_in_bed": "Key Habits",
  "smoked": "Key Habits",
  "relaxed": "Addictive Habits",
  "dabs": "Addictive Habits",
  "drank": "Addictive Habits",
  "phone_in_morning": "Morning Habits",
  "breakfast": "Morning Habits",
  "coffee": "Morning Habits",
  "brushed_teeth": "Nighttime Habits",
  "washed_face": "Nighttime Habits",
  "green_tea": "Nighttime Habits",
  "water_bottles": "Workout Habits",
  "weight": "Workout Habits",
  "morning_walk": "New Habits"
};

const HABIT_DISPLAY_NAMES = {
  "pages_read": "Pages Read",
  "netflix_in_bed": "Netflix in Bed",
  "smoked": "Smoke",
  "relaxed": "Relax?",
  "dabs": "# of Dabs",
  "drank": "Drink",
  "phone_in_morning": "Phone use in first 30 mins",
  "breakfast": "Breakfast",
  "coffee": "Coffee",
  "brushed_teeth": "Brush Teeth at Night",
  "washed_face": "Wash Face at Night",
  "green_tea": "Green Tea",
  "water_bottles": "Water Bottles",
  "weight": "Weight",
  "morning_walk": "Morning Walk"
};

function getDefaultValue(habitKey) {
  // Numeric or boolean
  if (["pages_read", "dabs", "coffee", "water_bottles", "weight"].includes(habitKey)) return 0;
  return false;
}

function statusFromValue(val, habitKey) {
  // For numeric habits, "Done" if > 0, for boolean, "Done" if true
  if (["pages_read", "dabs", "coffee", "water_bottles", "weight"].includes(habitKey)) {
    return val > 0 ? "Done" : "Missed";
  }
  return val ? "Done" : "Missed";
}

function aggregatePagesReadByMonth(rawData) {
  const pagesByYear = {};
  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Aggregate pages read from raw data
  for (const day of rawData) {
    if (day.habits.pages_read && day.habits.pages_read > 0) {
      const date = new Date(day.date);
      const year = date.getUTCFullYear();
      const monthName = allMonths[date.getUTCMonth()];
      
      if (!pagesByYear[year]) {
        pagesByYear[year] = {};
      }
      if (!pagesByYear[year][monthName]) {
        pagesByYear[year][monthName] = 0;
      }
      pagesByYear[year][monthName] += day.habits.pages_read;
    }
  }

  // Ensure all months exist for each year for consistent charting
  for (const year in pagesByYear) {
    for (const month of allMonths) {
      if (!pagesByYear[year][month]) {
        pagesByYear[year][month] = 0;
      }
    }
  }

  return pagesByYear;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const habitsByCategory = {};
  const habitHistories = {};

  // Build up history arrays
  for (const day of raw) {
    for (const habitKey of CANONICAL_HABITS) {
      let val = day.habits[habitKey];
      if (val === undefined || val === null) val = getDefaultValue(habitKey);
      if (!habitHistories[habitKey]) habitHistories[habitKey] = [];
      habitHistories[habitKey].push(val);
    }
  }

  // Build summary for each habit
  for (const [habitKey, history] of Object.entries(habitHistories)) {
    const category = HABIT_CATEGORY_MAP[habitKey] || "Other";
    const displayName = HABIT_DISPLAY_NAMES[habitKey] || habitKey;
    const total = history.reduce((acc, v) => acc + (typeof v === 'number' ? v : (v ? 1 : 0)), 0);
    const streak = (() => {
      let s = 0;
      for (let i = history.length - 1; i >= 0; --i) {
        if (history[i] && (typeof history[i] === 'number' ? history[i] > 0 : history[i])) s++;
        else break;
      }
      return s;
    })();
    const status = statusFromValue(history[history.length - 1], habitKey);

    if (!habitsByCategory[category]) habitsByCategory[category] = [];
    habitsByCategory[category].push({
      habit_name: displayName,
      total,
      streak,
      history,
      status
    });
  }

  // --- Generate and write both data files ---
  fs.writeFileSync(outputPath, JSON.stringify(habitsByCategory, null, 2));
  console.log(`✅ Habits grouped and written to ${outputPath}`);

  const pagesReadData = aggregatePagesReadByMonth(raw);
  const pagesReadOutputPath = path.join(path.dirname(outputPath), "pagesReadByYear.json");
  fs.writeFileSync(pagesReadOutputPath, JSON.stringify(pagesReadData, null, 2));
  console.log(`✅ Pages read data aggregated and written to ${pagesReadOutputPath}`);

  // Aggregate Netflix in Bed data
  const netflixByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    const year = date.getFullYear();
    // Using toLocaleString with 'short' month format for consistency
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!netflixByYear[year]) netflixByYear[year] = {};
    if (!netflixByYear[year][month]) netflixByYear[year][month] = 0;

    const watched = log.habits?.["netflix_in_bed"] === true ? 1 : 0;
    if (watched) {
      netflixByYear[year][month] += 1;
    }
  }

  const netflixDataPath = path.join(path.dirname(outputPath), 'netflixDataByYear.json');
  fs.writeFileSync(netflixDataPath, JSON.stringify(netflixByYear, null, 2));
  console.log(`✅ Netflix data aggregated and written to ${netflixDataPath}`);

  // Aggregate Smoke data
  const smokeByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!smokeByYear[year]) smokeByYear[year] = {};
    if (!smokeByYear[year][month]) smokeByYear[year][month] = 0;

    const smoked = (log.smoked === true || log.habits?.smoked === true) ? 1 : 0;
    if (smoked) {
      smokeByYear[year][month] += 1;
    }
  }

  const smokeDataPath = path.join(path.dirname(outputPath), 'smokeDataByYear.json');
  fs.writeFileSync(smokeDataPath, JSON.stringify(smokeByYear, null, 2));
  console.log(`✅ Smoke data aggregated and written to ${smokeDataPath}`);

  // Aggregate Relax data
  const relaxByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!relaxByYear[year]) relaxByYear[year] = {};
    if (!relaxByYear[year][month]) relaxByYear[year][month] = 0;

    const relaxed = (log.relaxed === true || log.habits?.relaxed === true) ? 1 : 0;
    if (relaxed) {
      relaxByYear[year][month] += 1;
    }
  }

  const relaxDataPath = path.join(path.dirname(outputPath), 'relaxDataByYear.json');
  fs.writeFileSync(relaxDataPath, JSON.stringify(relaxByYear, null, 2));
  console.log(`✅ Relax data aggregated and written to ${relaxDataPath}`);

  // Aggregate Dabs data
  const dabsByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!dabsByYear[year]) dabsByYear[year] = {};
    if (!dabsByYear[year][month]) dabsByYear[year][month] = 0;

    const dabsCount = (log.dabs || 0) + (log.habits?.dabs || 0);
    if (dabsCount > 0) {
      dabsByYear[year][month] += dabsCount;
    }
  }

  const dabsDataPath = path.join(path.dirname(outputPath), 'dabsDataByYear.json');
  fs.writeFileSync(dabsDataPath, JSON.stringify(dabsByYear, null, 2));
  console.log(`✅ Dabs data aggregated and written to ${dabsDataPath}`);

  // Aggregate Drank data
  const drankByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!drankByYear[year]) drankByYear[year] = {};
    if (!drankByYear[year][month]) drankByYear[year][month] = 0;

    const drank = (log.drank === true || log.habits?.drank === true) ? 1 : 0;
    if (drank) {
      drankByYear[year][month] += 1;
    }
  }

  const drankDataPath = path.join(path.dirname(outputPath), 'drankDataByYear.json');
  fs.writeFileSync(drankDataPath, JSON.stringify(drankByYear, null, 2));
  console.log(`✅ Drank data aggregated and written to ${drankDataPath}`);

  // Aggregate Phone in Morning data
  const phoneInMorningByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!phoneInMorningByYear[year]) phoneInMorningByYear[year] = {};
    if (!phoneInMorningByYear[year][month]) phoneInMorningByYear[year][month] = 0;

    const phoneInMorning = (log.phone_in_morning === true || log.habits?.phone_in_morning === true) ? 1 : 0;
    if (phoneInMorning) {
      phoneInMorningByYear[year][month] += 1;
    }
  }

  const phoneInMorningDataPath = path.join(path.dirname(outputPath), 'phoneInMorningDataByYear.json');
  fs.writeFileSync(phoneInMorningDataPath, JSON.stringify(phoneInMorningByYear, null, 2));
  console.log(`✅ Phone in Morning data aggregated and written to ${phoneInMorningDataPath}`);

  // Aggregate Breakfast data
  const breakfastByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!breakfastByYear[year]) breakfastByYear[year] = {};
    if (!breakfastByYear[year][month]) breakfastByYear[year][month] = 0;

    const hadBreakfast = (log.breakfast === true || log.habits?.breakfast === true) ? 1 : 0;
    if (hadBreakfast) {
      breakfastByYear[year][month] += 1;
    }
  }

  const breakfastDataPath = path.join(path.dirname(outputPath), 'breakfastDataByYear.json');
  fs.writeFileSync(breakfastDataPath, JSON.stringify(breakfastByYear, null, 2));
  console.log(`✅ Breakfast data aggregated and written to ${breakfastDataPath}`);

  // Aggregate Coffee data
  const coffeeByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!coffeeByYear[year]) coffeeByYear[year] = {};
    if (!coffeeByYear[year][month]) coffeeByYear[year][month] = 0;

    const hadCoffee = (log.green_tea === true || log.habits?.green_tea === true) ? 1 : 0;
    if (hadCoffee) {
      coffeeByYear[year][month] += 1;
    }
  }

  const coffeeDataPath = path.join(path.dirname(outputPath), 'coffeeDataByYear.json');
  fs.writeFileSync(coffeeDataPath, JSON.stringify(coffeeByYear, null, 2));
  console.log(`✅ Coffee data aggregated and written to ${coffeeDataPath}`);

  // Aggregate Brush Teeth at Night data
  const brushedTeethByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!brushedTeethByYear[year]) brushedTeethByYear[year] = {};
    if (!brushedTeethByYear[year][month]) brushedTeethByYear[year][month] = 0;

    const brushedTeeth = (log.brushed_teeth === true || log.habits?.brushed_teeth === true) ? 1 : 0;
    if (brushedTeeth) {
      brushedTeethByYear[year][month] += 1;
    }
  }

  const brushedTeethDataPath = path.join(path.dirname(outputPath), 'brushedTeethDataByYear.json');
  fs.writeFileSync(brushedTeethDataPath, JSON.stringify(brushedTeethByYear, null, 2));
  console.log(`✅ Brush Teeth data aggregated and written to ${brushedTeethDataPath}`);

  // Aggregate Wash Face at Night data
  const washedFaceByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!washedFaceByYear[year]) washedFaceByYear[year] = {};
    if (!washedFaceByYear[year][month]) washedFaceByYear[year][month] = 0;

    const washedFace = (log.washed_face === true || log.habits?.washed_face === true) ? 1 : 0;
    if (washedFace) {
      washedFaceByYear[year][month] += 1;
    }
  }

  const washedFaceDataPath = path.join(path.dirname(outputPath), 'washedFaceDataByYear.json');
  fs.writeFileSync(washedFaceDataPath, JSON.stringify(washedFaceByYear, null, 2));
  console.log(`✅ Wash Face data aggregated and written to ${washedFaceDataPath}`);

  // Aggregate Green Tea data
  const greenTeaByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!greenTeaByYear[year]) greenTeaByYear[year] = {};
    if (!greenTeaByYear[year][month]) greenTeaByYear[year][month] = 0;

    const hadGreenTea = (log.green_tea === true || log.habits?.green_tea === true) ? 1 : 0;
    if (hadGreenTea) {
      greenTeaByYear[year][month] += 1;
    }
  }

  const greenTeaDataPath = path.join(path.dirname(outputPath), 'greenTeaDataByYear.json');
  fs.writeFileSync(greenTeaDataPath, JSON.stringify(greenTeaByYear, null, 2));
  console.log(`✅ Green Tea data aggregated and written to ${greenTeaDataPath}`);

  // Aggregate Water Bottles data
  const waterBottlesByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!waterBottlesByYear[year]) waterBottlesByYear[year] = {};
    if (!waterBottlesByYear[year][month]) waterBottlesByYear[year][month] = 0;

    const waterBottlesCount = (log.water_bottles || 0) + (log.habits?.water_bottles || 0);
    if (waterBottlesCount > 0) {
      waterBottlesByYear[year][month] += waterBottlesCount;
    }
  }

  const waterBottlesDataPath = path.join(path.dirname(outputPath), 'waterBottlesDataByYear.json');
  fs.writeFileSync(waterBottlesDataPath, JSON.stringify(waterBottlesByYear, null, 2));
  console.log(`✅ Water Bottles data aggregated and written to ${waterBottlesDataPath}`);

  // Aggregate Weight data by average
  const weightByYear = {};
  const weightCounts = {};

  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue;

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });
    const weightValue = parseFloat(log.habits?.weight || log.weight);

    if (weightValue > 0) {
      if (!weightByYear[year]) {
        weightByYear[year] = {};
        weightCounts[year] = {};
      }
      if (!weightByYear[year][month]) {
        weightByYear[year][month] = 0;
        weightCounts[year][month] = 0;
      }
      weightByYear[year][month] += weightValue;
      weightCounts[year][month] += 1;
    }
  }

  // Calculate averages
  for (const year in weightByYear) {
    for (const month in weightByYear[year]) {
      if (weightCounts[year][month] > 0) {
        weightByYear[year][month] = weightByYear[year][month] / weightCounts[year][month];
      }
    }
  }

  const weightDataPath = path.join(path.dirname(outputPath), 'weightDataByYear.json');
  fs.writeFileSync(weightDataPath, JSON.stringify(weightByYear, null, 2));
  console.log(`✅ Weight data aggregated and written to ${weightDataPath}`);

  // Aggregate Morning Walk data
  const morningWalkByYear = {};
  for (const log of raw) {
    const date = new Date(log.date);
    if (!date || isNaN(date)) continue; // Skip invalid dates

    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", { month: "long" });

    if (!morningWalkByYear[year]) morningWalkByYear[year] = {};
    if (!morningWalkByYear[year][month]) morningWalkByYear[year][month] = 0;

    const tookAWalk = (log.morning_walk === true || log.habits?.morning_walk === true) ? 1 : 0;
    if (tookAWalk) {
      morningWalkByYear[year][month] += 1;
    }
  }

  const morningWalkDataPath = path.join(path.dirname(outputPath), 'morningWalkDataByYear.json');
  fs.writeFileSync(morningWalkDataPath, JSON.stringify(morningWalkByYear, null, 2));
  console.log(`✅ Morning Walk data aggregated and written to ${morningWalkDataPath}`);

  aggregateLastMonthSummary(raw, outputPath);
}

function aggregateLastMonthSummary(raw, outputPath) {
  const now = new Date('2025-07-04T21:13:17-07:00');
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = lastMonth.getFullYear();
  const lastMonthMonth = lastMonth.getMonth();

  const lastMonthSummary = {};

  for (const habit of CANONICAL_HABITS) {
    lastMonthSummary[habit] = [];
  }

  for (const log of raw) {
    const logDate = new Date(log.date);
    if (logDate.getFullYear() === lastMonthYear && logDate.getMonth() === lastMonthMonth) {
      const dayOfMonth = logDate.getDate();
      for (const habit of CANONICAL_HABITS) {
        let value = log.habits?.[habit] ?? log[habit] ?? getDefaultValue(habit);
        if (typeof value === 'boolean') {
          value = value ? 1 : 0;
        }
        if (lastMonthSummary[habit][dayOfMonth - 1]) {
          lastMonthSummary[habit][dayOfMonth - 1] += value
        } else {
          lastMonthSummary[habit][dayOfMonth - 1] = value
        }
      }
    }
  }

  const daysInLastMonth = new Date(lastMonthYear, lastMonthMonth + 1, 0).getDate();
  for (const habit in lastMonthSummary) {
    for (let i = 0; i < daysInLastMonth; i++) {
      if (lastMonthSummary[habit][i] === undefined) {
        lastMonthSummary[habit][i] = 0;
      }
    }
  }

  const summaryByCategory = {};
  for (const habitKey in lastMonthSummary) {
    const category = HABIT_CATEGORY_MAP[habitKey] || 'Other';
    if (!summaryByCategory[category]) {
      summaryByCategory[category] = [];
    }
    summaryByCategory[category].push({
      habit_name: HABIT_DISPLAY_NAMES[habitKey] || habitKey,
      data: lastMonthSummary[habitKey],
    });
  }

  const lastMonthSummaryPath = path.join(path.dirname(outputPath), 'lastMonthSummary.json');
  fs.writeFileSync(lastMonthSummaryPath, JSON.stringify(summaryByCategory, null, 2));
  console.log(`✅ Last month summary data aggregated and written to ${lastMonthSummaryPath}`);
}

main();



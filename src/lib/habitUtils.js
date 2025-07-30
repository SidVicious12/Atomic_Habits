import allHabitData from '../data/output.json';

// Maps display-friendly names to the snake_case keys in the JSON data
export const habitNameKeyMap = {
  "Pages Read": "pages_read",
  "Watched Netflix in Bed?": "netflix_in_bed",
  "Smoked?": "smoked",
  "Relax?": "relaxed",
  "Dabs": "dabs",
  "Drinks": "drank",
  "Phone usage in first 30 min": "phone_in_morning",
  "Breakfast": "breakfast",
  "Coffee": "coffee",
  "Brushed teeth": "brushed_teeth",
  "Washed face": "washed_face",
  "Drank green tea": "green_tea",
  "Bottles of water": "water_bottles",
  "Weight": "weight",
  "Morning Walk": "morning_walk",
};

// Processes the raw data for a specific habit
export const getHabitStats = (habitKey, year, month) => {
  let filteredData;

  // First, map all data to include a proper Date object for easier processing.
  const processedData = allHabitData.map(day => {
    const parts = day.date.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return { ...day, date };
  });

  if (year && month) {
    const monthIndex = new Date(Date.parse(month + " 1, 2012")).getMonth();
    const numericYear = parseInt(year, 10);
    filteredData = processedData.filter(day => 
      day.date.getUTCFullYear() === numericYear && day.date.getUTCMonth() === monthIndex
    );
  } else {
    // If dataset is historical, the last 30 calendar days from *today* may return 0 rows.
    // Instead, take the most recent 30 entries in the data set.
    filteredData = processedData
      .sort((a, b) => b.date - a.date) // newest first
      .slice(0, 30)
      .reverse(); // restore chronological order
  }

  let totalCount = 0;
  const chartData = filteredData
    .map(day => {
      const value = day.habits[habitKey];
      const numericValue = typeof value === 'boolean' ? (value ? 1 : 0) : (typeof value === 'number' ? value : 0);
      totalCount += numericValue;
      return {
        key: day.date.getTime(),
        data: numericValue,
      };
    })
    .sort((a, b) => a.key - b.key); // Sort by timestamp ascending

  return { chartData, totalCount };
};

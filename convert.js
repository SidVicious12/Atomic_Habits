#!/usr/bin/env node
/**
 * convert.js
 *
 * Usage:
 *   node convert.js Habit_Tracker.csv output.json
 *
 * 1. Reads a CSV exported from Google Sheets (first row = headers).
 * 2. Normalises the header names to snake_case keys.
 * 3. Converts each row into the final JSON structure agreed for the habit tracker.
 *    - date / day / month fields derived from a "Date" (or similar) column.
 *    - boolean-like values (yes/no/true/false/1/0) are coerced to booleans.
 *    - numeric strings are coerced to numbers when sensible.
 * 4. Writes an array of daily log objects to the given output path (default: output.json).
 */

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday.js";

dayjs.extend(weekday);

// -------- Helpers -------- //
const toSnake = (str) =>
  str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/ (.)/g, (_, c) => c.toUpperCase()) // camelCase first
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();

const NUMERIC_HABITS = ["pages_read", "dabs", "water_bottles", "weight", "coffee"];

const coerceValue = (value, key) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === "") return null;

  // Handle numeric habits first
  if (NUMERIC_HABITS.includes(key)) {
    const num = Number(trimmed);
    return !Number.isNaN(num) ? num : null;
  }

  // Handle boolean-like habits
  const lower = trimmed.toLowerCase();
  if (["true", "yes", "y", "1"].includes(lower)) return true;
  if (["false", "no", "n", "0"].includes(lower)) return false;

  // Fallback for any other values that might be numbers
  const num = Number(trimmed);
  if (!Number.isNaN(num)) return num;

  return trimmed; // fallback string
};

const KEY_MAP = {
  "number_of_pages_read": "pages_read",
  "did_iwatch_netflix_in_bed_last_night": "netflix_in_bed",
  "smoke": "smoked",
  "relax": "relaxed",
  "of_dabs": "dabs",
  "drink": "drank",
  "did_iuse_my_phone_for_social_media30_mins_after_waking_up": "phone_in_morning",
  "brush_teeth_at_night": "brushed_teeth",
  "wash_face_at_night": "washed_face",
  "of_bottles_of_water_drank": "water_bottles",
  "weight_in_lbs": "weight",
};

function deriveDateFields(dateStr) {
  const d = dayjs(dateStr);
  if (!d.isValid()) {
    return { date: dateStr, day: null, month: null };
  }
  return {
    date: d.format("YYYY-MM-DD"),
    day: d.format("dddd"),
    month: d.format("YYYY-MM"),
  };
}

// -------- Main -------- //
const [, , csvPath = "Habit_Tracker.csv", outputPath = "output.json"] = process.argv;

if (!fs.existsSync(csvPath)) {
  console.error(`CSV file not found: ${csvPath}`);
  process.exit(1);
}

const results = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (row) => {
    const normalisedRow = {};

    for (const [header, value] of Object.entries(row)) {
      if (!header) continue;
      const snakeKey = toSnake(header);
      const finalKey = KEY_MAP[snakeKey] || snakeKey;
      normalisedRow[finalKey] = coerceValue(value, finalKey);
    }

    // Expect a column like "Date" or "date" or similar
    const dateColumn = Object.keys(normalisedRow).find((k) => k.startsWith("date"));
    const { date, day, month } = deriveDateFields(normalisedRow[dateColumn]);

    // Build final structure
    const dailyLog = {
      date,
      day,
      month,
      habits: {},
    };

    // Exclude date-like column from habit values
    for (const [key, val] of Object.entries(normalisedRow)) {
      if (key === dateColumn || key === "day" || key === "month") continue;
      dailyLog.habits[key] = val;
    }

    results.push(dailyLog);
  })
  .on("end", () => {
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Conversion complete. ${results.length} rows written to ${outputPath}`);
  });

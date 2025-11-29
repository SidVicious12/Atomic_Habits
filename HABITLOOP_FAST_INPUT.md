# HabitLoop Fast Input System

A comprehensive guide to the fast input flows for logging daily habits in under 5 minutes.

---

## Table of Contents

1. [Data Model & Google Sheets Logic](#data-model--google-sheets-logic)
2. [Desktop Quick Daily Entry UX](#desktop-quick-daily-entry-ux)
3. [Mobile Input UX](#mobile-input-ux)
4. [Additional Input Channels](#additional-input-channels)
5. [Best Practices & Gamification](#best-practices--gamification)

---

## Data Model & Google Sheets Logic

### Schema Overview

Your Google Sheet serves as the primary data store with ~33,000+ rows. Each row represents one day.

| Column | Field | Type | Notes |
|--------|-------|------|-------|
| A | Date | DATE | Primary key (YYYY-MM-DD) |
| B | Day | TEXT | Auto-calculated (Monday, Tuesday, etc.) |
| C | Time Awake | TIME | HH:MM format |
| D | Coffee | YES/NO | Boolean toggle |
| E | Breakfast | YES/NO | Boolean toggle |
| F | Time at Work | TIME | HH:MM format |
| G | Time Left Work | TIME | HH:MM format |
| H | Netflix in Bed? | YES/NO | Boolean (inverted - No is good) |
| I | Phone 30min after wake? | YES/NO | Boolean (inverted) |
| J | # of Dabs | NUMBER | 0-10 |
| K | # of Water Bottles | NUMBER | 0-12 |
| L | # of Pages Read | NUMBER | 0-200 |
| M | Brush Teeth at Night | YES/NO | Boolean toggle |
| N | Wash Face at Night | YES/NO | Boolean toggle |
| O | Green Tea | YES/NO | Boolean toggle |
| P | Drink (alcohol) | YES/NO | Boolean (inverted) |
| Q | Smoke | YES/NO | Boolean (inverted) |
| R | Soda | YES/NO | Boolean (inverted) |
| S | Chocolate | YES/NO | Boolean toggle |
| T | Workout | TEXT | None/Chest/Back/Legs/etc. |
| U | Relax? | YES/NO | Boolean toggle |
| V | How was my day? | TEXT | Terrible/Bad/Okay/Good/Legendary |
| W | Weight in lbs | NUMBER | Decimal (e.g., 175.5) |
| X | Calories | NUMBER | Integer (e.g., 2000) |
| Y | Latest hype? | TEXT | Free text |
| Z | Dream I had | TEXT | Free text |
| AA | Bed time | TIME | HH:MM format |
| AB | Morning walk | YES/NO | Boolean toggle |

### Append-Only Logic

**Critical Requirement:** Never overwrite existing rows. Always append OR update only the current day's row.

#### Option A: Pure Append (Safest)

```javascript
// Always creates a new row
function handleAppend(sheet, data) {
  const lastRow = sheet.getLastRow();
  const newRow = lastRow + 1;
  sheet.getRange(newRow, 1, 1, data.length).setValues([data]);
  return { rowNumber: newRow };
}
```

#### Option B: Upsert by Date (Recommended)

```javascript
// Updates if date exists, appends if not
function handleUpsert(sheet, data) {
  const dateCol = 1;
  const lastRow = sheet.getLastRow();
  const dates = sheet.getRange(2, dateCol, lastRow - 1, 1).getValues();
  
  // Find existing row for this date
  let existingRow = -1;
  for (let i = 0; i < dates.length; i++) {
    if (formatDate(dates[i][0]) === data.date) {
      existingRow = i + 2;
      break;
    }
  }
  
  if (existingRow > 0) {
    // Update existing row (same day, multiple edits)
    sheet.getRange(existingRow, 1, 1, data.length).setValues([data]);
    return { action: 'updated', rowNumber: existingRow };
  } else {
    // Append new row (new day)
    return handleAppend(sheet, data);
  }
}
```

### API Flow

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  HabitLoop  │────▶│  Apps Script     │────▶│ Google Sheet │
│  Web App    │     │  Webhook (POST)  │     │  (33K+ rows) │
└─────────────┘     └──────────────────┘     └──────────────┘
       │                    │
       │   JSON payload     │   appendRow() or
       │   {action, data}   │   updateRow()
       ▼                    ▼
```

---

## Desktop Quick Daily Entry UX

### Layout Overview

The desktop Quick Daily Entry is designed for speed:

```
┌─────────────────────────────────────────────────────────┐
│  [⚡ Quick Entry]  [··· Full Form]                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Quick Daily Entry                          │
│         Track your habits in seconds                    │
│                                                         │
│                    ┌────┐                               │
│                    │67% │  ← Progress Ring              │
│                    └────┘                               │
│                                                         │
│              📅 [2024-01-15]                            │
├─────────────────────────────────────────────────────────┤
│  ☀️ Morning                                        [▼]  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [○] ☕ Morning Coffee                           │   │
│  │ [✓] 🚶 Morning Walk                       ✨    │   │
│  │ [○] 🥐 Breakfast                               │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  💧 Intake                                         [▼]  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💧 Water Bottles                                │   │
│  │ [-]           4           [+]                   │   │
│  │        [2] [4] [6] [8]  ← Quick presets         │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │        💾 Save Today's Habits                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│           ⌘+Enter to save • ⌘+Q toggle mode            │
└─────────────────────────────────────────────────────────┘
```

### Interaction Patterns

| Habit Type | Control | Interaction |
|------------|---------|-------------|
| Binary (Yes/No) | Toggle Button | Single click toggles |
| Count (Water, Pages) | Stepper + Presets | +/- buttons OR click preset |
| Time (Wake, Bed) | Time Input | Type or picker |
| Rating (Day mood) | Select Dropdown | Single click |
| Text (Dream, Hype) | Textarea | Type freely |

### Smart Defaults

- **Date**: Auto-selects today
- **Water**: Defaults to 4 (median from historical data)
- **Pages**: Defaults to 10
- **Weight**: Pre-fills from last entry
- **Time Awake**: Pre-fills from last entry pattern

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + Enter` | Save form |
| `⌘ + Q` | Toggle Quick/Full mode |
| `Tab` | Move to next field |
| `Space` | Toggle current toggle |
| `↑ / ↓` | Increment/decrement steppers |

---

## Mobile Input UX

### Design Principles

1. **One-hand operation** - All controls reachable by thumb
2. **Large tap targets** - Minimum 48x48px touch areas
3. **Minimal typing** - Toggles and steppers over text input
4. **Swipe navigation** - Swipe left/right between sections
5. **Visual feedback** - Animations and haptic feedback

### Mobile Layout (Vertical Swipe Sections)

```
┌─────────────────────────┐
│ [X]  Today's Log  67%   │
│ ════════════════════    │  ← Progress bar
│      • • ○ • •          │  ← Section dots
├─────────────────────────┤
│                         │
│        MORNING          │
│                         │
│   ┌───┐  ┌───┐  ┌───┐   │
│   │ ☕ │  │ 🚶 │  │ 🥐 │   │  ← Large tap targets
│   │    │  │ ✓ │  │    │   │
│   └───┘  └───┘  └───┘   │
│  Coffee  Walk  Breakfast│
│                         │
│    ◀                ▶   │  ← Swipe indicators
├─────────────────────────┤
│                         │
│  ┌─────────────────────┐│
│  │   💾 Save Habits    ││  ← Thumb-reachable
│  └─────────────────────┘│
└─────────────────────────┘
```

### Counter Section (Water, Pages, Dabs)

```
┌─────────────────────────┐
│        INTAKE           │
├─────────────────────────┤
│  💧 Water               │
│  ┌───┐    4    ┌───┐    │
│  │ - │         │ + │    │  ← Large buttons
│  └───┘         └───┘    │
├─────────────────────────┤
│  📖 Pages               │
│  ┌───┐   10    ┌───┐    │
│  │ - │         │ + │    │
│  └───┘         └───┘    │
└─────────────────────────┘
```

### API Consistency

Mobile uses the **same endpoints** as desktop:

```javascript
// Same upsert call works for both
const result = await upsertDailyLogToSheet({
  date: '2024-01-15',
  coffee: true,
  water_bottles_count: 4,
  // ... same schema
});
```

---

## Additional Input Channels

### 1. iOS/Android Widget (Recommended)

**Implementation**: React Native + Expo

```
┌──────────────────┐
│ HabitLoop Widget │
│ ┌──┐ ┌──┐ ┌──┐  │
│ │☕│ │💧│ │💪│  │  ← Tap to toggle/increment
│ └──┘ └──┘ └──┘  │
│ +4   +1   ✓     │
└──────────────────┘
```

**Data flow**:
- Widget taps call same Google Sheets webhook
- Uses device storage for optimistic updates
- Syncs on next full app open

### 2. SMS/Text Input

**Implementation**: Twilio + Cloud Function

```
You → SMS: "coffee, walk, water 6"
Bot → "✓ Logged: Coffee, Walk, Water (6)"
```

**Parser example**:
```javascript
function parseSMS(text) {
  const habits = {};
  
  // Match patterns
  if (/coffee/i.test(text)) habits.coffee = true;
  if (/walk/i.test(text)) habits.morning_walk = true;
  
  // Match counts: "water 6" or "6 water"
  const waterMatch = text.match(/water\s*(\d+)|(\d+)\s*water/i);
  if (waterMatch) habits.water_bottles_count = parseInt(waterMatch[1] || waterMatch[2]);
  
  return habits;
}
```

### 3. Email Daily Digest

**Implementation**: SendGrid + Scheduled Cloud Function

Daily email at 9 PM with clickable links:

```html
<h2>Log Today's Habits</h2>
<p>Click to confirm:</p>
<a href="webhook?coffee=true">☕ Had Coffee</a>
<a href="webhook?workout=Chest">💪 Workout: Chest</a>
<a href="webhook?water=4">💧 Water: 4 bottles</a>
...
<a href="app/full">📝 Full Form</a>
```

### 4. Slack/Discord Bot

**Implementation**: Slack Bolt / Discord.js

```
/habit coffee walk water:6
> ✓ Logged for Jan 15: Coffee, Walk, Water (6)

/habit status
> Today: 5/8 habits logged (62%)
> Missing: Teeth, Face, Bed time
```

### 5. Browser Extension (Chrome/Firefox)

**Implementation**: Chrome Extension with popup

```
┌─────────────────────┐
│ HabitLoop Quick Log │
├─────────────────────┤
│ [☕] [🚶] [💧+] [📖+] │
│ Click to toggle/add │
├─────────────────────┤
│ Today: 67% complete │
└─────────────────────┘
```

### 6. Apple Watch / Wear OS

**Complication**: Tap to log most common habits
**Full app**: Swipeable cards like mobile version

### Channel Comparison

| Channel | Speed | Convenience | Best For |
|---------|-------|-------------|----------|
| Desktop Quick Entry | ⭐⭐⭐ | ⭐⭐ | Full daily logging |
| Mobile App | ⭐⭐⭐ | ⭐⭐⭐ | On-the-go updates |
| Widget | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Quick increments |
| SMS | ⭐⭐ | ⭐⭐⭐⭐ | No app needed |
| Email | ⭐⭐ | ⭐⭐⭐ | Reminder + logging |
| Slack/Discord | ⭐⭐⭐ | ⭐⭐⭐ | Already in workspace |
| Browser Extension | ⭐⭐⭐⭐ | ⭐⭐⭐ | While browsing |

---

## Best Practices & Gamification

### 1. Streaks

Track consecutive days for each habit:

```javascript
function calculateStreak(logs, habitName) {
  let streak = 0;
  const sorted = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (const log of sorted) {
    if (log[habitName]) streak++;
    else break;
  }
  return streak;
}
```

Display: `🔥 7 day streak on Morning Walk!`

### 2. Completion Celebrations

```javascript
// Trigger confetti/animation at milestones
if (completionRate === 100) {
  showCelebration('🎉 Perfect day!');
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}
```

### 3. Smart Defaults

Pre-fill based on patterns:
- **Time-based**: Morning coffee usually at 7:30? Default that.
- **Day-based**: Always skip workout on Sundays? Default to "None".
- **Trend-based**: Average water is 5? Default to 5.

### 4. Micro-rewards

- **Sound effects**: Subtle "ding" on toggle
- **Visual feedback**: Sparkle animation on completion
- **Progress dopamine**: Animated progress ring filling

### 5. Friction Reduction

| Friction Point | Solution |
|----------------|----------|
| Forgot to log | Push notification at 9 PM |
| Too many fields | Quick mode with essentials only |
| Typing required | Toggles and presets |
| App not open | Widget on home screen |

### 6. Data Insights

Show motivating stats:
- "You've logged 847 consecutive days!"
- "Morning walks increased 23% this month"
- "Your mood is 'Good' or better 78% of the time"

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/google-sheets-write.ts` | Google Sheets write service |
| `src/components/QuickDailyEntry.tsx` | Desktop quick entry UI |
| `src/components/MobileQuickEntry.tsx` | Mobile-optimized UI |
| `src/hooks/useDailyLogs.ts` | Updated hooks for read/write |
| `GOOGLE_SHEETS_WRITE_SETUP.md` | Apps Script setup guide |
| `HABITLOOP_FAST_INPUT.md` | This documentation |

---

## Next Steps

1. **Set up Apps Script webhook** (see GOOGLE_SHEETS_WRITE_SETUP.md)
2. **Add `VITE_GOOGLE_SHEETS_WEBHOOK_URL` to .env**
3. **Test the Quick Daily Entry** at `/log`
4. **Consider mobile PWA** with service worker for offline
5. **Build widget** for fastest possible input

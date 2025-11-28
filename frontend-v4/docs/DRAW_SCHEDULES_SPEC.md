# Draw Schedules - Component Specification

## Overview
This document specifies the exact structure and behavior of the Draw Schedules component, based on the original Vue.js application at https://la-numbers.apk.lol/#/sortition-schedules

## Visual Structure

### Page Layout
```
┌─────────────────────────────────────────────────┐
│          Horarios de sorteos                     │
├─────────────────────────────────────────────────┤
│  [LOTTERY 1 (TIMEZONE)]                         │ ← Button (collapsed)
│  [LOTTERY 2 (TIMEZONE)]                         │ ← Button (collapsed)
│  ▼ LOTTERY 3 (TIMEZONE)                         │ ← Button (expanded)
│  ┌───────────────────────────────────────────┐  │
│  │ ┌────────┐  Nombre:      [DRAW NAME    ]  │  │
│  │ │ LOGO   │  Abreviación: [ABBR        ]  │  │
│  │ │ IMAGE  │  Color:       [🎨 Picker   ]  │  │
│  │ └────────┘                                │  │
│  ├───────────────────────────────────────────┤  │
│  │ Lunes:     [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Martes:    [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Miércoles: [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Jueves:    [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Viernes:   [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Sábado:    [12:00 AM] → [02:34 PM] [🗑]  │  │
│  │ Domingo:   [12:00 AM] → [02:34 PM] [🗑]  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │ [Second draw in same lottery...]          │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│           [ACTUALIZAR]                          │ ← Single save button
│                                                 │
│  [LOTTERY 4 (TIMEZONE)]                         │
└─────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Lottery Button (Collapsed State)
- **Appearance**: Full-width turquoise button
- **Text**: `LOTTERY_NAME (TIMEZONE)` in white, uppercase
- **Behavior**: Click to expand/collapse
- **Example**: `LOTERIA NACIONAL (AMERICA/SANTO_DOMINGO)`

### 2. Lottery Expanded Section
Contains ALL draws for that lottery

#### 2.1 Draw Header Section
**Layout**: Horizontal flex with logo on left, fields on right

**Logo**:
- Square image (approx 150x150px)
- White background
- Displays draw logo from server
- Clickable (may allow logo upload - TBD)

**Fields** (3 fields in column):
1. **Nombre** (Name)
   - Disabled text input
   - Gray background (#e9ecef)
   - Value from API: `drawName`
   - Display only, not editable

2. **Abreviación** (Abbreviation)
   - Disabled text input
   - Gray background (#e9ecef)
   - Value from API: `abbreviation`
   - Display only, not editable

3. **Color**
   - Color picker component
   - Shows current color as preview square
   - Click to open color picker
   - Value from API: `color` (hex format)

#### 2.2 Day Schedules Section
**Separator**: Horizontal line between header and days

**Each Day Row** (7 rows total):
- **Label**: Day name in Spanish (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)
- **Start Time**: Text input showing time (e.g., "12:00 AM")
- **Arrow Icon**: → symbol between times
- **End Time**: Text input showing time (e.g., "02:34 PM")
- **Delete Button**: Trash icon to remove this day's schedule

**Important**:
- ALL 7 days are ALWAYS visible
- Days without schedules show empty inputs
- Delete button removes the schedule for that day

### 3. Update Button
- **Text**: "ACTUALIZAR"
- **Position**: Below all expanded lotteries, centered
- **Color**: Turquoise (#51cbce)
- **Behavior**: Saves ALL changes for ALL draws in ALL expanded lotteries

## Data Structure

### API Response (GET /api/draws/schedules)
```json
[
  {
    "drawId": 1,
    "drawName": "GANA MAS",
    "abbreviation": "GM",
    "color": "#ff6b9d",
    "logoUrl": "https://...",
    "lotteryId": 5,
    "lotteryName": "LOTERIA NACIONAL",
    "timezone": "America/Santo_Domingo",
    "defaultDrawTime": "14:34:00",
    "useWeeklySchedule": true,
    "weeklySchedule": {
      "monday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "tuesday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "wednesday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "thursday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "friday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "saturday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true },
      "sunday": { "startTime": "00:00:00", "endTime": "14:34:00", "enabled": true }
    }
  }
]
```

### Update Payload (PATCH /api/draws/schedules)
```json
{
  "schedules": [
    {
      "drawId": 1,
      "useWeeklySchedule": true,
      "weeklySchedule": {
        "monday": { "startTime": "09:00:00", "endTime": "21:00:00", "enabled": true },
        ...
      }
    }
  ]
}
```

## Behavior Specifications

### 1. Initial Load
- Fetch all draw schedules from `/api/draws/schedules`
- Group draws by lottery
- All lotteries start collapsed
- Display lottery buttons in order

### 2. Expand/Collapse
- Click lottery button to toggle expansion
- Only one lottery expanded at a time (OR multiple allowed - TBD)
- Expanding loads draw data for that lottery

### 3. Editing Schedules
- User can modify start/end times for any day
- User can click color picker to change draw color
- Changes are tracked in component state (not saved immediately)

### 4. Delete Day Schedule
- Click trash icon to remove that day's schedule
- Set `enabled: false` for that day
- Clear the time inputs visually
- Change is tracked in state

### 5. Save Changes
- Click "ACTUALIZAR" button
- Collect all modified draws from ALL expanded lotteries
- Send PATCH request with all changes
- Show success/error notification
- Reload data to reflect saved state

## Component State Management

### State Variables
```javascript
const [lotteries, setLotteries] = useState([]);
const [expandedLotteryIds, setExpandedLotteryIds] = useState(new Set());
const [modifiedDraws, setModifiedDraws] = useState(new Map());
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
```

### Key Functions
- `loadDrawSchedules()` - Fetch data from API
- `groupDrawsByLottery(draws)` - Group draws by lottery
- `toggleLotteryExpansion(lotteryId)` - Expand/collapse lottery
- `handleTimeChange(drawId, day, field, value)` - Track time changes
- `handleColorChange(drawId, color)` - Track color changes
- `handleDeleteDay(drawId, day)` - Remove day schedule
- `handleSaveAll()` - Save all modifications

## Styling Requirements

### Colors
- Lottery buttons: `#51cbce` (turquoise)
- Button hover: `#45b8bb`
- Delete button: Red on hover
- Disabled inputs: `#e9ecef` background
- Arrow icon: Gray

### Fonts
- Font family: Montserrat, sans-serif
- Lottery button: 16px, uppercase, white
- Section labels: 14px
- Input text: 14px

### Spacing
- Lottery buttons: Full width, 8px gap between
- Draw sections: 16px padding
- Day rows: 8px gap between
- Update button: 24px margin top

## Differences from Current Implementation

### Current (WRONG)
❌ Modal dialog for editing
❌ Toggle switch for weekly schedule
❌ Days hidden until enabled
❌ HTML5 time inputs
❌ No logo display
❌ No color picker
❌ Individual save per draw
❌ Shows "Horario fijo: 12:00" for non-weekly

### Required (CORRECT)
✅ Inline editing (no modal)
✅ Always show weekly schedule
✅ All 7 days always visible
✅ Text inputs for times
✅ Logo display
✅ Color picker
✅ Single "Actualizar" button for all
✅ Show all draws when lottery expanded

## Implementation Priority

1. **Phase 1**: Basic structure
   - Remove modal
   - Create lottery accordion
   - Display all draws inline
   - Show all 7 days always

2. **Phase 2**: Functionality
   - Editable time inputs
   - Delete day functionality
   - Track modifications in state

3. **Phase 3**: Visual enhancements
   - Add color picker
   - Add logo display
   - Style to match original

4. **Phase 4**: Save functionality
   - Implement "Actualizar" button
   - Collect all modifications
   - Send to API
   - Handle success/error

## Testing Checklist

- [ ] Lottery buttons display with correct timezone
- [ ] Click lottery to expand/collapse
- [ ] All draws show for expanded lottery
- [ ] Logo displays correctly
- [ ] Name and Abbreviation are disabled/gray
- [ ] Color picker opens and changes color
- [ ] All 7 days visible for each draw
- [ ] Can edit start/end times
- [ ] Delete button removes day schedule
- [ ] "Actualizar" button saves all changes
- [ ] Success notification shows
- [ ] Data persists after reload

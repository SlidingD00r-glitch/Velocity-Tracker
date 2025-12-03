# Team Velocity Tracker

A minimal, local, client-side Team Velocity Tracker. Open `index.html` in your browser to use.

Features
- Import CSV (format below)
- Export current data to CSV
- Track three teams: Team Alpha, Team Beta, Team Gamma
- Dark mode (default)
- Simple chart view (Chart.js via CDN)

CSV format
- Header: `Label,<team1>,<team2>,<team3>` — the app maps columns positionally (label, team1, team2, team3).
- Each following row: label and numeric values for the three teams (integers between 1 and 40).
 - Each following row: label and numeric values for the three teams (integers between 0 and 40).

Total velocity
- The app includes a computed `Total` column which is the sum of the three team velocities for each row. The `Total` is shown in the table, included in the chart, and exported in CSV as the last column.
Team names
- Team names are editable in the app header. Changing them updates the table, chart, and exported CSV header.
 - Team names are editable in the app header. Changing them updates the table, chart, and exported CSV header.

Import notes
- CSV import maps columns by position, so header names do not need to match the in-app team names. For example, a CSV with header `Label,LDS-1,LDS-2,LDS-3` will import correctly by column order. The first column is always treated as the label column.

Persistence
- The app automatically saves data (rows and team names) to your browser's `localStorage`. On reload the saved state is restored.
- Use the `Clear Saved Data` button to clear the saved state and current rows.
 - The app automatically saves data (rows, team names, and story point results) to your browser's `localStorage`. On reload the saved state is restored.
 - The Story Point Calculator preserves the last workbook mapping and whether you chose to include Story Points in CSV export.
 - Use the `Clear Saved Data` button to clear the saved state and current rows.

Example
```
Label,Team Alpha,Team Beta,Team Gamma
Sprint 1,20,18,15
Sprint 2,24,21,19
```

Usage
- Open `index.html` in any modern browser.
- Use the file picker to import a CSV and the `Export CSV` button to download current data.
- Add rows manually using the form below the table.

Next steps (optional)
- Add persistent storage (localStorage) to save across browser reloads.
- Add CSV column mapping for different team names.
- Add per-team velocity averages and other analytics.

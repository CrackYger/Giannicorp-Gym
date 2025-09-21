# MIGRATION_SETUP_v0.12.1

**Schema-Version:** 9

**Änderungen**
- `plan_days`: `weekdays: number[] = []`, `notes: string = ""`, `last_completed_at: number | null = null`.
- `plan_day_exercises`: `group_type: "single"`, optional `group_id`, `alt_exercises: string[] = []`, optional `tempo`, `rest_between_exercises_sec: number = 0`.
- Defaults-Normalisierung (`workouts|templates|sets`):
  - `defaults.rest_sec ??= 90`
  - `defaults.note` → `defaults.notes` (String, Default `""`).

**Idempotenz**
- Migration kann mehrfach laufen, ohne Duplikate zu erzeugen.
- Felder werden nur gesetzt, wenn nicht vorhanden.

**Sync-Tabellen**
- Einheitliche Namen: `sync_state`, `_pending_changes`, `_sync_conflicts`.

**App-Version**
- `src/config/app.ts` exportiert `APP_VERSION = "0.12.1"` und wird in Export-Meta verwendet.

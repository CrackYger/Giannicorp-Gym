
# Giannicorp Gym – v0.10.0 Delta (Stabilität, Fehlertoleranz & Performance-Sweep)

**Ziel:** Keine neuen Features – reine Qualität: robuste Migrationen, Worker-/Heatmap-Stabilität, Sync-Härte, Crash-Guards, Logs-Export, kleine Performance-Wins, A11y/Safe-Areas.

## Dateien (neu/aktualisiert)
```
src/types/global.d.ts
src/db/schema.ts
src/db/client.ts
src/lib/time/iso.ts
src/lib/events/emitter.ts
src/lib/storage/StorageQuotaDialog.tsx
src/lib/logging/logger.ts
src/lib/exporter.ts
src/lib/importer.ts
src/lib/heatmap/cache.ts
src/lib/heatmap/workerClient.ts
src/workers/heatmap.worker.ts
src/components/errors/ErrorBoundary.tsx
src/components/guards/RouteGuard.tsx
src/components/guards/ActiveWorkoutGuard.tsx
src/components/layout/SafeArea.tsx
src/styles/safe-area.css
src/components/modal/Modal.tsx
src/components/VirtualList.tsx
src/features/profile/LogExportButton.tsx
src/lib/sync/deltaSync.ts
src/lib/auth/session.ts
```

## Minimaler Integrationsplan (copy & paste)

1) **Globaler ErrorBoundary + Safe Areas**
   ```tsx
   // src/main.tsx (oder App.tsx)
   import { ErrorBoundary } from "./components/errors/ErrorBoundary";
   import "./styles/safe-area.css";
   import { StorageQuotaDialog } from "./lib/storage/StorageQuotaDialog";

   root.render(
     <ErrorBoundary>
       <App />
       <StorageQuotaDialog />
     </ErrorBoundary>
   );
   ```

2) **Dexie-Client verwenden**
   ```ts
   import { db, openDB } from "./db/client";
   await openDB();
   ```

3) **Heatmap-Worker über Singleton**
   ```ts
   import { computeMuscleAgg } from "./lib/heatmap/workerClient";
   const { data, error } = await computeMuscleAgg({ period, sideMode, selectedView, excludeWarmups });
   if (error) { /* Fallback: leere Heatmap zeigen + Retry-Button */ }
   ```

4) **Cache-Invalidierung**
   ```ts
   import { invalidateMuscleAggCache } from "./lib/heatmap/cache";
   // Call whenever period/sideMode/selectedView/excludeWarmups oder Sets/Workouts im Zeitraum geändert werden:
   invalidateMuscleAggCache();
   ```

5) **Route-Guards**
   ```tsx
   import { RouteGuard } from "./components/guards/RouteGuard";
   import { ActiveWorkoutGuard } from "./components/guards/ActiveWorkoutGuard";

   <RouteGuard viewerUserId={viewerId} authUserId={authId} importOrSyncBlocking={isBlocking} isCoachViewer={isCoachViewer}>
     <ActiveWorkoutGuard hasActiveWorkout={hasActive} onContinueActive={continueActive} onAbortActive={abortActive} tryStartNew={startNew}>
       <StartOrLoggingScreen />
     </ActiveWorkoutGuard>
   </RouteGuard>
   ```

6) **Sync mit Backoff/401/Offline-Badge**
   ```ts
   import { createDeltaSync } from "./lib/sync/deltaSync";
   const sync = createDeltaSync({
     supabase,
     tables: ["exercises","sets","templates","badges","invites","coach_notes","exercise_settings","exercise_targets"],
     fetchTable: async (table, since) => {
       // Beispiel: vom Server geänderte Zeilen holen
       const res = await fetch(`/api/sync/${table}?since=${encodeURIComponent(since ?? "")}`);
       return { rows: await res.json(), status: res.status };
     },
     pushChanges: async (table, changes) => {
       const res = await fetch(`/api/sync/${table}`, { method: "POST", headers: { "content-type":"application/json" }, body: JSON.stringify({ changes }) });
       return { ok: res.ok, status: res.status };
     },
     onStatus: ({ offline, message }) => { /* Offline-Badge / Toast steuern */ },
   });
   await sync.runOnce();
   ```

7) **Auth-Lifecycle doppelt absichern**
   ```ts
   import { installAuthLifecycle } from "./lib/auth/session";
   installAuthLifecycle(supabase, (msg) => toast.error(msg));
   ```

8) **Logs exportieren**
   ```tsx
   import { LogExportButton } from "./features/profile/LogExportButton";
   <LogExportButton />
   ```

9) **VirtualList** (>200 Einträge)
   ```tsx
   import { VirtualList } from "./components/VirtualList";
   <VirtualList itemCount={items.length} itemHeight={64} renderItem={(i) => <Row item={items[i]} />} className="h-[70vh]" />
   ```

## Definition of Done – Checkliste
- App startet offline stabil, keine Crashes beim Wechsel der Ansichten/Zeiträume.
- Heatmap berechnet stabil, kein Doppel-Worker, Debounce ≥150ms, Fallback/Retry möglich.
- Sync übersteht Offline/Timeout/Token-Refresh; sinnvolle deutsche Statushinweise; RLS-Fehler werden angezeigt.
- Import/Export/Logs laufen ohne Freeze; große Dateien zeigen Fortschritt; Schema-Mismatch bricht sauber ab.
- Route-Guards verhindern Schreiben im Coach-Viewer; aktives Workout wird korrekt erzwungen.
- Lint/Typecheck/Build grün; weniger Re-Renders (Memo/VirtualList optional einsetzbar).

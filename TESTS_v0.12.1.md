## Smoke-Tests (5)
1) **Bulk-Add**
   - Öffne Plan-Editor → wähle einen Day → „Bulk-Add“.
   - Suche/Filter → wähle >=10 Übungen → Defaults setzen (z. B. 3×8–12 @ RPE8, Rest 90s).
   - Bestätigen → alle Einträge erscheinen (Rest/Notes angewandt). Re-Order per Drag, Entfernen via Button.
2) **Superset**
   - Zwei Übungen selektieren → unten „Superset“ + Rest 15 s → „Als Gruppe“.
   - Einträge werden orange gerahmt, Label „Superset A“. Start nach Plan → ActiveWorkout zeigt Gruppe mit Rest-Hinweis.
3) **Circuit**
   - Drei–vier Übungen selektieren → „Circuit“ + Rest 10 s → „Als Gruppe“.
   - Start nach Plan → ActiveWorkout zeigt Circuit, Groups alphabetisch (A/B/…).
4) **Weekdays**
   - Im Day-Header Mo/Do wählen. Start-Screen → Liste schlägt diesen Day an Mo/Do explizit vor.
   - Nach Abschluss (Workout abschließen) rotiert Vorschlag durch `last_completed_at`.
5) **Alt-Übung**
   - ActiveWorkout: Dropdown „Alternative …“ → z. B. „Seated Cable Row“ statt „Lat Pulldown“.
   - Satz-Quelle wechselt auf `alt` (intern), PR- und Logs bleiben konsistent.

## Abnahmetests (3)
1) **Migration idempotent**
   - App 2× starten → keine doppelten Felder, bestehende Pläne unverändert, keine Duplikate.
2) **End-to-End Geschwindigkeit**
   - Neuer Plan (Upper/Lower), Bulk-Add, 1 Superset pro Day, Weekdays setzen → „Nach Plan starten“ in ≤15 s (warm).
3) **Offline**
   - Flugmodus → Plan bearbeiten, Superset anlegen, Workout starten & speichern → Neustart zeigt persistierte Änderungen.

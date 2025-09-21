# Giannicorp Gym – v0.8.0 Coach/Client „Lite“ (Delta)

**Ziel:** Einladungen (Codes), Rollen (owner/coach/member), Consent fürs Teilen, Viewer (read-only), geteilte Templates.
**Kein** Eingriff in Heatmap/Progression/PR-Algorithmen. Offline-first bleibt.

## Inhalt
- `supabase/migrations/2025-09-11_v0_8_0_coach_client_lite.sql` — **Schema + RLS exakt nach Prompt**
- `src/features/coachlite/**` — UI/State/API (Viewer, Invites, Consent, Templates-Share, Coach-Notizen)
  - Keine bestehenden Dateien überschrieben. TS strict-ready.

## Integration
1) **SQL ausführen** (Supabase SQL Editor oder CLI). Policies/Trigger werden gesetzt.
2) **Ordner** `src/features/coachlite` kopieren.
3) **Routen** hinzufügen (Empfehlung):
   - `/profile/members` → `MembersManagePage`
   - `/join-space` → `JoinSpacePage`
4) **Top-Bar/Profil**:
   - `<ViewerSwitcher />` (zeigt „Ich“ + Clients mit Consent)
   - `<ConsentToggle />` im Profil (für Member)
5) **Workout-Detail**:
   - `<CoachNotesTab workoutId={...} />`
6) **Templates**:
   - In Editor: `<TemplateShareToggle id shared />`
   - In Picker: `<TemplateFilterBar onChange={...} />`

## Definition of Done (aus Prompt)
- Viewer-Switch (Ich/Clients mit Consent), read-only Daten.
- Consent-Toggle wirkt sofort.
- Invite-Flow Ende-zu-Ende (Erstellen → Beitreten → Consent).
- Templates Space-weit teilbar/findbar.
- RLS-Checks bestehen.

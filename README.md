# GianniCorp Fitness (React + Vite + Tailwind)

Mobile‑first Trainings‑Tracker für iPhone/iPad mit lokalem Speicher (LocalStorage).

## Schnellstart
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Features in dieser Alpha
- Übungen anlegen
- Plan(e) anlegen
- Workout starten, Sätze mit Gewicht + Wdh. loggen
- Verlauf ansehen + CSV‑Export
- Responsive: Sidebar (Desktop) / Tabbar (Mobile)

## Struktur
- `src/components/layout` – Sidebar, MobileNav
- `src/pages/*` – Seiten
- `src/store/*` – Zustand via Zustand Store
- `src/libs/*` – Utilities (Storage, CSV)
- `src/data/seed.ts` – Demo‑Daten (PPL)

## Nächste Schritte (Roadmap)
- PWA (Offline + Homescreen‑Icon)
- Statistiken/Charts (PRs willkommen)
- Satz‑Vorlagen pro Übung, 1RM‑Schätzung
- iCloud/Drive Export

## iOS (.ipa) – Weg über Capacitor + Xcode (Kurzfassung)
1. Repository erstellen (GitHub) und Code pushen.
2. Capacitor installieren und Projekt initialisieren:
   ```bash
   npm i @capacitor/core @capacitor/cli
   npx cap init "GianniCorpFitness" "com.giannicorp.fitness"
   npm run build
   npx cap add ios
   npx cap sync ios
   ```
3. Öffne `ios/App/App.xcworkspace` in Xcode. Wähle **Signing & Capabilities**:
   - Mit Apple‑ID (kostenlos) ein persönliches Team wählen → App wird **signiert** (7 Tage gültig).
4. Build auf ein angeschlossenes iPhone oder **Archive** → **Distribute App** → **Development** → `.ipa` exportieren.
5. **Sideloadly** nutzen und die `.ipa` auf iPhone/iPad laden.

**Hinweis:** iOS erlaubt keine Installation *unsignierter* `.ipa` Dateien. Auch bei Sideloadly brauchst du eine Signatur (kostenlos via Apple‑ID oder mit Entwicklerkonto).

## Lizenz
MIT

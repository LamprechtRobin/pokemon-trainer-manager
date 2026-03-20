# Pokemon Trainer Manager

Eine React-basierte Web-Anwendung zur Verwaltung von Pokemon-Trainern und ihren Teams.

## Features

- **Trainer-Verwaltung**: Erstelle und bearbeite Pokemon-Trainer mit Bildern und Beschreibungen
- **Pokemon-Teams**: Jeder Trainer kann unbegrenzt viele Pokemon in seinem Team haben
- **Pokemon-Transfer**: Pokemon können zwischen Trainern transferiert werden
- **PokeAPI-Integration**: Alle Pokemon (alle Generationen) mit deutschen Namen, Bildern, Typen und Stats
- **Dual-Type Support**: Pokemon können ein oder zwei Typen haben (z.B. "🔥 Fire / 🌪️ Flying")
- **Erfahrungssystem**: Einfaches 0-10 EXP-System mit Quick-Add-Buttons
- **Pokemon-Details**: Detaillierte Bearbeitung von Pokemon mit Level, EXP, Typen und Stats
- **Mobile-First Design**: Responsive Design mit Tailwind CSS
- **Supabase + Cloudflare R2**: Persistente Datenspeicherung mit Bild-Upload

## Technologie-Stack

- **Frontend**: React 18.2.0 mit TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **Database**: Supabase Postgres
- **Object Storage**: Cloudflare R2
- **API**: PokeAPI für Pokemon-Daten
- **Package Manager**: pnpm

## Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd pmon
```

2. Abhängigkeiten installieren:
```bash
pnpm install
```

3. `.env.local` mit Supabase- und R2-Variablen befuellen
4. SQL aus `supabase/schema.sql` im Supabase SQL Editor ausfuehren

5. Anwendung starten:
```bash
pnpm start
```

### Lokale API-Anbindung

Wenn du lokal mit `pnpm start` arbeitest, sind Vercel Functions unter `/api` nicht automatisch verfuegbar.
Setze dafuer in `.env.local` eine externe API-Base-URL:

```bash
REACT_APP_API_BASE_URL=https://deine-app.vercel.app
```

Alternativ kannst du lokal mit `vercel dev` starten, damit `/api` auch lokal aufgeloest wird.

## Struktur

- `src/components/` - Wiederverwendbare React-Komponenten
- `src/pages/` - Hauptseiten der Anwendung
- `src/services/` - API-Services (PokeAPI, Trainer API)
- `src/types/` - TypeScript-Interfaces
- `api/` - Vercel Functions (Supabase CRUD + R2 Storage)

## Pokemon-Features

- **Automatische Daten**: Beim Hinzufügen werden automatisch Bild, Typ(en) und Stats von der PokeAPI geladen
- **Deutsche Namen**: Alle Pokemon werden mit deutschen Namen angezeigt
- **Stats-Berechnung**: 
  - Angriff = max(Attack, Special Attack)
  - Verteidigung = Durchschnitt(Defense, Special Defense)
- **EXP-System**: 0-10 Erfahrungspunkte mit +/-1, +/-3, +/-5 Buttons

## Entwickelt mit Claude Code

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
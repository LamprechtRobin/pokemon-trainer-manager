# Pokemon Trainer Manager

Eine React-basierte Web-Anwendung zur Verwaltung von Pokemon-Trainern und ihren Teams.

## Features

- **Trainer-Verwaltung**: Erstelle und bearbeite Pokemon-Trainer mit Bildern und Beschreibungen
- **Pokemon-Teams**: Jeder Trainer kann bis zu 6 Pokemon in seinem Team haben
- **PokeAPI-Integration**: Alle Pokemon (alle Generationen) mit deutschen Namen, Bildern, Typen und Stats
- **Dual-Type Support**: Pokemon können ein oder zwei Typen haben (z.B. "🔥 Fire / 🌪️ Flying")
- **Erfahrungssystem**: Einfaches 0-10 EXP-System mit Quick-Add-Buttons
- **Pokemon-Details**: Detaillierte Bearbeitung von Pokemon mit Level, EXP, Typen und Stats
- **Mobile-First Design**: Responsive Design mit Tailwind CSS
- **Firebase Integration**: Persistente Datenspeicherung mit Firestore

## Technologie-Stack

- **Frontend**: React 18.2.0 mit TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router 7
- **Database**: Firebase Firestore
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

3. Firebase-Konfiguration in `src/firebase/config.ts` einrichten

4. Anwendung starten:
```bash
pnpm dev
```

## Struktur

- `src/components/` - Wiederverwendbare React-Komponenten
- `src/pages/` - Hauptseiten der Anwendung
- `src/services/` - API-Services (PokeAPI, Firebase)
- `src/types/` - TypeScript-Interfaces
- `src/firebase/` - Firebase-Konfiguration und Services

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
# Trainer Skill Sheet - Implementierungsplan

## Überblick
Ein druckbares Trainer Skill Sheet basierend auf dem neuen Pokemon Trainer Regelwerk für Pen & Paper Pokemon Spiele. Das Sheet soll alle 5 Basis-Attribute und zugehörigen Skills enthalten.

## Regelwerk Struktur

### Die 5 Basis-Attribute
- **Intelligenz** - Logisches Denken, Wissen, Problemlösung und strategische Planung
- **Geschicklichkeit** - Körperliche Koordination, Reflexe, Fingerfertigkeit und Präzision
- **Sozial** - Empathie, Menschenkenntnis, emotionale Intelligenz und Verständnis
- **Stärke** - Physische Kraft, Ausdauer, körperliche Belastbarkeit
- **Präsenz** - Charisma, Führungsqualitäten, Ausstrahlung und Überzeugungskraft

### Skills nach Basis-Attributen

#### Intelligenz Skills (7 Skills)
- **Pokemon Wissen** - Allgemeine Pokemon Kenntnisse
- **Typ-Wissen** - Pokemon-Typ Effektivitäten und Schwächen
- **Kampftaktik** - Strategische Kampfführung
- **Navigation** - Orientierung und Wegfindung
- **Forschung** - Wissenschaftliche Pokemon Studien
- **Computer** - Umgang mit Pokemon-Technologie
- **Erste Hilfe** - Medizinische Grundversorgung

#### Geschicklichkeit Skills (6 Skills)
- **Pokemon Fangen** - Wilde Pokemon erfolgreich fangen
- **Pokeball Handling** - Geschickter Umgang mit Pokeballs
- **Klettern** - Hindernisse überwinden
- **Schleichen** - Unbemerkt bewegen
- **Fahrzeuge** - Lenken von Fahrzeugen
- **Schlösser knacken** - Mechanische Rätsel lösen

#### Sozial Skills (5 Skills)
- **Pokemon Empathie** - Pokemon Gefühle verstehen
- **Verhandeln** - Geschäfte und Tausche abwickeln
- **Menschenkenntnis** - Menschen einschätzen
- **Teamwork** - Zusammenarbeit mit anderen
- **Beruhigen** - Pokemon und Menschen besänftigen

#### Stärke Skills (5 Skills)
- **Schwimmen** - Wasserhindernisse meistern
- **Laufen** - Ausdauer und Geschwindigkeit
- **Tragen** - Schwere Lasten bewegen
- **Klettern (Kraft)** - Kraftbasiertes Klettern
- **Ringen** - Körperlichen Widerstand überwinden

#### Präsenz Skills (5 Skills)
- **Pokemon Führung** - Pokemon befehligen und koordinieren
- **Überreden** - Andere von etwas überzeugen
- **Einschüchtern** - Durch Präsenz beeindrucken
- **Inspirieren** - Andere motivieren und anführen
- **Auftreten** - Öffentliche Präsentation

### Implementierung in der App

#### 1. Datenmodell erweitern
```typescript
interface TrainerSkills {
  // Basis Attribute (0-5 Punkte)
  intelligence: number;
  agility: number;
  social: number;
  strength: number;
  presence: number;
  
  // Intelligenz Skills (d4, d6, d8, d10, d12)
  pokemonKnowledge: string; // "d4", "d6", "d8", "d10", "d12" oder ""
  typeKnowledge: string;
  combatTactics: string;
  navigation: string;
  research: string;
  computer: string;
  firstAid: string;
  
  // Geschicklichkeit Skills
  pokemonCatching: string;
  pokeballHandling: string;
  climbing: string;
  stealth: string;
  vehicles: string;
  lockpicking: string;
  
  // Sozial Skills
  pokemonEmpathy: string;
  negotiation: string;
  insight: string;
  teamwork: string;
  calming: string;
  
  // Stärke Skills
  swimming: string;
  running: string;
  carrying: string;
  powerClimbing: string;
  wrestling: string;
  
  // Präsenz Skills
  pokemonLeadership: string;
  persuasion: string;
  intimidation: string;
  inspiration: string;
  performance: string;
  
  // Optional
  disadvantage?: string;
  specialAbility?: string;
}
```

#### 2. Skill Sheet Generator Komponente
- **TrainerSkillSheet.tsx** - Hauptkomponente für das Skill Sheet
- **AttributeInput.tsx** - Eingabefeld für Basis-Attribute (0-5)
- **SkillInput.tsx** - Dropdown für Skill-Stufen (d4, d6, d8, d10, d12)
- **SkillSection.tsx** - Sektion für Skills gruppiert nach Basis-Attributen
- **PointCalculator.tsx** - Berechnet verfügbare/verwendete Skill-Level

#### 3. Print-optimierte Darstellung
- CSS Media Queries für Druckansicht
- A4-Format optimiert
- Schwarz-weiß Darstellung
- Minimaler Tintenverbrauch
- Klare Tabellen und Felder zum Ausfüllen
- 5 Basis-Attribute Sektionen
- 28 Skills gruppiert nach Attributen

#### 4. Punkt-Verteilungs-System
```typescript
// Basis-Attribute: 15 Punkte zu verteilen (0-5 pro Attribut)
const calculateSkillLevels = (attributePoints: number): number => {
  return attributePoints; // Jeder Attribut-Punkt = 1 Skill-Level
};

// Skill-Level zu Würfelstufe konvertieren
const skillLevelToDie = (levels: number): string => {
  const dieMap = { 0: "", 1: "d4", 2: "d6", 3: "d8", 4: "d10", 5: "d12" };
  return dieMap[levels] || "";
};
```

#### 5. Export Funktionen
- **PDF Export** - Direkt druckbares PDF
- **JSON Export** - Daten-Backup
- **CSV Export** - Tabellenkalkulation Import

## UI/UX Design

### Layout Struktur
```
┌─────────────────────────────────────┐
│           TRAINER INFO              │
│  Name: ____________  Alter: ____    │
│  Region: __________               │
├─────────────────────────────────────┤
│         BASIS ATTRIBUTE (15 Punkte) │
│  Intelligenz: [0-5]  Geschick: [0-5]│
│  Sozial: [0-5]      Stärke: [0-5]  │
│  Präsenz: [0-5]     Übrig: __      │
├─────────────────────────────────────┤
│         INTELLIGENZ SKILLS (__ Level)│
│  Pokemon Wissen:     [d4-d12]      │
│  Typ-Wissen:         [d4-d12]      │
│  Kampftaktik:        [d4-d12]      │
│  Navigation:         [d4-d12]      │
│  Forschung:          [d4-d12]      │
│  Computer:           [d4-d12]      │
│  Erste Hilfe:        [d4-d12]      │
├─────────────────────────────────────┤
│         GESCHICKLICHKEIT SKILLS     │
│  Pokemon Fangen:     [d4-d12]      │
│  Pokeball Handling:  [d4-d12]      │
│  Klettern:           [d4-d12]      │
│  Schleichen:         [d4-d12]      │
│  Fahrzeuge:          [d4-d12]      │
│  Schlösser knacken:  [d4-d12]      │
├─────────────────────────────────────┤
│         SOZIAL SKILLS               │
│  Pokemon Empathie:   [d4-d12]      │
│  Verhandeln:         [d4-d12]      │
│  Menschenkenntnis:   [d4-d12]      │
│  Teamwork:           [d4-d12]      │
│  Beruhigen:          [d4-d12]      │
├─────────────────────────────────────┤
│         STÄRKE SKILLS               │
│  Schwimmen:          [d4-d12]      │
│  Laufen:             [d4-d12]      │
│  Tragen:             [d4-d12]      │
│  Klettern (Kraft):   [d4-d12]      │
│  Ringen:             [d4-d12]      │
├─────────────────────────────────────┤
│         PRÄSENZ SKILLS              │
│  Pokemon Führung:    [d4-d12]      │
│  Überreden:          [d4-d12]      │
│  Einschüchtern:      [d4-d12]      │
│  Inspirieren:        [d4-d12]      │
│  Auftreten:          [d4-d12]      │
├─────────────────────────────────────┤
│         OPTIONAL                    │
│  Nachteil: __________________       │
│  Spezielle Fähigkeit: ____________  │
│  Ausrüstung: 6 Pokeballs, Pokedex  │
│  Notizen: ______________________    │
└─────────────────────────────────────┘
```

### Features
- **Punkte-Verteilung** - 15 Punkte auf Basis-Attribute
- **Skill-Level Tracker** - Verfügbare Level pro Attribut
- **Dropdown Auswahl** - d4, d6, d8, d10, d12 für Skills
- **Automatische Validierung** - Kann nicht mehr Level vergeben als verfügbar
- **Nachteile/Vorteile** - Optional für extra Punkte
- **Notizen Bereich** - Freie Textfelder für Besonderheiten

## Implementierungsschritte

### Phase 1: Datenmodell & Backend
1. TrainerSkills Interface erweitern (5 Basis-Attribute + 28 Skills)
2. Firebase Schema anpassen für neues Skill-System
3. CRUD Operationen für Skills implementieren

### Phase 2: UI Komponenten
1. AttributeInput Komponenten erstellen (0-5 Punkte)
2. SkillInput Dropdowns implementieren (d4-d12)
3. PointCalculator für Skill-Level Tracking
4. Skill Sheet Layout mit 5 Sektionen

### Phase 3: Funktionalität
1. Punkte-Verteilungs-System implementieren
2. Skill-Level zu Würfelstufe Konvertierung
3. Validierung: Nicht mehr Level als verfügbar
4. Export Funktionen (PDF, JSON)

### Phase 4: Integration
1. Skill Sheet in bestehende Trainer Profile integrieren
2. Druckfunktion testen und optimieren (A4)
3. Mobile Responsiveness sicherstellen

## Technische Anforderungen

### Dependencies
```json
{
  "react-to-print": "^2.14.15",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Neue Dateien
- `src/components/SkillSheet/TrainerSkillSheet.tsx`
- `src/components/SkillSheet/AttributeInput.tsx`
- `src/components/SkillSheet/SkillInput.tsx`
- `src/components/SkillSheet/SkillSection.tsx`
- `src/components/SkillSheet/PointCalculator.tsx`
- `src/types/skills.ts`
- `src/utils/skillCalculator.ts`
- `src/styles/print.css`

### CSS Print Optimierung
```css
@media print {
  .skill-sheet {
    background: white;
    font-size: 12pt;
    page-break-inside: avoid;
  }
  
  .no-print {
    display: none !important;
  }
}
```

## Zukünftige Erweiterungen
- **Trainer Templates** - Vorgefertigte Basis-Attribut Verteilungen (Forscher, Kämpfer, etc.)
- **Campaign Integration** - Erfahrungspunkte und Skill-Entwicklung verfolgen
- **Group Sheets** - Mehrere Trainer auf einem Sheet
- **Digital Dice Roller** - Integrierte Würfel-Simulation mit Wild Die
- **Skill Challenges** - Vordefinierte Schwierigkeitsgrade für verschiedene Aktionen
- **Pokemon Team Integration** - Skill-Boni basierend auf Pokemon-Team
- **Region-spezifische Skills** - Zusätzliche Skills je nach Pokemon-Region
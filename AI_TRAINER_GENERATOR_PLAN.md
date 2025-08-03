# KI-Gestützte Trainer-Generierung - Implementation Plan

## Übersicht
Implementierung einer Gemini-basierten Trainer-Generierung, die aus einem User-Prompt einen vollständigen Trainer mit Pokemon-Team, Stats und Items erstellt.

## 1. Gemini Service Erweiterung

### 1.1 Neue Service-Methode: `generateTrainer()`
- **Input:** User-Prompt (z.B. "Erstelle einen Feuerwehr-Trainer mit Feuer-Pokemon")
- **Output:** Validiertes Trainer-JSON
- **Features:**
  - Strukturierter System-Prompt mit JSON-Schema
  - Fallback-Mechanismen bei invaliden Responses
  - Retry-Logic für robuste Generierung

### 1.2 Prompt Engineering
- **System-Prompt:** Detaillierte Anweisungen für JSON-Struktur
- **Constraints:** Level 1-100, 1-6 Pokemon, realistische Stats
- **Examples:** Beispiel-Trainer für bessere AI-Performance
- **Schema:** Exakte TypeScript-Interface-Definition im Prompt

## 2. Validation Pipeline

### 2.1 Schema Validation
- **Zod-Schema:** Strenge Type-Validation für AI-Response
- **Struktur-Check:** Alle Required Fields vorhanden
- **Datentyp-Validation:** Numbers, Strings, Arrays korrekt

### 2.2 Pokemon Validation
- **PokeAPI Integration:** Namen-Validation gegen offizielle Pokemon-DB
- **Stat-Plausibilität:** Level-basierte Stat-Ranges
- **Attacken-Check:** Gegen bestehende `attacks.json` validieren
- **Type-Validation:** Gegen PokeAPI Type-System

### 2.3 Business Logic Validation
- **Team-Balance:** Type-Coverage-Analyse
- **Level-Realismus:** Anfänger vs. Experten-Trainer Logic
- **Attacken-Lernbarkeit:** Pokemon können diese Attacken lernen
- **Shiny-Rate:** Realistische Shiny-Wahrscheinlichkeit

## 3. UI Components

### 3.1 AITrainerGenerator Component
```typescript
interface AITrainerGeneratorProps {
  onGenerate: (trainer: Trainer) => void;
  onCancel: () => void;
}
```
- **Prompt-Input:** Freitext-Eingabe für User-Wünsche
- **Generation-Progress:** Loading-States mit Fortschritt
- **Preview-Mode:** Generierter Trainer vor Bestätigung anzeigen
- **Edit-Mode:** Manuelle Nachbearbeitung möglich

### 3.2 Integration in AddTrainerForm
- **Mode-Selector:** Manual vs. AI Generation
- **Tabs:** "Manuell erstellen" / "KI generieren"
- **Hybrid-Mode:** AI-Generated + Manual-Edits

### 3.3 TrainerPreview Component
- **Team-Übersicht:** Pokemon mit Stats und Attacken
- **Validation-Status:** Grün/Gelb/Rot Indicators
- **Quick-Edit:** Inline-Editing für kleine Korrekturen

## 4. Data Processing Pipeline

### 4.1 Pokemon Data Enrichment
- **Image-URLs:** Von PokeAPI fetchen
- **Missing-Stats:** Auto-calculation basierend auf Level
- **Type-Info:** Primary/Secondary Types ergänzen
- **Abilities:** Standard-Abilities zuweisen

### 4.2 Stat Calculation
- **Base-Stats:** Von PokeAPI laden
- **Level-Scaling:** Realistische Stat-Berechnung
- **Talent-Points:** Automatische Verteilung basierend auf Trainer-Typ
- **IV-Simulation:** Random Individual Values

### 4.3 Attack Assignment
- **Learnable-Moves:** Von PokeAPI + attacks.json
- **Level-Appropriate:** Nur Attacken die das Pokemon kennen kann
- **Moveset-Quality:** Balanced Attack/Defense/Status mix

## 5. Error Handling & Fallbacks

### 5.1 AI Response Errors
- **Invalid JSON:** Retry mit verbessertem Prompt
- **Missing Fields:** Default-Werte einsetzen
- **Unrealistic Data:** Auto-Correction Algorithms

### 5.2 Pokemon API Errors
- **Unknown Pokemon:** Suggest similar valid Pokemon
- **API Down:** Fallback zu local Pokemon database
- **Rate Limiting:** Queue-System für Requests

### 5.3 User Experience
- **Progressive Enhancement:** Schritt-für-Schritt Generation
- **Error Messages:** Klare Erklärungen was schiefgelaufen ist
- **Retry Options:** "Nochmal versuchen" / "Manuell korrigieren"

## 6. Quality Assurance Features

### 6.1 Team Analysis
- **Type Coverage:** Wie viele Pokemon-Types abgedeckt
- **Level Distribution:** Realistische Level-Spreads
- **Role Coverage:** Tank/DPS/Support Balance
- **Weakness Analysis:** Team-Schwächen identifizieren

### 6.2 Realism Checks
- **Trainer-Type Matching:** Feuerwehrmann hat Feuer-Pokemon
- **Experience Level:** Anfänger haben schwächere Teams
- **Regional Matching:** Pokemon passen zur Trainer-Herkunft
- **Item Appropriateness:** Realistische Item-Auswahl

### 6.3 Auto-Improvements
- **Stat Optimization:** Suboptimale Stats korrigieren
- **Move Suggestions:** Bessere Attacken vorschlagen
- **Item Recommendations:** Passende Items hinzufügen
- **Balance Adjustments:** Zu starke/schwache Teams anpassen

## 7. Implementation Steps

### Phase 1: Core Generation
1. Gemini Service für Trainer-Generation
2. Basic JSON Validation
3. Simple UI Component
4. Integration in AddTrainerForm

### Phase 2: Pokemon Integration
1. PokeAPI Data Enrichment
2. Stat Calculation System
3. Attack Validation Pipeline
4. Image URL Generation

### Phase 3: Quality & UX
1. Advanced Validation Rules
2. Preview & Edit Components
3. Error Handling & Fallbacks
4. Team Analysis Features

### Phase 4: Polish & Optimization
1. Performance Optimizations
2. Advanced Prompt Engineering
3. User Feedback Integration
4. Additional Trainer Types

## 8. File Structure
```
src/
├── services/
│   ├── aiTrainerGenerator.ts    # Main AI generation logic
│   ├── trainerValidator.ts      # Validation pipeline
│   └── pokemonEnricher.ts       # PokeAPI data enrichment
├── components/
│   ├── AITrainerGenerator.tsx   # Main generator UI
│   ├── TrainerPreview.tsx       # Preview component
│   └── ValidationStatus.tsx     # Validation indicators
└── types/
    └── aiTrainer.ts            # AI-specific type definitions
```

## 9. Testing Strategy
- **Unit Tests:** Validation functions
- **Integration Tests:** PokeAPI integration
- **E2E Tests:** Complete generation flow
- **AI Tests:** Prompt consistency checks

## 10. Beispiel-Prompts für Testing

### Einfache Prompts
- "Erstelle einen Anfänger-Trainer mit Pikachu"
- "Ein Feuerwehr-Trainer mit Feuer-Pokemon"
- "Wassersport-Trainer aus Hamburg"

### Komplexe Prompts
- "Erfahrener Team Rocket Bösewicht mit starken Dark/Poison Pokemon, Level 40-60"
- "Gym Leader für Psycho-Pokemon mit ausgewogenem Team"
- "Pokémon-Professor mit seltenen und geforscher Pokemon"

### Edge Cases
- "Trainer ohne Pokemon" (sollte mindestens 1 Pokemon generieren)
- "Team mit 10 Pokemon" (sollte auf 6 begrenzen)
- "Alle Level 100 Pokemon" (sollte realistischer machen)

## 11. Mögliche Erweiterungen

### Zukunftige Features
- **Trainer-Persönlichkeiten:** Shy, Aggressive, Friendly
- **Regional-Variants:** Alola, Galar Forms
- **Mega-Evolution Support**
- **Z-Moves Integration**
- **Team-Synergien:** Weather Teams, Trick Room, etc.
- **Competitive-Mode:** VGC-konforme Teams
- **Story-Integration:** Teams passend zur Lore

### Community Features
- **Trainer-Templates:** Vordefinierte Trainer-Typen
- **User-Ratings:** Community kann AI-Trainer bewerten
- **Sharing:** Generated Trainer teilen
- **Tournaments:** AI vs AI Battles

## 12. Performance Considerations

### Optimizations
- **Caching:** PokeAPI responses cachen
- **Batch-Requests:** Multiple Pokemon parallel laden
- **Lazy-Loading:** Bilder erst bei Bedarf laden
- **Request-Debouncing:** AI-Requests limitieren

### Monitoring
- **Generation-Success-Rate:** Wie oft schlägt AI-Generation fehl
- **Validation-Metrics:** Welche Validierungen schlagen häufig fehl
- **Performance-Metrics:** Generierungszeit tracken
- **User-Satisfaction:** Feedback über generierte Trainer

---

*Dieses Dokument kann während der Entwicklung angepasst und erweitert werden.*
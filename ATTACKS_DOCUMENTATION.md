# Pokemon Attacken System

## Dateistruktur

Die Attacken sind jetzt in separaten Dateien organisiert:
- `src/data/attacks/base-attacks.json` - Base-Attacken (100% Genauigkeit)
- `src/data/attacks/power-attacks.json` - Power-Attacken (70% Genauigkeit)

Der `attackService.ts` kombiniert automatisch beide Dateien über `getAllAttacks()`.

## Übersicht

Das Spiel bietet zwei verschiedene Kategorien von Attacken für jede Pokemon-Type:

## Base Attacken (Erste 18 Typen)
- **Genauigkeit**: 100%
- **Stärke**: 4 → 7 → 10 (Tier 1 → 2 → 3)
- **Charakteristik**: Zuverlässig und präzise

### Beispiel: Normal Type
- Tackle (4 Power, 100% Accuracy) → Bodyslam (7 Power) → Hyperstrahl (10 Power)

## Power Attacken (power-attacks.json)
- **Genauigkeit**: 70%
- **Stärke**: 8 → 12 → 16 (Tier 1 → 2 → 3)
- **Charakteristik**: Risiko/Belohnung - höhere Stärke, aber können verfehlen

### Beispiel: Normal Type
- Megahieb (8 Power, 70% Accuracy) → Gigastoß (12 Power) → Explosion (16 Power)

## Neue attackService API

```typescript
// Alle Attacken (kombiniert)
attackService.getAllAttacks()

// Nur Base-Attacken
attackService.getBaseAttacks()

// Nur Power-Attacken
attackService.getPowerAttacks()
```

## Vollständige Liste der Power-Attacken

### Normal Type
1. Megahieb → Gigastoß → Explosion

### Fire Type
2. Feuerschlag → Hitzekoller → Lohekanonade

### Water Type
3. Kaskade → Nassschweif → Aquahaubitze

### Electric Type
4. Donnerschlag → Ladungsstoß → Blitzkanone

### Grass Type
5. Rankenhieb → Machtpeitsche → Florakraft

### Ice Type
6. Eishieb → Eisscherbe → Eiseskälte

### Fighting Type
7. Wuchtschlag → Kraftkoloss → Power-Punch

### Poison Type
8. Gifthieb → Toxin → Giftzahn

### Ground Type
9. Knochenkeule → Erdkräfte → Abgrundsklinge

### Flying Type
10. Flügelschlag → Sturzflug → Himmelsangriff

### Psychic Type
11. Psystrahl → Seher → Psychoschub

### Bug Type
12. Nadelrakete → Kreuzschere → Angriffsbefehl

### Rock Type
13. Felswurf → Kopfstoß → Diamantsturm

### Ghost Type
14. Nachtnebel → Phantomkraft → Astralbarrage

### Dragon Type
15. Windhose → Drachenklaue → Zeitenlärm

### Dark Type
16. Finte → Nachthieb → Schlummerort

### Steel Type
17. Patronenhieb → Lichtkanone → Kismetwunsch

### Fairy Type
18. Charme → Knuddler → Ruinenlicht

## Strategische Überlegungen

### Base Attacken (base-attacks.json)
- **Vorteile**: Garantierter Treffer, zuverlässiger Schaden
- **Nachteile**: Geringere maximale Schadenswerte
- **Ideal für**: Anfänger, sichere Strategien, niedrige Level
- **Datei**: `src/data/attacks/base-attacks.json`

### Power Attacken (power-attacks.json)
- **Vorteile**: Höhere Schadenswerte, größeres Potenzial
- **Nachteile**: 30% Chance zu verfehlen, riskanter
- **Ideal für**: Fortgeschrittene Spieler, Hochlevel-Pokemon, Risiko-Strategien
- **Datei**: `src/data/attacks/power-attacks.json`

## Balance

Das System bietet strategische Entscheidungen:
- Sicherheit vs. Schaden
- Zuverlässigkeit vs. Potenzial
- Verschiedene Spielstile werden unterstützt
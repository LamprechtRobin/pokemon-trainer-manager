# Runware AI Integration Setup

## Übersicht
Die Pokemon Trainer Manager App nutzt jetzt Runware AI für die automatische Bildgenerierung von Trainern.

## Setup

### 1. Runware API Key erhalten
1. Gehe zu [runware.ai](https://runware.ai)
2. Erstelle einen Account oder melde dich an
3. Navigiere zu deinem Dashboard
4. Generiere einen API Key

### 2. API Key konfigurieren
Füge deinen Runware API Key in die `.env` Datei ein:

```env
REACT_APP_RUNWARE_API_KEY=dein_runware_api_key_hier
```

⚠️ **Wichtig:** Stelle sicher, dass die `.env` Datei nicht in Git committet wird (sie sollte in `.gitignore` stehen).

### 3. Funktionalität
- **Automatische Bildgenerierung:** Beim Erstellen von AI-Trainern werden automatisch passende Bilder generiert
- **Manuelle Bildgenerierung:** Im Trainer-Bearbeiten-Modus kann für bestehende Trainer ein neues Bild generiert werden
- **Anime-Stil:** Optimiert für Pokemon-Trainer im Anime-Stil
- **Automatische URL-Einfügung:** Generierte Bilder werden automatisch in das URL-Feld eingefügt
- **Fallback:** Bei Fehlern wird der Trainer ohne Bild erstellt/gelassen

## API Details

### Verwendete Runware-Parameter
- **Model:** `runware:100@1` (Standard Stable Diffusion Model)
- **Auflösung:** 512x512px (konfigurierbar)
- **Guidance Scale:** 7 (für gute Prompt-Befolgung)
- **Steps:** 20 (gute Balance zwischen Qualität und Geschwindigkeit)

### Prompt-Optimierung
Die App erstellt automatisch optimierte Prompts:
- **Anime-Stil:** "anime style Pokemon trainer portrait"
- **Trainer-Details:** Name und Beschreibung werden eingebaut
- **Pokemon-Kontext:** "Pokemon world setting, confident pose"
- **Qualitäts-Keywords:** "high quality, detailed, studio quality"

## Kosten
- Runware berechnet pro generiertem Bild
- Preise variieren je nach gewähltem Model und Auflösung
- Prüfe die aktuellen Preise auf [runware.ai/pricing](https://runware.ai/pricing)

## Fehlerbehebung

### "API Key nicht gefunden"
- Überprüfe, dass `REACT_APP_RUNWARE_API_KEY` in der `.env` Datei gesetzt ist
- Starte die App neu nach Änderungen an der `.env`

### "Bildgenerierung fehlgeschlagen"
- Prüfe dein Runware-Guthaben
- Überprüfe die Netzwerkverbindung
- Schaue in die Browser-Konsole für detaillierte Fehlermeldungen

### API-Limits
- Runware hat eventuell Rate-Limits
- Bei häufiger Nutzung plane entsprechende Pausen ein

## Verwendung

### Automatische Bildgenerierung (AI-Trainer)
1. Neuen Trainer mit AI-Generator erstellen
2. "Bild generieren" aktivieren
3. Runware generiert automatisch ein passendes Trainer-Bild

### Manuelle Bildgenerierung (Bestehende Trainer)
1. Trainer-Profil öffnen
2. "Bearbeiten" klicken
3. Im Bild-Bereich auf "🎨 Bild mit AI generieren" klicken
4. Runware generiert Bild basierend auf Name und Beschreibung
5. Generierte URL wird automatisch eingefügt
6. "Speichern" klicken

## Migration von Hugging Face
Alle Hugging Face Referenzen wurden entfernt und durch Runware ersetzt:
- ✅ `imageGenerationService.ts` komplett neu implementiert mit Runware API
- ✅ `TrainerDetail.tsx` Dummy-Implementation ersetzt
- ✅ `GenerationSettings.tsx` UI-Text angepasst
- ✅ `.env.example` erweitert
- ✅ API-Listen aktualisiert

Die bestehende API-Schnittstelle bleibt gleich, sodass alle bestehenden Komponenten weiterhin funktionieren.
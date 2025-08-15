import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { backupService } from '../services/backupService';

const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [backupSummary, setBackupSummary] = useState<{
    totalTrainers: number;
    totalPokemon: number;
    lastBackupTime?: string;
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    loadBackupSummary();
  }, []);

  const loadBackupSummary = async () => {
    try {
      const summary = await backupService.getBackupSummary();
      setBackupSummary(summary);
    } catch (error) {
      console.error('Error loading backup summary:', error);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await backupService.exportTrainers();
      backupService.setLastBackupTime();
      await loadBackupSummary(); // Refresh summary
      alert('Backup erfolgreich erstellt und heruntergeladen!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Erstellen des Backups: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input
    event.target.value = '';

    if (!file.name.endsWith('.json')) {
      alert('Bitte wähle eine JSON-Datei aus.');
      return;
    }

    const confirmImport = window.confirm(
      'Warnung: Diese Aktion wird neue Trainer aus der Backup-Datei importieren. ' +
      'Bestehende Trainer mit gleichen Namen werden übersprungen. Fortfahren?'
    );

    if (!confirmImport) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const result = await backupService.importTrainers(file);
      setImportResult(result);
      await loadBackupSummary(); // Refresh summary
      
      let message = `Import abgeschlossen!\n`;
      message += `• ${result.imported} Trainer importiert\n`;
      message += `• ${result.skipped} Trainer übersprungen (bereits vorhanden)\n`;
      if (result.errors.length > 0) {
        message += `• ${result.errors.length} Fehler aufgetreten`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Import error:', error);
      alert('Fehler beim Importieren: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setImportLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Zurück zur Übersicht
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Datenbank Backup</h1>
          <p className="text-gray-600">Sichere deine Trainer-Daten oder stelle sie wieder her</p>
        </div>

        {/* Current Data Summary */}
        {backupSummary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aktuelle Datenbank</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{backupSummary.totalTrainers}</div>
                <div className="text-sm text-blue-800">Trainer</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{backupSummary.totalPokemon}</div>
                <div className="text-sm text-green-800">Pokemon</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-600">Letztes Backup</div>
                <div className="text-xs text-purple-800">
                  {backupSummary.lastBackupTime 
                    ? formatDate(backupSummary.lastBackupTime)
                    : 'Noch kein Backup erstellt'
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📤 Backup erstellen</h2>
            <p className="text-gray-600 mb-6">
              Lade alle deine Trainer-Daten als JSON-Datei herunter. Diese Datei kann später zur 
              Wiederherstellung verwendet werden.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Was wird gesichert?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Alle Trainer-Profile</li>
                  <li>• Pokemon-Teams mit allen Details</li>
                  <li>• Items und Inventar</li>
                  <li>• Trainer-Bilder (URLs)</li>
                  <li>• Alle gelernten Attacken</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loading ? '⏳ Erstelle Backup...' : '📤 Backup herunterladen'}
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📥 Backup wiederherstellen</h2>
            <p className="text-gray-600 mb-6">
              Lade Trainer-Daten aus einer Backup-Datei. Bestehende Trainer werden nicht überschrieben.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">⚠️ Wichtige Hinweise</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Trainer mit gleichen Namen werden übersprungen</li>
                  <li>• Nur gültige JSON-Backup-Dateien werden akzeptiert</li>
                  <li>• Der Import kann nicht rückgängig gemacht werden</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importLoading}
                  className="hidden"
                  id="backup-file-input"
                />
                <label
                  htmlFor="backup-file-input"
                  className={`cursor-pointer inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    importLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {importLoading ? '⏳ Importiere...' : '📁 Backup-Datei auswählen'}
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Wähle eine JSON-Backup-Datei aus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Import-Ergebnis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-green-800">Importiert</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                <div className="text-sm text-yellow-800">Übersprungen</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-red-800">Fehler</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">Fehler beim Import:</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Backup-Tipps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Regelmäßige Backups</h3>
              <p className="text-sm text-gray-600">
                Erstelle regelmäßig Backups, besonders nach wichtigen Änderungen an deinen Trainern oder 
                Pokemon-Teams. Die Backup-Datei ist klein und schnell erstellt.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sichere Aufbewahrung</h3>
              <p className="text-sm text-gray-600">
                Speichere deine Backup-Dateien an einem sicheren Ort, z.B. in einer Cloud oder auf einem 
                anderen Gerät. So sind deine Daten auch bei Problemen geschützt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
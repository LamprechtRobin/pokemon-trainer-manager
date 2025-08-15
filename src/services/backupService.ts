import { trainerService } from '../firebase/trainerService';
import { Trainer } from '../types/trainer';

interface BackupData {
  timestamp: string;
  version: string;
  trainers: Trainer[];
  metadata: {
    totalTrainers: number;
    totalPokemon: number;
    exportedBy: string;
  };
}

export const backupService = {
  /**
   * Export all trainer data to JSON file
   */
  async exportTrainers(): Promise<void> {
    try {
      console.log('Starting trainer data export...');
      const trainers = await trainerService.getAllTrainers();
      
      const totalPokemon = trainers.reduce((total, trainer) => 
        total + (trainer.team || []).length, 0
      );

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        trainers,
        metadata: {
          totalTrainers: trainers.length,
          totalPokemon,
          exportedBy: 'Pokemon Trainer Manager'
        }
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trainer-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log(`Backup completed: ${trainers.length} trainers, ${totalPokemon} Pokemon exported`);
      return;
    } catch (error) {
      console.error('Error exporting trainers:', error);
      throw new Error('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  /**
   * Import trainers from JSON backup file
   */
  async importTrainers(file: File): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backupData: BackupData = JSON.parse(content);
          
          // Validate backup structure
          if (!this.validateBackupData(backupData)) {
            throw new Error('Invalid backup file format');
          }

          console.log(`Importing ${backupData.trainers.length} trainers from backup...`);
          
          // Get existing trainers to avoid duplicates
          const existingTrainers = await trainerService.getAllTrainers();
          const existingNames = new Set(existingTrainers.map(t => t.name.toLowerCase()));
          
          let imported = 0;
          let skipped = 0;
          const errors: string[] = [];

          for (const trainer of backupData.trainers) {
            try {
              // Skip if trainer with same name already exists
              if (existingNames.has(trainer.name.toLowerCase())) {
                skipped++;
                console.log(`Skipped duplicate trainer: ${trainer.name}`);
                continue;
              }

              // Remove the ID to let Firebase generate a new one
              const trainerData = { ...trainer };
              delete trainerData.id;

              await trainerService.addTrainer(trainerData);
              imported++;
              console.log(`Imported trainer: ${trainer.name}`);
            } catch (error) {
              const errorMsg = `Failed to import ${trainer.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
              errors.push(errorMsg);
              console.error(errorMsg);
            }
          }

          resolve({ imported, skipped, errors });
        } catch (error) {
          reject(new Error('Failed to parse backup file: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read backup file'));
      };

      reader.readAsText(file);
    });
  },

  /**
   * Validate backup data structure
   */
  validateBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.timestamp === 'string' &&
      typeof data.version === 'string' &&
      Array.isArray(data.trainers) &&
      data.metadata &&
      typeof data.metadata.totalTrainers === 'number'
    );
  },

  /**
   * Create a quick backup summary
   */
  async getBackupSummary(): Promise<{
    totalTrainers: number;
    totalPokemon: number;
    lastBackupTime?: string;
  }> {
    try {
      const trainers = await trainerService.getAllTrainers();
      const totalPokemon = trainers.reduce((total, trainer) => 
        total + (trainer.team || []).length, 0
      );

      // Check localStorage for last backup time
      const lastBackupTime = localStorage.getItem('lastBackupTime');

      return {
        totalTrainers: trainers.length,
        totalPokemon,
        lastBackupTime: lastBackupTime || undefined
      };
    } catch (error) {
      console.error('Error getting backup summary:', error);
      throw error;
    }
  },

  /**
   * Store last backup time
   */
  setLastBackupTime(): void {
    localStorage.setItem('lastBackupTime', new Date().toISOString());
  }
};
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './config';
import { Trainer } from '../types/trainer';

const COLLECTION_NAME = 'trainers';

export const trainerService = {
  async getAllTrainers(): Promise<Trainer[]> {
    try {
      console.log('Firebase: Getting trainers from collection:', COLLECTION_NAME);
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      console.log('Firebase: Query snapshot size:', querySnapshot.size);
      const trainers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Trainer));
      console.log('Firebase: Mapped trainers:', trainers);
      return trainers;
    } catch (error) {
      console.error('Error getting trainers:', error);
      throw error;
    }
  },

  async addTrainer(trainerData: Omit<Trainer, 'id'>): Promise<string> {
    try {
      console.log('Firebase: Adding trainer to collection:', COLLECTION_NAME);
      console.log('Firebase: Trainer data:', trainerData);
      
      // Remove undefined values as Firestore doesn't support them
      const cleanData = Object.fromEntries(
        Object.entries(trainerData).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Firebase: Clean data (undefined removed):', cleanData);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData);
      console.log('Firebase: Document added with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Error adding trainer:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  async updateTrainer(trainerId: string, trainerData: Partial<Trainer>): Promise<void> {
    try {
      // Recursively remove undefined values from nested objects
      const cleanData = this.removeUndefinedValues(trainerData);
      
      const trainerRef = doc(db, COLLECTION_NAME, trainerId);
      await updateDoc(trainerRef, cleanData);
    } catch (error) {
      console.error('Error updating trainer:', error);
      throw error;
    }
  },

  // Helper function to recursively remove undefined values
  removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  },

  async deleteTrainer(trainerId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, trainerId));
    } catch (error) {
      console.error('Error deleting trainer:', error);
      throw error;
    }
  }
};
import { Trainer } from '../types/trainer';

const envBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim().replace(/\/$/, '');
const API_BASE = envBaseUrl ? `${envBaseUrl}/api/trainers` : '/api/trainers';

const parseJsonIfPossible = async <T>(response: Response): Promise<T | null> => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const payload = await parseJsonIfPossible<{ error?: string } & T>(response);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (payload?.error) {
      message = payload.error;
    } else {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.toLowerCase().includes('application/json')) {
        message = `${message} (received non-JSON response from ${response.url})`;
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (payload === null) {
    throw new Error(`Expected JSON response from ${response.url}, but received non-JSON content.`);
  }

  return payload as T;
};

export const trainerService = {
  async getAllTrainers(): Promise<Trainer[]> {
    const response = await fetch(API_BASE);
    return handleResponse<Trainer[]>(response);
  },

  async addTrainer(trainerData: Omit<Trainer, 'id'>): Promise<string> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trainerData)
    });

    const payload = await handleResponse<{ id: string }>(response);
    return payload.id;
  },

  async updateTrainer(trainerId: string, trainerData: Partial<Trainer>): Promise<void> {
    const response = await fetch(`${API_BASE}/${trainerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trainerData)
    });

    await handleResponse<void>(response);
  },

  async deleteTrainer(trainerId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${trainerId}`, {
      method: 'DELETE'
    });

    await handleResponse<void>(response);
  },

  async getTrainerById(trainerId: string): Promise<Trainer | null> {
    const response = await fetch(`${API_BASE}/${trainerId}`);
    if (response.status === 404) {
      return null;
    }

    return handleResponse<Trainer>(response);
  }
};

export const getAllTrainers = trainerService.getAllTrainers.bind(trainerService);
export const addTrainer = trainerService.addTrainer.bind(trainerService);
export const updateTrainer = trainerService.updateTrainer.bind(trainerService);
export const deleteTrainer = trainerService.deleteTrainer.bind(trainerService);
export const getTrainerById = trainerService.getTrainerById.bind(trainerService);

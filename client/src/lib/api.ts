import { apiRequest } from "./queryClient";

export interface ModelStatus {
  id: number;
  modelType: string;
  status: string;
  accuracy: number | null;
  lastTrained: string | null;
  version: string;
}

export interface BatchJob {
  id: number;
  filename: string;
  modelType: string;
  status: string;
  totalRows: number;
  processedRows: number;
  results: any;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const api = {
  // Model status
  getModelStatuses: async (): Promise<ModelStatus[]> => {
    const response = await apiRequest("GET", "/api/models/status");
    return response.json();
  },

  trainModel: async (modelType: string) => {
    const response = await apiRequest("POST", `/api/models/train/${modelType}`);
    return response.json();
  },

  // Predictions
  predictPackaging: async (data: any) => {
    const response = await apiRequest("POST", "/api/predict/packaging", data);
    return response.json();
  },

  predictCarbon: async (data: any) => {
    const response = await apiRequest("POST", "/api/predict/carbon", data);
    return response.json();
  },

  predictProduct: async (data: any) => {
    const response = await apiRequest("POST", "/api/predict/product", data);
    return response.json();
  },

  predictESG: async (data: any) => {
    const response = await apiRequest("POST", "/api/predict/esg", data);
    return response.json();
  },

  // Batch processing
  uploadBatchFile: async (file: File, modelType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modelType', modelType);

    const response = await fetch('/api/batch/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  getBatchJobs: async (): Promise<BatchJob[]> => {
    const response = await apiRequest("GET", "/api/batch/jobs");
    return response.json();
  },

  getBatchJob: async (id: number): Promise<BatchJob> => {
    const response = await apiRequest("GET", `/api/batch/jobs/${id}`);
    return response.json();
  },

  // Predictions history
  getPredictions: async (modelType?: string) => {
    const url = modelType ? `/api/predictions?modelType=${modelType}` : '/api/predictions';
    const response = await apiRequest("GET", url);
    return response.json();
  }
};

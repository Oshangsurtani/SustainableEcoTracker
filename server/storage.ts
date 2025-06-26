import { 
  users, 
  modelPredictions, 
  batchJobs, 
  modelStatus,
  type User, 
  type InsertUser,
  type ModelPrediction,
  type InsertModelPrediction,
  type BatchJob,
  type InsertBatchJob,
  type ModelStatus,
  type InsertModelStatus
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Model prediction methods
  createModelPrediction(prediction: InsertModelPrediction): Promise<ModelPrediction>;
  getModelPredictions(modelType?: string): Promise<ModelPrediction[]>;

  // Batch job methods
  createBatchJob(job: InsertBatchJob): Promise<BatchJob>;
  getBatchJob(id: number): Promise<BatchJob | undefined>;
  updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined>;
  getBatchJobs(): Promise<BatchJob[]>;

  // Model status methods
  getModelStatus(modelType: string): Promise<ModelStatus | undefined>;
  upsertModelStatus(status: InsertModelStatus): Promise<ModelStatus>;
  getAllModelStatuses(): Promise<ModelStatus[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private predictions: Map<number, ModelPrediction>;
  private batchJobs: Map<number, BatchJob>;
  private modelStatuses: Map<string, ModelStatus>;
  private currentUserId: number;
  private currentPredictionId: number;
  private currentBatchJobId: number;

  constructor() {
    this.users = new Map();
    this.predictions = new Map();
    this.batchJobs = new Map();
    this.modelStatuses = new Map();
    this.currentUserId = 1;
    this.currentPredictionId = 1;
    this.currentBatchJobId = 1;

    // Initialize model statuses
    const modelTypes = ['packaging', 'carbon', 'product', 'esg'];
    modelTypes.forEach(type => {
      this.modelStatuses.set(type, {
        id: this.currentPredictionId++,
        modelType: type,
        status: 'not_trained',
        accuracy: null,
        lastTrained: null,
        version: '1.0'
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createModelPrediction(prediction: InsertModelPrediction): Promise<ModelPrediction> {
    const id = this.currentPredictionId++;
    const newPrediction: ModelPrediction = {
      ...prediction,
      id,
      createdAt: new Date()
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  async getModelPredictions(modelType?: string): Promise<ModelPrediction[]> {
    const allPredictions = Array.from(this.predictions.values());
    if (modelType) {
      return allPredictions.filter(p => p.modelType === modelType);
    }
    return allPredictions;
  }

  async createBatchJob(job: InsertBatchJob): Promise<BatchJob> {
    const id = this.currentBatchJobId++;
    const newJob: BatchJob = {
      ...job,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.batchJobs.set(id, newJob);
    return newJob;
  }

  async getBatchJob(id: number): Promise<BatchJob | undefined> {
    return this.batchJobs.get(id);
  }

  async updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.batchJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.batchJobs.set(id, updatedJob);
    return updatedJob;
  }

  async getBatchJobs(): Promise<BatchJob[]> {
    return Array.from(this.batchJobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getModelStatus(modelType: string): Promise<ModelStatus | undefined> {
    return this.modelStatuses.get(modelType);
  }

  async upsertModelStatus(status: InsertModelStatus): Promise<ModelStatus> {
    const existing = this.modelStatuses.get(status.modelType);
    const newStatus: ModelStatus = {
      id: existing?.id || this.currentPredictionId++,
      ...status
    };
    this.modelStatuses.set(status.modelType, newStatus);
    return newStatus;
  }

  async getAllModelStatuses(): Promise<ModelStatus[]> {
    return Array.from(this.modelStatuses.values());
  }
}

export const storage = new MemStorage();

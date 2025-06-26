import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { MLModelService } from "./services/mlModels";
import { DataProcessor } from "./services/dataProcessor";
import { insertModelPredictionSchema, insertBatchJobSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const mlService = new MLModelService();
  const dataProcessor = new DataProcessor();

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Model status endpoints
  app.get("/api/models/status", async (req, res) => {
    try {
      const statuses = await storage.getAllModelStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch model statuses" });
    }
  });

  app.get("/api/models/status/:modelType", async (req, res) => {
    try {
      const { modelType } = req.params;
      const status = await storage.getModelStatus(modelType);
      if (!status) {
        return res.status(404).json({ error: "Model not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch model status" });
    }
  });

  app.post("/api/models/train/:modelType", async (req, res) => {
    try {
      const { modelType } = req.params;
      
      // Update status to training
      await storage.upsertModelStatus({
        modelType,
        status: 'training',
        accuracy: null,
        lastTrained: null,
        version: '1.0'
      });

      // Simulate training delay
      setTimeout(async () => {
        const accuracy = 75 + Math.random() * 20; // Random accuracy between 75-95%
        await storage.upsertModelStatus({
          modelType,
          status: 'trained',
          accuracy,
          lastTrained: new Date(),
          version: '1.0'
        });
      }, 3000);

      res.json({ message: "Training started", modelType });
    } catch (error) {
      res.status(500).json({ error: "Failed to start training" });
    }
  });

  // Individual prediction endpoints
  app.post("/api/predict/packaging", async (req, res) => {
    try {
      const input = req.body;
      const prediction = await mlService.predictPackaging(input);
      
      const record = await storage.createModelPrediction({
        modelType: 'packaging',
        inputData: input,
        prediction,
        confidence: prediction.sustainabilityScore / 100
      });

      res.json({ prediction, id: record.id });
    } catch (error) {
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  app.post("/api/predict/carbon", async (req, res) => {
    try {
      const input = req.body;
      const prediction = await mlService.predictCarbonFootprint(input);
      
      const record = await storage.createModelPrediction({
        modelType: 'carbon',
        inputData: input,
        prediction,
        confidence: 0.85 // Fixed confidence for carbon predictions
      });

      res.json({ prediction, id: record.id });
    } catch (error) {
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  app.post("/api/predict/product", async (req, res) => {
    try {
      const input = req.body;
      const prediction = await mlService.predictProductRecommendation(input);
      
      const record = await storage.createModelPrediction({
        modelType: 'product',
        inputData: input,
        prediction,
        confidence: prediction.purchaseLikelihood / 100
      });

      res.json({ prediction, id: record.id });
    } catch (error) {
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  app.post("/api/predict/esg", async (req, res) => {
    try {
      const input = req.body;
      const prediction = await mlService.predictESGScore(input);
      
      const record = await storage.createModelPrediction({
        modelType: 'esg',
        inputData: input,
        prediction,
        confidence: prediction.esgScore / 100
      });

      res.json({ prediction, id: record.id });
    } catch (error) {
      res.status(500).json({ error: "Prediction failed" });
    }
  });

  // Batch processing endpoints
  app.post("/api/batch/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { modelType } = req.body;
      if (!modelType || !['packaging', 'carbon', 'product', 'esg'].includes(modelType)) {
        return res.status(400).json({ error: "Invalid model type" });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const rows = dataProcessor.parseCSV(csvContent);

      const job = await storage.createBatchJob({
        filename: req.file.originalname,
        modelType,
        status: 'queued',
        totalRows: rows.length,
        processedRows: 0,
        results: null,
        errorMessage: null
      });

      // Process in background
      processJobAsync(job.id, modelType, rows);

      res.json({ jobId: job.id, totalRows: rows.length });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/batch/jobs", async (req, res) => {
    try {
      const jobs = await storage.getBatchJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/batch/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getBatchJob(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  // Prediction history
  app.get("/api/predictions", async (req, res) => {
    try {
      const { modelType } = req.query;
      const predictions = await storage.getModelPredictions(modelType as string);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  async function processJobAsync(jobId: number, modelType: string, rows: any[]) {
    try {
      await storage.updateBatchJob(jobId, { status: 'processing' });

      let results: any[] = [];
      
      switch (modelType) {
        case 'packaging':
          results = await dataProcessor.processPackagingData(rows);
          break;
        case 'carbon':
          results = await dataProcessor.processCarbonData(rows);
          break;
        case 'product':
          results = await dataProcessor.processProductData(rows);
          break;
        case 'esg':
          results = await dataProcessor.processESGData(rows);
          break;
      }

      await storage.updateBatchJob(jobId, {
        status: 'completed',
        processedRows: results.length,
        results,
        completedAt: new Date()
      });
    } catch (error) {
      await storage.updateBatchJob(jobId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}

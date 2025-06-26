import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { users, modelPredictions, batchJobs, modelStatus } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import ws from 'ws';

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { users, modelPredictions, batchJobs, modelStatus } });

// Simple ML Service for predictions
class MLModelService {
  constructor() {
    this.encoders = {
      materialType: { 'Plastic': 0, 'Cardboard': 1, 'Glass': 2, 'Metal': 3, 'Composite': 4 },
      fragility: { 'Low': 0, 'Medium': 1, 'High': 2 },
      recyclable: { 'Yes': 1, 'No': 0 },
      transportMode: { 'Road': 0, 'Rail': 1, 'Sea': 2, 'Air': 3 },
      preferredPackaging: { 'Plastic': 0, 'Cardboard': 1, 'Glass': 2, 'Metal': 3 },
      category: { 'Electronics': 0, 'Clothing': 1, 'Food': 2, 'Home': 3, 'Books': 4 },
      material: { 'Plastic': 0, 'Cotton': 1, 'Metal': 2, 'Wood': 3, 'Glass': 4 },
      brand: { 'EcoGreen': 0, 'SustainaCorp': 1, 'GreenTech': 2, 'EcoFriendly': 3 },
      sentiment: { 'Positive': 1, 'Negative': 0, 'Neutral': 0.5 }
    };
  }

  async predictPackaging(input) {
    const sustainabilityScore = Math.max(20, Math.min(95, 
      70 + (input.recyclable === 'Yes' ? 15 : -10) + 
      (input.materialType === 'Cardboard' ? 10 : 0) - 
      (input.lcaEmission / 10)
    ));

    return {
      packagingType: input.materialType === 'Cardboard' ? 'Eco-Box' : 'Standard Box',
      sustainabilityScore: Math.round(sustainabilityScore),
      recommendation: this.getPackagingRecommendation(input.materialType, input.fragility),
      estimatedCost: Math.round((input.productWeight * 0.5 + 2) * 100) / 100,
      carbonFootprint: Math.round(input.lcaEmission * 1.2 * 100) / 100
    };
  }

  async predictCarbonFootprint(input) {
    const totalFootprint = (input.totalPurchases * 0.5) + 
                          (input.avgDistance * 0.2) + 
                          (input.electricity * 0.4) + 
                          (input.travel * 0.8) + 
                          (input.serviceUsage * 0.3);

    const breakdown = {
      purchases: Math.round(input.totalPurchases * 0.5),
      transport: Math.round(input.avgDistance * 0.2),
      energy: Math.round(input.electricity * 0.4),
      travel: Math.round(input.travel * 0.8),
      services: Math.round(input.serviceUsage * 0.3)
    };

    return {
      totalCarbonFootprint: Math.round(totalFootprint),
      breakdown,
      category: totalFootprint > 1000 ? 'High' : totalFootprint > 500 ? 'Medium' : 'Low',
      recommendations: this.getCarbonReductionSuggestions(breakdown)
    };
  }

  async predictProductRecommendation(input) {
    const sustainabilityScore = Math.max(20, Math.min(95,
      (100 - input.carbonFootprint) * 0.4 + 
      (100 - input.waterUsage) * 0.3 + 
      (100 - input.wasteProduction) * 0.3
    ));

    const purchaseLikelihood = Math.max(10, Math.min(90,
      (input.rating / 5) * 40 + 
      (input.price <= input.avgPrice ? 30 : 10) + 
      (sustainabilityScore / 100) * 30
    ));

    return {
      sustainabilityScore: Math.round(sustainabilityScore),
      purchaseLikelihood: Math.round(purchaseLikelihood),
      recommendation: this.getProductRecommendation(sustainabilityScore),
      alternativeProducts: [
        { name: 'Eco Alternative 1', score: Math.min(95, sustainabilityScore + 10) },
        { name: 'Eco Alternative 2', score: Math.min(95, sustainabilityScore + 5) }
      ]
    };
  }

  async predictESGScore(input) {
    const sentimentScore = this.encoders.sentiment[input.sentiment] || 0.5;
    const esgScore = Math.max(20, Math.min(95,
      input.environmentalScore * 0.6 + sentimentScore * 40
    ));

    return {
      esgScore: Math.round(esgScore),
      environmentalImpact: input.environmentalScore,
      socialImpact: Math.round(sentimentScore * 80),
      governanceScore: Math.round(60 + Math.random() * 30),
      overallRating: esgScore > 70 ? 'Excellent' : esgScore > 50 ? 'Good' : 'Needs Improvement',
      recommendations: this.getESGRecommendations(esgScore, input.sentiment)
    };
  }

  getPackagingRecommendation(packagingType, fragility) {
    if (fragility === 'High') return 'Use extra protective materials and sustainable cushioning';
    if (packagingType === 'Cardboard') return 'Excellent choice for sustainability';
    return 'Consider switching to recyclable materials';
  }

  getCarbonReductionSuggestions(breakdown) {
    const suggestions = [];
    if (breakdown.transport > 50) suggestions.push('Consider electric or hybrid transport');
    if (breakdown.energy > 100) suggestions.push('Switch to renewable energy sources');
    if (breakdown.purchases > 200) suggestions.push('Buy local and sustainable products');
    return suggestions;
  }

  getProductRecommendation(score) {
    if (score > 80) return 'Highly recommended sustainable choice';
    if (score > 60) return 'Good sustainable option with room for improvement';
    return 'Consider more sustainable alternatives';
  }

  getESGRecommendations(score, sentiment) {
    const recommendations = [];
    if (score < 50) recommendations.push('Improve environmental practices');
    if (sentiment === 'Negative') recommendations.push('Address public perception issues');
    recommendations.push('Increase transparency in reporting');
    return recommendations;
  }
}

// Storage implementation
class DatabaseStorage {
  async getAllModelStatuses() {
    const statuses = await db.select().from(modelStatus);
    if (statuses.length === 0) {
      // Initialize default model statuses
      const defaultModels = ['packaging', 'carbon', 'product', 'esg'];
      for (const modelType of defaultModels) {
        await db.insert(modelStatus).values({
          modelType,
          status: 'not_trained',
          accuracy: null,
          lastTrained: null,
          version: '1.0'
        }).onConflictDoNothing();
      }
      return await db.select().from(modelStatus);
    }
    return statuses;
  }

  async getModelStatus(modelType) {
    const [status] = await db.select().from(modelStatus).where(eq(modelStatus.modelType, modelType));
    return status || undefined;
  }

  async upsertModelStatus(statusData) {
    const [status] = await db.insert(modelStatus)
      .values(statusData)
      .onConflictDoUpdate({
        target: modelStatus.modelType,
        set: {
          status: statusData.status,
          accuracy: statusData.accuracy,
          lastTrained: statusData.lastTrained,
          version: statusData.version
        }
      })
      .returning();
    return status;
  }

  async createModelPrediction(prediction) {
    const [record] = await db.insert(modelPredictions)
      .values({
        ...prediction,
        confidence: prediction.confidence || null
      })
      .returning();
    return record;
  }

  async createBatchJob(job) {
    const [record] = await db.insert(batchJobs)
      .values({
        ...job,
        status: job.status || 'queued',
        totalRows: job.totalRows || 0,
        processedRows: job.processedRows || 0,
        results: job.results || null,
        errorMessage: job.errorMessage || null,
        completedAt: null
      })
      .returning();
    return record;
  }

  async updateBatchJob(id, updates) {
    const [job] = await db.update(batchJobs)
      .set(updates)
      .where(eq(batchJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getBatchJobs() {
    return await db.select().from(batchJobs).orderBy(desc(batchJobs.createdAt));
  }
}

const storage = new DatabaseStorage();
const mlService = new MLModelService();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const path = url.replace('/api', '');

  try {
    // Model status endpoints
    if (path === '/models/status' && method === 'GET') {
      const statuses = await storage.getAllModelStatuses();
      return res.json(statuses);
    }

    if (path.startsWith('/models/status/') && method === 'GET') {
      const modelType = path.split('/')[3];
      const status = await storage.getModelStatus(modelType);
      if (!status) {
        return res.status(404).json({ error: 'Model not found' });
      }
      return res.json(status);
    }

    if (path.startsWith('/models/train/') && method === 'POST') {
      const modelType = path.split('/')[3];
      
      await storage.upsertModelStatus({
        modelType,
        status: 'training',
        accuracy: null,
        lastTrained: null,
        version: '1.0'
      });

      // Simulate training delay
      setTimeout(async () => {
        const accuracy = 75 + Math.random() * 20;
        await storage.upsertModelStatus({
          modelType,
          status: 'trained',
          accuracy,
          lastTrained: new Date(),
          version: '1.0'
        });
      }, 3000);

      return res.json({ message: 'Training started', modelType });
    }

    // Prediction endpoints
    if (path === '/predict/packaging' && method === 'POST') {
      const prediction = await mlService.predictPackaging(req.body);
      const record = await storage.createModelPrediction({
        modelType: 'packaging',
        inputData: req.body,
        prediction,
        confidence: prediction.sustainabilityScore / 100
      });
      return res.json({ prediction, id: record.id });
    }

    if (path === '/predict/carbon' && method === 'POST') {
      const prediction = await mlService.predictCarbonFootprint(req.body);
      const record = await storage.createModelPrediction({
        modelType: 'carbon',
        inputData: req.body,
        prediction,
        confidence: 0.85
      });
      return res.json({ prediction, id: record.id });
    }

    if (path === '/predict/product' && method === 'POST') {
      const prediction = await mlService.predictProductRecommendation(req.body);
      const record = await storage.createModelPrediction({
        modelType: 'product',
        inputData: req.body,
        prediction,
        confidence: prediction.purchaseLikelihood / 100
      });
      return res.json({ prediction, id: record.id });
    }

    if (path === '/predict/esg' && method === 'POST') {
      const prediction = await mlService.predictESGScore(req.body);
      const record = await storage.createModelPrediction({
        modelType: 'esg',
        inputData: req.body,
        prediction,
        confidence: prediction.esgScore / 100
      });
      return res.json({ prediction, id: record.id });
    }

    // Batch jobs endpoint
    if (path === '/batch/jobs' && method === 'GET') {
      const jobs = await storage.getBatchJobs();
      return res.json(jobs);
    }

    // Batch upload (simplified for Vercel limitations)
    if (path === '/batch/upload' && method === 'POST') {
      // For Vercel free tier, we'll simulate batch processing
      const { modelType, data } = req.body;
      
      const job = await storage.createBatchJob({
        filename: 'uploaded_data.csv',
        modelType,
        status: 'completed',
        totalRows: Array.isArray(data) ? data.length : 1,
        processedRows: Array.isArray(data) ? data.length : 1,
        results: { message: 'Batch processing completed successfully' },
        errorMessage: null,
        completedAt: new Date()
      });

      return res.json({ jobId: job.id, totalRows: job.totalRows });
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
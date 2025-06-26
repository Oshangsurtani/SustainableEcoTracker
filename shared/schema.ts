import { pgTable, text, serial, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const modelPredictions = pgTable("model_predictions", {
  id: serial("id").primaryKey(),
  modelType: text("model_type").notNull(), // 'packaging', 'carbon', 'product', 'esg'
  inputData: jsonb("input_data").notNull(),
  prediction: jsonb("prediction").notNull(),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const batchJobs = pgTable("batch_jobs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  modelType: text("model_type").notNull(),
  status: text("status").notNull().default('queued'), // 'queued', 'processing', 'completed', 'failed'
  totalRows: integer("total_rows"),
  processedRows: integer("processed_rows").default(0),
  results: jsonb("results"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const modelStatus = pgTable("model_status", {
  id: serial("id").primaryKey(),
  modelType: text("model_type").notNull().unique(),
  status: text("status").notNull().default('not_trained'), // 'not_trained', 'training', 'trained', 'error'
  accuracy: real("accuracy"),
  lastTrained: timestamp("last_trained"),
  version: text("version").default('1.0'),
});

// Insert schemas
export const insertModelPredictionSchema = createInsertSchema(modelPredictions).omit({
  id: true,
  createdAt: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertModelStatusSchema = createInsertSchema(modelStatus).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types
export type ModelPrediction = typeof modelPredictions.$inferSelect;
export type InsertModelPrediction = z.infer<typeof insertModelPredictionSchema>;

export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = z.infer<typeof insertBatchJobSchema>;

export type ModelStatus = typeof modelStatus.$inferSelect;
export type InsertModelStatus = z.infer<typeof insertModelStatusSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

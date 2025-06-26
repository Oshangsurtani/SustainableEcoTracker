import { MLModelService } from './mlModels';

export interface CSVRow {
  [key: string]: string | number;
}

export class DataProcessor {
  private mlService: MLModelService;

  constructor() {
    this.mlService = new MLModelService();
  }

  parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number, otherwise keep as string
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      rows.push(row);
    }

    return rows;
  }

  async processPackagingData(rows: CSVRow[]): Promise<any[]> {
    const results = [];
    
    for (const row of rows) {
      try {
        const input = {
          materialType: String(row['Material_Type'] || row['material_type'] || 'Glass'),
          productWeight: Number(row['Product_Weight_g'] || row['weight'] || 150),
          fragility: String(row['Fragility'] || row['fragility'] || 'Medium'),
          recyclable: String(row['Recyclable'] || row['recyclable'] || 'Yes'),
          transportMode: String(row['Transport_Mode'] || row['transport_mode'] || 'Land'),
          lcaEmission: Number(row['LCA_Emission_kgCO2'] || row['emissions'] || 1.5)
        };

        const prediction = await this.mlService.predictPackaging(input);
        results.push({
          input,
          prediction,
          status: 'success'
        });
      } catch (error) {
        results.push({
          input: row,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    return results;
  }

  async processCarbonData(rows: CSVRow[]): Promise<any[]> {
    const results = [];
    
    for (const row of rows) {
      try {
        const input = {
          totalPurchases: Number(row['Total_Purchases'] || row['purchases'] || 10),
          avgDistance: Number(row['Avg_Distance_km'] || row['distance'] || 300),
          preferredPackaging: String(row['Preferred_Packaging'] || row['packaging'] || 'Cardboard'),
          returnsPercent: Number(row['Returns_%'] || row['returns'] || 2),
          electricity: Number(row['Electricity_kWh'] || row['electricity'] || 250),
          travel: Number(row['Travel_km'] || row['travel'] || 800),
          serviceUsage: Number(row['Service_Usage_hr'] || row['service'] || 20)
        };

        const prediction = await this.mlService.predictCarbonFootprint(input);
        results.push({
          input,
          prediction,
          status: 'success'
        });
      } catch (error) {
        results.push({
          input: row,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    return results;
  }

  async processProductData(rows: CSVRow[]): Promise<any[]> {
    const results = [];
    
    for (const row of rows) {
      try {
        const input = {
          category: String(row['category'] || row['Category'] || 'Unknown'),
          material: String(row['material'] || row['Material'] || 'Unknown'),
          brand: String(row['brand'] || row['Brand'] || 'Unknown'),
          price: Number(row['price'] || row['Price'] || 50),
          rating: Number(row['rating'] || row['Rating'] || 3.5),
          reviewsCount: Number(row['reviewsCount'] || row['Reviews'] || 50),
          carbonFootprint: Number(row['Carbon_Footprint_MT'] || row['carbon'] || 30),
          waterUsage: Number(row['Water_Usage_Liters'] || row['water'] || 800),
          wasteProduction: Number(row['Waste_Production_KG'] || row['waste'] || 8),
          avgPrice: Number(row['Average_Price_USD'] || row['avg_price'] || 60)
        };

        const prediction = await this.mlService.predictProductRecommendation(input);
        results.push({
          input,
          prediction,
          status: 'success'
        });
      } catch (error) {
        results.push({
          input: row,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    return results;
  }

  async processESGData(rows: CSVRow[]): Promise<any[]> {
    const results = [];
    
    for (const row of rows) {
      try {
        const input = {
          productName: String(row['Product Name'] || row['product_name'] || 'Unknown Product'),
          sentence: String(row['Sentence'] || row['sentence'] || 'No description'),
          sentiment: String(row['Sentiment'] || row['sentiment'] || 'Neutral'),
          environmentalScore: Number(row['Environmental Score'] || row['environmental_score'] || 50)
        };

        const prediction = await this.mlService.predictESGScore(input);
        results.push({
          input,
          prediction,
          status: 'success'
        });
      } catch (error) {
        results.push({
          input: row,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }

    return results;
  }
}

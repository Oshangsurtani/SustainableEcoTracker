export interface PackagingInput {
  materialType: string;
  productWeight: number;
  fragility: string;
  recyclable: string;
  transportMode: string;
  lcaEmission: number;
}

export interface CarbonFootprintInput {
  totalPurchases: number;
  avgDistance: number;
  preferredPackaging: string;
  returnsPercent: number;
  electricity: number;
  travel: number;
  serviceUsage: number;
}

export interface ProductInput {
  category: string;
  material: string;
  brand: string;
  price: number;
  rating: number;
  reviewsCount: number;
  carbonFootprint: number;
  waterUsage: number;
  wasteProduction: number;
  avgPrice: number;
}

export interface ESGInput {
  productName: string;
  sentence: string;
  sentiment: string;
  environmentalScore: number;
}

export class MLModelService {
  private encoders: { [key: string]: { [key: string]: number } } = {
    materialType: { 'Glass': 0, 'Plastic': 1, 'Metal': 2, 'Ceramic': 3 },
    fragility: { 'Low': 0, 'Medium': 1, 'High': 2 },
    recyclable: { 'No': 0, 'Yes': 1 },
    transportMode: { 'Land': 0, 'Air': 1, 'Sea': 2 },
    preferredPackaging: { 'Cardboard': 0, 'Plastic': 1, 'Biodegradable': 2 }
  };

  private packagingOptions = [
    'Biodegradable Bubble Wrap',
    'Recycled Cardboard',
    'Compostable Packaging',
    'Reusable Container',
    'Minimal Packaging'
  ];

  async predictPackaging(input: PackagingInput): Promise<any> {
    // Simulate the gradient boosting model prediction
    const encodedMaterial = this.encoders.materialType[input.materialType] || 0;
    const encodedFragility = this.encoders.fragility[input.fragility] || 0;
    const encodedRecyclable = this.encoders.recyclable[input.recyclable] || 0;
    const encodedTransport = this.encoders.transportMode[input.transportMode] || 0;

    // Simple scoring algorithm based on the model logic
    let score = 0;
    if (input.recyclable === 'Yes') score += 20;
    if (input.fragility === 'High') score += 15;
    if (input.productWeight < 200) score += 10;
    if (input.lcaEmission < 2.0) score += 25;
    if (input.transportMode === 'Land') score += 10;

    const sustainabilityScore = Math.min(Math.max(score + Math.random() * 20, 60), 100);
    const costEfficiency = sustainabilityScore > 80 ? 'High' : sustainabilityScore > 60 ? 'Medium' : 'Low';
    const carbonImpact = sustainabilityScore > 75 ? 'Low' : sustainabilityScore > 50 ? 'Medium' : 'High';

    // Select packaging option based on score
    const optionIndex = Math.floor((sustainabilityScore / 100) * this.packagingOptions.length);
    const packagingType = this.packagingOptions[Math.min(optionIndex, this.packagingOptions.length - 1)];

    return {
      packagingType,
      sustainabilityScore: Math.round(sustainabilityScore),
      costEfficiency,
      carbonImpact,
      recommendation: this.getPackagingRecommendation(packagingType, input.fragility)
    };
  }

  async predictCarbonFootprint(input: CarbonFootprintInput): Promise<any> {
    // Carbon footprint calculation based on the model
    const encodedPackaging = this.encoders.preferredPackaging[input.preferredPackaging] || 0;
    
    // Weighted calculation similar to the ML model
    const transportationEmissions = input.avgDistance * 0.21 * input.totalPurchases; // kg CO2 per km
    const packagingEmissions = input.totalPurchases * (encodedPackaging === 2 ? 0.5 : encodedPackaging === 0 ? 1.2 : 2.1);
    const electricityEmissions = input.electricity * 0.4; // kg CO2 per kWh
    const travelEmissions = input.travel * 0.15; // kg CO2 per km
    const returnEmissions = (input.returnsPercent / 100) * transportationEmissions * 2;
    const serviceEmissions = input.serviceUsage * 0.8;

    const totalEmissions = transportationEmissions + packagingEmissions + electricityEmissions + 
                          travelEmissions + returnEmissions + serviceEmissions;

    const breakdown = {
      transportation: Math.round((transportationEmissions / totalEmissions) * 100),
      packaging: Math.round((packagingEmissions / totalEmissions) * 100),
      electricity: Math.round((electricityEmissions / totalEmissions) * 100),
      other: Math.round(((travelEmissions + returnEmissions + serviceEmissions) / totalEmissions) * 100)
    };

    const suggestions = this.getCarbonReductionSuggestions(breakdown);

    return {
      totalEmissions: Math.round(totalEmissions),
      breakdown,
      suggestions
    };
  }

  async predictProductRecommendation(input: ProductInput): Promise<any> {
    // Product recommendation scoring
    const sustainabilityFactors = {
      lowCarbonFootprint: input.carbonFootprint < 50 ? 25 : 0,
      lowWaterUsage: input.waterUsage < 1000 ? 20 : 0,
      lowWaste: input.wasteProduction < 10 ? 20 : 0,
      goodRating: input.rating > 4.0 ? 15 : 0,
      popularProduct: input.reviewsCount > 100 ? 10 : 0,
      affordablePrice: input.price < input.avgPrice ? 10 : 0
    };

    const totalScore = Object.values(sustainabilityFactors).reduce((sum, score) => sum + score, 0);
    const purchaseLikelihood = Math.min(totalScore / 100, 0.95);

    return {
      purchaseLikelihood: Math.round(purchaseLikelihood * 100),
      sustainabilityScore: totalScore,
      factors: sustainabilityFactors,
      recommendation: this.getProductRecommendation(totalScore)
    };
  }

  async predictESGScore(input: ESGInput): Promise<any> {
    // ESG scoring based on sentiment and environmental factors
    const sentimentMultiplier = input.sentiment === 'Positive' ? 1.2 : 
                               input.sentiment === 'Negative' ? 0.8 : 1.0;
    
    const baseScore = input.environmentalScore * sentimentMultiplier;
    const esgScore = Math.max(Math.min(baseScore + (Math.random() * 20 - 10), 100), 0);

    const category = esgScore >= 70 ? 'Eco-friendly' : 'Non Eco-friendly';
    const recommendations = this.getESGRecommendations(esgScore, input.sentiment);

    return {
      esgScore: Math.round(esgScore),
      category,
      sentiment: input.sentiment,
      environmentalScore: input.environmentalScore,
      recommendations
    };
  }

  private getPackagingRecommendation(packagingType: string, fragility: string): string {
    if (fragility === 'High') {
      return `This ${packagingType.toLowerCase()} provides excellent protection while minimizing environmental impact. Consider using reinforced corners for fragile items.`;
    }
    return `This ${packagingType.toLowerCase()} option provides good protection while maintaining sustainability standards. Ideal for standard shipping requirements.`;
  }

  private getCarbonReductionSuggestions(breakdown: any): string[] {
    const suggestions = [];
    if (breakdown.transportation > 30) {
      suggestions.push('• Optimize delivery routes (-20%)');
    }
    if (breakdown.packaging > 20) {
      suggestions.push('• Switch to biodegradable packaging (-15%)');
    }
    if (breakdown.electricity > 25) {
      suggestions.push('• Use renewable energy (-25%)');
    }
    if (suggestions.length === 0) {
      suggestions.push('• Consider consolidating shipments (-10%)');
    }
    return suggestions;
  }

  private getProductRecommendation(score: number): string {
    if (score >= 80) {
      return 'Highly recommended sustainable product with excellent environmental credentials.';
    } else if (score >= 60) {
      return 'Good sustainable choice with room for improvement in some areas.';
    } else {
      return 'Consider alternative products with better sustainability ratings.';
    }
  }

  private getESGRecommendations(score: number, sentiment: string): string[] {
    const recommendations = [];
    
    if (score < 50) {
      recommendations.push('Improve environmental reporting and transparency');
      recommendations.push('Implement sustainable sourcing practices');
    }
    
    if (sentiment === 'Negative') {
      recommendations.push('Address public perception through improved communication');
      recommendations.push('Invest in community engagement programs');
    }
    
    if (score < 70) {
      recommendations.push('Set measurable sustainability targets');
      recommendations.push('Increase renewable energy usage');
    }
    
    return recommendations;
  }
}

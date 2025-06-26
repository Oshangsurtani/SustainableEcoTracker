import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart } from "lucide-react";

export default function ProductRecommendationModel() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: '',
    material: '',
    brand: '',
    price: '',
    rating: '',
    reviewsCount: '',
    carbonFootprint: '',
    waterUsage: '',
    wasteProduction: '',
    avgPrice: ''
  });
  const [result, setResult] = useState<any>(null);

  const predictMutation = useMutation({
    mutationFn: (data: any) => api.predictProduct(data),
    onSuccess: (response) => {
      setResult(response.prediction);
      toast({
        title: "Analysis Complete",
        description: "Product recommendation generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to generate product recommendation.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      category: formData.category,
      material: formData.material,
      brand: formData.brand,
      price: Number(formData.price),
      rating: Number(formData.rating),
      reviewsCount: Number(formData.reviewsCount),
      carbonFootprint: Number(formData.carbonFootprint),
      waterUsage: Number(formData.waterUsage),
      wasteProduction: Number(formData.wasteProduction),
      avgPrice: Number(formData.avgPrice)
    };

    predictMutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <ShoppingCart className="mr-4 h-8 w-8 text-secondary" />
            <div>
              <div>Product Recommendation Model</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Sustainable product recommendations based on multiple factors
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Information</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="Electronics"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      placeholder="Recycled Plastic"
                      value={formData.material}
                      onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="EcoTech"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="50"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      placeholder="4.2"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewsCount">Reviews Count</Label>
                    <Input
                      id="reviewsCount"
                      type="number"
                      placeholder="150"
                      value={formData.reviewsCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviewsCount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="carbonFootprint">Carbon Footprint (MT)</Label>
                    <Input
                      id="carbonFootprint"
                      type="number"
                      placeholder="30"
                      value={formData.carbonFootprint}
                      onChange={(e) => setFormData(prev => ({ ...prev, carbonFootprint: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterUsage">Water Usage (Liters)</Label>
                    <Input
                      id="waterUsage"
                      type="number"
                      placeholder="800"
                      value={formData.waterUsage}
                      onChange={(e) => setFormData(prev => ({ ...prev, waterUsage: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wasteProduction">Waste Production (KG)</Label>
                    <Input
                      id="wasteProduction"
                      type="number"
                      placeholder="8"
                      value={formData.wasteProduction}
                      onChange={(e) => setFormData(prev => ({ ...prev, wasteProduction: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="avgPrice">Average Market Price ($)</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      placeholder="60"
                      value={formData.avgPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, avgPrice: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90"
                  disabled={predictMutation.isPending}
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Product'
                  )}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recommendation Results</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary mb-2">
                        {result.purchaseLikelihood}%
                      </div>
                      <div className="text-sm text-gray-600">Purchase Likelihood</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Sustainability Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(result.factors).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-medium">
                              {value as number > 0 ? '✓' : '○'} {value as number}pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-secondary/10 rounded-lg p-4">
                    <h4 className="font-medium text-secondary mb-2">Overall Score</h4>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Sustainability Score</span>
                      <span className="text-sm font-medium">{result.sustainabilityScore}/100</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Recommendation:</strong> {result.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  Fill out the form and click "Analyze Product" to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

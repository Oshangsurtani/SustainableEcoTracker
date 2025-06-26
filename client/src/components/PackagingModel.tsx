import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package } from "lucide-react";

export default function PackagingModel() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    materialType: '',
    productWeight: '',
    fragility: '',
    recyclable: '',
    transportMode: '',
    lcaEmission: ''
  });
  const [result, setResult] = useState<any>(null);

  const predictMutation = useMutation({
    mutationFn: (data: any) => api.predictPackaging(data),
    onSuccess: (response) => {
      setResult(response.prediction);
      toast({
        title: "Prediction Complete",
        description: "Packaging recommendation generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Prediction Failed",
        description: "Failed to generate packaging recommendation.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      materialType: formData.materialType,
      productWeight: Number(formData.productWeight),
      fragility: formData.fragility,
      recyclable: formData.recyclable,
      transportMode: formData.transportMode,
      lcaEmission: Number(formData.lcaEmission)
    };

    predictMutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Package className="mr-4 h-8 w-8 text-primary" />
            <div>
              <div>Packaging Recommendation Model</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Get optimal packaging suggestions based on product characteristics
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
                <div>
                  <Label htmlFor="materialType">Material Type</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, materialType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Glass">Glass</SelectItem>
                      <SelectItem value="Plastic">Plastic</SelectItem>
                      <SelectItem value="Metal">Metal</SelectItem>
                      <SelectItem value="Ceramic">Ceramic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="productWeight">Product Weight (g)</Label>
                  <Input
                    id="productWeight"
                    type="number"
                    placeholder="150"
                    value={formData.productWeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, productWeight: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="fragility">Fragility</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, fragility: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fragility level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recyclable">Recyclable</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, recyclable: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Is recyclable?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transportMode">Transport Mode</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, transportMode: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Sea">Sea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="lcaEmission">LCA Emission (kg CO2)</Label>
                  <Input
                    id="lcaEmission"
                    type="number"
                    step="0.01"
                    placeholder="1.89"
                    value={formData.lcaEmission}
                    onChange={(e) => setFormData(prev => ({ ...prev, lcaEmission: e.target.value }))}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={predictMutation.isPending}
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Get Packaging Recommendation'
                  )}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recommendation Results</h3>
              {result ? (
                <div className="bg-eco-light rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <i className="fas fa-check-circle text-sustainability text-xl mr-3" />
                    <span className="text-lg font-medium text-eco-dark">Recommended Packaging</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Packaging Type:</span>
                      <span className="font-medium text-eco-dark">{result.packagingType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Sustainability Score:</span>
                      <span className="font-medium text-sustainability">{result.sustainabilityScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Cost Efficiency:</span>
                      <span className="font-medium text-yellow-600">{result.costEfficiency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Carbon Impact:</span>
                      <span className="font-medium text-sustainability">{result.carbonImpact}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded border-l-4 border-sustainability">
                    <p className="text-sm text-gray-700">
                      <strong>Recommendation:</strong> {result.recommendation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  Fill out the form and click "Get Packaging Recommendation" to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

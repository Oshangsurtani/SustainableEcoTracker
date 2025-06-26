import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Cloud } from "lucide-react";

export default function CarbonFootprintModel() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    totalPurchases: '',
    avgDistance: '',
    preferredPackaging: '',
    returnsPercent: '',
    electricity: '',
    travel: '',
    serviceUsage: ''
  });
  const [result, setResult] = useState<any>(null);

  const predictMutation = useMutation({
    mutationFn: (data: any) => api.predictCarbon(data),
    onSuccess: (response) => {
      setResult(response.prediction);
      toast({
        title: "Calculation Complete",
        description: "Carbon footprint calculated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate carbon footprint.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      totalPurchases: Number(formData.totalPurchases),
      avgDistance: Number(formData.avgDistance),
      preferredPackaging: formData.preferredPackaging,
      returnsPercent: Number(formData.returnsPercent),
      electricity: Number(formData.electricity),
      travel: Number(formData.travel),
      serviceUsage: Number(formData.serviceUsage)
    };

    predictMutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Cloud className="mr-4 h-8 w-8 text-yellow-600" />
            <div>
              <div>Carbon Footprint Calculator</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Calculate and analyze carbon emissions for customer activities
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalPurchases">Total Purchases</Label>
                  <Input
                    id="totalPurchases"
                    type="number"
                    placeholder="15"
                    value={formData.totalPurchases}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalPurchases: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="avgDistance">Average Distance (km)</Label>
                  <Input
                    id="avgDistance"
                    type="number"
                    placeholder="450"
                    value={formData.avgDistance}
                    onChange={(e) => setFormData(prev => ({ ...prev, avgDistance: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="preferredPackaging">Preferred Packaging</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, preferredPackaging: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardboard">Cardboard</SelectItem>
                      <SelectItem value="Plastic">Plastic</SelectItem>
                      <SelectItem value="Biodegradable">Biodegradable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="returnsPercent">Returns (%)</Label>
                  <Input
                    id="returnsPercent"
                    type="number"
                    placeholder="3"
                    value={formData.returnsPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnsPercent: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="electricity">Electricity Usage (kWh)</Label>
                  <Input
                    id="electricity"
                    type="number"
                    placeholder="320"
                    value={formData.electricity}
                    onChange={(e) => setFormData(prev => ({ ...prev, electricity: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="travel">Travel Distance (km)</Label>
                  <Input
                    id="travel"
                    type="number"
                    placeholder="1000"
                    value={formData.travel}
                    onChange={(e) => setFormData(prev => ({ ...prev, travel: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="serviceUsage">Service Usage (hours)</Label>
                  <Input
                    id="serviceUsage"
                    type="number"
                    placeholder="25"
                    value={formData.serviceUsage}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceUsage: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    disabled={predictMutation.isPending}
                  >
                    {predictMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      'Calculate Carbon Footprint'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Carbon Impact</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">
                        {result.totalEmissions}
                      </div>
                      <div className="text-sm text-gray-600">kg CO2e Estimated</div>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Breakdown by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Transportation</span>
                          <span className="text-sm font-medium">{result.breakdown.transportation}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Packaging</span>
                          <span className="text-sm font-medium">{result.breakdown.packaging}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Electricity</span>
                          <span className="text-sm font-medium">{result.breakdown.electricity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Other</span>
                          <span className="text-sm font-medium">{result.breakdown.other}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-sustainability/10 rounded-lg p-4">
                    <h4 className="font-medium text-sustainability mb-2">Reduction Suggestions</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {result.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  Fill out the form and click "Calculate Carbon Footprint" to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

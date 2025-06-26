import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp } from "lucide-react";

export default function ESGScoreModel() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productName: '',
    sentence: '',
    sentiment: '',
    environmentalScore: ''
  });
  const [result, setResult] = useState<any>(null);

  const predictMutation = useMutation({
    mutationFn: (data: any) => api.predictESG(data),
    onSuccess: (response) => {
      setResult(response.prediction);
      toast({
        title: "Analysis Complete",
        description: "ESG score calculated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to calculate ESG score.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      productName: formData.productName,
      sentence: formData.sentence,
      sentiment: formData.sentiment,
      environmentalScore: Number(formData.environmentalScore)
    };

    predictMutation.mutate(payload);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <TrendingUp className="mr-4 h-8 w-8 text-accent" />
            <div>
              <div>ESG Score Analysis</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Environmental, Social, and Governance scoring with sentiment analysis
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
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Eco-Friendly Solar Panel"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sentence">Product Description/Review</Label>
                  <Textarea
                    id="sentence"
                    placeholder="This renewable energy product significantly reduces carbon emissions and promotes sustainable energy practices..."
                    className="min-h-24"
                    value={formData.sentence}
                    onChange={(e) => setFormData(prev => ({ ...prev, sentence: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, sentiment: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="environmentalScore">Environmental Score (0-100)</Label>
                  <Input
                    id="environmentalScore"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="75"
                    value={formData.environmentalScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, environmentalScore: e.target.value }))}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={predictMutation.isPending}
                >
                  {predictMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Calculate ESG Score'
                  )}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">ESG Analysis Results</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-teal-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent mb-2">
                        {result.esgScore}
                      </div>
                      <div className="text-sm text-gray-600">ESG Score (0-100)</div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Analysis Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Category:</span>
                          <span className={`text-sm font-medium ${
                            result.category === 'Eco-friendly' ? 'text-sustainability' : 'text-red-600'
                          }`}>
                            {result.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sentiment:</span>
                          <span className={`text-sm font-medium ${
                            result.sentiment === 'Positive' ? 'text-green-600' :
                            result.sentiment === 'Negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {result.sentiment}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Environmental Score:</span>
                          <span className="text-sm font-medium">{result.environmentalScore}/100</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-accent/10 rounded-lg p-4">
                    <h4 className="font-medium text-accent mb-2">Recommendations</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {result.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    result.category === 'Eco-friendly' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      result.category === 'Eco-friendly' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Overall Assessment
                    </h4>
                    <p className="text-sm text-gray-700">
                      This product has been classified as <strong>{result.category}</strong> with an ESG score of {result.esgScore}/100. 
                      {result.category === 'Eco-friendly' 
                        ? ' This indicates strong environmental, social, and governance practices.'
                        : ' Consider implementing the recommendations above to improve sustainability performance.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                  Fill out the form and click "Calculate ESG Score" to see results
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

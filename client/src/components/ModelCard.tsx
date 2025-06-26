import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ModelCardProps {
  model: {
    id: number;
    modelType: string;
    status: string;
    accuracy: number | null;
    lastTrained: string | null;
    version: string;
  };
  onUseModel: () => void;
}

export default function ModelCard({ model, onUseModel }: ModelCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trainMutation = useMutation({
    mutationFn: () => api.trainModel(model.modelType),
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: `${getModelName(model.modelType)} training has begun.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/models/status'] });
    },
    onError: () => {
      toast({
        title: "Training Failed",
        description: "Failed to start model training.",
        variant: "destructive",
      });
    }
  });

  const getModelName = (type: string) => {
    const names: { [key: string]: string } = {
      packaging: 'Packaging Model',
      carbon: 'Carbon Footprint',
      product: 'Product Recommendations',
      esg: 'ESG Score'
    };
    return names[type] || type;
  };

  const getModelIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      packaging: 'fas fa-box',
      carbon: 'fas fa-smog',
      product: 'fas fa-shopping-cart',
      esg: 'fas fa-chart-line'
    };
    return icons[type] || 'fas fa-cog';
  };

  const getModelDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      packaging: 'AI-powered packaging recommendations based on product characteristics',
      carbon: 'Calculate and predict carbon emissions for customer activities',
      product: 'Sustainable product recommendations based on user preferences',
      esg: 'Environmental, Social, and Governance scoring with sentiment analysis'
    };
    return descriptions[type] || 'Model description';
  };

  const getIconColor = (type: string) => {
    const colors: { [key: string]: string } = {
      packaging: 'text-primary',
      carbon: 'text-yellow-600',
      product: 'text-secondary',
      esg: 'text-accent'
    };
    return colors[type] || 'text-gray-600';
  };

  const getStatusBadge = () => {
    const statusConfig: { [key: string]: { variant: any; label: string } } = {
      not_trained: { variant: 'secondary', label: 'Not Trained' },
      training: { variant: 'default', label: 'Training...' },
      trained: { variant: 'default', label: 'Trained' },
      error: { variant: 'destructive', label: 'Error' }
    };

    const config = statusConfig[model.status] || { variant: 'secondary', label: 'Unknown' };
    
    if (model.status === 'trained') {
      return (
        <Badge className="bg-sustainability text-white">
          {config.label} {model.accuracy && `(${Math.round(model.accuracy)}%)`}
        </Badge>
      );
    }

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full bg-gray-100`}>
            <i className={`${getModelIcon(model.modelType)} ${getIconColor(model.modelType)} text-xl`} />
          </div>
          {getStatusBadge()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getModelName(model.modelType)}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          {getModelDescription(model.modelType)}
        </p>

        {model.status === 'trained' && model.lastTrained && (
          <p className="text-xs text-gray-500 mb-4">
            Last trained: {new Date(model.lastTrained).toLocaleDateString()}
          </p>
        )}

        <div className="space-y-2">
          <Button 
            onClick={onUseModel}
            disabled={model.status !== 'trained'}
            className="w-full"
          >
            Use Model
          </Button>
          
          {model.status !== 'training' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => trainMutation.mutate()}
              disabled={trainMutation.isPending}
              className="w-full"
            >
              {model.status === 'trained' ? 'Retrain' : 'Train'} Model
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

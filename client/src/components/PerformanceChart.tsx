import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PerformanceChart() {
  const { data: modelStatuses = [] } = useQuery({
    queryKey: ['/api/models/status'],
    queryFn: () => api.getModelStatuses(),
  });

  const chartData = modelStatuses.map(model => ({
    name: model.modelType.charAt(0).toUpperCase() + model.modelType.slice(1),
    accuracy: model.accuracy || 0,
    color: getModelColor(model.modelType)
  }));

  function getModelColor(type: string) {
    const colors: { [key: string]: string } = {
      packaging: '#2563eb',
      carbon: '#f59e0b',
      product: '#10b981',
      esg: '#06b6d4'
    };
    return colors[type] || '#6b7280';
  }

  const platformFeatures = [
    'AI-powered packaging recommendations',
    'Carbon footprint prediction and analysis',
    'Sustainable product recommendations',
    'ESG score assessment and insights',
    'Batch processing for large datasets',
    'Real-time visualization and reporting'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Model Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Model Performance</CardTitle>
            <div className="flex space-x-2">
              {modelStatuses.map((model) => (
                <Badge
                  key={model.modelType}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: getModelColor(model.modelType), color: 'white' }}
                >
                  {model.modelType}: {model.accuracy ? `${Math.round(model.accuracy)}%` : 'N/A'}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                <Bar 
                  dataKey="accuracy" 
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Platform Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <i className="fas fa-cog text-primary text-xl mr-3" />
            Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <i className="fas fa-check-circle text-sustainability mr-3" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ModelCard from "@/components/ModelCard";
import PerformanceChart from "@/components/PerformanceChart";
import PackagingModel from "@/components/PackagingModel";
import CarbonFootprintModel from "@/components/CarbonFootprintModel";
import ProductRecommendationModel from "@/components/ProductRecommendationModel";
import ESGScoreModel from "@/components/ESGScoreModel";
import BatchProcessor from "@/components/BatchProcessor";
import { Package, Calculator, ShoppingCart, TrendingUp, Upload, Zap } from "lucide-react";

export default function Dashboard() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const { data: modelStatuses = [] } = useQuery({
    queryKey: ['/api/models/status'],
    queryFn: () => api.getModelStatuses(),
  });

  const quickActions = [
    {
      icon: Package,
      title: 'Get Packaging Suggestion',
      description: 'AI-powered packaging recommendations',
      section: 'packaging',
      color: 'text-primary'
    },
    {
      icon: Calculator,
      title: 'Calculate Carbon Footprint',
      description: 'Environmental impact analysis',
      section: 'carbon',
      color: 'text-yellow-600'
    },
    {
      icon: ShoppingCart,
      title: 'Product Recommendations',
      description: 'Sustainable product suggestions',
      section: 'products',
      color: 'text-secondary'
    },
    {
      icon: TrendingUp,
      title: 'ESG Score Analysis',
      description: 'Governance and sustainability scoring',
      section: 'esg',
      color: 'text-accent'
    }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'packaging':
        return <PackagingModel />;
      case 'carbon':
        return <CarbonFootprintModel />;
      case 'products':
        return <ProductRecommendationModel />;
      case 'esg':
        return <ESGScoreModel />;
      case 'batch':
        return <BatchProcessor />;
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sustainability Analytics Dashboard
              </h2>
              <p className="text-gray-600">
                Monitor and optimize environmental impact across your operations
              </p>
            </div>

            {/* Model Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {modelStatuses.map((model) => (
                <ModelCard
                  key={model.modelType}
                  model={model}
                  onUseModel={() => setCurrentSection(model.modelType)}
                />
              ))}
            </div>

            {/* Quick Actions Section */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Zap className="text-primary text-xl mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Individual Predictions */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Individual Predictions</h4>
                    <div className="space-y-4">
                      {quickActions.slice(0, 2).map((action) => (
                        <Button
                          key={action.section}
                          variant="ghost"
                          className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-100"
                          onClick={() => setCurrentSection(action.section)}
                        >
                          <div className="flex items-center">
                            <action.icon className={`mr-3 h-5 w-5 ${action.color}`} />
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm text-gray-600">{action.description}</div>
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis & Recommendations */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Analysis & Recommendations</h4>
                    <div className="space-y-4">
                      {quickActions.slice(2).map((action) => (
                        <Button
                          key={action.section}
                          variant="ghost"
                          className="w-full flex items-center justify-between p-4 h-auto hover:bg-gray-100"
                          onClick={() => setCurrentSection(action.section)}
                        >
                          <div className="flex items-center">
                            <action.icon className={`mr-3 h-5 w-5 ${action.color}`} />
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-sm text-gray-600">{action.description}</div>
                            </div>
                          </div>
                          <i className="fas fa-arrow-right text-gray-400" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Batch Process Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center">
                    <Button
                      onClick={() => setCurrentSection('batch')}
                      className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Batch Process Data
                    </Button>
                    <p className="text-gray-600 text-sm mt-2">
                      Upload CSV files for bulk processing and analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <PerformanceChart />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      {renderContent()}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">&copy; 2025 Sustainability Analytics Platform. Powered by Machine Learning.</p>
            <p className="text-xs text-gray-400 mt-2">Built for Vercel deployment with serverless functions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

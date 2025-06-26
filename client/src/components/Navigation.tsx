import { Button } from "@/components/ui/button";
import { Leaf, RotateCcw, Bot } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Navigation({ currentSection, onSectionChange }: NavigationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trainAllMutation = useMutation({
    mutationFn: async () => {
      const modelTypes = ['packaging', 'carbon', 'product', 'esg'];
      const promises = modelTypes.map(type => api.trainModel(type));
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Training Started",
        description: "All models are being trained. This may take a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/models/status'] });
    },
    onError: () => {
      toast({
        title: "Training Failed",
        description: "Failed to start model training. Please try again.",
        variant: "destructive",
      });
    }
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/models/status'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/batch/jobs'] });
    },
    onSuccess: () => {
      toast({
        title: "Refreshed",
        description: "Status updated successfully.",
      });
    }
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'packaging', label: 'Packaging' },
    { id: 'carbon', label: 'Carbon Footprint' },
    { id: 'products', label: 'Products' },
    { id: 'esg', label: 'ESG Score' },
    { id: 'batch', label: 'Batch Process' }
  ];

  return (
    <nav className="gradient-bg shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Leaf className="text-white text-2xl mr-3" />
              <h1 className="text-white text-xl font-bold">Sustainability Analytics</h1>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentSection === item.id
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
            <Button
              size="sm"
              onClick={() => trainAllMutation.mutate()}
              disabled={trainAllMutation.isPending}
              className="bg-sustainability hover:bg-sustainability/90 text-white"
            >
              <Bot className="mr-2 h-4 w-4" />
              Train All Models
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type BatchJob } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function BatchProcessor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState<string>('');

  const { data: batchJobs = [] } = useQuery({
    queryKey: ['/api/batch/jobs'],
    queryFn: () => api.getBatchJobs(),
    refetchInterval: 3000, // Refresh every 3 seconds for real-time updates
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, modelType }: { file: File; modelType: string }) => 
      api.uploadBatchFile(file, modelType),
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "File uploaded and processing started.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/batch/jobs'] });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!selectedModelType) {
      toast({
        title: "Model Type Required",
        description: "Please select a model type for processing.",
        variant: "destructive",
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ file, modelType: selectedModelType });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-sustainability" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      queued: { variant: 'secondary' as const, label: 'Queued' },
      processing: { variant: 'default' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' }
    };

    const { variant, label } = config[status as keyof typeof config] || config.queued;
    
    if (status === 'completed') {
      return <Badge className="bg-sustainability text-white">{label}</Badge>;
    }
    
    return <Badge variant={variant}>{label}</Badge>;
  };

  const modelTypes = [
    { id: 'packaging', name: 'Packaging Analysis', icon: 'fas fa-box', color: 'bg-blue-50' },
    { id: 'carbon', name: 'Carbon Footprint', icon: 'fas fa-smog', color: 'bg-yellow-50' },
    { id: 'product', name: 'Product Scoring', icon: 'fas fa-shopping-cart', color: 'bg-green-50' },
    { id: 'esg', name: 'ESG Analysis', icon: 'fas fa-chart-line', color: 'bg-teal-50' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <Upload className="mr-4 h-8 w-8 text-primary" />
            <div>
              <div>Batch Data Processing</div>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Upload CSV files for bulk analysis and processing
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Zone */}
          <div
            className={`upload-zone border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors ${
              dragActive 
                ? 'dragover border-secondary bg-eco-light' 
                : 'border-gray-300 hover:border-primary hover:bg-muted'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your CSV files here</p>
                <p className="text-gray-600">or click to browse files</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending || !selectedModelType}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Choose Files'
                )}
              </Button>
              <div className="text-xs text-gray-500">
                Supported formats: CSV (max 10MB per file)
              </div>
            </div>
          </div>

          {/* Processing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {modelTypes.map((model) => (
              <div
                key={model.id}
                className={`${model.color} rounded-lg p-6 text-center cursor-pointer transition-all border-2 ${
                  selectedModelType === model.id ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setSelectedModelType(model.id)}
              >
                <i className={`${model.icon} text-2xl mb-3 ${
                  model.id === 'packaging' ? 'text-primary' :
                  model.id === 'carbon' ? 'text-yellow-600' :
                  model.id === 'product' ? 'text-secondary' : 'text-accent'
                }`} />
                <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {model.id === 'packaging' && 'Bulk packaging recommendations'}
                  {model.id === 'carbon' && 'Bulk carbon calculations'}
                  {model.id === 'product' && 'Bulk product recommendations'}
                  {model.id === 'esg' && 'Bulk ESG scoring'}
                </p>
                {selectedModelType === model.id && (
                  <Badge className="bg-primary text-white">Selected</Badge>
                )}
              </div>
            ))}
          </div>

          {/* Processing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {batchJobs.length > 0 ? (
                <div className="space-y-3">
                  {batchJobs.map((job: BatchJob) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center">
                        {getStatusIcon(job.status)}
                        <div className="ml-3">
                          <div className="font-medium">{job.filename}</div>
                          <div className="text-sm text-gray-600">
                            {job.modelType} Analysis • {job.totalRows} rows
                            {job.status === 'processing' && job.processedRows > 0 && (
                              <span> • {job.processedRows}/{job.totalRows} processed</span>
                            )}
                          </div>
                          {job.errorMessage && (
                            <div className="text-sm text-red-600">{job.errorMessage}</div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(job.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No batch jobs yet. Upload a CSV file to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

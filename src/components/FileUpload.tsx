import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  return (
    <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-network">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300 ease-smooth
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-glow opacity-30 rounded-full blur-xl" />
            <div className="relative p-4 bg-primary/10 rounded-full">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Upload Network Data
            </h3>
            <p className="text-muted-foreground">
              {isDragActive 
                ? "Drop your Excel file here..." 
                : "Drag & drop your Excel file here, or click to browse"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .xlsx and .xls files
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="mt-4 border-primary/30 hover:bg-primary/10 hover:border-primary"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>
    </Card>
  );
};
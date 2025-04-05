
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DownloadProgressProps {
  progress: number;
  isVisible: boolean;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="w-full space-y-2 mt-4">
      <div className="flex justify-between text-sm">
        <span>İndiriliyor...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default DownloadProgress;

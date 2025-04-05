
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Quality {
  label: string;
  value: string;
}

interface VideoQualitySelectorProps {
  qualities: Quality[];
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  disabled: boolean;
}

const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  qualities,
  selectedQuality,
  onQualityChange,
  disabled
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Quality:</span>
      <Select
        value={selectedQuality}
        onValueChange={onQualityChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Select quality" />
        </SelectTrigger>
        <SelectContent>
          {qualities.map((quality) => (
            <SelectItem key={quality.value} value={quality.value}>
              {quality.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VideoQualitySelector;

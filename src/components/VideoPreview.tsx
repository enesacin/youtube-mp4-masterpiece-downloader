
import React from 'react';
import { Youtube } from 'lucide-react';

interface VideoPreviewProps {
  videoInfo: {
    title: string;
    thumbnail: string;
    duration: string;
  } | null;
  isLoading: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoInfo, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-6 space-y-4">
        <div className="bg-gray-200 animate-pulse w-full max-w-md h-48 rounded-lg flex items-center justify-center">
          <Youtube size={48} className="text-gray-400" />
        </div>
        <div className="bg-gray-200 animate-pulse w-3/4 h-6 rounded" />
        <div className="bg-gray-200 animate-pulse w-1/2 h-4 rounded" />
      </div>
    );
  }

  if (!videoInfo) return null;

  return (
    <div className="w-full mt-6 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
      <div className="relative">
        <img 
          src={videoInfo.thumbnail} 
          alt={videoInfo.title}
          className="w-full object-cover h-48"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
          {videoInfo.duration}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-2">{videoInfo.title}</h3>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span>Ready to download</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;

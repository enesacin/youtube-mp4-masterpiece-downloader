
import React from 'react';
import { Youtube, Clock, ExternalLink } from 'lucide-react';

interface VideoPreviewProps {
  videoInfo: {
    title: string;
    thumbnail: string;
    duration: string;
    videoId?: string;
  } | null;
  isLoading: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoInfo, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-6 space-y-4">
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse w-full max-w-md h-48 rounded-lg flex items-center justify-center">
          <Youtube size={48} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse w-3/4 h-6 rounded" />
        <div className="bg-gray-200 dark:bg-gray-700 animate-pulse w-1/2 h-4 rounded" />
      </div>
    );
  }

  if (!videoInfo) return null;

  const openYoutubeVideo = () => {
    if (videoInfo.videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoInfo.videoId}`, '_blank');
    }
  };

  return (
    <div className="w-full mt-6 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="relative">
        <img 
          src={videoInfo.thumbnail} 
          alt={videoInfo.title}
          className="w-full object-cover h-48 md:h-64 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={openYoutubeVideo}
          onError={(e) => {
            // Resim yüklenemezse yedek göster
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/1280x720/333/FFF.webp?text=Video+Önizleme';
          }}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
          <Clock size={12} />
          {videoInfo.duration}
        </div>
        {videoInfo.videoId && (
          <div className="absolute top-2 left-2 bg-youtube-red text-white px-2 py-1 text-xs rounded flex items-center gap-1">
            <Youtube size={12} />
            {videoInfo.videoId}
          </div>
        )}
        {videoInfo.videoId && (
          <button 
            onClick={openYoutubeVideo}
            className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-opacity"
            title="YouTube'da aç"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-2">{videoInfo.title}</h3>
        <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>İndirmeye hazır</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;

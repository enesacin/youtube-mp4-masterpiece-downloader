
import React from 'react';
import type { VideoInfo, DownloadType } from './types';

interface DownloadInfoProps {
  videoInfo: VideoInfo | null;
  selectedQuality: string;
  downloadType: DownloadType;
}

const DownloadInfo: React.FC<DownloadInfoProps> = ({ 
  videoInfo, 
  selectedQuality, 
  downloadType 
}) => {
  if (!videoInfo) return null;
  
  const formatQuality = (quality: string) => {
    if (quality === 'highest') return 'En Yüksek';
    if (quality === 'mp3') return 'MP3 (Sadece Ses)';
    return `${quality}p`;
  };
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm mt-4">
      <h3 className="font-medium mb-2">İndirme Bilgileri</h3>
      <ul className="space-y-1 text-gray-600 dark:text-gray-300">
        <li><strong>Video ID:</strong> {videoInfo.videoId}</li>
        <li><strong>Format:</strong> {downloadType === 'mp3' ? 'MP3 (Ses)' : 'MP4 (Video)'}</li>
        <li><strong>Kalite:</strong> {formatQuality(selectedQuality)}</li>
      </ul>
    </div>
  );
};

export default DownloadInfo;

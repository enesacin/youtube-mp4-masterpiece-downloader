
import React from 'react';
import type { VideoInfo, DownloadType } from './types';
import { ExternalLink, FileDown, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadInfoProps {
  videoInfo: VideoInfo | null;
  selectedQuality: string;
  downloadType: DownloadType;
  embedCode?: string | null;
  fallbackUrls?: string[] | null;
  onFallbackDownload?: (url: string) => void;
}

const DownloadInfo: React.FC<DownloadInfoProps> = ({ 
  videoInfo, 
  selectedQuality, 
  downloadType,
  embedCode,
  fallbackUrls,
  onFallbackDownload
}) => {
  if (!videoInfo) return null;
  
  const formatQuality = (quality: string) => {
    if (quality === 'highest') return 'En Yüksek (1080p)';
    if (quality === 'mp3') return 'MP3 (Sadece Ses)';
    return `${quality}p`;
  };
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm mt-4">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        {downloadType === 'mp3' ? <Download size={16} /> : <FileDown size={16} />}
        İndirme Bilgileri
      </h3>
      <ul className="space-y-1 text-gray-600 dark:text-gray-300">
        <li><strong>Video Başlığı:</strong> {videoInfo.title}</li>
        <li><strong>Video ID:</strong> {videoInfo.videoId}</li>
        <li><strong>Format:</strong> {downloadType === 'mp3' ? 'MP3 (Ses)' : 'MP4 (Video)'}</li>
        <li><strong>Kalite:</strong> {formatQuality(selectedQuality)}</li>
        <li><strong>Tahmini Süre:</strong> {videoInfo.duration}</li>
        <li className="text-xs mt-2 text-gray-500 dark:text-gray-400 italic">
          <span className="flex items-center gap-1">
            <ExternalLink size={12} />
            İndirme başlamazsa, aşağıdaki alternatif indirme yöntemlerini kullanabilirsiniz.
          </span>
        </li>
      </ul>

      {fallbackUrls && fallbackUrls.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium">Alternatif İndirme Bağlantıları:</p>
          <div className="grid grid-cols-2 gap-2">
            {fallbackUrls.map((url, index) => (
              <Button 
                key={index}
                onClick={() => onFallbackDownload && onFallbackDownload(url)}
                variant="outline" 
                size="sm"
                className="text-xs flex items-center justify-center gap-1"
              >
                <Download size={12} />
                Alternatif {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {embedCode && (
        <div className="mt-4 border-t pt-3 border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2">Alternatif İndirme Yöntemi</h4>
          <div 
            className="bg-white dark:bg-gray-700 rounded p-2 overflow-hidden" 
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        </div>
      )}
    </div>
  );
};

export default DownloadInfo;

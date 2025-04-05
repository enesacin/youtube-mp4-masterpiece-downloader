
import React from 'react';
import { AlertTriangle, FileDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase';
import YoutubeUrlInput from '../YoutubeUrlInput';
import VideoQualitySelector, { Quality } from '../VideoQualitySelector';
import DownloadProgress from '../DownloadProgress';
import VideoPreview from '../VideoPreview';
import DownloadInfo from './DownloadInfo';
import { useYoutubeDownloader } from './useYoutubeDownloader';

const AVAILABLE_QUALITIES: Quality[] = [
  { label: 'En Yüksek', value: 'highest' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: 'Sadece Ses (MP3)', value: 'mp3' }
];

const YoutubeDownloader: React.FC = () => {
  const {
    isLoading,
    downloadProgress,
    isDownloading,
    videoInfo,
    selectedQuality,
    downloadType,
    embedCode,
    fallbackUrl,
    handleSubmit,
    handleQualityChange,
    handleDownload
  } = useYoutubeDownloader();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!isSupabaseConfigured() && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-4 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Supabase yapılandırması eksik</h3>
            <p className="text-sm mt-1">
              Bu uygulama çalışmak için Supabase bilgilerine ihtiyaç duyar. Lütfen VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değişkenlerini yapılandırın.
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <YoutubeUrlInput 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
        
        {videoInfo && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
              <VideoQualitySelector
                qualities={AVAILABLE_QUALITIES}
                selectedQuality={selectedQuality}
                onQualityChange={handleQualityChange}
                disabled={isDownloading}
              />
              
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-youtube-red hover:bg-red-700 text-white transition-colors w-full sm:w-auto"
              >
                {downloadType === 'mp4' ? <FileDown size={16} /> : <Download size={16} />}
                <span>{isDownloading ? 'İndiriliyor...' : `${downloadType.toUpperCase()} İndir`}</span>
              </Button>
            </div>
            
            <DownloadProgress 
              progress={downloadProgress} 
              isVisible={isDownloading} 
            />
          </>
        )}
      </div>
      
      <VideoPreview 
        videoInfo={videoInfo} 
        isLoading={isLoading} 
      />
      
      <DownloadInfo
        videoInfo={videoInfo}
        selectedQuality={selectedQuality}
        downloadType={downloadType}
        embedCode={embedCode}
        fallbackUrl={fallbackUrl}
      />
    </div>
  );
};

export default YoutubeDownloader;

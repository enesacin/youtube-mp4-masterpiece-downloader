import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import YoutubeUrlInput from './YoutubeUrlInput';
import VideoQualitySelector, { Quality } from './VideoQualitySelector';
import DownloadProgress from './DownloadProgress';
import VideoPreview from './VideoPreview';
import { Download, FileDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const AVAILABLE_QUALITIES: Quality[] = [
  { label: 'En Yüksek', value: 'highest' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: 'Sadece Ses (MP3)', value: 'mp3' }
];

const YoutubeDownloader: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<null | {
    title: string;
    thumbnail: string;
    duration: string;
    videoId: string;
  }>(null);
  const [downloadType, setDownloadType] = useState<'mp4' | 'mp3'>('mp4');

  const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setIsLoading(true);
    setVideoInfo(null);
    
    if (!isSupabaseConfigured()) {
      toast({
        variant: "destructive",
        title: "Supabase yapılandırması eksik",
        description: "Lütfen Supabase URL ve anahtar bilgilerini yapılandırın."
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('youtube-info', {
        body: { url: inputUrl }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data || !data.videoId) {
        throw new Error("Video bilgisi alınamadı");
      }
      
      setVideoInfo(data);
      
      toast({
        title: "Video bilgisi alındı",
        description: "Videoyu tercih ettiğiniz kalitede indirebilirsiniz."
      });
    } catch (error) {
      console.error("Video bilgisi alınırken hata:", error);
      toast({
        variant: "destructive",
        title: "Video bilgisi alınamadı",
        description: "Lütfen URL'yi kontrol edin ve tekrar deneyin."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    if (quality === 'mp3') {
      setDownloadType('mp3');
    } else {
      setDownloadType('mp4');
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    if (!isSupabaseConfigured()) {
      toast({
        variant: "destructive",
        title: "Supabase yapılandırması eksik",
        description: "Lütfen Supabase URL ve anahtar bilgilerini yapılandırın."
      });
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      console.log("İndirme isteği gönderiliyor:", {
        videoId: videoInfo.videoId,
        quality: selectedQuality,
        downloadType
      });
      
      const { data, error } = await supabase.functions.invoke('youtube-download', {
        body: { 
          videoId: videoInfo.videoId,
          quality: selectedQuality,
          downloadType
        }
      });
      
      clearInterval(progressInterval);
      setDownloadProgress(100);
      
      if (error) {
        console.error("İndirme hatası:", error);
        throw new Error(error.message || "İndirme sırasında bir hata oluştu");
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || "İndirme işlemi başarısız");
      }
      
      console.log("İndirme cevabı:", data);
      
      const fileName = `${videoInfo.title.replace(/[^\w\s]/gi, '')}_${selectedQuality}.${downloadType}`;
      
      setTimeout(() => {
        window.open(data.downloadUrl, '_blank');
        
        toast({
          title: "İndirme tamamlandı!",
          description: `${fileName} dosyası tarayıcınızda açıldı.`,
        });
      }, 1000);
      
    } catch (error) {
      console.error("İndirme hatası:", error);
      toast({
        variant: "destructive",
        title: "İndirme başarısız",
        description: error instanceof Error ? error.message : "İndirme sırasında bir hata oluştu. Lütfen tekrar deneyin."
      });
    } finally {
      setIsDownloading(false);
    }
  };

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
      
      {videoInfo && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm mt-4">
          <h3 className="font-medium mb-2">İndirme Bilgileri</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300">
            <li><strong>Video ID:</strong> {videoInfo.videoId}</li>
            <li><strong>Format:</strong> {downloadType.toUpperCase()}</li>
            <li><strong>Kalite:</strong> {selectedQuality === 'highest' ? 'En Yüksek' : selectedQuality}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default YoutubeDownloader;


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/supabase';
import { VideoInfo, DownloadType } from './types';
import { fetchVideoInfo, downloadVideo } from './api';
import { openYoutubeLink } from './utils';

export type { VideoInfo, DownloadType } from './types';

export function useYoutubeDownloader() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>('mp4');

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
      const data = await fetchVideoInfo(inputUrl);
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
    setDownloadProgress(10); // Başlangıç değeri
    
    try {
      toast({
        title: "Bilgilendirme",
        description: "YouTube video indirme işlemi şu anda direkt olarak desteklenmemektedir. Supabase Edge Functions, yt-dlp gibi alt süreçleri çalıştıramaz."
      });
      
      try {
        await downloadVideo(videoInfo, selectedQuality, downloadType);
      } catch (error) {
        console.error("İndirme hatası:", error);
      }
      
      setDownloadProgress(100);
      
      // Alternatif olarak kullanıcıya YouTube indirme sitesinin bağlantısını gösterelim
      toast({
        title: "Önerilen Alternatif",
        description: "Çevrimiçi YouTube indirme sitelerini kullanabilir veya kendi sunucunuza yt-dlp kurarak video indirebilirsiniz.",
      });
      
      // YouTube'a direkt link sağlayalım
      openYoutubeLink(videoInfo.videoId);
      
    } catch (error) {
      console.error("İndirme hatası:", error);
      toast({
        variant: "destructive",
        title: "İndirme başarısız",
        description: error instanceof Error ? error.message : "İndirme sırasında bir hata oluştu. Supabase Edge Functions'ın sınırlamaları nedeniyle, YouTube video indirme işlemi desteklenmemektedir."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    url,
    selectedQuality,
    isLoading,
    downloadProgress,
    isDownloading,
    videoInfo,
    downloadType,
    handleSubmit,
    handleQualityChange,
    handleDownload
  };
}


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type VideoInfo = {
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
};

export type DownloadType = 'mp4' | 'mp3';

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
    setDownloadProgress(10); // Başlangıç değeri
    
    try {
      toast({
        title: "Bilgilendirme",
        description: "YouTube video indirme işlemi şu anda direkt olarak desteklenmemektedir. Supabase Edge Functions, yt-dlp gibi alt süreçleri çalıştıramaz."
      });
      
      const { data, error } = await supabase.functions.invoke('youtube-download', {
        body: { 
          videoId: videoInfo.videoId,
          quality: selectedQuality,
          downloadType
        }
      });
      
      setDownloadProgress(100);
      
      if (error) {
        console.error("İndirme hatası:", error);
        throw new Error(error.message || "İndirme sırasında bir hata oluştu");
      }
      
      if (data.error) {
        console.error("İndirme cevap hatası:", data.error);
        throw new Error(data.error || "İndirme işlemi başarısız");
      }
      
      // Alternatif olarak kullanıcıya YouTube indirme sitesinin bağlantısını gösterelim
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoInfo.videoId}`;
      
      toast({
        title: "Önerilen Alternatif",
        description: "Çevrimiçi YouTube indirme sitelerini kullanabilir veya kendi sunucunuza yt-dlp kurarak video indirebilirsiniz.",
      });
      
      // YouTube'a direkt link sağlayalım
      const link = document.createElement('a');
      link.href = youtubeUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
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

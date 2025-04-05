
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
      
      // Tarayıcıya uygun dosya adı oluşturma
      const safeFileName = videoInfo.title.replace(/[^\w\s]/gi, '') || videoInfo.videoId;
      const fileName = `${safeFileName}_${selectedQuality}.${downloadType}`;
      
      // Dosya indirme işlemi
      const url = data.downloadUrl;
      
      // Simülasyon bilgisi gösterelim
      if (data.isSimulation) {
        toast({
          title: "Demo Modu",
          description: "Bu bir simülasyondur. Gerçek video yerine örnek bir dosya indirilecektir.",
        });
      }
      
      // Dosyayı indirmek için Fetch API kullanalım
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`İndirme başarısız: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Temizlik
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }, 100);
        
        toast({
          title: "İndirme tamamlandı!",
          description: `${fileName} dosyası indirildi. ${data.isSimulation ? '(Örnek dosya)' : ''}`,
        });
      } catch (downloadErr) {
        console.error("Blob indirme hatası:", downloadErr);
        
        // Alternatif indirme yöntemi
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        toast({
          title: "İndirme başlatıldı",
          description: `Tarayıcınız dosyayı indirmeye başladı. ${data.isSimulation ? '(Örnek dosya)' : ''}`,
        });
      }
      
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

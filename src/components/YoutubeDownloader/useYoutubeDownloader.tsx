
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { VideoInfo, DownloadType } from './types';
import { fetchVideoInfo, downloadVideo, initiateDownload } from './api';
import { openYoutubeLink } from './utils';

export function useYoutubeDownloader() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>('mp4');
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setIsLoading(true);
    setVideoInfo(null);
    setEmbedCode(null);
    setFallbackUrl(null);
    
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
      // İndirme bilgisini al
      const downloadData = await downloadVideo(videoInfo, selectedQuality, downloadType);
      
      if (!downloadData.downloadUrl) {
        throw new Error("İndirme URL'si alınamadı");
      }
      
      setDownloadProgress(50);
      
      if (downloadData.embedCode) {
        setEmbedCode(downloadData.embedCode);
      }
      
      if (downloadData.fallbackUrl) {
        setFallbackUrl(downloadData.fallbackUrl);
      }
      
      // Dosya adını hazırla
      const fileExtension = downloadType === 'mp3' ? 'mp3' : 'mp4';
      const fileName = `${videoInfo.title.replace(/[^\w\s]/gi, '')}_${selectedQuality}.${fileExtension}`;
      
      // İndirme işlemini başlat
      initiateDownload(downloadData.downloadUrl, fileName);
      
      setDownloadProgress(100);
      
      toast({
        title: "İndirme başlatıldı",
        description: "İndirme işlemi başlatıldı. Tarayıcınız indirmeyi başlatamazsa, alternatif indirme yöntemini deneyin.",
      });
      
    } catch (error) {
      console.error("İndirme hatası:", error);
      
      toast({
        variant: "destructive",
        title: "İndirme başarısız",
        description: error instanceof Error ? 
          error.message : 
          "İndirme sırasında bir hata oluştu. Lütfen alternatif indirme yöntemini deneyin."
      });
      
      // Gömülü embed kodu varsa gösterilecek
      if (!embedCode && videoInfo.videoId) {
        const fallbackEmbed = `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://api.vevioz.com/api/widget/${downloadType === 'mp3' ? 'mp3' : 'mp4'}/${videoInfo.videoId}"></iframe>`;
        setEmbedCode(fallbackEmbed);
      }
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
    embedCode,
    fallbackUrl,
    handleSubmit,
    handleQualityChange,
    handleDownload
  };
}

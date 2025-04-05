
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { VideoInfo, DownloadType } from './types';

export async function fetchVideoInfo(url: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase yapılandırması eksik");
  }
  
  const { data, error } = await supabase.functions.invoke('youtube-info', {
    body: { url }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data || !data.videoId) {
    throw new Error("Video bilgisi alınamadı");
  }
  
  return data as VideoInfo;
}

export async function downloadVideo(videoInfo: VideoInfo, selectedQuality: string, downloadType: DownloadType) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase yapılandırması eksik");
  }
  
  const { data, error } = await supabase.functions.invoke('youtube-download', {
    body: { 
      videoId: videoInfo.videoId,
      quality: selectedQuality,
      downloadType
    }
  });
  
  if (error) {
    console.error("İndirme hatası:", error);
    throw new Error(error.message || "İndirme sırasında bir hata oluştu");
  }
  
  if (data.error) {
    console.error("İndirme cevap hatası:", data.error);
    throw new Error(data.error || "İndirme işlemi başarısız");
  }
  
  return data;
}

export function initiateDownload(downloadUrl: string, fileName: string) {
  // Yeni pencerede doğrudan indirme başlat
  const newWindow = window.open(downloadUrl, '_blank');
  
  // Yeni pencere açılmadı mı? (Pop-up engelleyici varsa)
  if (!newWindow) {
    console.warn('Popup engellendi, alternatif indirme yöntemi deneniyor');
    
    // Alternatif yöntem: iframe kullanarak indirme
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    if (iframe.contentWindow) {
      iframe.contentWindow.location.href = downloadUrl;
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } else {
      // Son çare: a etiketi ile indirme
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);
    }
  }
  
  console.log('İndirme işlemi başlatıldı (Yeni pencere veya alternatif yöntem ile)');
}

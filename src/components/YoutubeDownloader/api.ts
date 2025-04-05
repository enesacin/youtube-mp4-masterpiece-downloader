
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
  // Iframe ile yeni bir pencerede hizmet açarak indirme işlemini başlat
  // Bu yöntem, download özelliğinin çalışmadığı durumlar için daha güvenilirdir
  
  // Open a new window to the download service
  const downloadWindow = window.open(downloadUrl, '_blank');
  
  // Create a fallback method with the download attribute
  setTimeout(() => {
    if (!downloadWindow || downloadWindow.closed || typeof downloadWindow.closed === 'undefined') {
      // If popup was blocked, try the direct download approach
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('İndirme işlemi başlatıldı (alternatif metod)');
    }
  }, 1000);
}

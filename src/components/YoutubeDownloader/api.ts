
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
  // Dosyayı doğrudan indirmek için fetch kullanma
  fetch(downloadUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`İndirme başarısız oldu: ${response.status} ${response.statusText}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Blob'dan bir URL oluşturma
      const blobUrl = window.URL.createObjectURL(blob);
      
      // URL kullanarak bir indirme bağlantısı oluşturma
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      
      // İndirme işlemini başlatma
      downloadLink.click();
      
      // Temizleme
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    })
    .catch(error => {
      console.error("İndirme sırasında hata:", error);
      alert(`İndirme sırasında bir hata oluştu: ${error.message}`);
    });
}


import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { VideoInfo, DownloadType } from './types';

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

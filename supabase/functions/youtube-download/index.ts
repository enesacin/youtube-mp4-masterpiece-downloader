
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS için OPTIONS isteklerini işleyelim
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId, quality, downloadType } = await req.json()
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID gereklidir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("İndirme isteği alındı:", { videoId, quality, downloadType });

    // Input doğrulama
    if (!videoId.match(/^[a-zA-Z0-9_-]{11}$/)) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz video ID formatı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Güvenli bir dönüş değeri oluşturalım
    const videoTitle = `YouTube Video ${videoId}`;

    // Kalite ve dosya tipi ayarları
    const qualityLabel = quality === 'highest' ? 'En Yüksek Kalite' : 
                        quality === 'mp3' ? 'MP3 Ses' : `${quality}p`;
    
    const fileExtension = downloadType === 'mp3' ? 'mp3' : 'mp4';
    const fileSizeEstimate = downloadType === 'mp3' ? 
      Math.floor(Math.random() * 15) + 2 : 
      Math.floor(Math.random() * 50) + 15;
    
    // Bu bir simülasyondur - gerçek indirme fonksiyonu uygulanabilir
    // Gerçek uygulamada, youtube-dl veya benzeri bir araç kullanabilirsiniz
    
    // Simülasyon indirme URL'si
    const downloadUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Simüle edilmiş bir gecikme (gerçek indirme işlemi zaman alacaktır)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("İndirme simülasyonu tamamlandı:", {
      videoId,
      quality,
      downloadType,
      fileName: `youtube-${videoId}.${fileExtension}`
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: downloadUrl,
        fileName: `youtube-${videoId}.${fileExtension}`,
        fileSize: `${fileSizeEstimate}MB`,
        quality: qualityLabel,
        title: videoTitle,
        message: 'İndirme başarılı! (Simülasyon)',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("İndirme işlemi hatası:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

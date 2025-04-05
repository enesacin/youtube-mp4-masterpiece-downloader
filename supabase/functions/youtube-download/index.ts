
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
    
    // Simülasyon - Örnek dosya URL'leri (Geçerli ve herkese açık URL'ler)
    const downloadUrl = downloadType === 'mp3' 
      ? 'https://file-examples.com/storage/fe5467a6a163010b197fb20/2017/11/file_example_MP3_700KB.mp3'
      : 'https://file-examples.com/storage/fe5467a6a163010b197fb20/2017/04/file_example_MP4_480_1_5MG.mp4';
    
    // Simüle edilmiş bir gecikme (gerçek indirme işlemi zaman alacaktır)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("İndirme simülasyonu tamamlandı:", {
      videoId,
      quality,
      downloadType,
      fileName: `youtube-${videoId}.${fileExtension}`,
      downloadUrl
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

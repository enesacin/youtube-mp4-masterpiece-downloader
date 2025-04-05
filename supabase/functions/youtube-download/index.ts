
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

    // YouTube URL oluştur
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Video bilgisi almak için YouTube oEmbed API'sini kullanalım
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    
    if (!oembedResponse.ok) {
      return new Response(
        JSON.stringify({ error: "YouTube API'si yanıt vermedi" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const oembedData = await oembedResponse.json();
    const videoTitle = oembedData.title || `YouTube Video ${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    // Güvenli bir indirme hizmetine yönlendirme URL'si oluşturalım
    // Bu, doğrudan bir indirme servisi API'sine gider
    let downloadUrl = '';
    let serviceType = '';
    
    if (downloadType === 'mp3') {
      // MP3 için indirme servisi
      downloadUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
      serviceType = 'mp3';
    } else {
      // Video için indirme servisi
      // Kalite seçeneğine göre URL oluştur
      const videoQuality = quality === 'highest' ? '1080' : quality;
      downloadUrl = `https://api.vevioz.com/api/button/videos/${videoId}`;
      serviceType = `mp4-${videoQuality}p`;
    }
    
    // Başarılı yanıt döndür
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        downloadUrl, 
        serviceType,
        qualityLabel: quality === 'highest' ? 'En Yüksek Kalite' : `${quality}p`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

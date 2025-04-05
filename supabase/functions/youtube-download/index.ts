
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
    
    // Not: Supabase Edge Functions, dış süreçleri çalıştırmaya izin vermez (yt-dlp gibi)
    // Bu nedenle doğrudan YouTube API'sini kullanmamız gerekiyor
    
    // Video bilgisi almak için YouTube oEmbed API'sini kullanalım
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const oembedResponse = await fetch(oembedUrl);
    const oembedData = await oembedResponse.json();
    
    const videoTitle = oembedData.title || `YouTube Video ${videoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    // Kalite bilgisini kullanarak videoyu indirmek için bir link oluşturalım
    let videoUrl = '';
    let qualityLabel = '';
    
    if (downloadType === 'mp3') {
      // Doğrudan YouTube'dan MP3 indirmek mümkün değil
      // Bu noktada son kullanıcıya bir mesaj gösterilebilir
      return new Response(
        JSON.stringify({
          error: "Supabase Edge Functions üzerinde doğrudan YouTube'dan MP3 indirmek mümkün değildir. Bir sunucu uygulamasına ihtiyaç vardır."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    } else {
      // Video indirme için seçenek oluşturalım
      // Not: Bu, doğrudan YouTube'dan video indirmek için çalışmayacaktır
      // Sadece arayüz testleri için bir yanıt döndürüyoruz
      
      if (quality === 'highest') {
        qualityLabel = 'En Yüksek Kalite';
      } else if (quality === 'mp3') {
        qualityLabel = 'MP3 Ses';
      } else {
        qualityLabel = `${quality}p`;
      }
      
      // Kullanıcıya bir bilgi mesajı
      return new Response(
        JSON.stringify({
          success: false,
          error: "Supabase Edge Functions üzerinde doğrudan YouTube video indirme işlemi desteklenmemektedir.",
          message: "YouTube video indirme işlemi için yt-dlp gibi araçların çalıştırılabildiği bir sunucu gereklidir. Supabase Edge Functions, güvenlik nedeniyle alt süreçleri çalıştırmaya izin vermez.",
          videoId,
          title: videoTitle,
          thumbnail: thumbnailUrl,
          quality: qualityLabel
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
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

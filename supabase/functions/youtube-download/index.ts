
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
    
    // Alternatif indirme servisleri
    const alternativeDownloadUrls = {
      'mp3': [
        `https://backend.singlelogin.me/api/converter/convert?url=${encodeURIComponent(youtubeUrl)}&format=mp3`,
        `https://loader.to/api/button/?url=${encodeURIComponent(youtubeUrl)}&f=mp3`,
        `https://ymp4.download/api/json/mp3/${videoId}`
      ],
      'mp4': [
        `https://backend.singlelogin.me/api/converter/convert?url=${encodeURIComponent(youtubeUrl)}&format=mp4&quality=${quality === 'highest' ? '1080' : quality}`,
        `https://loader.to/api/button/?url=${encodeURIComponent(youtubeUrl)}&f=mp4&quality=${quality === 'highest' ? '1080' : quality}`,
        `https://ymp4.download/api/json/mp4/${videoId}/${quality === 'highest' ? '1080' : quality}`
      ]
    };
    
    // Embed kodları (iframe veya script)
    const embedCode = {
      'mp3': `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://loader.to/api/button/?url=${encodeURIComponent(youtubeUrl)}&f=mp3"></iframe>`,
      'mp4': `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://loader.to/api/button/?url=${encodeURIComponent(youtubeUrl)}&f=mp4&quality=${quality === 'highest' ? '1080' : quality}"></iframe>`
    };
    
    // Doğrudan indirme bağlantıları
    const directDownloadUrl = `https://dl.y2mate.com/api/${downloadType === 'mp3' ? 'youtube-mp3' : 'youtube'}/convert?url=${encodeURIComponent(youtubeUrl)}${downloadType === 'mp3' ? '&quality=320kbps' : `&quality=${quality === 'highest' ? '1080' : quality}p`}`;
    
    // Daha güvenilir alternatif servisler
    const yt1sApiUrl = `https://yt1s.com/api/ajaxSearch`;
    const body = new URLSearchParams();
    body.append('q', youtubeUrl);
    body.append('vt', downloadType);
    
    // Başarılı yanıt döndür
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        downloadUrl: directDownloadUrl, // Doğrudan indirme bağlantısı
        alternativeUrls: downloadType === 'mp3' ? alternativeDownloadUrls.mp3 : alternativeDownloadUrls.mp4,
        embedCode: downloadType === 'mp3' ? embedCode.mp3 : embedCode.mp4,
        downloadType,
        quality: quality === 'highest' ? '1080' : quality,
        downloadFilename: `${videoTitle.replace(/[^\w\s-]/gi, '')}_${quality}.${downloadType}`
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

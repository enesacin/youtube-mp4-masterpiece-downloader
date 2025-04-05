
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
    
    // Alternatif indirme servisleri - daha güvenilir servisler seçildi
    const alternativeDownloadUrls = {
      'mp3': [
        `https://api.vevioz.com/api/button/mp3/${videoId}`,
        `https://api.ytbvideoly.com/api/button/mp3/${videoId}`,
        `https://api.y2mate.guru/api/convert/mp3/${videoId}`
      ],
      'mp4': [
        `https://api.vevioz.com/api/button/videos/${videoId}/${quality === 'highest' ? '1080' : quality}`,
        `https://api.ytbvideoly.com/api/button/videos/${videoId}/${quality === 'highest' ? '1080' : quality}`,
        `https://api.y2mate.guru/api/convert/mp4/${videoId}/${quality === 'highest' ? '1080' : quality}`
      ]
    };
    
    // Embed kodları (iframe)
    const embedCode = {
      'mp3': `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://api.vevioz.com/api/widget/mp3/${videoId}"></iframe>`,
      'mp4': `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://api.vevioz.com/api/widget/mp4/${videoId}/${quality === 'highest' ? '1080' : quality}"></iframe>`
    };
    
    // Çalışan doğrudan indirme bağlantıları (SSYouTube hizmeti)
    const ssyoutubeUrl = `https://ssyoutube.com/api/convert?url=${encodeURIComponent(youtubeUrl)}`;
    const savefromUrl = `https://en.savefrom.net/download-from-youtube/#url=${encodeURIComponent(youtubeUrl)}`;
    
    // Doğrudan indirme bağlantısı
    const directDownloadUrl = `https://api.vevioz.com/api/button/${downloadType === 'mp3' ? 'mp3' : 'videos'}/${videoId}${downloadType === 'mp4' ? `/${quality === 'highest' ? '1080' : quality}` : ''}`;
    
    // Başarılı yanıt döndür
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        downloadUrl: directDownloadUrl,
        fallbackUrl: downloadType === 'mp3' ? ssyoutubeUrl : savefromUrl,
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


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
    
    // Daha güvenilir indirme servisleri
    const downloadServices = {
      mp3: [
        `https://api.savefrom.to/api/convert?url=${encodeURIComponent(youtubeUrl)}&action=audio&format=mp3`,
        `https://api.recordmp3.co/api/dl/audio?v=${videoId}`,
        `https://dl1.savemedia.website/download/audio/mp3/${videoId}`
      ],
      mp4: [
        `https://api.savefrom.to/api/convert?url=${encodeURIComponent(youtubeUrl)}&action=video&format=mp4&quality=${quality === 'highest' ? '1080' : quality}`,
        `https://dl1.savemedia.website/download/video/mp4/${videoId}/${quality === 'highest' ? '1080' : quality}`,
        `https://ytdl.vsrv.one/api/download?v=${videoId}&f=mp4&q=${quality === 'highest' ? '1080' : quality}`
      ]
    };
    
    // Embed kodları (iframe) - ilk indirme başarısız olursa kullanılacak
    const embedCode = {
      mp3: `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://getn.topsandtees.space/z8Ajkj?video_id=${videoId}&t=mp3"></iframe>`,
      mp4: `<iframe style="width:100%;height:60px;border:0;overflow:hidden;" scrolling="no" src="https://getn.topsandtees.space/z8Ajkj?video_id=${videoId}&t=mp4"></iframe>`
    };
    
    // Daha güvenilir indirme bağlantıları
    const directDownloadUrl = downloadServices[downloadType][0];
    
    // Başarılı yanıt döndür
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        downloadUrl: directDownloadUrl,
        fallbackUrls: downloadType === 'mp3' ? downloadServices.mp3 : downloadServices.mp4,
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

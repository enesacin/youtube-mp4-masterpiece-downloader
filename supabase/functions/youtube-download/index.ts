
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
    
    // Doğrudan indirilebilir linkler oluştur
    let downloadUrl = '';
    
    if (downloadType === 'mp3') {
      // MP3 için doğrudan indirme URL'si
      downloadUrl = `https://dl.y2mate.com/api/youtube-mp3/convert?url=${encodeURIComponent(youtubeUrl)}&quality=320kbps`;
    } else {
      // Video kalitesine göre indirme URL'si
      const videoQuality = quality === 'highest' ? '1080' : quality;
      downloadUrl = `https://dl.y2mate.com/api/youtube/convert?url=${encodeURIComponent(youtubeUrl)}&quality=${videoQuality}p`;
    }
    
    // Alternatif indirme servisleri
    const alternativeDownloadUrls = {
      'mp3': [
        `https://dl.y2mate.com/api/youtube-mp3/convert?url=${encodeURIComponent(youtubeUrl)}&quality=320kbps`,
        `https://cdn.ytmp3cc.cc/download.php?v=${videoId}&format=mp3`,
        `https://yt-download.org/api/mp3/${videoId}`
      ],
      'mp4': [
        `https://dl.y2mate.com/api/youtube/convert?url=${encodeURIComponent(youtubeUrl)}&quality=${quality === 'highest' ? '1080' : quality}p`,
        `https://cdn.ytmp4.cc/download.php?v=${videoId}&format=mp4&quality=${quality === 'highest' ? '1080' : quality}`,
        `https://yt-download.org/api/mp4/${videoId}/${quality === 'highest' ? '1080' : quality}`
      ]
    };
    
    // Başarılı yanıt döndür
    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        downloadUrl: downloadType === 'mp3' ? alternativeDownloadUrls.mp3[1] : alternativeDownloadUrls.mp4[1], // En güvenilir servisi kullan
        alternativeUrls: downloadType === 'mp3' ? alternativeDownloadUrls.mp3 : alternativeDownloadUrls.mp4,
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

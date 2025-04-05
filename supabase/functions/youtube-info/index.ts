
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // CORS için OPTIONS isteklerini işleyelim
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'YouTube URL gereklidir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Video ID'sini çıkartın
    const videoId = extractVideoId(url)
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz YouTube URL formatı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("İşlenen video ID:", videoId);

    // YouTube sayfasını getir
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`)
    const html = await response.text()
    
    // Cheerio ile HTML'i parse et
    const $ = load(html)
    
    // Video başlığını bul
    const title = $('meta[property="og:title"]').attr('content') || `YouTube Video (${videoId})`
    
    // Thumbnail URL'sini al
    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    
    // Süre bilgisi (gerçek uygulamada daha doğru bir yöntem kullanılabilir)
    const durationText = $('meta[itemprop="duration"]').attr('content')
    let duration = '0:00'
    
    if (durationText) {
      // PT1H30M15S formatını 1:30:15 formatına dönüştür
      const match = durationText.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      if (match) {
        const hours = match[1] ? parseInt(match[1]) : 0
        const minutes = match[2] ? parseInt(match[2]) : 0
        const seconds = match[3] ? parseInt(match[3]) : 0
        
        if (hours > 0) {
          duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
          duration = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      }
    }

    return new Response(
      JSON.stringify({
        videoId,
        title,
        thumbnail,
        duration
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("YouTube bilgisi alma hatası:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function extractVideoId(url: string): string | null {
  // Normal video URL'leri (www.youtube.com ve youtu.be)
  let match = url.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  
  // Bulunamadıysa, Shorts URL'i için kontrol et
  if (!match) {
    match = url.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  }
  
  // Embed URL'leri için kontrol et
  if (!match) {
    match = url.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  }
  
  // Playlist içindeki videolar için kontrol et (v parametresi)
  if (!match) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const videoId = params.get('v');
    if (videoId && videoId.length === 11) {
      return videoId;
    }
  }
  
  return match ? match[1] : null
}

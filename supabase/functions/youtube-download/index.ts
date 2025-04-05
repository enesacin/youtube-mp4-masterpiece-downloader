
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
    
    // Video bilgisi alımı
    const videoInfoCommand = new Deno.Command("yt-dlp", {
      args: ["--dump-json", youtubeUrl],
    });
    
    const videoInfoOutput = await videoInfoCommand.output();
    
    if (!videoInfoOutput.success) {
      console.error("Video bilgisi alma hatası:", new TextDecoder().decode(videoInfoOutput.stderr));
      return new Response(
        JSON.stringify({ error: "Video bilgisi alınamadı" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Video bilgilerini JSON olarak analiz et
    const videoInfoText = new TextDecoder().decode(videoInfoOutput.stdout);
    const videoInfo = JSON.parse(videoInfoText);
    
    const videoTitle = videoInfo.title || `YouTube Video ${videoId}`;
    const thumbnailUrl = videoInfo.thumbnail || "";
    
    // İndirme formatı ve kalite ayarları
    let format = "";
    let outputFileName = "";
    
    if (downloadType === "mp3") {
      // MP3 ses indirme
      format = "bestaudio[ext=m4a]/bestaudio";
      outputFileName = `youtube-${videoId}.mp3`;
    } else {
      // Video indirme
      if (quality === "highest") {
        format = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";
      } else {
        // Belirli çözünürlüğü belirt, örn: 720
        format = `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}][ext=mp4]/best[height<=${quality}]`;
      }
      outputFileName = `youtube-${videoId}.mp4`;
    }
    
    // İndirme komutunu oluştur
    const downloadCommand = new Deno.Command("yt-dlp", {
      args: [
        "-f", format,
        "-o", `/tmp/${outputFileName}`,
        youtubeUrl
      ],
    });
    
    console.log("İndirme komutu çalıştırılıyor:", {
      format,
      outputFile: `/tmp/${outputFileName}`,
      url: youtubeUrl
    });
    
    // Videoyu indir
    const downloadOutput = await downloadCommand.output();
    
    if (!downloadOutput.success) {
      console.error("İndirme hatası:", new TextDecoder().decode(downloadOutput.stderr));
      return new Response(
        JSON.stringify({ error: "Video indirilemedi" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // İndirilen dosyanın boyutunu kontrol et
    const fileInfo = await Deno.stat(`/tmp/${outputFileName}`);
    const fileSize = Math.ceil(fileInfo.size / (1024 * 1024)); // MB cinsinden
    
    // Dosyayı oku
    const fileContent = await Deno.readFile(`/tmp/${outputFileName}`);
    
    // MIME tipini belirle
    const contentType = downloadType === "mp3" ? "audio/mpeg" : "video/mp4";
    
    // Dosyayı sil (temizlik)
    try {
      await Deno.remove(`/tmp/${outputFileName}`);
    } catch (e) {
      console.error("Geçici dosya silinemedi:", e);
    }
    
    // Dosya içeriğini base64 olarak kodla
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileContent)));
    
    const qualityLabel = quality === 'highest' ? 'En Yüksek Kalite' : 
                        quality === 'mp3' ? 'MP3 Ses' : `${quality}p`;
    
    // Base64 kodlu dosyayı Data URL formatında dön
    const dataUrl = `data:${contentType};base64,${base64Content}`;
    
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: dataUrl,
        fileName: outputFileName,
        fileSize: `${fileSize}MB`,
        quality: qualityLabel,
        title: videoTitle,
        thumbnail: thumbnailUrl,
        message: 'Video başarıyla indirildi!'
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

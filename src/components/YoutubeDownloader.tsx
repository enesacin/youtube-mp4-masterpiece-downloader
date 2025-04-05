
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import YoutubeUrlInput from './YoutubeUrlInput';
import VideoQualitySelector, { Quality } from './VideoQualitySelector';
import DownloadProgress from './DownloadProgress';
import VideoPreview from './VideoPreview';
import { Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AVAILABLE_QUALITIES: Quality[] = [
  { label: 'Highest', value: 'highest' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
  { label: 'Audio Only (MP3)', value: 'mp3' }
];

const YoutubeDownloader: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<null | {
    title: string;
    thumbnail: string;
    duration: string;
    videoId: string;
  }>(null);
  const [downloadType, setDownloadType] = useState<'mp4' | 'mp3'>('mp4');

  const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setIsLoading(true);
    setVideoInfo(null);
    
    try {
      // Extract video ID from URL
      const videoId = extractVideoId(inputUrl);
      
      if (!videoId) {
        throw new Error("Could not extract video ID from URL");
      }
      
      // In a real implementation, we would fetch from a backend API
      // For demo purposes, we're using a timeout to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isYoutubeShorts = inputUrl.includes('/shorts/');
      
      // Get video thumbnail
      const thumbnailUrl = isYoutubeShorts
        ? `https://placehold.co/600x1200/333/FFF.webp?text=YouTube+Shorts+${videoId}`
        : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      // Mock response with actual video ID
      const mockVideoInfo = {
        title: isYoutubeShorts 
          ? `YouTube Shorts Video (${videoId})` 
          : `YouTube Video (${videoId})`,
        thumbnail: thumbnailUrl,
        duration: isYoutubeShorts ? '0:30' : '10:30',
        videoId: videoId
      };
      
      setVideoInfo(mockVideoInfo);
      
      toast({
        title: "Video information retrieved",
        description: "You can now download the video in your preferred quality."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to retrieve video information",
        description: "Please check the URL and try again."
      });
      console.error("Error fetching video info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
    // Regular video URLs (both www.youtube.com and youtu.be)
    let match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    // If not found, try to match Shorts URL
    if (!match) {
      match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    }
    
    return match ? match[1] : null;
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    // Set download type based on quality selection
    if (quality === 'mp3') {
      setDownloadType('mp3');
    } else {
      setDownloadType('mp4');
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Simulate download progress
      const steps = 10;
      for (let i = 0; i <= 100; i += (100/steps)) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDownloadProgress(Math.min(i, 100));
      }
      
      // Format filename with video ID for more realistic experience
      const videoTitle = videoInfo.title.replace(/[^\w\s]/gi, '');
      const fileExtension = downloadType === 'mp4' ? 'mp4' : 'mp3';
      const quality = selectedQuality === 'highest' ? 'highest' : selectedQuality;
      const fileName = `${videoTitle}_${quality}.${fileExtension}`;
      
      // In a real implementation, this would be a call to a backend API
      // that would handle the actual YouTube download process
      
      // Create a sample blob for demonstration
      const mimeType = downloadType === 'mp4' ? 'video/mp4' : 'audio/mpeg';
      const blobContent = `This is a placeholder for ${downloadType === 'mp4' ? 'video' : 'audio'} data for ID: ${videoInfo.videoId} at quality: ${selectedQuality}`;
      const blob = new Blob([blobContent], { type: mimeType });
      
      // Create and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download complete!",
        description: `${videoTitle} has been downloaded as ${fileExtension.toUpperCase()} in ${selectedQuality === 'highest' ? 'highest quality' : selectedQuality} format.`
      });
      
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "An error occurred during download. Please try again."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <YoutubeUrlInput 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
        
        {videoInfo && (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
              <VideoQualitySelector
                qualities={AVAILABLE_QUALITIES}
                selectedQuality={selectedQuality}
                onQualityChange={handleQualityChange}
                disabled={isDownloading}
              />
              
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-youtube-red hover:bg-red-700 text-white transition-colors w-full sm:w-auto"
              >
                {downloadType === 'mp4' ? <FileDown size={16} /> : <Download size={16} />}
                <span>{isDownloading ? 'Downloading...' : `Download ${downloadType.toUpperCase()}`}</span>
              </Button>
            </div>
            
            <DownloadProgress 
              progress={downloadProgress} 
              isVisible={isDownloading} 
            />
          </>
        )}
      </div>
      
      <VideoPreview 
        videoInfo={videoInfo} 
        isLoading={isLoading} 
      />
      
      {videoInfo && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm mt-4">
          <h3 className="font-medium mb-2">Download Information</h3>
          <ul className="space-y-1 text-gray-600 dark:text-gray-300">
            <li><strong>Video ID:</strong> {videoInfo.videoId}</li>
            <li><strong>Format:</strong> {downloadType.toUpperCase()}</li>
            <li><strong>Quality:</strong> {selectedQuality === 'highest' ? 'Highest Available' : selectedQuality}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default YoutubeDownloader;

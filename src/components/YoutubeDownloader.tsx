
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import YoutubeUrlInput from './YoutubeUrlInput';
import VideoQualitySelector, { Quality } from './VideoQualitySelector';
import DownloadProgress from './DownloadProgress';
import VideoPreview from './VideoPreview';
import { Download } from 'lucide-react';

const MOCK_VIDEO_INFO = {
  title: 'Sample YouTube Video',
  thumbnail: 'https://img.youtube.com/vi/SAMPLE_ID/maxresdefault.jpg',
  duration: '10:30'
};

const AVAILABLE_QUALITIES: Quality[] = [
  { label: 'Highest', value: 'highest' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' }
];

const YoutubeDownloader: React.FC = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<typeof MOCK_VIDEO_INFO | null>(null);

  const handleSubmit = async (inputUrl: string) => {
    setUrl(inputUrl);
    setIsLoading(true);
    setVideoInfo(null);
    
    try {
      // In a real implementation, we would fetch video info here
      // For demo purposes, we're using a timeout to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This is where we would validate and get real video info
      // Mock response for demo
      const isYoutubeShorts = inputUrl.includes('/shorts/');
      const mockVideoInfo = {
        ...MOCK_VIDEO_INFO,
        title: isYoutubeShorts 
          ? 'Sample YouTube Shorts Video' 
          : 'Sample YouTube Regular Video',
        thumbnail: isYoutubeShorts
          ? 'https://placehold.co/600x1200/333/FFF.webp?text=YouTube+Shorts'
          : 'https://placehold.co/1280x720/333/FFF.webp?text=YouTube+Video'
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDownloadProgress(i);
      }
      
      // In a real implementation, we would get the video data here
      // For demo, we'll create a download link with a Blob
      const videoTitle = videoInfo.title.replace(/[^\w\s]/gi, '');
      const fileName = `${videoTitle}_${selectedQuality}.mp4`;
      
      // Create a sample blob (this is just for demo purposes)
      // In a real app, this would be the actual video data
      const blob = new Blob(['This is a placeholder for actual video data'], { type: 'video/mp4' });
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download complete!",
        description: `${videoTitle} has been downloaded in ${selectedQuality === 'highest' ? 'highest quality' : selectedQuality} format.`
      });
      
    } catch (error) {
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <VideoQualitySelector
              qualities={AVAILABLE_QUALITIES}
              selectedQuality={selectedQuality}
              onQualityChange={handleQualityChange}
              disabled={isDownloading}
            />
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-youtube-red hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              <span>{isDownloading ? 'Downloading...' : 'Download MP4'}</span>
            </button>
          </div>
        )}
        
        <DownloadProgress 
          progress={downloadProgress} 
          isVisible={isDownloading} 
        />
      </div>
      
      <VideoPreview 
        videoInfo={videoInfo} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default YoutubeDownloader;

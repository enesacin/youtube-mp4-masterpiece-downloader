
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YoutubeUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const YoutubeUrlInput: React.FC<YoutubeUrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  
  const validateYoutubeUrl = (input: string): boolean => {
    // Basic YouTube URL validation regex
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(&.*)?$/;
    return youtubeRegex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setIsValid(false);
      return;
    }
    
    const valid = validateYoutubeUrl(url);
    setIsValid(valid);
    
    if (valid) {
      onSubmit(url);
    }
  };

  const clearInput = () => {
    setUrl('');
    setIsValid(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex relative">
        <Input
          type="text"
          placeholder="Paste YouTube video or Shorts URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (!isValid) setIsValid(true);
          }}
          className={cn(
            "pr-10 border-2 focus-visible:ring-youtube-red",
            !isValid && "border-red-500"
          )}
          disabled={isLoading}
        />
        {url && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-[70px] top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X size={16} />
          </button>
        )}
        <Button 
          type="submit" 
          className="ml-2 bg-youtube-red hover:bg-red-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Download'}
        </Button>
      </div>
      {!isValid && (
        <p className="text-red-500 text-sm mt-1">Please enter a valid YouTube URL</p>
      )}
    </form>
  );
};

export default YoutubeUrlInput;

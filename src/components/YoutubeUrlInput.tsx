
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
    // Daha geniş bir YouTube URL doğrulama regex'i
    // Daha fazla format destekliyor: normal videolar, shorts, playlist içindeki videolar, zaman damgalı linkler vb.
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})(&.+)?$/;
    return youtubeRegex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setIsValid(false);
      return;
    }
    
    // URL doğrulamasını gerçekleştir
    const valid = validateYoutubeUrl(url);
    setIsValid(valid);
    
    if (valid) {
      onSubmit(url);
    } else {
      console.log("Geçersiz YouTube URL'si:", url);
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
          placeholder="YouTube video veya Shorts URL'sini yapıştırın"
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
          {isLoading ? 'İşleniyor...' : 'İndir'}
        </Button>
      </div>
      {!isValid && (
        <p className="text-red-500 text-sm mt-1">Lütfen geçerli bir YouTube URL'si girin</p>
      )}
    </form>
  );
};

export default YoutubeUrlInput;


import React from 'react';
import YoutubeDownloader from '@/components/YoutubeDownloader';
import { Youtube } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-8 md:py-16 mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Youtube size={36} className="text-youtube-red mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold">
              YouTube Video İndirici
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            YouTube videolarını ve Shorts'ları yüksek kalitede indirin
          </p>
        </header>
        
        <main className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <YoutubeDownloader />
        </main>
        
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Nasıl Çalışır</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-youtube-red w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-medium text-lg mb-2">YouTube URL'si Yapıştır</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Herhangi bir YouTube video ya da Shorts URL'sini kopyalayıp yapıştırın
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-youtube-red w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Kalite Seçin</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tercih ettiğiniz video kalitesini seçin
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
              <div className="bg-youtube-red w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-medium text-lg mb-2">Videoyu İndirin</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yüksek kalitede video veya ses dosyanızı hemen edinin
              </p>
            </div>
          </div>
        </section>
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p className="mb-2">
            YouTube Video İndirici sadece gösterim amaçlıdır.
          </p>
          <p>
            Lütfen YouTube'un Hizmet Şartları'na ve telif hakkı yasalarına saygı gösterin.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

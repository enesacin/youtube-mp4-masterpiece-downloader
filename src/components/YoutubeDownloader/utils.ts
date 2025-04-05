
export function openYoutubeLink(videoId: string) {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const link = document.createElement('a');
  link.href = youtubeUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
}


import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, Maximize, Settings } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const [showControls, setShowControls] = useState(true);

  // جودات الفيديو المتاحة
  const qualities = {
    auto: src,
    high: src,
    medium: src,
    low: src
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(e => {
        console.error("Failed to play video:", e);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    const progress = (video.currentTime / video.duration) * 100;
    setProgress(progress);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    
    video.currentTime = position * video.duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume === 0 ? 1 : volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  const toggleQualityMenu = () => {
    setShowQualityMenu(!showQualityMenu);
  };
  
  const changeQuality = (quality: string) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const isPlaying = !videoRef.current.paused;
      
      setCurrentQuality(quality);
      videoRef.current.src = qualities[quality as keyof typeof qualities];
      videoRef.current.load();
      
      // الاستمرار من نفس النقطة
      videoRef.current.addEventListener("canplay", function resumePlayback() {
        videoRef.current?.removeEventListener("canplay", resumePlayback);
        videoRef.current.currentTime = currentTime;
        if (isPlaying) videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
      });
    }
    setShowQualityMenu(false);
  };

  const handleDownload = () => {
    if (src) {
      const link = document.createElement('a');
      link.href = src;
      link.download = `${title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // معالجة أخطاء الفيديو
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setIsPlaying(false);
    };
    
    video.addEventListener("error", handleError);
    
    return () => {
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-black" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video 
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={handlePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="application/x-mpegURL" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
      
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div 
            className="h-1 bg-gray-700 rounded-full cursor-pointer mb-2"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-physics-gold rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handlePlayPause} className="text-white">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-physics-gold"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={toggleQualityMenu} className="text-white">
                  <Settings size={20} />
                </button>
                
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-md overflow-hidden w-24">
                    <div className="text-white text-xs p-1 bg-physics-gold text-center">الجودة</div>
                    {Object.keys(qualities).map(quality => (
                      <button
                        key={quality}
                        className={`block w-full text-xs text-center px-2 py-1 ${currentQuality === quality ? 'text-physics-gold' : 'text-white'} hover:bg-gray-700`}
                        onClick={() => changeQuality(quality)}
                      >
                        {quality === 'auto' ? 'تلقائي' : 
                         quality === 'high' ? 'عالية' : 
                         quality === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button onClick={handleDownload} className="text-white">
                <Download size={20} />
              </button>
              <button onClick={handleFullscreen} className="text-white">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

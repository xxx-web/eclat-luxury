import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook for lazy loading videos
 * Uses IntersectionObserver to play video when in viewport
 * Pauses video when out of viewport
 * Prevents mobile Safari throttling of concurrent autoplay
 */
export function useLazyVideo(): RefObject<HTMLVideoElement | null> {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video entered viewport - play
            video.play().catch((err) => {
              // Ignore AbortError (user paused or another play request interrupted)
              if (err.name !== 'AbortError') {
                console.warn('Video play failed:', err);
              }
            });
          } else {
            // Video left viewport - pause
            video.pause();
          }
        });
      },
      {
        rootMargin: '300px', // Start loading 300px before entering viewport
        threshold: 0.1, // Trigger when 10% visible
      }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
      observer.disconnect();
    };
  }, []);

  return videoRef;
}

export default useLazyVideo;

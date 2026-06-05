import { useState, useEffect } from "react";

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Hook to asynchronously load and cache image URLs in a Map.
 * Provides a fallback flag if loading fails.
 * @param url Target image URL.
 */
export function useImageLoader(url?: string): { loadedImage: HTMLImageElement | null; error: boolean } {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoadedImage(null);
      setError(true);
      return;
    }

    if (imageCache.has(url)) {
      setLoadedImage(imageCache.get(url) || null);
      setError(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // prevent canvas tainted errors
    img.src = url;
    img.onload = () => {
      imageCache.set(url, img);
      setLoadedImage(img);
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      setLoadedImage(null);
    };
  }, [url]);

  return { loadedImage, error };
}

/**
 * Preload helper to fetch and cache an image ahead of race start.
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache.has(url)) {
      resolve(imageCache.get(url)!);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image at: ${url}`));
    };
  });
}

export default useImageLoader;

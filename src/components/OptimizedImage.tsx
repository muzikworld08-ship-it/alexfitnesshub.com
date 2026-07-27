import React, { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: "pulsing" | "dumbbell" | "none";
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  fallbackType = "pulsing",
  loading = "lazy",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
        <Dumbbell className="w-5 h-5 text-slate-400 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-slate-400 mt-2">NO IMAGE SOURCE</span>
      </div>
    );
  }

  // Check if image is an external or remote URL
  const isExternal = src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//") || src.startsWith("data:");

  let avifSrc = "";
  let webpSrc = "";
  let fallbackSrc = src;

  if (isExternal) {
    if (src.includes("unsplash.com")) {
      // Unsplash supports on-the-fly format auto-negotiation (AVIF/WebP)
      avifSrc = `${src.split("?")[0]}?auto=format&fm=avif&q=70&w=1200`;
      webpSrc = `${src.split("?")[0]}?auto=format&fm=webp&q=80&w=1200`;
    } else if (src.includes("dicebear.com")) {
      // Dicebear returns SVG which is already optimized
      avifSrc = src;
      webpSrc = src;
    } else if (src.includes("firebasestorage.googleapis.com")) {
      // Firebase Storage URLs
      avifSrc = src;
      webpSrc = src;
    } else {
      // General external CDNs or images
      avifSrc = src;
      webpSrc = src;
    }
  } else {
    // Local asset: our custom Vite plugin has automatically generated WebP and AVIF copies at build time.
    // e.g., /assets/banner-F123.jpg -> /assets/banner-F123.webp /avif
    // Find file extension and replace it
    const lastDotIndex = src.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      const base = src.substring(0, lastDotIndex);
      avifSrc = `${base}.avif`;
      webpSrc = `${base}.webp`;
    } else {
      avifSrc = `${src}.avif`;
      webpSrc = `${src}.webp`;
    }
  }

  // Create highly performing responsive srcsets for high-density mobile screens
  const generateSrcset = (baseSrc: string) => {
    if (baseSrc.includes("unsplash.com")) {
      // Generate different widths for unsplash
      const baseUrl = baseSrc.split("&w=")[0];
      const fmParam = baseSrc.includes("fm=avif") ? "fm=avif" : baseSrc.includes("fm=webp") ? "fm=webp" : "fm=jpg";
      return [
        `${baseUrl}&auto=format&${fmParam}&q=70&w=480 480w`,
        `${baseUrl}&auto=format&${fmParam}&q=70&w=768 768w`,
        `${baseUrl}&auto=format&${fmParam}&q=80&w=1080 1080w`,
        `${baseUrl}&auto=format&${fmParam}&q=80&w=1400 1400w`
      ].join(", ");
    }
    return undefined;
  };

  const avifSrcset = generateSrcset(avifSrc);
  const webpSrcset = generateSrcset(webpSrc);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000);
    } else {
      setHasError(true);
    }
  };

  const retryUrl = retryCount > 0 ? `${fallbackSrc}${fallbackSrc.includes("?") ? "&" : "?"}retry=${retryCount}` : fallbackSrc;

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center ${className}`}>
        <Dumbbell className="w-5 h-5 text-red-500 animate-bounce mb-1" />
        <span className="text-[10px] font-sans font-bold text-red-500 uppercase tracking-tight">MEDIA ERROR</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full h-full block">
      {/* Visual skeletal loading pulse */}
      {!isLoaded && fallbackType !== "none" && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 animate-pulse z-10 flex flex-col items-center justify-center space-y-1.5">
          <Dumbbell className="w-4 h-4 text-slate-300 dark:text-slate-600 animate-spin" />
          <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">COMPILING RENDER</span>
        </div>
      )}

      <picture className="w-full h-full block">
        {/* AVIF Optimized format */}
        {avifSrc && (
          <source
            type="image/avif"
            srcSet={avifSrcset || avifSrc}
            sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
          />
        )}
        {/* WebP Optimized format */}
        {webpSrc && (
          <source
            type="image/webp"
            srcSet={webpSrcset || webpSrc}
            sizes="(max-width: 640px) 480px, (max-width: 1024px) 768px, 1200px"
          />
        )}
        {/* Fallback image with native srcset properties */}
        <img
          src={retryUrl}
          alt={alt}
          loading={loading}
          className={`${className} transition-opacity duration-300 ${!isLoaded ? "opacity-0" : "opacity-100"}`}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          {...props}
        />
      </picture>
    </div>
  );
};

export default OptimizedImage;

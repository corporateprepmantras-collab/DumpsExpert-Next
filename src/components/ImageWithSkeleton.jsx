"use client";
import { useState } from "react";
import Image from "next/image";

export default function ImageWithSkeleton({
  src,
  alt,
  fill = false,
  className,
  sizes,
  loading = "lazy",
  priority = false,
  quality,
  skeletonClassName,
  width,
  height,
}) {
  const [isLoading, setIsLoading] = useState(true);

  const isRemote = typeof src === "string" && /^https?:\/\//i.test(src);

  // If not using `fill` and width/height aren't provided for a remote image,
  // fall back to a plain <img> to avoid next/image runtime width error.
  const shouldRenderPlainImg = isRemote && !fill && (!width || !height);

  // Decide loading mode: if priority is true, force eager to avoid conflicts
  const effectiveLoading = priority ? "eager" : loading;

  return (
    <>
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${skeletonClassName || ""}`}
        />
      )}

      {shouldRenderPlainImg ? (
        <img
          src={src}
          alt={alt}
          className={className}
          width={width}
          height={height}
          loading={effectiveLoading}
          decoding="async"
          onLoad={() => setIsLoading(false)}
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s" }}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          className={className}
          sizes={sizes}
          loading={effectiveLoading}
          priority={priority}
          quality={quality}
          onLoad={() => setIsLoading(false)}
          style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s" }}
        />
      )}
    </>
  );
}

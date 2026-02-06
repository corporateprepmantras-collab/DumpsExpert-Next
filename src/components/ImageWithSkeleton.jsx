"use client";
import { useState } from "react";
import Image from "next/image";

export default function ImageWithSkeleton({
  src,
  alt,
  fill,
  className,
  sizes,
  loading,
  priority,
  quality,
  skeletonClassName,
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-200 animate-pulse ${skeletonClassName || ""}`}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        loading={loading}
        priority={priority}
        quality={quality}
        onLoad={() => setIsLoading(false)}
        style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s" }}
      />
    </>
  );
}

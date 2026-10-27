"use client";

import { useState } from "react";

type ResilientImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  loading?: "eager" | "lazy";
};

export default function ResilientImage({
  src,
  alt,
  className,
  fallbackClassName = "image-placeholder",
  loading = "lazy"
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src.trim()) {
    return (
      <div className={fallbackClassName} role="img" aria-label={alt || "Gambar tidak tersedia"}>
        <span>MBC<span className="red-dot">.</span></span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}

import { useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { resolveMediaUrl } from "../../utils/mediaUrl";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  className?: string;
}

// Chevron SVG ikonları — Swiper :after içeriğini gizlediğimiz için kendi ikonlarımızı koyuyoruz
function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 16 7 10 13 4" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="7 4 13 10 7 16" />
    </svg>
  );
}

export default function ImageCarousel({
  images,
  alt = "Görsel",
  className = "",
}: ImageCarouselProps) {
  const swiperRef = useRef<SwiperClass | null>(null);

  const urls = useMemo(
    () =>
      images
        .map((u) => resolveMediaUrl(u))
        .filter((u): u is string => Boolean(u)),
    [images],
  );

  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
      >
        <img
          src={urls[0]}
          alt={alt}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Önceki butonu */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Önceki görsel"
        className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/90 text-gray-700 shadow-md backdrop-blur-[10px] transition hover:bg-white dark:bg-gray-800/90 dark:text-white/80 dark:hover:bg-gray-700"
      >
        <ChevronLeft />
      </button>

      {/* Sonraki butonu */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Sonraki görsel"
        className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/90 text-gray-700 shadow-md backdrop-blur-[10px] transition hover:bg-white dark:bg-gray-800/90 dark:text-white/80 dark:hover:bg-gray-700"
      >
        <ChevronRight />
      </button>

      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        className="carouselTwo !pb-10"
      >
        {urls.map((url, i) => (
          <SwiperSlide key={`${url}-${i}`}>
            <img
              src={url}
              alt={`${alt} ${i + 1}`}
              className="aspect-[16/10] w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

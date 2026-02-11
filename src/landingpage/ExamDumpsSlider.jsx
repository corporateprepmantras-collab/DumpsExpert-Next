"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ExamDumpsSlider({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const observerRef = useRef(null);
  const sliderRef = useRef(null);
  const touchStartRef = useRef(null);
  const autoSlideRef = useRef(null);

  // Responsive visible cards and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 640;
      setIsMobile(mobile);

      if (mobile) {
        setVisibleCards(1);
      } else if (width < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(4);
      }

      // Reset index if necessary after resize
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(
          0,
          products.length - (mobile ? 1 : width < 1024 ? 2 : 4),
        );
        return Math.min(prev, maxIndex);
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems(
              (prev) => new Set([...prev, entry.target.dataset.index]),
            );
          }
        });
      },
      {
        threshold: isMobile ? 0.2 : 0.1,
        rootMargin: isMobile ? "0px 0px -50px 0px" : "0px",
      },
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile]);

  // Clear auto slide on interaction
  const clearAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoSlide();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [clearAutoSlide]);

  // Auto slide with improved mobile handling
  useEffect(() => {
    if (!products.length || products.length <= visibleCards || isDragging)
      return;

    autoSlideRef.current = setInterval(
      () => {
        setCurrentIndex((prev) => {
          const maxIndex = products.length - visibleCards;
          return prev >= maxIndex ? 0 : prev + visibleCards;
        });
      },
      isMobile ? 4000 : 5000,
    ); // Slower on mobile for better UX

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [products.length, visibleCards, isDragging, isMobile]);

  // Reset auto slide after user interaction ends
  const resetAutoSlide = useCallback(() => {
    clearAutoSlide();
    setTimeout(() => {
      if (!isDragging && products.length > visibleCards) {
        autoSlideRef.current = setInterval(
          () => {
            setCurrentIndex((prev) => {
              const maxIndex = products.length - visibleCards;
              return prev >= maxIndex ? 0 : prev + visibleCards;
            });
          },
          isMobile ? 4000 : 5000,
        );
      }
    }, 2000); // Resume auto-slide after 2 seconds of inactivity
  }, [products.length, visibleCards, isDragging, isMobile, clearAutoSlide]);

  // Navigation callbacks with transition management
  const nextSlide = useCallback(() => {
    if (isTransitioning || products.length === 0) return;
    clearAutoSlide();
    setIsTransitioning(true);

    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - visibleCards);
      return prev >= maxIndex ? 0 : Math.min(prev + visibleCards, maxIndex);
    });

    setTimeout(() => {
      setIsTransitioning(false);
      resetAutoSlide();
    }, 300);
  }, [
    products.length,
    visibleCards,
    isTransitioning,
    clearAutoSlide,
    resetAutoSlide,
  ]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || products.length === 0) return;
    clearAutoSlide();
    setIsTransitioning(true);

    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, products.length - visibleCards);
      return prev <= 0 ? maxIndex : Math.max(0, prev - visibleCards);
    });

    setTimeout(() => {
      setIsTransitioning(false);
      resetAutoSlide();
    }, 300);
  }, [
    products.length,
    visibleCards,
    isTransitioning,
    clearAutoSlide,
    resetAutoSlide,
  ]);

  // Navigate to specific slide (for pagination dots)
  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || products.length === 0) return;
      clearAutoSlide();
      setIsTransitioning(true);
      const newIndex = Math.min(
        index * visibleCards,
        Math.max(0, products.length - visibleCards),
      );
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
        resetAutoSlide();
      }, 300);
    },
    [
      visibleCards,
      isTransitioning,
      clearAutoSlide,
      resetAutoSlide,
      products.length,
    ],
  );

  // Improved drag and touch handlers
  const handleDragStart = (clientX) => {
    clearAutoSlide();
    setIsDragging(true);
    setDragStart(clientX);
    setDragDelta(0);
    touchStartRef.current = clientX;
  };

  const handleDragMove = (clientX) => {
    if (!isDragging || isTransitioning) return;
    const delta = clientX - dragStart;
    setDragDelta(delta);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = isMobile ? 50 : 100;
    const absDelta = Math.abs(dragDelta);

    if (absDelta > threshold) {
      if (dragDelta > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      // Reset position if threshold not met
      resetAutoSlide();
    }

    setDragDelta(0);
  };

  // Mouse events
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      if (isMobile) return; // Disable mouse events on mobile
      handleDragStart(e.clientX);
    },
    [isMobile],
  );

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      if (isMobile) return;
      handleDragMove(e.clientX);
    },
    [isMobile, isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;
    handleDragEnd();
  }, [isMobile]);

  // Touch events with improved mobile handling
  const handleTouchStart = useCallback((e) => {
    // Don't prevent default to allow native scrolling
    const touch = e.touches[0];
    handleDragStart(touch.clientX);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current;
      const deltaY = touch.clientY - e.touches[0].clientY;

      // Only prevent default if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        handleDragMove(touch.clientX);
      }
    },
    [isDragging],
  );

  const handleTouchEnd = useCallback((e) => {
    handleDragEnd();
  }, []);

  // Memoize visible products based on currentIndex
  const visibleProducts = useMemo(() => {
    if (isMobile) {
      // On mobile, show one card at a time with proper indexing
      return [products[currentIndex]].filter(Boolean);
    }
    return products.slice(currentIndex, currentIndex + visibleCards);
  }, [products, currentIndex, visibleCards, isMobile]);

  // Memoize pagination
  const totalPages = useMemo(() => {
    return Math.ceil(products.length / visibleCards);
  }, [products.length, visibleCards]);

  const currentPage = useMemo(() => {
    return Math.floor(currentIndex / visibleCards);
  }, [currentIndex, visibleCards]);

  if (!products.length) {
    return (
      <div className="w-full py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <p className="text-center text-gray-500 py-10">No products found.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Most Popular IT Certification{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
              Dumps
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Get certified with our premium exam preparation materials
          </p>
          {isMobile && products.length > 1 && (
            <p className="text-orange-500 text-sm mt-2 flex items-center justify-center gap-1">
              <span>Swipe to explore </span>
              <span className="inline-flex">→</span>
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        {products.length > 1 && (
          <div className="flex justify-center gap-4 mb-10">
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className={`bg-white border-2 border-orange-500 rounded-full p-3 shadow-lg hover:bg-orange-50 transition-all hover:scale-105 active:scale-95 touch-manipulation ${
                isTransitioning ? "opacity-50 cursor-not-allowed" : ""
              } ${isMobile ? "p-2" : "p-3"}`}
              aria-label="Previous products"
            >
              <ChevronLeft
                className={`text-orange-500 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className={`bg-orange-500 border-2 border-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-105 active:scale-95 touch-manipulation ${
                isTransitioning ? "opacity-50 cursor-not-allowed" : ""
              } ${isMobile ? "p-2" : "p-3"}`}
              aria-label="Next products"
            >
              <ChevronRight
                className={`text-white ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              />
            </button>
          </div>
        )}

        {/* Product Cards - Mobile-First Slider */}
        <div
          ref={sliderRef}
          className="relative overflow-hidden touch-pan-y"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={`flex transition-transform duration-300 ease-out ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{
              transform: isMobile
                ? `translateX(calc(-${currentIndex * 100}% + ${dragDelta}px))`
                : `translateX(calc(-${currentIndex * (100 / visibleCards)}% + ${dragDelta}px))`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {products.map((product, index) => {
              const slug = encodeURIComponent(product.slug || product.title);
              const isVisible = isMobile
                ? index === currentIndex
                : index >= currentIndex && index < currentIndex + visibleCards;

              return (
                <div
                  key={product._id}
                  data-index={index}
                  ref={(el) => {
                    if (el && observerRef.current && isVisible) {
                      observerRef.current.observe(el);
                    }
                  }}
                  className={`${
                    isMobile
                      ? "w-full flex-shrink-0 px-4"
                      : visibleCards === 2
                        ? "w-1/2 flex-shrink-0 px-2"
                        : "w-1/4 flex-shrink-0 px-2"
                  } group relative`}
                  style={{
                    opacity: visibleItems.has(String(index)) ? 1 : 0,
                    transform: visibleItems.has(String(index))
                      ? "translateY(0)"
                      : "translateY(2rem)",
                    transition:
                      "opacity 0.5s ease-out, transform 0.5s ease-out",
                  }}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full">
                    <a
                      href={`/ItDumps/sap/${slug}`}
                      className="block flex flex-col h-full"
                    >
                      {/* Image Container */}
                      <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden flex-shrink-0">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.title}
                          className="w-full h-full object-contain object-center p-4 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-2 right-2 bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                          Popular
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4 flex flex-col flex-grow pointer-events-none">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors duration-300 line-clamp-2">
                          {product.sapExamCode || product.title}
                        </h3>

                        <p className="text-gray-600 text-xs mb-3 line-clamp-2 min-h-[32px] sm:min-h-[36px] flex-grow leading-relaxed">
                          {product.Description?.replace(/<[^>]+>/g, "") ||
                            "Comprehensive exam preparation material with real practice questions."}
                        </p>

                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-400 text-orange-400"
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            (4.8)
                          </span>
                        </div>

                        <div className="border-t border-gray-100 pt-2 sm:pt-3 mb-2 sm:mb-3"></div>

                        {/* Pricing */}
                        <div className="mb-3">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-base sm:text-lg font-bold text-orange-500">
                              ₹{product.dumpsPriceInr?.trim() || "N/A"}
                            </span>
                            <span className="text-sm font-semibold text-orange-500">
                              ${product.dumpsPriceUsd?.trim() || "N/A"}
                            </span>
                          </div>
                          {product.dumpsMrpInr && (
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="line-through text-gray-400">
                                ₹{product.dumpsMrpInr}
                              </span>
                              <span className="line-through text-gray-400">
                                ${product.dumpsMrpUsd}
                              </span>
                              <span className="font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                Save{" "}
                                {Math.round(
                                  ((product.dumpsMrpInr -
                                    product.dumpsPriceInr) /
                                    product.dumpsMrpInr) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Button */}
                        <button
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-2.5 sm:py-2 px-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg text-xs mt-auto pointer-events-auto hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          View Details →
                        </button>
                      </div>

                      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 w-0 group-hover:w-full transition-all duration-300" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                disabled={isTransitioning}
                className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                  currentPage === idx
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                } ${isTransitioning ? "opacity-50 cursor-not-allowed" : ""} ${
                  isMobile ? "h-1.5 active:scale-125" : "h-2"
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

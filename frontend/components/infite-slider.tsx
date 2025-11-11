'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';

interface DisciplineItem {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  coverImage: {
    url: string;
    alt?: string;
  };
}

interface InfiniteSliderProps {
  items?: DisciplineItem[];
  gap?: number;
  showVelocity?: boolean;
  heightPercentage?: number;
  aspectRatio?: number;
}

export default function InfiniteSlider({
  items = [],
  gap = 48,
  showVelocity = false,
  heightPercentage = 30,
  aspectRatio = 16 / 9,
}: InfiniteSliderProps) {
  const [itemHeight, setItemHeight] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  const sliderWrapperRef = useRef<HTMLDivElement>(null);
  const velocityDisplayRef = useRef<HTMLDivElement>(null);
  const currentXRef = useRef(-1200);
  const targetXRef = useRef(-1200);
  const animationFrameRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnimatedRef = useRef(false);
  const scrollVelocityRef = useRef(0);

  // Memoize tripled items array
  const tripledItems = useMemo(() => 
    [...items, ...items, ...items], 
    [items]
  );

  // Update dimensions with debouncing
  useEffect(() => {
    const updateDimensions = () => {
      const height = Math.round(window.innerHeight * (heightPercentage / 100));
      const width = Math.round(height * aspectRatio);
      setItemHeight(height);
      setItemWidth(width);
    };

    updateDimensions();

    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height;
          const height = Math.round(newHeight * (heightPercentage / 100));
          const width = Math.round(height * aspectRatio);
          setItemHeight(height);
          setItemWidth(width);
        }
      }, 100); // Debounce resize
    });

    resizeObserver.observe(document.documentElement);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [heightPercentage, aspectRatio]);

  // Memoize scale animation
  const animateScale = useCallback((velocity: number) => {
    const scaleY = 1 - Math.min(velocity * 0.002, 0.1);
    const scaleX = 1 - Math.min(velocity * 0.0015, 0.2);
    
    gsap.to('.slider-item', {
      scaleY,
      scaleX,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, []);

  // Memoize reset scale
  const resetScale = useCallback(() => {
    gsap.to('.slider-item', {
      scaleY: 1,
      scaleX: 1,
      duration: 0.5,
      ease: 'power2.out'
    });
    scrollVelocityRef.current = 0;
    if (showVelocity && velocityDisplayRef.current) {
      velocityDisplayRef.current.textContent = 'Velocity: 0';
    }
  }, [showVelocity]);

  useEffect(() => {
    const sliderWrapper = sliderWrapperRef.current;
    if (!sliderWrapper || items.length === 0 || itemHeight === 0) return;

    const itemTotalWidth = itemWidth + gap;
    const singleSetWidth = items.length * itemTotalWidth;

    // Set initial state only once
    if (!hasAnimatedRef.current) {
      gsap.set('.slider-item', { scaleY: 0, opacity: 0 });
      gsap.set(sliderWrapper, { x: 1200 });
    }

    // Animation loop with requestAnimationFrame
    const animate = () => {
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.06;

      // Infinite loop logic
      if (currentXRef.current < -singleSetWidth) {
        currentXRef.current += singleSetWidth;
        targetXRef.current += singleSetWidth;
      } else if (currentXRef.current > 0) {
        currentXRef.current -= singleSetWidth;
        targetXRef.current -= singleSetWidth;
      }

      gsap.set(sliderWrapper, { x: currentXRef.current });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation trigger
    const startAnimation = () => {
      if (hasAnimatedRef.current) return;

      gsap.timeline({
        onComplete: () => {
          currentXRef.current = -1200;
          targetXRef.current = -1200;
          animate();
        }
      })
        .to('.slider-item', {
          scaleY: 1,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.05
        })
        .to(sliderWrapper, {
          x: -1200,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: function() {
            const currentX = gsap.getProperty(sliderWrapper, 'x') as number;
            currentXRef.current = currentX;
            targetXRef.current = currentX;
          }
        }, 0);

      hasAnimatedRef.current = true;
    };

    // Wheel handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      targetXRef.current -= e.deltaY * 1.5;
      scrollVelocityRef.current = Math.abs(e.deltaY * 0.3);

      animateScale(scrollVelocityRef.current);

      if (showVelocity && velocityDisplayRef.current) {
        velocityDisplayRef.current.textContent = `Velocity: ${scrollVelocityRef.current.toFixed(2)}`;
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(resetScale, 150);
    };

    // Touch handlers
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;

      // Calculate differences for both axes
      const diffX = touchStartX - touchCurrentX;
      const diffY = touchStartY - touchCurrentY;

      // Use vertical swipes to control horizontal movement
      // Combine both horizontal and vertical movements for total effect
      const totalDiff = diffX + diffY;

      targetXRef.current -= totalDiff * 4.5;
      touchStartX = touchCurrentX;
      touchStartY = touchCurrentY;

      scrollVelocityRef.current = Math.abs(totalDiff * 4.5);
      animateScale(scrollVelocityRef.current);
    };

    const handleTouchEnd = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(resetScale, 150);
    };

    // Event listeners
    window.addEventListener('startSliderAnimation', startAnimation);
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Start animation if already triggered
    if (hasAnimatedRef.current && !animationFrameRef.current) {
      animate();
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('startSliderAnimation', startAnimation);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [items.length, itemWidth, gap, itemHeight, showVelocity, animateScale, resetScale]);

  if (items.length === 0) {
    return (
      <div className="relative w-full overflow-hidden flex justify-center">
        <p className="text-sm opacity-50">No disciplines available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" data-slider>
      {showVelocity && (
        <div className="absolute top-5 left-5 bg-black/50 px-4 py-3 rounded-lg text-sm z-10">
          <div>Scroll horizontally (or use mousewheel)</div>
          <div ref={velocityDisplayRef}>Velocity: 0</div>
        </div>
      )}

      <div
        ref={sliderWrapperRef}
        className="flex will-change-transform"
        style={{ gap: `${gap}px` }}
      >
        {tripledItems.map((item, index) => (
          <Link
            key={`${item._id}-${index}`}
            href={`/disciplines/${item.slug.current}`}
            className="slider-item will-change-transform flex flex-col group"
            style={{
              minWidth: `${itemWidth}px`,
              transformOrigin: 'center bottom',
            }}
          >
            <div className="pb-4">
              <h3 className="text-[clamp(0.875rem,1.5vw,1.125rem)] -mb-1 tracking-tight">
                {item.title}
              </h3>
            </div>
            <div
              className="relative"
              style={{
                height: `${itemHeight}px`,
                width: `${itemWidth}px`,
                flexShrink: 0,
              }}
            >
              <Image
                src={item.coverImage.url}
                alt={item.coverImage.alt || item.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes={`${itemWidth}px`}
                priority={index < 3} // Prioritize first 3 images
              />
            </div>
          </Link>
        ))}
      </div>
      
      <div className="flex justify-end px-4 pt-10">
        <span className="text-[clamp(0.875rem,1.2vw,0.9rem)]">(Scroll)</span>
      </div>
    </div>
  );
}
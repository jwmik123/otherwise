'use client';

import { useEffect, useRef } from 'react';
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
  itemWidth?: number;
  gap?: number;
  showVelocity?: boolean;
  maxHeight?: string;
}

export default function InfiniteSlider({
  items = [],
  itemWidth = 350,
  gap = 48,
  showVelocity = false,
  maxHeight = 'auto',
}: InfiniteSliderProps) {
  // Calculate height based on 4:3 aspect ratio
  const itemHeight = Math.round(itemWidth / (5 / 3));

  const sliderWrapperRef = useRef<HTMLDivElement>(null);
  const velocityDisplayRef = useRef<HTMLDivElement>(null);
  const startX = -800;
  const currentXRef = useRef(startX);
  const targetXRef = useRef(startX);
  const animationFrameRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const sliderWrapper = sliderWrapperRef.current;
    if (!sliderWrapper || items.length === 0) return;

    const itemTotalWidth = itemWidth + gap;
    const singleSetWidth = items.length * itemTotalWidth;

    // Set initial state only once
    if (!hasAnimatedRef.current) {
      gsap.set('.slider-item', { scaleY: 0 });
      gsap.set(sliderWrapper, { x: 1200 });
    }

    // Listen for trigger from text animation
    const startAnimation = () => {
      if (hasAnimatedRef.current) return;

      gsap.timeline({
        onComplete: () => {
          // Update refs to match final position after animation
          currentXRef.current = startX;
          targetXRef.current = startX;
          // Start the animation loop after GSAP animation completes
          animate();
        }
      })
        .to('.slider-item', {
          scaleY: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.05
        })
        .to(sliderWrapper, {
          x: startX,
          duration: 1.2,
          ease: 'power3.out',
          onUpdate: function() {
            // Sync refs during animation so scroll doesn't interfere
            const currentX = gsap.getProperty(sliderWrapper, 'x') as number;
            currentXRef.current = currentX;
            targetXRef.current = currentX;
          }
        }, 0);

      hasAnimatedRef.current = true;
    }

    window.addEventListener('startSliderAnimation', startAnimation)

    let scrollVelocity = 0;

    // Wheel event handler
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      targetXRef.current -= e.deltaY * 0.625;
      scrollVelocity = Math.abs(e.deltaY * 0.125);

      // Scale items based on velocity (shrink when scrolling)
      const scale = 1 - Math.min(scrollVelocity * 0.002, 0.3);
      gsap.to('.slider-item', {
        scaleY: scale,
        duration: 0.3,
        ease: 'power2.out'
      });

      // Update velocity display
      if (showVelocity && velocityDisplayRef.current) {
        velocityDisplayRef.current.textContent = `Velocity: ${scrollVelocity.toFixed(2)}`;
      }

      // Reset scale after scrolling stops
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        gsap.to('.slider-item', {
          scaleY: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
        scrollVelocity = 0;
        if (showVelocity && velocityDisplayRef.current) {
          velocityDisplayRef.current.textContent = 'Velocity: 0';
        }
      }, 150);
    };

    // Touch event handlers
    let touchStartX = 0;
    let touchCurrentX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentX = e.touches[0].clientX;
      const diff = touchStartX - touchCurrentX;
      targetXRef.current -= diff * 0.625;
      touchStartX = touchCurrentX;

      scrollVelocity = Math.abs(diff * 0.625);
      const scale = 1 - Math.min(scrollVelocity * 0.003, 0.3);
      gsap.to('.slider-item', {
        scaleY: scale,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        gsap.to('.slider-item', {
          scaleY: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
        scrollVelocity = 0;
      }, 150);
    };

    // Animation loop
    const animate = () => {
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.06;

      // Infinite loop logic - reset when we've scrolled one full set
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

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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
  }, [items.length, itemWidth, gap, showVelocity, itemHeight]);

  if (items.length === 0) {
    return (
      <div className="relative w-full overflow-hidden text-white flex justify-center">
        <p className="text-sm opacity-50">No disciplines available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden text-white">
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
        {/* Triple the items to ensure seamless infinite loop */}
        {[...items, ...items, ...items].map((item, index) => (
          <Link
            key={`item-${index}-${item._id}`}
            href={`/disciplines/${item.slug.current}`}
            className="slider-item will-change-transform flex flex-col group"
            style={{
              minWidth: `${itemWidth}px`,
              transformOrigin: 'center bottom',
            }}
          >
            <div className="relative overflow-hidden" style={{ height: `${itemHeight}px` }}>
              <Image
                src={item.coverImage.url}
                alt={item.coverImage.alt || item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes={`${itemWidth}px`}
              />
            </div>
            <div className="pt-4">
              <h3 className="text-xl font-bold uppercase tracking-tight">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

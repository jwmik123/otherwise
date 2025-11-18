'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import Image from 'next/image';
import Link from 'next/link';

gsap.registerPlugin(SplitText);

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
  useDirectSlug?: boolean;
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
  heightPercentage = 25,
  aspectRatio = 16 / 9,
}: InfiniteSliderProps) {
  const [itemHeight, setItemHeight] = useState(300);
  const [itemWidth, setItemWidth] = useState(0);

  const sliderWrapperRef = useRef<HTMLDivElement>(null);
  const velocityDisplayRef = useRef<HTMLDivElement>(null);
  const currentXRef = useRef(-1200);
  const targetXRef = useRef(-1200);
  const animationFrameRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnimatedRef = useRef(false);
  const scrollVelocityRef = useRef(0);
  const autoScrollSpeedRef = useRef(0.3); // Slow automatic scroll speed

  // Define the desired order
  const desiredOrder = [
    'infographics',
    'campagnes',
    'fotografie',
    'direct-mailings',
    'verpakkingen',
    'brochures',
    'beursmaterialen',
    'online'
  ];

  // Memoize sorted items based on desired order
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const indexA = desiredOrder.indexOf(a.slug.current);
      const indexB = desiredOrder.indexOf(b.slug.current);

      // If both items are in the desired order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only A is in the desired order, it comes first
      if (indexA !== -1) return -1;
      // If only B is in the desired order, it comes first
      if (indexB !== -1) return 1;
      // If neither is in the desired order, maintain original order
      return 0;
    });
  }, [items]);

  // Memoize tripled items array
  const tripledItems = useMemo(() =>
    [...sortedItems, ...sortedItems, ...sortedItems],
    [sortedItems]
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
    const scaleY = 1 - Math.min(velocity * 0.002, 0.02);
    const scaleX = 1 - Math.min(velocity * 0.0015, 0.05);
    
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
    if (!sliderWrapper || sortedItems.length === 0 || itemHeight === 0) return;

    const itemTotalWidth = itemWidth + gap;
    const singleSetWidth = sortedItems.length * itemTotalWidth;

    // Set initial state only once
    if (!hasAnimatedRef.current) {
      gsap.set('.slider-item', { scaleY: 0, opacity: 0 });
      gsap.set(sliderWrapper, { x: 1200 });
    }

    // Animation loop with requestAnimationFrame
    const animate = () => {
      // Apply automatic scrolling continuously
      targetXRef.current -= autoScrollSpeedRef.current;

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

      // Split all item titles into lines and wrap in overflow containers
      const titleElements = document.querySelectorAll('.item-title');
      const splits: SplitText[] = [];

      titleElements.forEach((title) => {
        // Set parent opacity to 1 immediately to allow GSAP to control child opacity
        gsap.set(title, { opacity: 1 });

        const split = new SplitText(title, { type: 'lines', linesClass: 'title-line' });
        splits.push(split);

        // Wrap lines in overflow containers
        split.lines.forEach((line) => {
          const wrapper = document.createElement('div');
          wrapper.style.overflow = 'hidden';
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });

        // Set initial state for lines
        gsap.set(split.lines, { y: 50, opacity: 0 });
      });

      const allTitleLines = splits.flatMap(split => split.lines);

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
        }, 0)
        .to(allTitleLines, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.02
        }, '-=0.3'); // Start slightly before slider animation ends

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

    // Touch handlers - only use horizontal swipes on mobile
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchCurrentX = e.touches[0].clientX;

      // Only use horizontal movement
      const diffX = touchStartX - touchCurrentX;

      targetXRef.current -= diffX * 4.5;
      touchStartX = touchCurrentX;

      scrollVelocityRef.current = Math.abs(diffX * 4.5);
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
  }, [sortedItems.length, itemWidth, gap, itemHeight, showVelocity, animateScale, resetScale]);

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
            href={item.useDirectSlug ? `/${item.slug.current}` : `/disciplines/${item.slug.current}`}
            className="slider-item will-change-transform flex flex-col group"
            style={{
              minWidth: `${itemWidth}px`,
              transformOrigin: 'center bottom',
            }}
          >
            <div className="pb-4">
              <h3 className="item-title text-[clamp(1rem,1.5vw,1.1rem)] pl-4 -mb-1 tracking-tight opacity-0">
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
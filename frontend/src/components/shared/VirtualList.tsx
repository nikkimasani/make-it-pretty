import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  maxHeight?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  maxHeight = '100%',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Record<number, number>>({});

  const getItemHeight = useCallback(
    (index: number): number => {
      if (index in measuredHeights) return measuredHeights[index];
      if (typeof itemHeight === 'function') return itemHeight(items[index], index);
      return itemHeight;
    },
    [itemHeight, items, measuredHeights],
  );

  const totalHeight = items.reduce((sum, _, i) => sum + getItemHeight(i), 0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  let offset = 0;
  let startIndex = 0;
  let endIndex = items.length;

  const viewportHeight = containerRef.current?.clientHeight ?? 600;
  const buffer = overscan * (typeof itemHeight === 'number' ? itemHeight : 40);

  for (let i = 0; i < items.length; i++) {
    const h = getItemHeight(i);
    if (offset + h < scrollTop - buffer) {
      offset += h;
      startIndex = i + 1;
    } else {
      break;
    }
  }

  let visibleHeight = 0;
  let visibleOffset = offset;
  for (let i = startIndex; i < items.length; i++) {
    const h = getItemHeight(i);
    if (visibleHeight > viewportHeight + buffer * 2) {
      endIndex = i;
      break;
    }
    if (i === startIndex) {
      visibleOffset = offset;
    }
    visibleHeight += h;
    offset += h;
  }

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ maxHeight, position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const idx = startIndex + i;
          const h = getItemHeight(idx);
          let top = visibleOffset;
          for (let j = startIndex; j < idx; j++) {
            top += getItemHeight(j);
          }
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${top}px)`,
                minHeight: h,
              }}
            >
              <div
                ref={(el) => {
                  if (el && typeof itemHeight === 'function') {
                    const actual = el.getBoundingClientRect().height;
                    if (actual > 0 && actual !== measuredHeights[idx]) {
                      setMeasuredHeights((prev) => ({ ...prev, [idx]: actual }));
                    }
                  }
                }}
              >
                {renderItem(item, idx)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

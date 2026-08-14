'use client';

import { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Course } from '@/lib/schedule';

const TYPE_COLOR: Record<string, string> = {
  Teori:   '#6366f1',
  Praktik: '#ef4444',
};

interface TooltipPos {
  x: number;
  y: number;
  side: 'right' | 'left';
}

interface CourseCardProps {
  course: Course;
  top: number;
  height: number;
  onDoubleClick?: () => void; // Desktop: klik 2x → edit
  onLongPress?: () => void;   // Mobile:  tahan 3s → edit
}

const LONG_PRESS_MS = 3000;
const TOOLTIP_AUTODISMISS_MS = 4000;

export default function CourseCard({ course, top, height, onDoubleClick, onLongPress }: CourseCardProps) {
  const color   = TYPE_COLOR[course.type] ?? '#6366f1';
  const isSmall = height < 55;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipPos | null>(null);

  // Long-press state (mobile)
  const longPressTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress      = useRef(false);
  const [pressing, setPressing] = useState(false);

  // Double-click flash state (desktop)
  const [flashing, setFlashing] = useState(false);

  // ── Shared: compute & show tooltip ──────────────────────────────
  const showTooltip = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const side: 'right' | 'left' = spaceRight >= 260 ? 'right' : 'left';
    setTooltip({ x: side === 'right' ? rect.right + 8 : rect.left - 8, y: rect.top, side });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  // ── Desktop: hover ───────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => showTooltip(), [showTooltip]);
  const handleMouseLeave = useCallback(() => hideTooltip(), [hideTooltip]);

  // ── Desktop: double-click → edit ─────────────────────────────────
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (!onDoubleClick) return;
    e.preventDefault();
    setFlashing(true);
    setTimeout(() => setFlashing(false), 300);
    onDoubleClick();
  }, [onDoubleClick]);

  // ── Mobile: long-press helpers ───────────────────────────────────
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressing(false);
  }, []);

  const clearTooltipDismiss = useCallback(() => {
    if (tooltipDismissTimer.current) {
      clearTimeout(tooltipDismissTimer.current);
      tooltipDismissTimer.current = null;
    }
  }, []);

  // Mobile touchstart: start long-press timer
  const handleTouchStart = useCallback(() => {
    clearTooltipDismiss();
    hideTooltip();
    didLongPress.current = false;
    setPressing(true);
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setPressing(false);
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress?.();
    }, LONG_PRESS_MS);
  }, [onLongPress, clearTooltipDismiss, hideTooltip]);

  // Mobile touchend: tap → show tooltip, long-press already handled
  const handleTouchEnd = useCallback(() => {
    cancelLongPress();
    if (!didLongPress.current) {
      // Tap → show tooltip, auto-dismiss setelah 4 detik
      showTooltip();
      tooltipDismissTimer.current = setTimeout(() => {
        setTooltip(null);
        tooltipDismissTimer.current = null;
      }, TOOLTIP_AUTODISMISS_MS);
    }
    didLongPress.current = false;
  }, [cancelLongPress, showTooltip]);

  // Cancel long-press if finger moves
  const handleTouchMove = useCallback(() => cancelLongPress(), [cancelLongPress]);

  return (
    <>
      <div
        ref={cardRef}
        className={[
          'course-card',
          isSmall   ? 'course-card--small'   : '',
          pressing  ? 'course-card--pressing' : '',
          flashing  ? 'course-card--flash'    : '',
        ].join(' ')}
        style={{
          top:             `${top}px`,
          height:          `${height}px`,
          borderLeftColor: color,
          backgroundColor: `${color}1a`,
        }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {/* Long-press progress ring */}
        {pressing && (
          <svg className="long-press-ring" viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="18" />
          </svg>
        )}
        <div
          className="course-card__glow"
          style={{ background: `radial-gradient(ellipse at top left, ${color}30, transparent 70%)` }}
        />
        <div className="course-card__content">
          {!isSmall && (
            <span className={`course-badge ${course.type === 'Praktik' ? 'course-badge--praktik' : 'course-badge--teori'}`}>
              {course.type}
            </span>
          )}
          <p className="course-card__name">{course.name}</p>
          {!isSmall && (
            <p className="course-card__time" style={{ color }}>
              {course.startTime} – {course.endTime}
            </p>
          )}
        </div>
      </div>

      {/* Tooltip via portal — tidak terpotong oleh parent overflow */}
      {tooltip && typeof window !== 'undefined' && createPortal(
        <div
          className="course-tooltip"
          style={{
            position:  'fixed',
            top:       tooltip.y,
            ...(tooltip.side === 'right'
              ? { left:  tooltip.x }
              : { right: window.innerWidth - tooltip.x }),
            borderLeftColor: color,
          }}
          onMouseEnter={() => setTooltip(tooltip)} // Desktop: hover ke tooltip tidak menghilangkan
          onMouseLeave={handleMouseLeave}
        >
          <span className={`tooltip-badge ${course.type === 'Praktik' ? 'course-badge--praktik' : 'course-badge--teori'}`}>
            {course.type}
          </span>
          <p className="tooltip-name">{course.name}</p>
          {course.lecturer && (
            <p className="tooltip-info">
              <span className="tooltip-icon">👤</span>{course.lecturer}
            </p>
          )}
          {course.room && (
            <p className="tooltip-info">
              <span className="tooltip-icon">📍</span>{course.room}
            </p>
          )}
          <p className="tooltip-time" style={{ color }}>
            {course.startTime} – {course.endTime}
            {course.sks ? ` · ${course.sks} SKS` : ''}
          </p>
        </div>,
        document.body,
      )}
    </>
  );
}

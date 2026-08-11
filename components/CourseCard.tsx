'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Course } from '@/lib/schedule';

// Warna berdasarkan jenis — Teori = biru, Praktik = merah
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
  onClick: () => void;
}

export default function CourseCard({ course, top, height, onClick }: CourseCardProps) {
  const color   = TYPE_COLOR[course.type] ?? '#6366f1';
  const isSmall = height < 55; // < 55px → sembunyikan badge & waktu
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipPos | null>(null);

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const side: 'right' | 'left' = spaceRight >= 260 ? 'right' : 'left';
    setTooltip({ x: side === 'right' ? rect.right + 8 : rect.left - 8, y: rect.top, side });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <>
      <div
        ref={cardRef}
        className={`course-card ${isSmall ? 'course-card--small' : ''}`}
        style={{
          top:             `${top}px`,
          height:          `${height}px`,
          borderLeftColor: color,
          backgroundColor: `${color}1a`,
        }}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="course-card__glow"
          style={{ background: `radial-gradient(ellipse at top left, ${color}30, transparent 70%)` }}
        />
        <div className="course-card__content">
          {!isSmall && (
            <span
              className={`course-badge ${course.type === 'Praktik' ? 'course-badge--praktik' : 'course-badge--teori'}`}
            >
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
          onMouseEnter={() => setTooltip(tooltip)}
          onMouseLeave={handleMouseLeave}
        >
          <span
            className={`tooltip-badge ${course.type === 'Praktik' ? 'course-badge--praktik' : 'course-badge--teori'}`}
          >
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

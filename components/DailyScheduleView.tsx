'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Course, DayType, timeToMinutes } from '@/lib/schedule';

const DAYS: DayType[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const DAY_SHORT: Record<DayType, string> = {
  Senin: 'Sen',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Kamis: 'Kam',
  Jumat: "Jum'at",
};

const TYPE_COLOR: Record<string, string> = {
  Teori:   '#6366f1',
  Praktik: '#ef4444',
};

const LONG_PRESS_MS = 3000;

interface DailyScheduleViewProps {
  courses: Course[];
  onCourseLongPress: (course: Course) => void; // tahan 3s → edit
  onAddClick: (day: DayType, startTime: string) => void;
}

export default function DailyScheduleView({
  courses,
  onCourseLongPress,
  onAddClick,
}: DailyScheduleViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayType>('Senin');

  // Long-press state
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress   = useRef(false);
  const [pressingId, setPressingId] = useState<string | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingId(null);
  }, []);

  // Mobile: tahan 3 detik → edit
  const handleTouchStart = useCallback((course: Course) => {
    didLongPress.current = false;
    setPressingId(course.id);
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setPressingId(null);
      if (navigator.vibrate) navigator.vibrate(50);
      onCourseLongPress(course);
    }, LONG_PRESS_MS);
  }, [onCourseLongPress]);

  // Mobile: lepas sebelum 3 detik → tidak ada aksi (info sudah tampil di card)
  const handleTouchEnd = useCallback(() => {
    cancelLongPress();
    didLongPress.current = false;
  }, [cancelLongPress]);

  // Desktop: double-click → edit
  const [flashId, setFlashId] = useState<string | null>(null);
  const handleDoubleClick = useCallback((course: Course) => {
    setFlashId(course.id);
    setTimeout(() => setFlashId(null), 300);
    onCourseLongPress(course); // reuse handler — same action (open edit modal)
  }, [onCourseLongPress]);

  useEffect(() => {
    const todayIndex = new Date().getDay();
    if (todayIndex >= 1 && todayIndex <= 5) {
      const daysMap: DayType[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
      setSelectedDay(daysMap[todayIndex - 1]);
    }
  }, []);

  const dayCourses = courses
    .filter(c => c.day === selectedDay)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <div className="daily-view-container">
      {/* Day Tab Bar */}
      <div className="day-tabs">
        {DAYS.map(day => {
          const count = courses.filter(c => c.day === day).length;
          return (
            <button
              key={day}
              className={`day-tab ${selectedDay === day ? 'day-tab--active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="day-tab__short">{DAY_SHORT[day]}</span>
              <span className="day-tab__full">{day}</span>
              {count > 0 && <span className="day-tab__count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Agenda list */}
      <div className="daily-agenda">
        {dayCourses.length > 0 ? (
          <div className="agenda-list">
            {dayCourses.map(course => {
              const color = TYPE_COLOR[course.type] ?? '#6366f1';
              return (
                <div
                  key={course.id}
                  className={[
                    'agenda-card',
                    pressingId === course.id ? 'agenda-card--pressing' : '',
                    flashId    === course.id ? 'agenda-card--flash'    : '',
                  ].join(' ')}
                  style={{ borderLeftColor: color }}
                  onDoubleClick={() => handleDoubleClick(course)}
                  onTouchStart={() => handleTouchStart(course)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={cancelLongPress}
                >
                  <div className="agenda-card__header">
                    <span
                      className="agenda-card__badge"
                      style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {course.type}
                    </span>
                    <span className="agenda-card__sks">{course.sks} SKS</span>
                  </div>

                  <h3 className="agenda-card__name">{course.name}</h3>

                  <div className="agenda-card__details">
                    {course.lecturer && (
                      <div className="agenda-detail-item">
                        <span className="agenda-detail-icon">👤</span>
                        <span className="agenda-detail-text">{course.lecturer}</span>
                      </div>
                    )}
                    {course.room && (
                      <div className="agenda-detail-item">
                        <span className="agenda-detail-icon">📍</span>
                        <span className="agenda-detail-text">{course.room}</span>
                      </div>
                    )}
                    <div className="agenda-detail-item agenda-detail-item--time">
                      <span className="agenda-detail-icon">🕐</span>
                      <span className="agenda-detail-text" style={{ color, fontWeight: 600 }}>
                        {course.startTime} – {course.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="agenda-empty">
            <div className="agenda-empty__icon">☕</div>
            <p className="agenda-empty__text">Tidak ada jadwal kuliah hari {selectedDay}</p>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => onAddClick(selectedDay, '08:00')}
              style={{ marginTop: '12px' }}
            >
              + Tambah Matkul
            </button>
          </div>
        )}

        {dayCourses.length > 0 && (
          <button
            className="agenda-add-btn"
            onClick={() => {
              const lastCourse = dayCourses[dayCourses.length - 1];
              const nextStart = lastCourse ? lastCourse.endTime : '08:00';
              onAddClick(selectedDay, nextStart);
            }}
          >
            + Tambah Matkul untuk hari {selectedDay}
          </button>
        )}
      </div>
    </div>
  );
}

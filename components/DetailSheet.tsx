'use client';

import { Course } from '@/lib/schedule';

const TYPE_COLOR: Record<string, string> = {
  Teori:   '#6366f1',
  Praktik: '#ef4444',
};

interface DetailSheetProps {
  course: Course;
  onEdit: () => void;
  onClose: () => void;
}

export default function DetailSheet({ course, onEdit, onClose }: DetailSheetProps) {
  const color = TYPE_COLOR[course.type] ?? '#6366f1';

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-sheet" onClick={e => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="detail-handle" />

        {/* Header */}
        <div className="detail-header">
          <span
            className={`course-badge ${course.type === 'Praktik' ? 'course-badge--praktik' : 'course-badge--teori'}`}
          >
            {course.type}
          </span>
          <button className="detail-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        {/* Course name */}
        <h2 className="detail-name" style={{ borderLeftColor: color }}>
          {course.name}
        </h2>

        {/* Info rows */}
        <div className="detail-rows">
          {course.code && (
            <div className="detail-row">
              <span className="detail-row__icon">🏷️</span>
              <div>
                <p className="detail-row__label">Kode Matkul</p>
                <p className="detail-row__value">{course.code}</p>
              </div>
            </div>
          )}

          {course.lecturer && (
            <div className="detail-row">
              <span className="detail-row__icon">👤</span>
              <div>
                <p className="detail-row__label">Dosen</p>
                <p className="detail-row__value">{course.lecturer}</p>
              </div>
            </div>
          )}

          {course.room && (
            <div className="detail-row">
              <span className="detail-row__icon">📍</span>
              <div>
                <p className="detail-row__label">Ruangan / Lokasi</p>
                <p className="detail-row__value">{course.room}</p>
              </div>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-row__icon">🕐</span>
            <div>
              <p className="detail-row__label">Jadwal</p>
              <p className="detail-row__value" style={{ color }}>
                {course.day} · {course.startTime} – {course.endTime} · {course.sks} SKS
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>
            Tutup
          </button>
          <button
            className="btn btn--primary"
            onClick={() => { onClose(); setTimeout(onEdit, 50); }}
            style={{ flex: 2 }}
          >
            ✏️ Edit Matkul
          </button>
        </div>
      </div>
    </div>
  );
}

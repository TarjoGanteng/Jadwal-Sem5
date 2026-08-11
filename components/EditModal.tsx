'use client';

import { useState, useEffect, useRef } from 'react';
import { Course, DayType, CourseType } from '@/lib/schedule';

const DAYS: DayType[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const COURSE_TYPES: CourseType[] = ['Teori', 'Praktik'];

// Warna otomatis berdasarkan jenis
const TYPE_COLOR: Record<string, string> = {
  Teori:   '#6366f1',
  Praktik: '#ef4444',
};

interface EditModalProps {
  course?: Course;
  initialDay?: DayType;
  initialStartTime?: string;
  onSave: (course: Course) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EditModal({
  course,
  initialDay = 'Senin',
  initialStartTime = '08:00',
  onSave,
  onDelete,
  onClose,
}: EditModalProps) {
  const isEditing = !!course;
  const modalRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<Omit<Course, 'id' | 'color'>>({
    code: course?.code ?? '',
    name: course?.name ?? '',
    lecturer: course?.lecturer ?? '',
    room: course?.room ?? '',
    day: course?.day ?? initialDay,
    startTime: course?.startTime ?? initialStartTime,
    endTime: course?.endTime ?? '09:00',
    type: course?.type ?? 'Teori',
    sks: course?.sks ?? 2,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    // Focus first input
    const firstInput = modalRef.current?.querySelector('input');
    firstInput?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      color: TYPE_COLOR[form.type] ?? '#6366f1',
      id: course?.id ?? `course-${Date.now()}`,
    });
  };

  const handleDelete = () => {
    if (course) {
      onDelete(course.id);
      onClose();
    }
  };

  const update = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" ref={modalRef} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__left">
            <div className="modal-dot" style={{ backgroundColor: TYPE_COLOR[form.type] ?? '#6366f1' }} />
            <h2 className="modal-title">
              {isEditing ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Row: Kode + SKS */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course-code">Kode Matkul</label>
              <input
                id="course-code"
                type="text"
                value={form.code}
                onChange={e => update('code', e.target.value)}
                placeholder="INF80145"
              />
            </div>
            <div className="form-group form-group--narrow">
              <label htmlFor="course-sks">SKS</label>
              <input
                id="course-sks"
                type="number"
                min={1}
                max={8}
                value={form.sks}
                onChange={e => update('sks', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Nama */}
          <div className="form-group">
            <label htmlFor="course-name">Nama Mata Kuliah <span className="required">*</span></label>
            <input
              id="course-name"
              required
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="Pengembangan Aplikasi Mobile"
            />
          </div>

          {/* Dosen */}
          <div className="form-group">
            <label htmlFor="course-lecturer">Nama Dosen</label>
            <input
              id="course-lecturer"
              type="text"
              value={form.lecturer}
              onChange={e => update('lecturer', e.target.value)}
              placeholder="Nama Dosen"
            />
          </div>

          {/* Ruangan */}
          <div className="form-group">
            <label htmlFor="course-room">Ruangan / Lokasi</label>
            <input
              id="course-room"
              type="text"
              value={form.room}
              onChange={e => update('room', e.target.value)}
              placeholder="Ruang Kuliah ... [Kode]"
            />
          </div>

          {/* Hari + Jenis */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course-day">Hari <span className="required">*</span></label>
              <select
                id="course-day"
                value={form.day}
                onChange={e => update('day', e.target.value as DayType)}
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="course-type">Jenis</label>
              <select
                id="course-type"
                value={form.type}
                onChange={e => update('type', e.target.value as CourseType)}
              >
                {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Jam Mulai + Selesai */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="course-start">Jam Mulai <span className="required">*</span></label>
              <input
                id="course-start"
                required
                type="time"
                value={form.startTime}
                onChange={e => update('startTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-end">Jam Selesai <span className="required">*</span></label>
              <input
                id="course-end"
                required
                type="time"
                value={form.endTime}
                onChange={e => update('endTime', e.target.value)}
              />
            </div>
          </div>

          {/* Info warna otomatis */}
          <div className="form-group">
            <label>Warna Kartu</label>
            <div className="type-color-info">
              <span className="type-color-dot" style={{ backgroundColor: TYPE_COLOR[form.type] ?? '#6366f1' }} />
              <span className="type-color-label">
                Otomatis — {form.type === 'Praktik' ? 'Merah (Praktik)' : 'Biru (Teori)'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                className="btn btn--danger-outline"
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑 Hapus
              </button>
            )}
            {isEditing && showDeleteConfirm && (
              <div className="delete-confirm">
                <span>Yakin hapus?</span>
                <button type="button" className="btn btn--danger" onClick={handleDelete}>
                  Ya, Hapus
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setShowDeleteConfirm(false)}>
                  Batal
                </button>
              </div>
            )}

            <div className="modal-actions__right">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn--primary">
                {isEditing ? '✓ Simpan' : '+ Tambah'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

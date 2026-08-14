'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course, DayType, loadSchedule, saveSchedule } from '@/lib/schedule';
import { defaultSchedule } from '@/data/defaultSchedule';
import ScheduleGrid from '@/components/ScheduleGrid';
import EditModal from '@/components/EditModal';
import DailyScheduleView from '@/components/DailyScheduleView';

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>(defaultSchedule);
  const [canSave, setCanSave] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'daily'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [modalDefaults, setModalDefaults] = useState<{ day: DayType; startTime: string }>({
    day: 'Senin',
    startTime: '08:00',
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Deteksi touch/mobile device & sesuaikan viewMode default
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setIsMobile(isTouch);
    if (isTouch) setViewMode('daily');
  }, []);

  // Load dari localStorage setelah mount
  useEffect(() => {
    setCourses(loadSchedule(defaultSchedule));
    setCanSave(true);
  }, []);

  // Simpan ke localStorage hanya setelah load selesai
  useEffect(() => {
    if (canSave) saveSchedule(courses);
  }, [courses, canSave]);

  // Buka modal tambah matkul baru
  const openAddModal = useCallback((day: DayType, startTime: string) => {
    setSelectedCourse(undefined);
    setModalDefaults({ day, startTime });
    setIsModalOpen(true);
  }, []);

  // Buka modal edit matkul — dipakai oleh double-click (desktop) & long-press (HP)
  const openEditModal = useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback((course: Course) => {
    setCourses(prev => {
      const exists = prev.some(c => c.id === course.id);
      return exists ? prev.map(c => (c.id === course.id ? course : c)) : [...prev, course];
    });
    setIsModalOpen(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    setIsModalOpen(false);
  }, []);

  const handleReset = () => {
    setCourses(defaultSchedule);
    setShowResetConfirm(false);
  };

  const totalSks    = courses.reduce((sum, c) => sum + c.sks, 0);
  const totalMatkul = courses.length;

  return (
    <main className={`app ${viewMode === 'daily' ? 'app--scrollable' : ''}`}>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-tag">Semester 5 · 2025/2026</div>
            <h1 className="header-title">Jadwal Kuliah</h1>
            <p className="header-meta">Teknologi Informasi · Kelas K</p>
          </div>

          <div className="header-right">
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-value">{totalSks}</span>
                <span className="stat-label">Total SKS</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{totalMatkul}</span>
                <span className="stat-label">Mata Kuliah</span>
              </div>
            </div>

            <div className="header-actions">
              {!showResetConfirm ? (
                <button
                  id="btn-reset"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowResetConfirm(true)}
                >
                  ↺ Reset
                </button>
              ) : (
                <div className="reset-confirm">
                  <span>Yakin reset?</span>
                  <button className="btn btn--danger btn--sm" onClick={handleReset}>Ya</button>
                  <button className="btn btn--ghost btn--sm" onClick={() => setShowResetConfirm(false)}>Tidak</button>
                </div>
              )}
              <button
                id="btn-add-course"
                className="btn btn--primary btn--sm"
                onClick={() => openAddModal('Senin', '08:00')}
              >
                + Tambah Matkul
              </button>
            </div>
          </div>
        </div>

        {/* Hint bar */}
        <div className="hint-bar">
          {isMobile
            ? <span>💡 Tap kartu untuk lihat detail · Tahan 3 detik untuk edit · Tap di kolom hari untuk tambah</span>
            : <span>💡 Arahkan kursor ke jadwal untuk detail · <strong>Klik 2× untuk edit</strong> · Klik kolom hari untuk tambah matkul</span>
          }
        </div>
      </header>

      {/* ── View Toggle Segmented Control ── */}
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === 'daily' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            📋 Agenda Harian
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            📅 Tabel Grid
          </button>
        </div>
      </div>

      {/* ── Schedule Content ── */}
      <div className="grid-wrapper">
        {viewMode === 'daily' ? (
          <DailyScheduleView
            courses={courses}
            onCourseLongPress={openEditModal}
            onAddClick={openAddModal}
          />
        ) : (
          <ScheduleGrid
            courses={courses}
            onCourseLongPress={openEditModal}
            onCourseDoubleClick={openEditModal}
            onAddClick={openAddModal}
          />
        )}
      </div>

      {/* ── Edit / Add Modal ── */}
      {isModalOpen && (
        <EditModal
          course={selectedCourse}
          initialDay={modalDefaults.day}
          initialStartTime={modalDefaults.startTime}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}

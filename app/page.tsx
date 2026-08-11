'use client';

import { useState, useEffect, useCallback } from 'react';
import { Course, DayType, loadSchedule, saveSchedule } from '@/lib/schedule';
import { defaultSchedule } from '@/data/defaultSchedule';
import ScheduleGrid from '@/components/ScheduleGrid';
import EditModal from '@/components/EditModal';
import DetailSheet from '@/components/DetailSheet';
import DailyScheduleView from '@/components/DailyScheduleView';

export default function HomePage() {
  // Langsung tampilkan defaultSchedule — tidak ada loading spinner
  const [courses, setCourses] = useState<Course[]>(defaultSchedule);
  const [canSave, setCanSave] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'daily'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [modalDefaults, setModalDefaults] = useState<{ day: DayType; startTime: string }>({
    day: 'Senin',
    startTime: '08:00',
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Deteksi touch/mobile device & sesuaikan viewMode default
  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setIsMobile(isTouch);
    if (isTouch) {
      setViewMode('daily');
    }
  }, []);

  // Setelah mount, load dari localStorage secara diam-diam (tanpa spinner)
  useEffect(() => {
    setCourses(loadSchedule(defaultSchedule));
    setCanSave(true);
  }, []);

  // Simpan ke localStorage hanya setelah load selesai
  useEffect(() => {
    if (canSave) saveSchedule(courses);
  }, [courses, canSave]);

  const openAddModal = useCallback((day: DayType, startTime: string) => {
    setSelectedCourse(undefined);
    setModalDefaults({ day, startTime });
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((course: Course) => {
    if (isMobile) {
      // HP: tampilkan detail sheet dulu
      setDetailCourse(course);
    } else {
      // Desktop: langsung buka edit modal
      setSelectedCourse(course);
      setIsModalOpen(true);
    }
  }, [isMobile]);

  const openEditModalDirect = useCallback((course: Course) => {
    setDetailCourse(null);
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

  const totalSks = courses.reduce((sum, c) => sum + c.sks, 0);
  const totalMatkul = courses.length;

  return (
    <main className="app">
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
          <span>💡 Klik pada kolom hari untuk tambah mata kuliah · Klik kartu untuk edit</span>
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
            onCourseClick={openEditModal}
            onAddClick={openAddModal}
          />
        ) : (
          <ScheduleGrid
            courses={courses}
            onCourseClick={openEditModal}
            onAddClick={openAddModal}
          />
        )}
      </div>

      {/* ── Edit/Add Modal ── */}
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

      {/* ── Mobile Detail Sheet ── */}
      {detailCourse && (
        <DetailSheet
          course={detailCourse}
          onEdit={() => openEditModalDirect(detailCourse)}
          onClose={() => setDetailCourse(null)}
        />
      )}
    </main>
  );
}

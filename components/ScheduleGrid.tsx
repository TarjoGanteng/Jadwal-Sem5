'use client';

import { Course, DayType, timeToMinutes } from '@/lib/schedule';
import CourseCard from './CourseCard';

const DAYS: DayType[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const DAY_SHORT: Record<DayType, string> = {
  Senin: 'Sen',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Kamis: 'Kam',
  Jumat: "Jum'at",
};

// Range waktu: 07:30 – 18:30
const START_MINUTE = 7 * 60 + 30;  // 450
const END_MINUTE   = 18 * 60 + 30; // 1110
const PX_PER_MINUTE = 1.5;
const GUTTER_WIDTH  = 56;

// Slot setiap 30 menit dari 07:30 hingga 18:30
const timeSlots: { label: string; offsetMin: number; isHour: boolean }[] = [];
for (let m = START_MINUTE; m <= END_MINUTE; m += 30) {
  const h   = Math.floor(m / 60);
  const min = m % 60;
  timeSlots.push({
    label:     `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
    offsetMin: m - START_MINUTE,
    isHour:    min === 0,
  });
}

interface ScheduleGridProps {
  courses: Course[];
  onCourseLongPress: (course: Course) => void;
  onCourseDoubleClick: (course: Course) => void;
  onAddClick: (day: DayType, startTime: string) => void;
}

export default function ScheduleGrid({ courses, onCourseLongPress, onCourseDoubleClick, onAddClick }: ScheduleGridProps) {
  const gridHeight = (END_MINUTE - START_MINUTE) * PX_PER_MINUTE;

  const handleDayClick = (e: React.MouseEvent<HTMLDivElement>, day: DayType) => {
    if ((e.target as HTMLElement).closest('.course-card')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y    = e.clientY - rect.top;
    const minutesFromStart  = Math.floor(y / PX_PER_MINUTE);
    const absoluteMinutes   = minutesFromStart + START_MINUTE;
    const hour = Math.floor(absoluteMinutes / 60);
    const min  = Math.round((absoluteMinutes % 60) / 30) * 30;
    const clampedHour = Math.min(Math.max(hour, 7), 18);
    const adjMin      = min >= 60 ? 0 : min;
    const adjHour     = min >= 60 ? clampedHour + 1 : clampedHour;
    onAddClick(day, `${adjHour.toString().padStart(2, '0')}:${adjMin.toString().padStart(2, '0')}`);
  };

  return (
    <div className="schedule-container">
      {/* Sticky column headers */}
      <div className="schedule-header">
        <div className="time-gutter-header" style={{ width: GUTTER_WIDTH, minWidth: GUTTER_WIDTH }} />
        {DAYS.map(day => (
          <div key={day} className="day-header-cell">
            <span className="day-header-full">{day}</span>
            <span className="day-header-short">{DAY_SHORT[day]}</span>
          </div>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="schedule-body">
        {/* Time gutter — label tiap 30 menit */}
        <div className="time-gutter" style={{ width: GUTTER_WIDTH, minWidth: GUTTER_WIDTH, height: gridHeight }}>
          {timeSlots.map(slot => (
            <div
              key={slot.label}
              className={`time-label ${slot.isHour ? 'time-label--hour' : 'time-label--half'}`}
              style={{ top: Math.max(0, slot.offsetMin * PX_PER_MINUTE - 9) }}
            >
              {slot.label}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map(day => {
          const dayCourses = courses.filter(c => c.day === day);
          return (
            <div
              key={day}
              className="day-column"
              style={{ height: gridHeight }}
              onClick={e => handleDayClick(e, day)}
              title="Klik untuk tambah mata kuliah"
            >
              {/* Grid lines tiap 30 menit */}
              {timeSlots.map(slot => (
                <div
                  key={slot.label}
                  className={slot.isHour ? 'hour-line' : 'half-hour-line'}
                  style={{ top: slot.offsetMin * PX_PER_MINUTE }}
                />
              ))}

              {/* Course cards */}
              {dayCourses.map(course => {
                const startMin = timeToMinutes(course.startTime) - START_MINUTE;
                const endMin   = timeToMinutes(course.endTime)   - START_MINUTE;
                const top      = startMin * PX_PER_MINUTE;
                const height   = Math.max((endMin - startMin) * PX_PER_MINUTE, 40);
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    top={top}
                    height={height}
                    onDoubleClick={() => onCourseDoubleClick(course)}
                    onLongPress={() => onCourseLongPress(course)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

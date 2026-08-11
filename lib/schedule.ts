export type DayType = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
export type CourseType = 'Teori' | 'Praktik';

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  room: string;
  day: DayType;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  type: CourseType;
  sks: number;
  color: string;     // hex color
}

const STORAGE_KEY = 'jadwal-kuliah-semester-5';

export function loadSchedule(defaultData: Course[]): Course[] {
  if (typeof window === 'undefined') return defaultData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Course[];
    }
  } catch {
    // ignore parse errors
  }
  return defaultData;
}

export function saveSchedule(courses: Course[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // ignore storage errors
  }
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export interface Student {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  visualScore: number;
  auditoryScore: number;
  kinestheticScore: number;
  dominantStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Seimbang';
  isTested: boolean;
  kelas?: string;
}

export interface Seat {
  row: number; // 1 to 5
  col: number; // 1 to 6
  studentId: string | null;
}

export interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: 'V' | 'A' | 'K';
  }[];
}

export interface SeatingMetrics {
  totalStudents: number;
  visualCount: number;
  auditoryCount: number;
  kinestheticCount: number;
  unassignedCount: number;
  averageMatchScore: number; // Percentage of optimal matching
}

export interface Classroom {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan' | 'Campuran';
  rows: number;
  cols: number;
}

export interface WaliKelas {
  id: string;
  name: string;
  username: string;
  passwordRaw: string;
  classId: string | null;
}


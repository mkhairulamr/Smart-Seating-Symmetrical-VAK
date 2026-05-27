import { Student, Seat, SeatingMetrics } from '../types';

/**
 * Menghitung skor kecocokan tempat duduk untuk seorang siswa tertentu di baris dan kolom tertentu.
 * Nilainya berkisar dari 0 (Sangat Tidak Cocok) hingga 100 (Sangat Ideal).
 * 
 * Aturan Penempatan:
 * 1. Dominan Visual: Baris depan/tengah, posisi tengah agar dapat pandangan jelas ke papan tulis dan terhindar dari sudut menyamping yang ekstrem.
 * 2. Dominan Auditori: Baris tengah/strategis, posisi sentral agar gelombang suara guru terdistribusi maksimal.
 * 3. Dominan Kinestetik: Baris belakang atau deretan tepi/koridor agar leluasa bergerak tanpa mengganggu siswa lain.
 */
export function calculateSeatFitScore(
  student: Student,
  row: number,
  col: number,
  numRows: number = 5,
  numCols: number = 6
): number {
  if (!student.isTested) {
    return 70; // Skor default netral untuk siswa yang belum mengambil tes
  }

  const isEdge = col === 1 || col === numCols;
  const isCenter = numCols === 5 ? (col === 3) : (col === 3 || col === 4);
  const isInner = numCols === 5 ? (col === 2 || col === 4) : (col === 2 || col === 5);

  let score = 0;

  switch (student.dominantStyle) {
    case 'Visual':
      // Preferensi Tinggi pada Baris Depan
      if (numRows === 6) {
        if (row === 1) score += 95;
        else if (row === 2) score += 85;
        else if (row === 3) score += 65;
        else if (row === 4) score += 45;
        else if (row === 5) score += 25;
        else if (row === 6) score += 10;
      } else {
        if (row === 1) score += 95;
        else if (row === 2) score += 85;
        else if (row === 3) score += 60;
        else if (row === 4) score += 35;
        else if (row === 5) score += 15;
      }

      // Preferensi terhadap Kolom Tengah (menghindari sudut mati samping)
      if (isCenter) score += 10;
      else if (isInner) score += 5;
      else if (isEdge) score -= 15; // Mengurangi skor di paling pinggir
      break;

    case 'Auditory':
      // Preferensi pada Baris Tengah/Strategis
      if (numRows === 6) {
        if (row === 3 || row === 4) score += 95;
        else if (row === 2 || row === 5) score += 80;
        else if (row === 1) score += 60;
        else if (row === 6) score += 40;
      } else {
        if (row === 3) score += 95;
        else if (row === 2) score += 85;
        else if (row === 4) score += 80;
        else if (row === 1) score += 65;
        else if (row === 5) score += 45;
      }

      // Preferensi pada Posisi Tengah
      if (isCenter) score += 10;
      else if (isInner) score += 5;
      break;

    case 'Kinesthetic':
      // Preferensi pada Baris Belakang
      if (numRows === 6) {
        if (row === 6) score += 95;
        else if (row === 5) score += 85;
        else if (row === 4) score += 70;
        else if (row === 3) score += 50;
        else if (row === 2) score += 30;
        else if (row === 1) score += 10;
      } else {
        if (row === 5) score += 95;
        else if (row === 4) score += 80;
        else if (row === 3) score += 55;
        else if (row === 2) score += 35;
        else if (row === 1) score += 15;
      }

      // Preferensi AMAT TINGGI pada Tepi/Koridor (Aisle) untuk pergerakan bebas
      if (isEdge) {
        score += 30; // Bonus besar untuk penempatan dekat koridor
      }
      break;

    case 'Seimbang':
    default:
      // Siswa seimbang ditempatkan di mana saja dengan preferensi area menengah
      if (numRows === 6) {
        if (row === 2 || row === 3 || row === 4 || row === 5) score += 80;
        else score += 65;
      } else {
        if (row === 2 || row === 3 || row === 4) score += 80;
        else score += 65;
      }
      break;
  }

  // Batasi nilai agar tetap di rentang 0 - 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Menghasilkan susunan kursi lengkap (rows baris x cols kolom) yang optimal berdasarkan data siswa.
 * Menggunakan pendekatan Greedy Berprioritas:
 * 1. Mengurutkan siswa berdasarkan "Kadar Dominansi" (margin skor tertinggi ke skor sekunder)
 *    agar siswa dengan kebutuhan belajar paling kuat/spesifik ditempatkan terlebih dahulu.
 * 2. Mencocokkan siswa berprioritas tersebut dengan kursi kosong yang memiliki skor kesesuaian tertinggi.
 */
export function generateOptimalSeating(students: Student[], rows: number = 5, cols: number = 6): Seat[] {
  const seats: Seat[] = [];
  
  // Inisialisasi daftar kursi kosong
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      seats.push({ row: r, col: c, studentId: null });
    }
  }

  // Saring siswa yang aktif (diurutkan)
  // Menghitung bobot prioritas: Siswa yang dominan keras (misal: Visual 13, Auditori 3) mendapat prioritas di atas yang seimbang
  const sortedStudents = [...students].sort((a, b) => {
    if (!a.isTested && b.isTested) return 1;
    if (a.isTested && !b.isTested) return -1;
    if (!a.isTested && !b.isTested) return 0;

    // Hitung deviasi standar sederhana atau margin perbedaan skor tertinggi dengan rata-rata
    const getMargin = (s: Student) => {
      const scores = [s.visualScore, s.auditoryScore, s.kinestheticScore];
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      return max - min; // Semakin besar perbedaan, semakin kaku gaya belajarnya, semakin tinggi prioritas
    };

    return getMargin(b) - getMargin(a);
  });

  // Alokasi siswa satu per satu ke kursi yang paling ideal yang masih tersedia
  sortedStudents.forEach((student) => {
    let bestSeatIndex = -1;
    let maxSeatScore = -1;

    // Cari kursi kosong yang memiliki nilai kecocokan tertinggi bagi siswa ini
    seats.forEach((seat, index) => {
      if (seat.studentId === null) {
        const score = calculateSeatFitScore(student, seat.row, seat.col, rows, cols);
        if (score > maxSeatScore) {
          maxSeatScore = score;
          bestSeatIndex = index;
        }
      }
    });

    // Tempatkan di kursi terbaik jika ditemukan
    if (bestSeatIndex !== -1) {
      seats[bestSeatIndex].studentId = student.id;
    }
  });

  return seats;
}

/**
 * Menghitung metrik-metrik evaluasi penataan tempat duduk di kelas
 */
export function calculateSeatingMetrics(
  students: Student[],
  seats: Seat[],
  rows: number = 5,
  cols: number = 6
): SeatingMetrics {
  const totalStudents = students.length;
  const visualCount = students.filter(s => s.isTested && s.dominantStyle === 'Visual').length;
  const auditoryCount = students.filter(s => s.isTested && s.dominantStyle === 'Auditory').length;
  const kinestheticCount = students.filter(s => s.isTested && s.dominantStyle === 'Kinesthetic').length;

  let totalMatchScore = 0;
  let assignedCount = 0;

  seats.forEach(seat => {
    if (seat.studentId) {
      const student = students.find(s => s.id === seat.studentId);
      if (student) {
        totalMatchScore += calculateSeatFitScore(student, seat.row, seat.col, rows, cols);
        assignedCount++;
      }
    }
  });

  const unassignedCount = totalStudents - assignedCount;
  const averageMatchScore = assignedCount > 0 ? Math.round(totalMatchScore / assignedCount) : 0;

  return {
    totalStudents,
    visualCount,
    auditoryCount,
    kinestheticCount,
    unassignedCount,
    averageMatchScore
  };
}

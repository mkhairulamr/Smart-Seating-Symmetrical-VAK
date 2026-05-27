import React, { useState } from 'react';
import { Student, Seat } from '../types';
import { AVAILABLE_CLASSES } from '../mockData';
import { calculateSeatFitScore, calculateSeatingMetrics } from '../utils/seatingAlgorithm';
import { Sparkles, MessageCircle, HelpCircle, User, ArrowLeftRight, Check, MonitorPlay, Users, Compass, HelpCircle as HelpIcon } from 'lucide-react';

interface ClassroomGridProps {
  students: Student[];
  seatsByClass: Record<string, Seat[]>;
  onSwapSeats: (seatAIdx: number, seatBIdx: number, className: string) => void;
  onTriggerAutoLayout: (className: string) => void;
  userRole?: 'super_admin' | 'wali_kelas' | null;
  userKelas?: string | null;
  classDimensions: Record<string, { rows: number; cols: number }>;
  onUpdateClassDimensions: (className: string, rows: number, cols: number) => void;
}

export default function ClassroomGrid({
  students,
  seatsByClass,
  onSwapSeats,
  onTriggerAutoLayout,
  userRole,
  userKelas,
  classDimensions,
  onUpdateClassDimensions,
}: ClassroomGridProps) {
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    return userRole === 'wali_kelas' && userKelas ? userKelas : AVAILABLE_CLASSES[0];
  });
  const [selectedSeatIndex, setSelectedSeatIndex] = useState<number | null>(null);
  const [hoveredSeatIndex, setHoveredSeatIndex] = useState<number | null>(null);

  // Keep class locked to Wali Kelas companion class
  React.useEffect(() => {
    if (userRole === 'wali_kelas' && userKelas) {
      setSelectedClass(userKelas);
    }
  }, [userRole, userKelas]);

  const classStudents = students.filter((s) => s.kelas === selectedClass);
  const classSeats = seatsByClass[selectedClass] || [];

  const currentDimension = classDimensions[selectedClass] || { rows: 5, cols: 6 };
  const numRows = currentDimension.rows;
  const numCols = currentDimension.cols;

  const metrics = calculateSeatingMetrics(classStudents, classSeats, numRows, numCols);

  const getStudentForSeat = (seat: Seat) => {
    if (!seat.studentId) return null;
    return classStudents.find((s) => s.id === seat.studentId) || null;
  };

  const handleSeatClick = (index: number) => {
    if (selectedSeatIndex === null) {
      setSelectedSeatIndex(index);
    } else {
      if (selectedSeatIndex !== index) {
        // Swap seats
        onSwapSeats(selectedSeatIndex, index, selectedClass);
      }
      setSelectedSeatIndex(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setSelectedSeatIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr !== '') {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (sourceIndex !== targetIndex) {
        onSwapSeats(sourceIndex, targetIndex, selectedClass);
      }
    }
    setSelectedSeatIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Class Selector Dropdown Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div>
          <h3 className="font-sans font-bold text-base text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-sky-600" />
            Visualisasi Denah Menurut Kelas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilih kelas untuk menganalisis kecocokan tata letak berbasis hasil tes VAK mandiri.
          </p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block shrink-0">
            Pilih Kelas:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSeatIndex(null); // Reset select focus
              setHoveredSeatIndex(null);
            }}
            disabled={userRole === 'wali_kelas'}
            className="w-full md:w-64 bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold outline-none cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {userRole === 'wali_kelas' ? (
              <option value={userKelas || ''}>{userKelas}</option>
            ) : (
              AVAILABLE_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Configuration of Seating Layout (Dynamic Matrix) */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
        <div>
          <h4 className="font-sans font-bold text-sm text-slate-850 flex items-center gap-2">
            <span className="p-1 px-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-mono">🔧</span>
            Pengaturan Formasi Denah Fisik Kelas ({selectedClass})
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            {userRole === 'super_admin' ? (
              <span><strong>Akses Super Admin:</strong> Atur formasi dimensi baris/saf kelas ini secara global.</span>
            ) : (
              <span><strong>Akses Wali Kelas:</strong> Sesuaikan dimensi baris/saf dengan kondisi riil ruang kelas Anda.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onUpdateClassDimensions(selectedClass, 5, 6)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              numRows === 5 && numCols === 6
                ? 'bg-sky-600 text-white shadow shadow-sky-200 border border-sky-600'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="formasi-5x6-btn"
          >
            {numRows === 5 && numCols === 6 && <Check size={12} />}
            5 Baris x 6 Saf (30 Kursi)
          </button>
          <button
            onClick={() => onUpdateClassDimensions(selectedClass, 6, 5)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              numRows === 6 && numCols === 5
                ? 'bg-sky-600 text-white shadow shadow-sky-200 border border-sky-600'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            id="formasi-6x5-btn"
          >
            {numRows === 6 && numCols === 5 && <Check size={12} />}
            6 Baris x 5 Saf (30 Kursi)
          </button>
        </div>
      </div>

      {/* Metrics Dashboard Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="metrics-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Efisiensi Kecocokan Kelompok
            </span>
            <span className="font-sans font-bold text-2xl text-slate-800 block mt-1" id="metric-avg-score">
              {metrics.averageMatchScore}%
            </span>
            <span className="text-[11px] text-emerald-500 font-medium block mt-1">
              ✓ Sangat Ergonomis untuk KBM
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg select-none">
            {metrics.averageMatchScore >= 85 ? 'A+' : metrics.averageMatchScore >= 75 ? 'A' : 'B'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rincian Siswa Visual
          </span>
          <span className="font-sans font-bold text-2xl text-sky-600 block mt-1" id="metric-visual-count">
            {metrics.visualCount} <span className="text-xs font-normal text-slate-500">Siswa dominan</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-1 select-none">Target: Kursi Baris 1 & 2</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rincian Siswa Auditori
          </span>
          <span className="font-sans font-bold text-2xl text-teal-600 block mt-1" id="metric-auditory-count">
            {metrics.auditoryCount} <span className="text-xs font-normal text-slate-500">Siswa dominan</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-1 select-none">Target: Area Sentral / Tengah</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rincian Siswa Kinestetik
          </span>
          <span className="font-sans font-bold text-2xl text-purple-600 block mt-1" id="metric-kinesthetic-count">
            {metrics.kinestheticCount} <span className="text-xs font-normal text-slate-500">Siswa dominan</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-1 select-none">Target: Baris Belakang / Tepi</p>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Seating Grid (Left) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
          {/* Legend row */}
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-rose-50/10 pb-4">
            <div className="flex flex-wrap gap-2.5 text-[11px] font-semibold text-slate-600 select-none">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-sky-100 border border-sky-300 rounded" />
                Visual
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-teal-100 border border-teal-300 rounded" />
                Auditori
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded" />
                Kinestetik
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-slate-100 border border-slate-300 rounded" />
                Seimbang / Belum
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 bg-dashed border border-slate-300 rounded shrink-0" />
                Kosong
              </span>
            </div>

            {/* Auto Optimization trigger */}
            <button
              onClick={() => onTriggerAutoLayout(selectedClass)}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              id="btn-auto-layout"
            >
              <Sparkles size={13} className="animate-pulse" />
              Otomatisasi Posisi Seating (AI)
            </button>
          </div>

          {/* Classroom Front Representation */}
          <div className="space-y-3" id="front-classroom-view">
            {/* Whiteboard */}
            <div className="w-full bg-slate-800 text-slate-100 rounded-xl py-3 border-2 border-slate-700 shadow flex items-center justify-center relative select-none">
              <span className="absolute top-1 text-[8px] tracking-widest text-slate-400 uppercase font-bold">
                Arah Pandang Utama
              </span>
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest mt-1">
                DEPAN - PAPAN TULIS KELAS ({selectedClass})
              </h3>
            </div>

            {/* Teacher desk / Stage */}
            <div className="flex justify-center select-none">
              <div className="w-40 bg-amber-50 border border-amber-200/50 rounded-lg py-2 text-center text-[10px] font-semibold text-amber-700 shadow-sm flex items-center justify-center gap-1.5">
                <Compass size={11} />
                Meja Guru & Podium
              </div>
            </div>
          </div>

          {/* Interactive Swap Instruction banner is visible if seat is clicked */}
          {selectedSeatIndex !== null && (
            <div className="bg-sky-50 text-sky-800 border-2 border-dashed border-sky-200 p-3 rounded-xl flex items-center justify-between text-xs animate-pulse">
              <span className="font-medium">
                👉 Klik kursi yang ingin <strong>Ditukar (Swap)</strong> dengan siswa{' '}
                <strong>{getStudentForSeat(classSeats[selectedSeatIndex])?.name || 'Kursi Kosong'}</strong>.
              </span>
              <button
                onClick={() => setSelectedSeatIndex(null)}
                className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all"
              >
                Batalkan
              </button>
            </div>
          )}

          {/* Dynamic classroom seats grid (5x6 or 6x5) */}
          <div className={`grid ${numCols === 5 ? 'grid-cols-5' : 'grid-cols-6'} gap-3.5`} id="classroom-grid-seats">
            {Array.from({ length: numRows }).map((_, rowIndex) => {
              const rowNum = rowIndex + 1;

              return (
                <React.Fragment key={rowNum}>
                  {Array.from({ length: numCols }).map((_, colIndex) => {
                    const colNum = colIndex + 1;
                    const seatIndex = rowIndex * numCols + colIndex;
                    const seat = classSeats[seatIndex] || { row: rowNum, col: colNum, studentId: null };
                    const student = getStudentForSeat(seat);

                    const isSelected = selectedSeatIndex === seatIndex;
                    const isHovered = hoveredSeatIndex === seatIndex;
                    
                    // Path fitness values
                    const fitScore = student ? calculateSeatFitScore(student, rowNum, colNum, numRows, numCols) : 0;

                    let seatColorClass = 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100';
                    if (student) {
                      if (!student.isTested) {
                        seatColorClass = 'border-slate-300 bg-slate-100 text-slate-650';
                      } else if (student.dominantStyle === 'Visual') {
                        seatColorClass = 'border-sky-300 bg-sky-50/90 text-sky-900 shadow-sm hover:ring-2 hover:ring-sky-100';
                      } else if (student.dominantStyle === 'Auditory') {
                        seatColorClass = 'border-teal-300 bg-teal-50/90 text-teal-900 shadow-sm hover:ring-2 hover:ring-teal-100';
                      } else if (student.dominantStyle === 'Kinesthetic') {
                        seatColorClass = 'border-purple-300 bg-purple-50/90 text-purple-900 shadow-sm hover:ring-2 hover:ring-purple-100';
                      } else {
                        seatColorClass = 'border-slate-300 bg-slate-100 text-slate-800';
                      }
                    }

                    return (
                      <div
                        key={`${rowNum}-${colNum}`}
                        onClick={() => handleSeatClick(seatIndex)}
                        onMouseEnter={() => setHoveredSeatIndex(seatIndex)}
                        onMouseLeave={() => setHoveredSeatIndex(null)}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, seatIndex)}
                        onDragOver={(e) => handleDragOver(e, seatIndex)}
                        onDrop={(e) => handleDrop(e, seatIndex)}
                        className={`min-h-[75px] rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all select-none relative ${seatColorClass} ${
                          isSelected ? 'ring-4 ring-sky-300 border-sky-500 scale-[1.03] text-sky-950 z-10' : ''
                        }`}
                        id={`seat-card-r${rowNum}-c${colNum}`}
                      >
                        {/* Row/Col coordinates badge */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                          <span>
                            R{rowNum}-C{colNum}
                          </span>
                          {student && student.isTested && (
                            <span
                              className={`font-semibold rounded px-1 ${
                                fitScore >= 85
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : fitScore >= 65
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                              title={`Tingkat kecocokan algoritma di baris-kolom ini: ${fitScore}%`}
                            >
                              {fitScore}%
                            </span>
                          )}
                        </div>

                        {/* Student Name */}
                        <div className="font-sans font-semibold text-[11px] leading-tight py-1 truncate">
                          {student ? student.name : <span className="text-slate-300 italic font-normal">KORONG KOSONG</span>}
                        </div>

                        {/* Stool bottom identifiers */}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-mono text-slate-400">
                            {student ? student.id : '-'}
                          </span>
                          {student && (
                            <span className="text-[8px] font-bold px-1 rounded bg-white/70 border">
                              {student.isTested
                                ? student.dominantStyle === 'Visual'
                                  ? 'VIS'
                                  : student.dominantStyle === 'Auditory'
                                  ? 'AUD'
                                  : student.dominantStyle === 'Kinesthetic'
                                  ? 'KIN'
                                  : 'BAL'
                                : '?'
                              }
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t select-none">
            <span>💡 <strong>Tip UX:</strong> Geser & letakkan (Drag & Drop) siswa ke kursi baru, atau klik 2 kursi secara berurutan untuk menukarkan posisi!</span>
            <span>Total: 30 Kursi</span>
          </div>
        </div>

        {/* Detailed Info / Helper Box (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Hover / Info Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" id="seating-inspector">
            <h4 className="font-sans font-semibold text-slate-800 text-xs uppercase tracking-wide mb-4">
              Pemeriksa Kursi (Inspector)
            </h4>

            {hoveredSeatIndex !== null || selectedSeatIndex !== null ? (
              (() => {
                const targetIndex = hoveredSeatIndex !== null ? hoveredSeatIndex : selectedSeatIndex!;
                const seat = classSeats[targetIndex] || { row: Math.floor(targetIndex / numCols) + 1, col: (targetIndex % numCols) + 1, studentId: null };
                const student = getStudentForSeat(seat);
                const score = student ? calculateSeatFitScore(student, seat.row, seat.col, numRows, numCols) : 0;

                if (!student) {
                  return (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      Kursi kosong di Baris {seat.row}, Kolom {seat.col}. Klik untuk memindahkan siswa lain ke sini.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs">
                        {student.id}
                      </div>
                      <div>
                        <h5 className="font-sans font-semibold text-slate-800 text-sm">{student.name}</h5>
                        <p className="text-xs text-slate-400">{student.gender} • Baris {seat.row} - Kolom {seat.col}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Indeks Kecocokan Kursi:</span>
                        <span className={score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-amber-600' : 'text-rose-600'}>
                          {score}% ({score >= 85 ? 'Sangat Ideal' : score >= 65 ? 'Cukup Sesuai' : 'Kurang Sesuai'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {student.dominantStyle === 'Visual' && 'Siswa Visual idealnya duduk di deretan paling depan (R1-R2) serta dekat bagian sentral kelas agar mata lurus melihat papan tulis.'}
                        {student.dominantStyle === 'Auditory' && 'Siswa Auditori diutamakan di baris tengah atau posisi pusat/strategis agar suara penyampaian guru didengar paling jernih.'}
                        {student.dominantStyle === 'Kinesthetic' && 'Siswa Kinestetik diletakkan di baris belakang agar memiliki lapang gerak sirkulasi ataupun di koridor sisi samping.'}
                        {student.dominantStyle === 'Seimbang' && 'Siswa memiliki karakteristik belajar seimbang dan cocok ditempatkan fleksibel di area kelas.'}
                        {!student.isTested && 'Siswa belum tes. Nilai kecocokan dihitung flat standar.'}
                      </p>
                    </div>

                    {student.isTested && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skor Hasil Tes Siswa</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-sky-50 p-2 rounded text-center border border-sky-150">
                            <span className="text-[9px] text-sky-700 block font-semibold">V (Visual)</span>
                            <span className="font-bold text-sm text-sky-800">{student.visualScore}</span>
                          </div>
                          <div className="bg-teal-50 p-2 rounded text-center border border-teal-150">
                            <span className="text-[9px] text-teal-700 block font-semibold">A (Auditor)</span>
                            <span className="font-bold text-sm text-teal-800">{student.auditoryScore}</span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded text-center border border-purple-150">
                            <span className="text-[9px] text-purple-700 block font-semibold">K (Kinest)</span>
                            <span className="font-bold text-sm text-purple-800">{student.kinestheticScore}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs italic">
                Arahkan kursor atau klik ke salah satu kursi untuk memeriksa kecocokan penempatan VAK siswa secara detail.
              </div>
            )}
          </div>

          {/* Theory / Rules card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3" id="legend-rules-info">
            <h4 className="font-sans font-semibold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Compass size={14} className="text-sky-500" />
              Aturan Tata Letak Kelas
            </h4>
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed" id="classroom-rules-list">
              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 select-none">V</div>
                <div>
                  <span className="font-semibold text-slate-850">Garis Pandang Visual (Visual Line of Sight)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Baris 1 & 2 diutamakan agar siswa fokus melihat papan tulis kelas tanpa distorsi sudut mati.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 select-none">A</div>
                <div>
                  <span className="font-semibold text-slate-850">Kubah Akustik Tengah (Acoustic Bubble)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Baris 3 & 4 (terutama kolom tengah) agar suara guru yang konstan terdengar seimbang.</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 select-none">K</div>
                <div>
                  <span className="font-semibold text-slate-850">Ruang Gerak Kinestetik (Kinesthetic Freedom)</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Baris belakang (R5) atau sudut lorong sirkulasi (K1/K6) agar bebas peregangan fisik.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

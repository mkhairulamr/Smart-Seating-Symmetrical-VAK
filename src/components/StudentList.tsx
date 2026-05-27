import React, { useState } from 'react';
import { Student } from '../types';
import { AVAILABLE_CLASSES } from '../mockData';
import { Search, UserPlus, ClipboardList, RefreshCw, Trash2, Edit2, Sparkles, Filter, Smile, HelpCircle } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onStartTest: (student: Student) => void;
  onResetTest: (studentId: string) => void;
  onAddStudent: (name: string, gender: 'Laki-laki' | 'Perempuan', kelas: string) => void;
  onQuickUpdateScores: (studentId: string, visual: number, auditory: number, kinesthetic: number) => void;
  userRole?: 'super_admin' | 'wali_kelas' | null;
  userKelas?: string | null;
}

export default function StudentList({
  students,
  onStartTest,
  onResetTest,
  onAddStudent,
  onQuickUpdateScores,
  userRole,
  userKelas,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [styleFilter, setStyleFilter] = useState<'All' | 'Visual' | 'Auditory' | 'Kinesthetic' | 'Seimbang' | 'Belum Tes'>('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Laki-laki' | 'Perempuan'>('All');
  const [classFilter, setClassFilter] = useState<'All' | string>(() => {
    return userRole === 'wali_kelas' && userKelas ? userKelas : 'All';
  });

  // Add student Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [newStudentKelas, setNewStudentKelas] = useState<string>(() => {
    return userRole === 'wali_kelas' && userKelas ? userKelas : AVAILABLE_CLASSES[0];
  });

  // Keep class locked to Wali Kelas companion class
  React.useEffect(() => {
    if (userRole === 'wali_kelas' && userKelas) {
      setClassFilter(userKelas);
      setNewStudentKelas(userKelas);
    }
  }, [userRole, userKelas]);

  // Quick edit score states
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editVisual, setEditVisual] = useState(0);
  const [editAuditory, setEditAuditory] = useState(0);
  const [editKinesthetic, setEditKinesthetic] = useState(0);

  const handleKelasChange = (className: string) => {
    setNewStudentKelas(className);
    if (className.includes('Laki-laki')) {
      setNewStudentGender('Laki-laki');
    } else if (className.includes('Perempuan')) {
      setNewStudentGender('Perempuan');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(newStudentName.trim(), newStudentGender, newStudentKelas);
    setNewStudentName('');
    setShowAddForm(false);
  };

  const startQuickEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditVisual(student.visualScore);
    setEditAuditory(student.auditoryScore);
    setEditKinesthetic(student.kinestheticScore);
  };

  const saveQuickEdit = (studentId: string) => {
    const total = editVisual + editAuditory + editKinesthetic;
    if (total === 0) {
      alert("Total skor tidak boleh 0 jika ingin menyimpan perubahan manual!");
      return;
    }
    onQuickUpdateScores(studentId, editVisual, editAuditory, editKinesthetic);
    setEditingStudentId(null);
  };

  // Filter logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStyle = true;
    if (styleFilter !== 'All') {
      if (styleFilter === 'Belum Tes') {
        matchesStyle = !student.isTested;
      } else {
        matchesStyle = student.isTested && student.dominantStyle === styleFilter;
      }
    }

    const matchesGender = genderFilter === 'All' || student.gender === genderFilter;
    const matchesClass = classFilter === 'All' || student.kelas === classFilter;

    return matchesSearch && matchesStyle && matchesGender && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Controls & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4" id="filters-panel">
        <div className="flex flex-col xl:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400"
              id="student-search-input"
            />
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5">
            <Sparkles size={13} className="text-slate-500" />
            <select
              value={classFilter}
              onChange={(e: any) => setClassFilter(e.target.value)}
              disabled={userRole === 'wali_kelas'}
              className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 outline-none py-2 cursor-pointer pr-4 disabled:opacity-75 disabled:cursor-not-allowed"
              id="class-filter-select"
            >
              {userRole === 'wali_kelas' ? (
                <option value={userKelas || ''}>{userKelas}</option>
              ) : (
                <>
                  <option value="All">Semua Kelas</option>
                  {AVAILABLE_CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Style Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5">
            <Filter size={13} className="text-slate-500" />
            <select
              value={styleFilter}
              onChange={(e: any) => setStyleFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 outline-none py-2 cursor-pointer pr-4"
              id="style-filter-select"
            >
              <option value="All">Semua Gaya Belajar</option>
              <option value="Visual">Dominan Visual</option>
              <option value="Auditory">Dominan Auditori</option>
              <option value="Kinesthetic">Dominan Kinestetik</option>
              <option value="Seimbang">Tipe Seimbang</option>
              <option value="Belum Tes">Belum Tes VAK</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5">
            <Smile size={13} className="text-slate-500" />
            <select
              value={genderFilter}
              onChange={(e: any) => setGenderFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-600 focus:ring-0 outline-none py-2 cursor-pointer pr-4"
              id="gender-filter-select"
            >
              <option value="All">Semua Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        </div>

        {/* Add Student Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          id="btn-toggle-add-student-form"
        >
          <UserPlus size={15} />
          Tambah Siswa Baru
        </button>
      </div>

      {/* Add Student Form Expansion */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100/60 shadow-inner flex flex-col md:flex-row gap-4 items-end animate-fadeIn"
          id="add-student-form"
        >
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Nama Lengkap Siswa
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition-all shadow-sm"
              id="new-student-name"
              required
            />
          </div>

          <div className="w-full md:w-56 space-y-2">
            <label className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Pilihan Kelas
            </label>
            <select
              value={newStudentKelas}
              onChange={(e) => handleKelasChange(e.target.value)}
              disabled={userRole === 'wali_kelas'}
              className="w-full bg-white border border-sky-200 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none transition-all shadow-sm cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              id="new-student-kelas"
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

          <div className="w-full md:w-44 space-y-2">
            <label className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
              Jenis Kelamin (Gender)
            </label>
            <div className="bg-slate-150 rounded-xl p-1 bg-white border border-sky-200">
              <span className={`block text-center py-1.5 rounded-lg text-xs font-bold leading-relaxed select-none ${
                newStudentGender === 'Laki-laki' ? 'bg-sky-50 text-sky-700' : 'bg-purple-50 text-purple-700'
              }`}>
                {newStudentGender}
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-initial bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
              id="btn-submit-add-student"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 md:flex-initial bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              id="btn-cancel-add-student"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Student List Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="student-roster-table-container">
        {/* Table Header Row */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold select-none">
          <span>Daftar Siswa Kelas VAK ({filteredStudents.length} Siswa Di-filter)</span>
          <span className="hidden md:inline font-normal">Menampilkan hasil tes belajar mandiri siswa</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center" id="empty-roster-state">
            <HelpCircle size={40} className="text-slate-355 mx-auto mb-3 stroke-1 animate-bounce" />
            <h3 className="font-sans font-semibold text-sm text-slate-700">Tidak ada siswa ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cobalah ubah kata kunci pencarian atau bersihkan filter gaya belajar aktif Anda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const isEditing = editingStudentId === student.id;

              return (
                <div
                  key={student.id}
                  className={`p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all hover:bg-slate-50/50 ${
                    student.isTested ? '' : 'bg-rose-50/10'
                  }`}
                  id={`student-row-${student.id}`}
                >
                  {/* Basic Info Column */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                        student.gender === 'Laki-laki'
                          ? 'bg-sky-50 text-sky-600 border border-sky-100'
                          : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}
                    >
                      {student.id}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-medium text-sm text-slate-800 truncate block">
                          {student.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            student.gender === 'Laki-laki'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                        {student.kelas && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">
                            {student.kelas}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-400 font-sans">
                        {student.isTested ? (
                          userRole === 'wali_kelas' ? (
                            <span className="flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              🔒 Skor Asli Terkunci (Read-Only)
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                V: {student.visualScore}
                              </span>
                              <span className="flex items-center gap-1 font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                A: {student.auditoryScore}
                              </span>
                              <span className="flex items-center gap-1 font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                K: {student.kinestheticScore}
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-amber-500 font-medium italic flex items-center gap-1">
                            ⚠️ Belum Di-asesmen (VAK)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VAK Style Badge Column */}
                  <div className="flex items-center gap-3 md:justify-center w-full md:w-44 shrink-0">
                    {student.isTested ? (
                      <>
                        {student.dominantStyle === 'Visual' && (
                          <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-lg border border-sky-200/40 w-full text-center select-none flex items-center justify-center gap-1">
                            <Sparkles size={11} className="text-sky-500" />
                            Visual (Papan Tulis)
                          </span>
                        )}
                        {student.dominantStyle === 'Auditory' && (
                          <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-lg border border-teal-200/40 w-full text-center select-none flex items-center justify-center gap-1">
                            <Sparkles size={11} className="text-teal-500" />
                            Auditori (Suara)
                          </span>
                        )}
                        {student.dominantStyle === 'Kinesthetic' && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-lg border border-purple-200/40 w-full text-center select-none flex items-center justify-center gap-1">
                            <Sparkles size={11} className="text-purple-500" />
                            Kinestetik (Fisik)
                          </span>
                        )}
                        {student.dominantStyle === 'Seimbang' && (
                          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 w-full text-center select-none">
                            Seimbang (Balanced)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-lg border border-amber-200/40 w-full text-center select-none">
                        Tunda Seating
                      </span>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center justify-end gap-2 shrink-0 w-full md:w-auto">
                    {userRole === 'wali_kelas' ? (
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1 shrink-0 select-none">
                        🔒 Berkas Dilindungi (ReadOnly)
                      </span>
                    ) : isEditing ? (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-sky-600 block">VISUAL</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={editVisual}
                              onChange={(e) => setEditVisual(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-teal-600 block">AUDITORI</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={editAuditory}
                              onChange={(e) => setEditAuditory(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-purple-600 block">KINESTETIK</span>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={editKinesthetic}
                              onChange={(e) => setEditKinesthetic(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-14 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-center font-bold"
                            />
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => saveQuickEdit(student.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                          >
                            Simpan OK
                          </button>
                          <button
                            onClick={() => setEditingStudentId(null)}
                            className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {student.isTested ? (
                          <>
                            {/* Manual Override Action */}
                            <button
                              onClick={() => startQuickEdit(student)}
                              className="p-2 text-slate-500 hover:text-sky-650 hover:bg-slate-100 rounded-lg transition-all"
                              title="Set Skor Manual"
                              id={`btn-edit-scores-${student.id}`}
                            >
                              <Edit2 size={14} />
                            </button>
                            {/* Reset Test Action */}
                            <button
                              onClick={() => onResetTest(student.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Reset Tes VAK"
                              id={`btn-reset-test-${student.id}`}
                            >
                              <RefreshCw size={14} />
                            </button>
                          </>
                        ) : (
                          /* Start Assessment Questionnaire Trigger */
                          <button
                            onClick={() => onStartTest(student)}
                            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-700 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                            id={`btn-launch-test-${student.id}`}
                          >
                            <ClipboardList size={14} />
                            Mulai Tes VAK (20 Soal)
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

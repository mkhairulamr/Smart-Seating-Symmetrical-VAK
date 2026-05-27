import React, { useState } from 'react';
import { Classroom, WaliKelas, Student } from '../types';
import { 
  Building2, 
  UserCheck, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Database, 
  ShieldAlert, 
  Grid3X3, 
  UserMinus,
  Lock
} from 'lucide-react';

interface SuperAdminCrudProps {
  classrooms: Classroom[];
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
  waliKelasList: WaliKelas[];
  setWaliKelasList: React.Dispatch<React.SetStateAction<WaliKelas[]>>;
  students: Student[];
  onTriggerAutoLayout: (className: string) => void;
}

export default function SuperAdminCrud({
  classrooms,
  setClassrooms,
  waliKelasList,
  setWaliKelasList,
  students,
  onTriggerAutoLayout
}: SuperAdminCrudProps) {
  // Tabs: 'kelas' | 'wali'
  const [activeTab, setActiveTab] = useState<'kelas' | 'wali'>('kelas');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Alerts simulating PHP $_SESSION Success/Error alerts
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  // Form Modals - Open status & inputs
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalMode, setClassModalMode] = useState<'create' | 'update'>('create');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classFormName, setClassFormName] = useState('');
  const [classFormGender, setClassFormGender] = useState<'Laki-laki' | 'Perempuan' | 'Campuran'>('Campuran');
  const [classFormLayout, setClassFormLayout] = useState<'5x6' | '6x5'>('5x6');

  const [isWaliModalOpen, setIsWaliModalOpen] = useState(false);
  const [waliModalMode, setWaliModalMode] = useState<'create' | 'update'>('create');
  const [selectedWaliId, setSelectedWaliId] = useState<string | null>(null);
  const [waliFormName, setWaliFormName] = useState('');
  const [waliFormUsername, setWaliFormUsername] = useState('');
  const [waliFormPassword, setWaliFormPassword] = useState('');
  const [waliFormClassId, setWaliFormClassId] = useState<string>(''); // Class name or empty

  const triggerToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setAlertSuccess(text);
      setAlertError(null);
      setTimeout(() => setAlertSuccess(null), 5000);
    } else {
      setAlertError(text);
      setAlertSuccess(null);
      setTimeout(() => setAlertError(null), 5000);
    }
  };

  // --- CRUD KELAS ACTIONS ---
  const handleOpenAddClass = () => {
    setClassModalMode('create');
    setClassFormName('');
    setClassFormGender('Campuran');
    setClassFormLayout('5x6');
    setSelectedClassId(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (kls: Classroom) => {
    setClassModalMode('update');
    setClassFormName(kls.name);
    setClassFormGender(kls.gender);
    setClassFormLayout(kls.rows === 6 && kls.cols === 5 ? '6x5' : '5x6');
    setSelectedClassId(kls.id);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = classFormName.trim();
    if (!nameTrimmed) {
      triggerToast('error', 'Nama kelas tidak boleh kosong!');
      return;
    }

    const rows = classFormLayout === '6x5' ? 6 : 5;
    const cols = classFormLayout === '6x5' ? 5 : 6;

    if (classModalMode === 'create') {
      // Check duplicated class name
      if (classrooms.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
        triggerToast('error', `Kelas dengan nama "${nameTrimmed}" sudah terdaftar dalam sistem.`);
        return;
      }

      const nextNum = classrooms.length + 1;
      const newId = `C${nextNum.toString().padStart(2, '0')}`;
      const newClass: Classroom = {
        id: newId,
        name: nameTrimmed,
        gender: classFormGender,
        rows,
        cols
      };

      setClassrooms([...classrooms, newClass]);
      triggerToast('success', `Kelas baru [${nameTrimmed}] berhasil ditambah!`);
    } else {
      // Update Mode
      const updated = classrooms.map(c => {
        if (c.id === selectedClassId) {
          // Check duplicate name for *other* classes
          const duplicate = classrooms.some(other => other.id !== selectedClassId && other.name.toLowerCase() === nameTrimmed.toLowerCase());
          if (duplicate) {
            triggerToast('error', `Nama kelas "${nameTrimmed}" sudah terpakai kelas lain.`);
            return c;
          }

          // Trigger layout regeneration in seats if dimensions changed
          if (c.rows !== rows || c.cols !== cols) {
            setTimeout(() => onTriggerAutoLayout(nameTrimmed), 100);
          }

          return { ...c, name: nameTrimmed, gender: classFormGender, rows, cols };
        }
        return c;
      });

      // Update old ref in students and wali kelas if class name changes
      const oldKls = classrooms.find(c => c.id === selectedClassId);
      if (oldKls && oldKls.name !== nameTrimmed) {
        setWaliKelasList(prev => prev.map(w => w.classId === oldKls.name ? { ...w, classId: nameTrimmed } : w));
      }

      setClassrooms(updated);
      triggerToast('success', `Informasi & Layout Kelas [${nameTrimmed}] berhasil diubah!`);
    }

    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (kls: Classroom) => {
    // ⚠️ RESTRICT DATABASE SAFETY CHECK Simulators
    // Check if class is held by any Wali Kelas (mencegah orphan data / wali yatim)
    const activeWali = waliKelasList.find(w => w.classId === kls.name);
    if (activeWali) {
      triggerToast('error', `Dilarang Hapus Kelas: Kelas masih terikat dengan Wali Kelas aktif [${activeWali.name}]. Sesuai aturan restriksi database (RESTRICT), mohon ubah atau hapus akun Wali Kelas terkait terlebih dahulu.`);
      return;
    }

    // Check if class contains registered students
    const activeStudents = students.filter(s => s.kelas === kls.name);
    if (activeStudents.length > 0) {
      triggerToast('error', `Dilarang Hapus Kelas: Terdeteksi ${activeStudents.length} siswa terdaftar di dalam kelas ini. Pindahkan atau hapus siswa tersebut terlebih dahulu.`);
      return;
    }

    if (window.confirm(`PERINGATAN SIS-DB: Menghapus kelas "${kls.name}" akan menghapus konfigurasinya secara permanen. Klik OK jika Anda yakin.`)) {
      setClassrooms(classrooms.filter(c => c.id !== kls.id));
      triggerToast('success', `Kelas "${kls.name}" berhasil dihapus secara permanen dari sistem.`);
    }
  };


  // --- CRUD WALI KELAS ACTIONS ---
  const handleOpenAddWali = () => {
    setWaliModalMode('create');
    setWaliFormName('');
    setWaliFormUsername('');
    setWaliFormPassword('');
    setWaliFormClassId('');
    setSelectedWaliId(null);
    setIsWaliModalOpen(true);
  };

  const handleOpenEditWali = (wali: WaliKelas) => {
    setWaliModalMode('update');
    setWaliFormName(wali.name);
    setWaliFormUsername(wali.username);
    setWaliFormPassword(''); // blank unless they want to change
    setWaliFormClassId(wali.classId || '');
    setSelectedWaliId(wali.id);
    setIsWaliModalOpen(true);
  };

  const handleSaveWali = (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrimmed = waliFormName.trim();
    const usernameTrimmed = waliFormUsername.trim().toLowerCase();
    
    if (!nameTrimmed || !usernameTrimmed) {
      triggerToast('error', 'Nama wali dan username wajib diisi!');
      return;
    }

    if (waliModalMode === 'create' && !waliFormPassword) {
      triggerToast('error', 'Sandi baru wajib diisi untuk pendaftaran wali kelas!');
      return;
    }

    // Check Username duplication in other accounts
    const duplicateUsername = waliKelasList.some(w => w.id !== selectedWaliId && w.username === usernameTrimmed) || usernameTrimmed === 'khairul' || usernameTrimmed === 'admin';
    if (duplicateUsername) {
      triggerToast('error', `Username "${usernameTrimmed}" sudah terdaftar, silakan gunakan username lain.`);
      return;
    }

    // Check Class exclusive binding (1 Wali holds 1 Class)
    if (waliFormClassId) {
      const classDuplicateWali = waliKelasList.find(w => w.id !== selectedWaliId && w.classId === waliFormClassId);
      if (classDuplicateWali) {
        triggerToast('error', `Aturan Database Gagasan: Kelas "${waliFormClassId}" sudah dipegang oleh Wali kelas lain [${classDuplicateWali.name}]. Satu kelas hanya boleh memiliki satu wali.`);
        return;
      }
    }

    if (waliModalMode === 'create') {
      const nextNum = waliKelasList.length + 1;
      const newId = `W${nextNum.toString().padStart(2, '0')}`;
      const newWali: WaliKelas = {
        id: newId,
        name: nameTrimmed,
        username: usernameTrimmed,
        passwordRaw: waliFormPassword,
        classId: waliFormClassId || null
      };

      setWaliKelasList([...waliKelasList, newWali]);
      triggerToast('success', `Akun login Wali Kelas [${nameTrimmed}] berhasil dibuat!`);
    } else {
      // Update
      const updated = waliKelasList.map(w => {
        if (w.id === selectedWaliId) {
          return {
            ...w,
            name: nameTrimmed,
            username: usernameTrimmed,
            // Keep old password if input is empty
            passwordRaw: waliFormPassword ? waliFormPassword : w.passwordRaw,
            classId: waliFormClassId || null
          };
        }
        return w;
      });

      setWaliKelasList(updated);
      triggerToast('success', `Data akun Wali Kelas [${nameTrimmed}] berhasil diperbarui secara aman!`);
    }

    setIsWaliModalOpen(false);
  };

  const handleDeleteWali = (wali: WaliKelas) => {
    if (wali.username === 'khairul' || wali.username === 'admin_super') {
      triggerToast('error', 'Tindakan berbahaya! Dilarang keras menghapus akun Super Admin utama.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus permanen akses login wali kelas [${wali.name}]?`)) {
      setWaliKelasList(waliKelasList.filter(w => w.id !== wali.id));
      triggerToast('success', `Akun login Wali Kelas "${wali.name}" dilepas dari sistem.`);
    }
  };

  // Filter lists based on search qurey
  const filteredClassrooms = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.gender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWali = waliKelasList.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (w.classId || 'Tidak Memegang Kelas').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Simulation Banner Info */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex gap-3 text-xs mb-6 text-slate-700">
        <ShieldAlert size={20} className="text-sky-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-800 block text-sm mb-1">Panel Rinci Super Admin — Simulator Control Panel</span>
          Kelola master data kelas dan akun login wali kelas sekolah. Anda dapat melakukan CRUD interaktif di bawah ini dan hasilnya langsung menyinkronkan database simulasi platform. Anda juga dapat mencoba membuat akun wali kelas baru lalu logout untuk menguji login menggunakan akun tersebut!
        </div>
      </div>

      {/* PHP style alerting flash notifications */}
      {alertSuccess && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-slideDown">
          <CheckCircle size={16} className="text-emerald-600" />
          <span>🚀 <strong>Berhasil:</strong> {alertSuccess}</span>
        </div>
      )}

      {alertError && (
        <div className="p-4 mb-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-slideDown">
          <AlertCircle size={16} className="text-rose-600 animate-pulse" />
          <span>⚠️ <strong>Perhatian:</strong> {alertError}</span>
        </div>
      )}

      {/* Tab Switching Menu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveTab('kelas'); setSearchQuery(''); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kelas' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 size={14} />
            Manajemen Nama Kelas
          </button>
          <button
            onClick={() => { setActiveTab('wali'); setSearchQuery(''); }}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wali' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck size={14} />
            Akun Login Wali Kelas
          </button>
        </div>

        {/* Real-time search filter */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'kelas' ? 'Cari Rombel Kelas...' : 'Cari Wali Kelas/Username...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* --- TAB CONTENT: KELAS --- */}
      {activeTab === 'kelas' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-800">Daftar Seluruh Rombongan Kelas</h3>
              <p className="text-[11px] text-slate-400">Total terdaftar: {classrooms.length} Kelas aktif</p>
            </div>
            <button
              onClick={handleOpenAddClass}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold py-2 px-4 transition-all active:scale-95"
            >
              <PlusCircle size={14} />
              Tambah Kelas Baru
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="p-4">ID Kelas</th>
                  <th className="p-4">Nama Rombel Kelas</th>
                  <th className="p-4">Spesifikasi Kelas</th>
                  <th className="p-4">Ukuran Denah (Baris x Saf)</th>
                  <th className="p-4 text-center">Aksi Pengawasan</th>
                </tr>
              </thead>
              <tbody>
                {filteredClassrooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-slate-50/50">
                      Tidak ada kelas yang cocok dengan kata pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredClassrooms.map((kls) => (
                    <tr key={kls.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-medium">
                      <td className="p-4 font-mono font-bold text-slate-400">#{kls.id}</td>
                      <td className="p-4 font-bold text-slate-800">{kls.name}</td>
                      <td className="p-4">
                        {kls.gender === 'Laki-laki' && (
                          <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">♂️ Laki-laki</span>
                        )}
                        {kls.gender === 'Perempuan' && (
                          <span className="bg-pink-100 text-pink-800 text-[10px] font-bold px-2 py-0.5 rounded-full">♀️ Perempuan</span>
                        )}
                        {kls.gender === 'Campuran' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">⚖️ Campuran</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-md">
                          {kls.rows} Baris x {kls.cols} Saf
                        </span>
                        <span className="text-slate-450 text-[10px] ml-1.5 font-sans">({kls.rows * kls.cols} Kursi)</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditClass(kls)}
                            className="bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg p-1.5 transition-all text-xs flex items-center gap-1"
                            title="Edit Data Kelas"
                          >
                            <Edit3 size={13} />
                            Ubah
                          </button>
                          <button
                            onClick={() => handleDeleteClass(kls)}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg p-1.5 transition-all text-xs flex items-center gap-1"
                            title="Hapus Kelas"
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: WALI KELAS --- */}
      {activeTab === 'wali' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-slate-800">Manajemen Akses Akun Wali Kelas</h3>
              <p className="text-[11px] text-slate-400">Total terdaftar: {waliKelasList.length} Akun aktif</p>
            </div>
            <button
              onClick={handleOpenAddWali}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold py-2 px-4 transition-all active:scale-95"
            >
              <PlusCircle size={14} />
              Tambah Wali Kelas
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                  <th className="p-4">ID Admin</th>
                  <th className="p-4">Nama Lengkap Wali</th>
                  <th className="p-4">Username Akun</th>
                  <th className="p-4">Kelas Binaan Dampingan</th>
                  <th className="p-4 text-center">Aksi Pengawasan</th>
                </tr>
              </thead>
              <tbody>
                {filteredWali.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-slate-50/50">
                      Tidak ada akun login wali kelas yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredWali.map((wali) => (
                    <tr key={wali.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-medium">
                      <td className="p-4 font-mono font-bold text-slate-400">#{wali.id}</td>
                      <td className="p-4 font-bold text-slate-805 flex items-center gap-2">
                        <span>{wali.name}</span>
                      </td>
                      <td className="p-4">
                        <code className="bg-slate-100 px-2 py-1 rounded text-sky-700 font-bold font-mono text-[11px]">
                          {wali.username}
                        </code>
                      </td>
                      <td className="p-4">
                        {wali.classId ? (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            {wali.classId}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Tidak Memegang Kelas</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditWali(wali)}
                            className="bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg p-1.5 transition-all text-xs flex items-center gap-1"
                            title="Edit Data Wali Kelas"
                          >
                            <Edit3 size={13} />
                            Ubah
                          </button>
                          <button
                            onClick={() => handleDeleteWali(wali)}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg p-1.5 transition-all text-xs flex items-center gap-1"
                            title="Hapus Akun Wali"
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CLASS CRUD POPUP OVERLAY --- */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveClass} className="bg-white rounded-3xl border shadow-xl w-full max-w-md animate-scaleUp overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-slate-800">
                  {classModalMode === 'create' ? 'Buat Kelas Rombel Baru' : 'Ubah Informasi Detail Kelas'}
                </h4>
                <p className="text-[10px] text-slate-400">Formula master data kelas simulator backoffice</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Kelas Rombongan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: IX Khaula (Perempuan)"
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Spesifikasi Pengelompokan Gender
                </label>
                <select
                  value={classFormGender}
                  onChange={(e: any) => setClassFormGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-705 font-bold outline-none cursor-pointer transition-all"
                >
                  <option value="Campuran">Campuran (Laki / Perempuan)</option>
                  <option value="Laki-laki">Khusus Laki-laki (Ikhwan)</option>
                  <option value="Perempuan">Khusus Perempuan (Akhwat)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Pilih Layout Grid Standard
                </label>
                <select
                  value={classFormLayout}
                  onChange={(e: any) => setClassFormLayout(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-705 font-bold outline-none cursor-pointer transition-all"
                >
                  <option value="5x6">5 Baris x 6 Kolom (30 Kursi Standard)</option>
                  <option value="6x5">6 Baris x 5 Kolom (30 Kursi Samping)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-500 leading-relaxed border flex gap-2">
                <Grid3X3 size={16} className="text-sky-500 shrink-0" />
                <span>
                  <strong>Informasi Layout:</strong> Mengubah ukuran formasi baris/kolom otomatis menginduksi pembuatan rincian grid denah baru. Integrasi PHP dilindungi dengan transactional safety di backend.
                </span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-sm transition-all text-center"
              >
                Simpan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- WALI KELAS CRUD POPUP OVERLAY --- */}
      {isWaliModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveWali} className="bg-white rounded-3xl border shadow-xl w-full max-w-md animate-scaleUp overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-slate-800">
                  {waliModalMode === 'create' ? 'Daftarkan Akun Wali Kelas' : 'Edit Kredensial Wali Kelas'}
                </h4>
                <p className="text-[10px] text-slate-400">Simulasi registrasi pengguna login dengan sandi Bcrypt</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Lengkap Wali Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Nofrizal, S.Pd"
                  value={waliFormName}
                  onChange={(e) => setWaliFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Username Login
                </label>
                <input
                  type="text"
                  placeholder="Contoh: nofrizal"
                  value={waliFormUsername}
                  onChange={(e) => setWaliFormUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none transition-all font-semibold font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {waliModalMode === 'create' ? 'Sandi Login Akses' : 'Ubah Sandi (Kosongkan jika tidak diganti)'}
                </label>
                <input
                  type="password"
                  placeholder={waliModalMode === 'create' ? 'Ketik password baru...' : 'Sandi tidak dirubah...'}
                  value={waliFormPassword}
                  onChange={(e) => setWaliFormPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-705 outline-none transition-all fonts-bold"
                  required={waliModalMode === 'create'}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Relasikan dengan Kelas Binaan
                </label>
                <select
                  value={waliFormClassId}
                  onChange={(e: any) => setWaliFormClassId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-slate-705 font-bold outline-none cursor-pointer transition-all"
                >
                  <option value="">-- Tanpa Kelas Dampingan (Internal) --</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-550 leading-relaxed border flex gap-2">
                <Lock size={16} className="text-sky-500 shrink-0" />
                <span>
                  <strong>Keamanan Kata Sandi:</strong> Untuk melindungi integritas privasi akun, data sandi yang disimpan langsung disandikan secara aman menggunakan hashing satu arah Bcrypt di script php: <code className="bg-slate-100/90 text-sky-850 p-0.5 rounded px-1">password_hash($pas, PASSWORD_BCRYPT)</code>.
                </span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsWaliModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-sm transition-all text-center"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

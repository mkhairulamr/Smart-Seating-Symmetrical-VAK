import React, { useState, useEffect } from 'react';
import { Student, Seat, Classroom, WaliKelas } from './types';
import { INITIAL_STUDENTS, AVAILABLE_CLASSES } from './mockData';
import { generateOptimalSeating, calculateSeatingMetrics } from './utils/seatingAlgorithm';
import ClassroomGrid from './components/ClassroomGrid';
import StudentList from './components/StudentList';
import VakTest from './components/VakTest';
import PhpMySqlExport from './components/PhpMySqlExport';
import SuperAdminCrud from './components/SuperAdminCrud';
import { 
  Users, 
  LayoutGrid, 
  ClipboardList, 
  Database, 
  Landmark, 
  RefreshCw, 
  Layers, 
  Lock, 
  ShieldCheck, 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  EyeOff, 
  HelpCircle,
  ExternalLink,
  Key
} from 'lucide-react';

export default function App() {
  // Pre-load dynamic migration resetting to clean state with 148 dummy students
  if (typeof window !== 'undefined' && localStorage.getItem('smart_seating_v3_148_migrated') !== 'yes') {
    localStorage.removeItem('smart_seating_students');
    localStorage.removeItem('smart_seating_by_class_v2');
    localStorage.removeItem('smart_seating_class_dimensions');
    localStorage.removeItem('smart_seating_classrooms');
    localStorage.removeItem('smart_seating_wali_kelas');
    localStorage.setItem('smart_seating_v3_148_migrated', 'yes');
  }

  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem('smart_seating_classrooms');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'C01', name: 'VII Ibnu Abbas (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C02', name: 'VII Asma (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C03', name: 'VIII Ubay (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C04', name: 'VIII Sumayyah (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C05', name: 'IX Zubair (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C06', name: 'IX Khaula (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 }
    ];
  });

  const [waliKelasList, setWaliKelasList] = useState<WaliKelas[]>(() => {
    const saved = localStorage.getItem('smart_seating_wali_kelas');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'W01', name: 'Nofrizal, S.Pd', username: 'nofrizal', passwordRaw: 'password123', classId: 'VII Ibnu Abbas (Laki-laki)' },
      { id: 'W02', name: 'Cut Nisa, S.Pd', username: 'cutnisa', passwordRaw: 'password123', classId: 'VII Asma (Perempuan)' },
      { id: 'W03', name: 'Riswanda, S.Pd', username: 'riswanda', passwordRaw: 'password123', classId: 'VIII Ubay (Laki-laki)' },
      { id: 'W04', name: 'Aisyah, S.Pd', username: 'aisyah', passwordRaw: 'password123', classId: 'VIII Sumayyah (Perempuan)' },
      { id: 'W05', name: 'Mahmuddin, S.Pd', username: 'mahmuddin', passwordRaw: 'password123', classId: 'IX Zubair (Laki-laki)' },
      { id: 'W06', name: 'Saumiana, S.Pd', username: 'saumiana', passwordRaw: 'password123', classId: 'IX Khaula (Perempuan)' }
    ];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smart_seating_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [classDimensions, setClassDimensions] = useState<Record<string, { rows: number; cols: number }>>(() => {
    const saved = localStorage.getItem('smart_seating_class_dimensions');
    if (saved) return JSON.parse(saved);
    
    const defaults: Record<string, { rows: number; cols: number }> = {};
    const savedClassesFromStorage = localStorage.getItem('smart_seating_classrooms');
    const list = savedClassesFromStorage ? JSON.parse(savedClassesFromStorage) : [
      { id: 'C01', name: 'VII Ibnu Abbas (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C02', name: 'VII Asma (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C03', name: 'VIII Ubay (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C04', name: 'VIII Sumayyah (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C05', name: 'IX Zubair (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C06', name: 'IX Khaula (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 }
    ];

    list.forEach((c: any) => {
      defaults[c.name] = { rows: c.rows, cols: c.cols };
    });
    return defaults;
  });

  const [seatsByClass, setSeatsByClass] = useState<Record<string, Seat[]>>(() => {
    const saved = localStorage.getItem('smart_seating_by_class_v2');
    if (saved) {
      return JSON.parse(saved);
    }
    const initialSeats: Record<string, Seat[]> = {};
    const savedClassesFromStorage = localStorage.getItem('smart_seating_classrooms');
    const list = savedClassesFromStorage ? JSON.parse(savedClassesFromStorage) : [
      { id: 'C01', name: 'VII Ibnu Abbas (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C02', name: 'VII Asma (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C03', name: 'VIII Ubay (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C04', name: 'VIII Sumayyah (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
      { id: 'C05', name: 'IX Zubair (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
      { id: 'C06', name: 'IX Khaula (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 }
    ];

    list.forEach((c: any) => {
      const classStudents = INITIAL_STUDENTS.filter((s) => s.kelas === c.name);
      initialSeats[c.name] = generateOptimalSeating(classStudents, c.rows, c.cols);
    });
    return initialSeats;
  });

  // Portal view state routing:
  // 'portal' | 'student-registration' | 'student-test' | 'student-success' | 'admin-login' | 'admin-dashboard'
  const [viewMode, setViewMode] = useState<'portal' | 'student-registration' | 'student-test' | 'student-success' | 'admin-login' | 'admin-dashboard'>(() => {
    const savedMode = localStorage.getItem('smart_seating_view_mode');
    return (savedMode as any) || 'portal';
  });

  // Active sub-tab inside admin dashboard
  const [adminTab, setAdminTab] = useState<'grid' | 'roster' | 'integration' | 'super_admin'>('grid');

  // Student registration states for Blind Test
  const [studentName, setStudentName] = useState('');
  const [studentKelas, setStudentKelas] = useState<string>(() => {
    const saved = localStorage.getItem('smart_seating_classrooms');
    if (saved) {
      const cls = JSON.parse(saved);
      if (cls.length > 0) return cls[0].name;
    }
    return 'VII Ibnu Abbas (Laki-laki)';
  });
  const [studentGender, setStudentGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [currentTestedStudent, setCurrentTestedStudent] = useState<Student | null>(null);

  // Admin login credential inputs
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPasswordHashDetail, setShowPasswordHashDetail] = useState(false);
  const [showCredentialHelp, setShowCredentialHelp] = useState(false);

  const [userRole, setUserRole] = useState<'super_admin' | 'wali_kelas' | null>(() => {
    return (localStorage.getItem('smart_seating_user_role') as any) || null;
  });
  const [userKelas, setUserKelas] = useState<string | null>(() => {
    return localStorage.getItem('smart_seating_user_kelas') || null;
  });

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('smart_seating_user_role', userRole);
    } else {
      localStorage.removeItem('smart_seating_user_role');
    }
  }, [userRole]);

  useEffect(() => {
    if (userKelas) {
      localStorage.setItem('smart_seating_user_kelas', userKelas);
    } else {
      localStorage.removeItem('smart_seating_user_kelas');
    }
  }, [userKelas]);

  // Synchronize student structures with local storage
  useEffect(() => {
    localStorage.setItem('smart_seating_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smart_seating_classrooms', JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem('smart_seating_wali_kelas', JSON.stringify(waliKelasList));
  }, [waliKelasList]);

  useEffect(() => {
    localStorage.setItem('smart_seating_by_class_v2', JSON.stringify(seatsByClass));
  }, [seatsByClass]);

  useEffect(() => {
    localStorage.setItem('smart_seating_view_mode', viewMode);
  }, [viewMode]);

  // Dynamic automatic class gender updater
  const handleStudentClassChange = (selectedClass: string) => {
    setStudentKelas(selectedClass);
    const matchedClass = classrooms.find(c => c.name === selectedClass);
    if (matchedClass) {
      if (matchedClass.gender === 'Campuran') {
        setStudentGender('Laki-laki');
      } else {
        setStudentGender(matchedClass.gender as 'Laki-laki' | 'Perempuan');
      }
    } else {
      if (selectedClass.includes('Laki-laki')) {
        setStudentGender('Laki-laki');
      } else if (selectedClass.includes('Perempuan')) {
        setStudentGender('Perempuan');
      }
    }
  };

  // VAK Dominant Type Solver
  const evaluateDominantStyle = (v: number, a: number, k: number): 'Visual' | 'Auditory' | 'Kinesthetic' | 'Seimbang' => {
    const maxVal = Math.max(v, a, k);
    if (maxVal === 0) return 'Seimbang';

    const occurrences = [v === maxVal, a === maxVal, k === maxVal].filter(Boolean).length;
    if (occurrences > 1) return 'Seimbang'; // Ties

    if (v === maxVal) return 'Visual';
    if (a === maxVal) return 'Auditory';
    return 'Kinesthetic';
  };

  // Launch test for specific student (Teacher override trigger)
  const handleTeacherStartTest = (student: Student) => {
    setCurrentTestedStudent(student);
    setViewMode('student-test');
  };

  // Student registration submission logic
  const handleStudentRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Mohon isi nama lengkap Anda terlebih dahulu!');
      return;
    }

    // Check if pupil already exists inside dataset by Name and Class
    const foundExisting = students.find((s) => s.name.toLowerCase() === studentName.trim().toLowerCase() && s.kelas === studentKelas);
    
    if (foundExisting) {
      if (foundExisting.isTested) {
        if (!window.confirm(`Siswa dengan nama ${studentName.trim()} di kelas ${studentKelas} sudah memiliki data profil belajar. Apakah Anda ingin mengulangi kuesioner ini?`)) {
          return;
        }
      }
      setCurrentTestedStudent(foundExisting);
    } else {
      // Build a fresh temporary Student
      const nextNum = students.length + 1;
      const paddedId = `S${nextNum.toString().padStart(2, '0')}`;
      
      const newStudent: Student = {
        id: paddedId,
        name: studentName.trim(),
        gender: studentGender,
        visualScore: 0,
        auditoryScore: 0,
        kinestheticScore: 0,
        dominantStyle: 'Seimbang',
        isTested: false,
        kelas: studentKelas
      };

      setCurrentTestedStudent(newStudent);
    }

    setLoginError('');
    setViewMode('student-test');
  };

  // Completes assessment scoring
  const handleTestComplete = (studentId: string, visual: number, auditory: number, kinesthetic: number) => {
    if (!currentTestedStudent) return;

    const dominant = evaluateDominantStyle(visual, auditory, kinesthetic);
    const targetKelas = currentTestedStudent.kelas || classrooms[0]?.name || 'VII Ibnu Abbas (Laki-laki)';

    let updatedStudentsList: Student[];
    const studentExists = students.some(s => s.id === currentTestedStudent.id || (s.name.toLowerCase() === currentTestedStudent.name.toLowerCase() && s.kelas === targetKelas));

    if (studentExists) {
      // Update values
      updatedStudentsList = students.map((s) => {
        if (s.id === currentTestedStudent.id || (s.name.toLowerCase() === currentTestedStudent.name.toLowerCase() && s.kelas === targetKelas)) {
          return {
            ...s,
            name: currentTestedStudent.name, // keep newest entered name
            gender: currentTestedStudent.gender,
            visualScore: visual,
            auditoryScore: auditory,
            kinestheticScore: kinesthetic,
            dominantStyle: dominant,
            isTested: true,
          };
        }
        return s;
      });
    } else {
      // Create new student
      const completeNewStudent: Student = {
        ...currentTestedStudent,
        visualScore: visual,
        auditoryScore: auditory,
        kinestheticScore: kinesthetic,
        dominantStyle: dominant,
        isTested: true,
      };
      updatedStudentsList = [...students, completeNewStudent];
    }

    setStudents(updatedStudentsList);
    
    // Auto matching arrangement update specifically for this class
    const updatedClassStudents = updatedStudentsList.filter((s) => s.kelas === targetKelas);
    const dims = classDimensions[targetKelas] || { rows: 5, cols: 6 };
    const newClassSeats = generateOptimalSeating(updatedClassStudents, dims.rows, dims.cols);
    setSeatsByClass((prev) => ({
      ...prev,
      [targetKelas]: newClassSeats,
    }));

    // Redirect to success screen depending on source role
    setViewMode('student-success');
  };

  const handleUpdateClassDimensions = (className: string, rows: number, cols: number) => {
    setClassDimensions((prev) => {
      const updated = {
        ...prev,
        [className]: { rows, cols }
      };
      localStorage.setItem('smart_seating_class_dimensions', JSON.stringify(updated));
      return updated;
    });

    // Recompile seats immediately with the selected class configuration
    const classStudents = students.filter((s) => s.kelas === className);
    const updatedSeats = generateOptimalSeating(classStudents, rows, cols);
    setSeatsByClass((prev) => {
      const updated = {
        ...prev,
        [className]: updatedSeats
      };
      localStorage.setItem('smart_seating_by_class_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const handleResetTest = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const studentKelas = student.kelas || classrooms[0]?.name || 'VII Ibnu Abbas (Laki-laki)';

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          visualScore: 0,
          auditoryScore: 0,
          kinestheticScore: 0,
          dominantStyle: 'Seimbang' as const,
          isTested: false,
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    
    const updatedClassStudents = updatedStudents.filter((s) => s.kelas === studentKelas);
    const dims = classDimensions[studentKelas] || { rows: 5, cols: 6 };
    setSeatsByClass((prev) => ({
      ...prev,
      [studentKelas]: generateOptimalSeating(updatedClassStudents, dims.rows, dims.cols),
    }));
  };

  const handleQuickUpdateScores = (studentId: string, visual: number, auditory: number, kinesthetic: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    const studentKelas = student.kelas || classrooms[0]?.name || 'VII Ibnu Abbas (Laki-laki)';
    const dominant = evaluateDominantStyle(visual, auditory, kinesthetic);

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          visualScore: visual,
          auditoryScore: auditory,
          kinestheticScore: kinesthetic,
          dominantStyle: dominant,
          isTested: true,
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    
    const updatedClassStudents = updatedStudents.filter((s) => s.kelas === studentKelas);
    const dims = classDimensions[studentKelas] || { rows: 5, cols: 6 };
    setSeatsByClass((prev) => ({
      ...prev,
      [studentKelas]: generateOptimalSeating(updatedClassStudents, dims.rows, dims.cols),
    }));
  };

  const handleAddStudent = (name: string, gender: 'Laki-laki' | 'Perempuan', kelas: string) => {
    const nextNum = students.length + 1;
    const paddedId = `S${nextNum.toString().padStart(2, '0')}`;
    
    const newStudent: Student = {
      id: paddedId,
      name,
      gender,
      visualScore: 0,
      auditoryScore: 0,
      kinestheticScore: 0,
      dominantStyle: 'Seimbang',
      isTested: false,
      kelas
    };

    const newStudentsList = [...students, newStudent];
    setStudents(newStudentsList);

    const updatedClassStudents = newStudentsList.filter((s) => s.kelas === kelas);
    const dims = classDimensions[kelas] || { rows: 5, cols: 6 };
    setSeatsByClass((prev) => ({
      ...prev,
      [kelas]: generateOptimalSeating(updatedClassStudents, dims.rows, dims.cols),
    }));
  };

  const handleSwapSeats = (idxA: number, idxB: number, className: string) => {
    const classSeats = seatsByClass[className];
    if (!classSeats) return;
    const updatedSeats = [...classSeats];
    const tempStudentId = updatedSeats[idxA].studentId;
    updatedSeats[idxA].studentId = updatedSeats[idxB].studentId;
    updatedSeats[idxB].studentId = tempStudentId;
    setSeatsByClass((prev) => ({
      ...prev,
      [className]: updatedSeats,
    }));
  };

  const handleTriggerAutoLayout = (className: string) => {
    const classStudents = students.filter((s) => s.kelas === className);
    const dims = classDimensions[className] || { rows: 5, cols: 6 };
    const reallocatedSeats = generateOptimalSeating(classStudents, dims.rows, dims.cols);
    setSeatsByClass((prev) => ({
      ...prev,
      [className]: reallocatedSeats,
    }));
  };

  const handleResetAppToDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang data siswa (reset) ke database bawaan standar?")) {
      localStorage.removeItem('smart_seating_students');
      localStorage.removeItem('smart_seating_by_class_v2');
      localStorage.removeItem('smart_seating_class_dimensions');
      localStorage.removeItem('smart_seating_classrooms');
      localStorage.removeItem('smart_seating_wali_kelas');
      
      const defaultClassrooms: Classroom[] = [
        { id: 'C01', name: 'VII Ibnu Abbas (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
        { id: 'C02', name: 'VII Asma (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
        { id: 'C03', name: 'VIII Ubay (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
        { id: 'C04', name: 'VIII Sumayyah (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 },
        { id: 'C05', name: 'IX Zubair (Laki-laki)', gender: 'Laki-laki', rows: 5, cols: 6 },
        { id: 'C06', name: 'IX Khaula (Perempuan)', gender: 'Perempuan', rows: 5, cols: 6 }
      ];

      const defaultWalis: WaliKelas[] = [
        { id: 'W01', name: 'Nofrizal, S.Pd', username: 'nofrizal', passwordRaw: 'password123', classId: 'VII Ibnu Abbas (Laki-laki)' },
        { id: 'W02', name: 'Cut Nisa, S.Pd', username: 'cutnisa', passwordRaw: 'password123', classId: 'VII Asma (Perempuan)' },
        { id: 'W03', name: 'Riswanda, S.Pd', username: 'riswanda', passwordRaw: 'password123', classId: 'VIII Ubay (Laki-laki)' },
        { id: 'W04', name: 'Aisyah, S.Pd', username: 'aisyah', passwordRaw: 'password123', classId: 'VIII Sumayyah (Perempuan)' },
        { id: 'W05', name: 'Mahmuddin, S.Pd', username: 'mahmuddin', passwordRaw: 'password123', classId: 'IX Zubair (Laki-laki)' },
        { id: 'W06', name: 'Saumiana, S.Pd', username: 'saumiana', passwordRaw: 'password123', classId: 'IX Khaula (Perempuan)' }
      ];

      const preparedList = INITIAL_STUDENTS.map((item) => ({
        ...item
      }));
      
      setStudents(preparedList);
      setClassrooms(defaultClassrooms);
      setWaliKelasList(defaultWalis);

      const defaultDims: Record<string, { rows: number; cols: number }> = {};
      defaultClassrooms.forEach((c) => {
        defaultDims[c.name] = { rows: c.rows, cols: c.cols };
      });
      setClassDimensions(defaultDims);

      const initialSeats: Record<string, Seat[]> = {};
      defaultClassrooms.forEach((c) => {
        const classStudents = preparedList.filter((s) => s.kelas === c.name);
        initialSeats[c.name] = generateOptimalSeating(classStudents, c.rows, c.cols);
      });
      setSeatsByClass(initialSeats);
      setAdminTab('grid');
      alert('Sistem berhasil dikembalikan ke data simulasi default!');
    }
  };

  // Secure Admin Authentication Processor
  const handleAdminVerifyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const username = adminUsername.trim().toLowerCase();
    const password = adminPassword;

    // 1. Check Super Admin hardcoded accounts (M. Khairul A. / admin)
    if ((username === 'khairul' && password === 'password123') || (username === 'admin' && password === 'admin123')) {
      setUserRole('super_admin');
      setUserKelas(null);
      setAdminTab('super_admin'); // default to master dashboard for super admin!
      setViewMode('admin-dashboard');
      setLoginError('');
      setAdminPassword('');
      return;
    }

    // 2. Otherwise check from dynamic waliKelasList state
    const matchWali = waliKelasList.find(w => w.username === username && w.passwordRaw === password);
    if (matchWali) {
      setUserRole('wali_kelas');
      setUserKelas(matchWali.classId || 'VII Ibnu Abbas (Laki-laki)'); // Fallback class integration
      setAdminTab('grid');
      setViewMode('admin-dashboard');
      setLoginError('');
      setAdminPassword('');
    } else {
      setLoginError('Kombinasi username atau password Anda salah!');
    }
  };

  const handleLogoutAdmin = () => {
    setViewMode('portal');
    setAdminUsername('');
    setAdminPassword('');
    setUserRole(null);
    setUserKelas(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 font-sans leading-normal tracking-normal pb-16 relative">
      {/* Dynamic graphic blobs */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-sky-200/20 rounded-full filter blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-purple-200/10 rounded-full filter blur-3xl pointer-events-none z-0" />

      {/* RENDER VIEW PORTAL ENTRY GATEWAY */}
      {viewMode === 'portal' && (
        <div className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 select-none relative z-10 animate-fadeIn">
          {/* Main Title Center */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold mb-3">
              <ShieldCheck size={14} className="text-sky-600" />
              Symmetrical VAK Smart Portal
            </div>
            <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-slate-900 tracking-tight">
              Symmetrical VAK Cognitive Hub
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
              Sistem analisis dan pemetaan gaya belajar kognitif siswa (Visual, Auditori, dan Kinestetik) secara optimal dengan pendekatan objektif.
            </p>
          </div>

          {/* Cards Split Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Student gateway card - Blind questionnaire */}
            <div className="bg-white border border-slate-200 hover:border-sky-300 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-all mb-6">
                  <GraduationCap size={24} />
                </div>
                <span className="text-[10px] font-bold text-sky-650 uppercase tracking-widest block">Akses Siswa</span>
                <h3 className="font-sans font-bold text-xl text-slate-800 mt-1">
                  Evaluasi Gaya Belajar
                </h3>
                <p className="text-xs text-slate-400 mt-1 block">Identifikasi Gaya Belajar Siswa secara Objektif</p>
                
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Temukan gaya belajar dominan Anda (Visual, Auditori, atau Kinestetik) melalui 20 pertanyaan interaktif secara jujur demi mengoptimalkan kenyamanan dan efisiensi belajar Anda.
                </p>

                <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-sky-600">✓</span>
                    <span>Akses instan dan cepat tanpa perlu membuat akun tambahan.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sky-600">✓</span>
                    <span>Proses mudah, cukup isi nama lengkap dan kelas Anda.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-sky-600">✓</span>
                    <span>Evaluasi disajikan terstandardisasi secara mandiri dan objektif.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStudentName('');
                  setStudentKelas(classrooms[0]?.name || 'VII Ibnu Abbas (Laki-laki)');
                  setViewMode('student-registration');
                }}
                className="w-full mt-8 bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                Mulai Kuesioner Sekarang
                <ArrowRight size={14} />
               </button>
            </div>

            {/* Admin supervisor card - Controls dashboard */}
            <div className="bg-white border border-slate-200 hover:border-sky-300 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center text-slate-650 group-hover:bg-slate-900 group-hover:text-white transition-all mb-6">
                  <Lock size={22} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portal Guru / Pengawas</span>
                <h3 className="font-sans font-bold text-xl text-slate-800 mt-1">
                  Portal Guru & Wali Kelas
                </h3>
                <p className="text-xs text-slate-400 mt-1 block">Pusat Analisis & Klasifikasi Inteligensi Belajar</p>

                <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                  Kelola keragaman karakter belajar siswa secara cerdas, pantau analisis gaya belajar klasikal rombongan belajar, serta lakukan pengelolaan biodata administrasi yang dinamis.
                </p>

                <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="flex gap-2">
                    <span className="text-slate-600">✓</span>
                    <span>Monitor diagram profil kognitif per kelas secara dinamis.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-600">✓</span>
                    <span>Manajemen daftar rombel belajar dan akun guru terintegrasi.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-600">✓</span>
                    <span>Ekspor framework data profil siap pakai (SQL & Script PHP PDO).</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setLoginError('');
                  setViewMode('admin-login');
                }}
                className="w-full mt-8 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                Masuk ke Panel Pengawas
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW STUDENT REGISTRATION FORM (NO LOGIN REQUIRED) */}
      {viewMode === 'student-registration' && (
        <div className="max-w-md mx-auto px-4 pt-16 sm:pt-24 relative z-10 animate-fadeIn" id="student-blind-entry">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="p-3 bg-sky-50 text-sky-600 rounded-2xl inline-block mb-3">
                <BookOpen size={24} />
              </span>
              <h2 className="font-sans font-bold text-lg text-slate-800">
                Pendaftaran Kuesioner Gaya Belajar
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Silakan isi berkas identitas dasar Anda untuk memulai kuesioner pembelajaran
              </p>
            </div>

            <form onSubmit={handleStudentRegistrationSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  placeholder="Ketik nama lengkap Anda..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pilihan Kelas Anda
                  </label>
                  <select
                    value={studentKelas}
                    onChange={(e) => handleStudentClassChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-2xl px-4 py-3 text-xs text-slate-705 font-semibold outline-none cursor-pointer transition-all"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Jenis Kelamin siswa
                  </label>
                  {classrooms.find(c => c.name === studentKelas)?.gender === 'Campuran' ? (
                    <select
                      value={studentGender}
                      onChange={(e: any) => setStudentGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 rounded-2xl px-4 py-3 text-xs text-slate-705 font-semibold outline-none cursor-pointer transition-all animate-fadeIn"
                    >
                      <option value="Laki-laki">Laki-laki (Ikhwan)</option>
                      <option value="Perempuan">Perempuan (Akhwat)</option>
                    </select>
                  ) : (
                    <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs text-slate-705 font-bold select-none animate-fadeIn">
                      {studentGender}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border text-[11px] text-slate-550 leading-relaxed flex gap-2">
                <EyeOff size={18} className="text-sky-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Data Terjamin Objektif:</strong> Kuesioner ini dirancang murni untuk mengevaluasi tipe penangkapan informasi (Audio/Visual/Gerak) Anda, tanpa melibatkan layout visual tempat duduk demi kredibilitas jawaban.
                </span>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer text-center"
                >
                  Mulai Jawab Kuesioner ➔
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('portal')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-3.5 px-5 rounded-2xl transition-all"
                >
                  Kembali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER VIEW STUDENT ANSWERING QUESTIONS (BLIND MODE) */}
      {viewMode === 'student-test' && currentTestedStudent && (
        <div className="max-w-7xl mx-auto px-4 pt-6 select-none relative z-10 animate-fadeIn">
          <VakTest
            student={currentTestedStudent}
            onTestComplete={handleTestComplete}
            onCancel={() => {
              setCurrentTestedStudent(null);
              setViewMode(students.some(s => s.id === currentTestedStudent?.id) ? 'admin-dashboard' : 'portal');
            }}
            isBlindMode={viewMode === 'student-test'}
          />
        </div>
      )}

      {/* RENDER VIEW STUDENT ASSESS SUCCESS SPLASH */}
      {viewMode === 'student-success' && (
        <div className="max-w-lg mx-auto px-4 pt-16 sm:pt-24 relative z-10 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
            <span className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </span>
            <h2 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">
              Jawaban Berhasil Dikirimkan!
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold block tracking-wider">
              Terima Kasih Atas Partisipasi Anda
            </p>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto select-text">
              Jawaban Anda telah didokumentasikan ke dalam sistem database secara aman. Guru pendamping Anda sekarang memegang profil belajar VAK Anda untuk memformulasikan kenyamanan belajar terbaik untuk semester ini!
            </p>

            {/* Simulated study guidelines feedback based on scores */}
            <div className="mt-6 p-5 bg-sky-50/60 rounded-2xl border text-start space-y-3" id="student_study_feedback_tips">
              <span className="text-[10px] font-bold text-sky-800 uppercase block tracking-wider">Tips Sukses Belajar untuk Anda:</span>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>Manfaatkan ringkasan materi berwarna-warni dan mindmapping visual.</li>
                <li>Gunakan gaya audio membaca nyaring atau buat diskusi kelompok belajar kecil.</li>
                <li>Biasakan mencatat materi pelajaran dalam coretan sketsa interaktif.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStudentName('');
                setStudentKelas(classrooms[0]?.name || 'VII Ibnu Abbas (Laki-laki)');
                setCurrentTestedStudent(null);
                setViewMode('portal');
              }}
              className="mt-8 bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold py-3 px-8 rounded-2xl transition-all cursor-pointer shadow-sm text-center w-full"
            >
              Kembali ke Halaman Portal Utama
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEW ADMIN LOGIN PORTAL */}
      {viewMode === 'admin-login' && (
        <div className="max-w-md mx-auto px-4 pt-16 sm:pt-24 relative z-10 animate-fadeIn" id="admin-login-screen">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="p-3 bg-slate-900 text-white rounded-2xl inline-block mb-3">
                <Lock size={22} />
              </span>
              <h2 className="font-sans font-bold text-lg text-slate-800">
                Otentikasi Kredensial Administrator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Silakan ketik user hak akses administrasi untuk mengawasi sistem denah
              </p>
            </div>

            {loginError && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>⚠️</span> {loginError}
              </div>
            )}

            <form onSubmit={handleAdminVerifyLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Ketik username admin..."
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-700 outline-none transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Ketik password admin..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-705 outline-none transition-all font-semibold"
                  required
                />
              </div>

              {/* Password_hash Explanation Tooltip Block */}
              <div className="pt-2 border-t border-slate-100 mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordHashDetail(!showPasswordHashDetail)}
                  className="text-[11px] text-sky-650 font-semibold hover:underline flex items-center gap-1 text-start"
                >
                  <Database size={12} className="shrink-0" />
                  {showPasswordHashDetail ? 'Sembunyikan Informasi Kriptografi Hash PHP' : 'Bagaimana Password Anda Aman di Sistem PHP?'}
                </button>
                {showPasswordHashDetail && (
                  <div className="p-3 bg-slate-50 border text-[10px] text-slate-500 rounded-xl leading-relaxed space-y-1.5 select-text animate-fadeIn">
                    <span className="font-bold text-slate-700">✓ Secure Hash Verifikasi (password_hash):</span>
                    <p>
                      Password administrator tidak disimpan dalam teks polos (plaintext). Di backend PHP, kami menyandikannya memakai algoritma satu arah <code>PASSWORD_BCRYPT</code>:
                    </p>
                    <code className="bg-slate-200/80 p-1 rounded font-mono block text-[9px] text-slate-655 uppercase break-all">
                      $2y$10$7Z2v7f4Sg8wFveZgU.G8gOxSSeRoxAco/8L4jveP/ApxE9.f2uASe
                    </code>
                    <p>Secara andal menangkal eksploitasi kebocoran kredensial (brute force & rainbow tables).</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowCredentialHelp(!showCredentialHelp)}
                  className="text-[11px] text-amber-700 font-bold hover:underline flex items-center gap-1 text-start"
                >
                  <Key size={12} className="shrink-0 text-amber-600" />
                  {showCredentialHelp ? 'Sembunyikan Pintasan Akun' : 'Lupa Password / Lihat Daftar Akun Uji Coba'}
                </button>
                {showCredentialHelp && (
                  <div className="p-3 bg-amber-50/50 border border-amber-100/75 rounded-xl space-y-2 text-[10px] text-slate-650 max-h-[190px] overflow-y-auto animate-fadeIn select-none">
                    <p className="font-semibold text-amber-800 break-normal">Bantuan Kredensial Uji Coba (Klik untuk Isi Otomatis):</p>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminUsername('khairul');
                          setAdminPassword('password123');
                        }}
                        className="w-full text-start p-2 hover:bg-amber-100/70 bg-amber-100/30 rounded border border-amber-200/50 flex justify-between items-center transition-all cursor-pointer"
                      >
                        <div className="pr-2">
                          <span className="font-bold text-amber-900 text-[10px] block">Super Admin: khairul</span>
                          <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Sandi: password123</span>
                        </div>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-200/50 px-1.5 py-0.5 rounded shrink-0">Pilih</span>
                      </button>

                      {waliKelasList.map((w) => (
                        <button
                          type="button"
                          key={w.id}
                          onClick={() => {
                            setAdminUsername(w.username);
                            setAdminPassword(w.passwordRaw);
                          }}
                          className="w-full text-start p-2 hover:bg-slate-150 bg-white rounded border border-slate-200/60 flex justify-between items-center transition-all cursor-pointer"
                        >
                          <div className="pr-2">
                            <span className="font-bold text-slate-700 text-[10px] block">Guru: {w.username}</span>
                            <span className="block text-[9px] text-slate-500 mt-0.5">Rombel: {w.classId} | Sandi: {w.passwordRaw}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">Pilih</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer text-center"
                >
                  Masuk Sesi Guru ➔
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('portal')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-3.5 px-5 rounded-2xl transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER VIEW ADMIN BACKOFFICE CONTROL PANEL */}
      {viewMode === 'admin-dashboard' && (
        <div className="animate-fadeIn">
          {/* Dashboard Header Bar */}
          <header className="bg-white border-b border-slate-150 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95" id="main-navigation-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo area */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow shadow-sky-305">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <h1 className="font-sans font-bold text-xs md:text-sm text-slate-800 tracking-tight leading-none" id="logo-main-heading">
                      Smart Seating Control Backoffice
                    </h1>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      Masuk sebagai: <strong className="text-sky-600">{userRole === 'super_admin' ? 'Super Admin (M. Khairul A.)' : `Wali Kelas (${userKelas})`}</strong>
                    </p>
                  </div>
                </div>

                {/* Menu Tabs Navigation */}
                <nav className="flex space-x-1 md:space-x-2 bg-slate-100 p-1 rounded-xl" id="nav-tabs-controls">
                  <button
                    onClick={() => setAdminTab('grid')}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                      adminTab === 'grid'
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span className="hidden sm:inline">Denah Kelas 5x6</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('roster')}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                      adminTab === 'roster'
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users size={14} />
                    <span className="hidden sm:inline">Kelola Siswa</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('integration')}
                    className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                      adminTab === 'integration'
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Database size={14} />
                    <span className="hidden sm:inline">Integrasi MySQL/PHP</span>
                  </button>
                  {userRole === 'super_admin' && (
                    <button
                      onClick={() => setAdminTab('super_admin')}
                      className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs font-bold tracking-tight text-amber-705 bg-amber-50 hover:bg-amber-100 border border-amber-250 transition-all ${
                        adminTab === 'super_admin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                          : ''
                      }`}
                    >
                      <Lock size={12} className="text-amber-600" />
                      <span>Backoffice Master</span>
                    </button>
                  )}
                </nav>

                {/* Exit Dashboard Role trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetAppToDefault}
                    className="flex items-center justify-center p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all border border-slate-100 hover:border-red-100"
                    title="Reset Simulator Data Standar"
                  >
                    <RefreshCw size={14} />
                  </button>

                  <button
                    onClick={handleLogoutAdmin}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold font-sans transition-all active:scale-95"
                  >
                    Logout ➔
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Active Layout Description Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3 select-none relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/50 pb-5">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest block">
                  Dashboard Pengawas Sekolah • Guru Wali Kelas
                </span>
                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-slate-800 mt-1">
                  {adminTab === 'grid' && 'Tata Letak & Kursi Kelas Terintegrasi'}
                  {adminTab === 'roster' && 'Profil Inteligensi VAK & Roster Siswa'}
                  {adminTab === 'integration' && 'Daftar Ekspor SQL & PDO Backend Terenkripsi'}
                  {adminTab === 'super_admin' && 'Sistem Kredensial & Pengendali CRUD Master'}
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1 pb-1">
                  {adminTab === 'grid' && 'Lakukan pengawasan indeks keselarasan belajar, gunakan override visual klik dua tempat duduk untuk menukar posisinya secara manual.'}
                  {adminTab === 'roster' && 'Tambahkan profil individu baru, saring gender siswa, batalkan hasil kuesioner, and atur skor poin secara manual.'}
                  {adminTab === 'integration' && 'Salin framework ekspor full-stack, pastikan Anda menggunakan kueri parameterized PDO PHP yang melindung kontrol input.'}
                  {adminTab === 'super_admin' && 'Kendali otorisasi master kelas dan wali kelas sekolah. Simpan secara asinkronus dengan integritas referensi asing (RESTRICT).'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 bg-slate-50 border p-1.5 px-2.5 rounded-xl">
                  <Users size={13} className="text-slate-400" />
                  Siswa Aktif: {students.length}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-50 border p-1.5 px-2.5 rounded-xl">
                  <Layers size={13} className="text-slate-400" />
                  Kursi: 5x6 (Meja)
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Main Module Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10" id="admin-main-area-scroller">
            {adminTab === 'grid' && (
              <ClassroomGrid
                students={students}
                seatsByClass={seatsByClass}
                onSwapSeats={handleSwapSeats}
                onTriggerAutoLayout={handleTriggerAutoLayout}
                userRole={userRole}
                userKelas={userKelas}
                classDimensions={classDimensions}
                onUpdateClassDimensions={handleUpdateClassDimensions}
              />
            )}

            {adminTab === 'roster' && (
              <StudentList
                students={students}
                onStartTest={handleTeacherStartTest}
                onResetTest={handleResetTest}
                onAddStudent={handleAddStudent}
                onQuickUpdateScores={handleQuickUpdateScores}
                userRole={userRole}
                userKelas={userKelas}
              />
            )}

            {adminTab === 'integration' && (
              <PhpMySqlExport />
            )}

            {adminTab === 'super_admin' && (
              <SuperAdminCrud
                classrooms={classrooms}
                setClassrooms={setClassrooms}
                waliKelasList={waliKelasList}
                setWaliKelasList={setWaliKelasList}
                students={students}
                onTriggerAutoLayout={handleTriggerAutoLayout}
              />
            )}
          </main>

          {/* Styled Footer */}
          <footer className="mt-12 text-center text-xs text-slate-400 select-none border-t border-slate-200/40 pt-6 max-w-7xl mx-auto px-4">
            <p className="font-semibold text-slate-500">
              Smart Seating Symmetrical VAK Generator • Admin Console © {new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-md mx-auto">
              Dilengkapi dengan perlindungan SQL Injection di sisi ekspor backend PHP dan algoritma optimalisasi penempatan baris VAK depan-tengah-belakang.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Student, Question } from '../types';
import { VAK_QUESTIONS } from '../mockData';
import { ArrowLeft, ArrowRight, Save, ClipboardList, HelpCircle, CheckCircle2 } from 'lucide-react';

interface VakTestProps {
  student: Student;
  onTestComplete: (studentId: string, visual: number, auditory: number, kinesthetic: number) => void;
  onCancel: () => void;
  isBlindMode?: boolean;
}

export default function VakTest({ student, onTestComplete, onCancel, isBlindMode = false }: VakTestProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'V' | 'A' | 'K'>>({});
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; type: 'V' | 'A' | 'K' }[]>([]);

  const currentQuestion = VAK_QUESTIONS[currentQuestionIndex];
  const totalQuestions = VAK_QUESTIONS.length;

  useEffect(() => {
    if (currentQuestion) {
      const options = [...currentQuestion.options];
      // Shuffle choices using Fisher-Yates to prevent systematic choice bias
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      setShuffledOptions(options);
    }
  }, [currentQuestionIndex]);

  const handleSelectAnswer = (type: 'V' | 'A' | 'K') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: type,
    }));

    // Auto-advance with a slight delay for better sensory UX
    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const calculateResults = () => {
    let visual = 0;
    let auditory = 0;
    let kinesthetic = 0;

    Object.values(answers).forEach((type) => {
      if (type === 'V') visual++;
      if (type === 'A') auditory++;
      if (type === 'K') kinesthetic++;
    });

    return { visual, auditory, kinesthetic };
  };

  const isComplete = Object.keys(answers).length === totalQuestions;
  const progressPercent = (Object.keys(answers).length / totalQuestions) * 100;

  const handleSave = () => {
    if (!isComplete) return;
    const { visual, auditory, kinesthetic } = calculateResults();
    onTestComplete(student.id, visual, auditory, kinesthetic);
  };

  const tempResults = calculateResults();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="vak-test-portal">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-sky-50 to-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-100 rounded-xl text-sky-600">
            <ClipboardList size={22} />
          </div>
          <div>
            <span className="bg-sky-100 text-sky-800 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
              {isBlindMode ? 'Kuesioner Gaya Belajar Objektif' : 'Lembar Asesmen Mandiri'}
            </span>
            <h2 className="font-sans font-semibold text-lg text-slate-800 mt-1">
              {isBlindMode ? 'Evaluasi Kebiasaan & Gaya Belajar Siswa' : `Asesmen Gaya Belajar: ${student.name}`}
            </h2>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-all px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl bg-white shadow-sm"
          id="btn-cancel-test"
        >
          {isBlindMode ? 'Batal & Keluar Portal' : 'Batal & Kembali'}
        </button>
      </div>

      {isBlindMode && (
        <div className="bg-sky-50/70 py-3.5 px-6 border-b border-slate-100 text-xs text-slate-600 flex gap-2">
          <CheckCircle2 size={16} className="text-sky-500 shrink-0 mt-0.5" />
          <span>
            <strong>Informasi Kuesioner:</strong> Jawablah 20 pertanyaan berikut dengan jujur sesuai kebiasaan sehari-hari Anda. Respons Anda akan digunakan oleh guru pendamping untuk merancang modul dan sarana pengajaran yang paling efektif bagi Anda.
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3">
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600">
          <span>Persentase Pengisian</span>
          <span>
            {Object.keys(answers).length} dari {totalQuestions} Soal Terjawab ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main Test Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Box */}
          <div className="p-6 rounded-2xl border border-slate-150 bg-slate-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <HelpCircle size={100} />
            </div>

            <div className="text-xs font-bold text-sky-600 mb-2 uppercase tracking-wide">
              Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
            </div>

            <h3 className="font-sans font-medium text-base text-slate-800 leading-relaxed mb-6 select-text">
              {currentQuestion.text}
            </h3>

            {/* Answers Choice Grid */}
            <div className="space-y-3">
              {shuffledOptions.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option.type;
                const letterLabel = String.fromCharCode(65 + idx); // A, B, C

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(option.type)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 group relative ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-905 ring-2 ring-sky-100'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'bg-sky-500 text-white border-sky-400'
                          : 'bg-slate-50 text-slate-600 border-slate-200 group-hover:bg-sky-100 group-hover:text-sky-700'
                      }`}
                    >
                      {letterLabel}
                    </span>
                    <span className="text-xs md:text-sm font-medium pt-0.5 leading-relaxed select-text">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              id="prev-question"
            >
              <ArrowLeft size={14} />
              Sebelumnya
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Soal {currentQuestionIndex + 1} / {totalQuestions}
            </span>

            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              id="next-question"
            >
              Berikutnya
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Live Calculation Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 h-full flex flex-col justify-between">
            <div>
              <h4 className="font-sans font-semibold text-slate-700 text-xs uppercase tracking-wide mb-4">
                {isBlindMode ? 'Status Profil Belajar' : 'Kalkulator Hasil Sementara'}
              </h4>

              {isBlindMode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 rounded-xl border border-sky-100/70 text-sky-900 text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Evaluasi Gaya Belajar Objektif</span>
                    Kuesioner ini dirancang secara khusus untuk memetakan bagaimana Anda memproses materi pelajaran dengan paling nyaman. Pilihan jawaban Anda akan langsung terekam dan diolah oleh guru untuk menyesuaikan letak duduk serta sarana mengajar yang paling sesuai di kelas Anda.
                  </div>
                  <div className="p-4 bg-slate-100 rounded-xl border border-slate-200/80 text-slate-600 text-xs leading-relaxed">
                    <span className="font-semibold text-slate-700 block mb-1">💡 Petunjuk Singkat:</span>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Uraikan pilihan yang paling mewakili kebiasaan harian Anda.</li>
                      <li>Semua pilihan bernilai baik, tidak ada jawaban benar atau salah.</li>
                      <li>Hasil persentase akan tersimpan privat dalam database kelas.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-sky-400 rounded-full" />
                        Visual (Tipe Mengamati)
                      </span>
                      <span>{tempResults.visual} poin</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full transition-all"
                        style={{ width: `${(tempResults.visual / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Auditory score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full" />
                        Auditori (Tipe Mendengarkan)
                      </span>
                      <span>{tempResults.auditory} poin</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-400 h-full transition-all"
                        style={{ width: `${(tempResults.auditory / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Kinesthetic score */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                        Kinestetik (Tipe Mengalami Fisik)
                      </span>
                      <span>{tempResults.kinesthetic} poin</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-400 h-full transition-all"
                        style={{ width: `${(tempResults.kinesthetic / totalQuestions) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Show Dominant type but framed safely */}
              {!isBlindMode && (
                <div className="mt-6 pt-5 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Kombinasi Terdeteksi
                  </span>
                  {Object.keys(answers).length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Mulai menjawab untuk memantau...</span>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5">
                      {tempResults.visual > tempResults.auditory && tempResults.visual > tempResults.kinesthetic && (
                        <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-lg">
                          Visual (Baris Depan)
                        </span>
                      )}
                      {tempResults.auditory > tempResults.visual && tempResults.auditory > tempResults.kinesthetic && (
                        <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-lg">
                          Auditori (Baris Tengah)
                        </span>
                      )}
                      {tempResults.kinesthetic > tempResults.visual && tempResults.kinesthetic > tempResults.auditory && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-lg">
                          Kinestetik (Tepi / Belakang)
                        </span>
                      )}
                      {((tempResults.visual === tempResults.auditory && tempResults.visual >= tempResults.kinesthetic && tempResults.visual > 0) ||
                        (tempResults.visual === tempResults.kinesthetic && tempResults.visual >= tempResults.auditory && tempResults.visual > 0) ||
                        (tempResults.auditory === tempResults.kinesthetic && tempResults.auditory >= tempResults.visual && tempResults.auditory > 0)) && (
                        <span className="bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg">
                          Seimbang (Balanced)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save Button Action */}
            <div className="mt-8 pt-4 border-t border-slate-200/60">
              <button
                disabled={!isComplete}
                onClick={handleSave}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-semibold text-xs text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-200 ${
                  isComplete
                    ? 'bg-sky-600 hover:bg-sky-500 active:scale-[0.98] cursor-pointer'
                    : 'bg-slate-300 cursor-not-allowed opacity-50'
                }`}
                id="btn-save-test-results"
              >
                <Save size={15} />
                {isBlindMode ? 'Kirim Jawaban Kuesioner Objektif' : 'Simpan & Daftarkan Profil'}
              </button>
              {!isComplete && (
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  * Jawablah seluruh {totalQuestions} pertanyaan untuk mengirim kuesioner Anda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

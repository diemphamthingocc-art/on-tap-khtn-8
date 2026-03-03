import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Brain, 
  Dna, 
  Thermometer, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw,
  Loader2,
  Info
} from 'lucide-react';
import { mcqQuestions, tfQuestions, shortQuestions } from './constants';
import { gradeShortAnswers } from './services/aiService';

type Screen = 'start' | 'quiz' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [violationCount, setViolationCount] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // User Answers
  const [userMCQ, setUserMCQ] = useState<(number | null)[]>(new Array(mcqQuestions.length).fill(null));
  const [userTF, setUserTF] = useState<(boolean | null)[][]>(tfQuestions.map(q => new Array(q.i.length).fill(null)));
  const [userShort, setUserShort] = useState<string[]>(new Array(shortQuestions.length).fill(''));

  // Results
  const [results, setResults] = useState<{
    total: number;
    s1: number;
    s2: number;
    s3: number;
    feedback: string;
  } | null>(null);

  const triggerViolation = useCallback(() => {
    if (screen !== 'quiz' || isReviewing) return;
    setViolationCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        handleSubmit(true);
      } else {
        setShowCheatModal(true);
      }
      return next;
    });
  }, [screen, isReviewing]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') triggerViolation();
    };
    const handleBlur = () => triggerViolation();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [triggerViolation]);

  const handleSubmit = async (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowCheatModal(false);

    let s1 = 0;
    mcqQuestions.forEach((q, i) => {
      if (userMCQ[i] === q.c) s1 += (4 / mcqQuestions.length);
    });

    let s2 = 0;
    const totalTFItems = tfQuestions.reduce((acc, q) => acc + q.i.length, 0);
    tfQuestions.forEach((q, i) => {
      q.i.forEach((_, j) => {
        if (userTF[i][j] === q.a[j]) s2 += (4 / totalTFItems);
      });
    });

    try {
      const aiPayload = shortQuestions.map((q, i) => ({ q: q.q, a: userShort[i] }));
      const aiResult = await gradeShortAnswers(process.env.GEMINI_API_KEY || '', aiPayload);
      
      let total = s1 + s2 + aiResult.score;
      if (auto && violationCount >= 3) total *= 0.5;

      setResults({
        total: Number(total.toFixed(1)),
        s1: Number(s1.toFixed(2)),
        s2: Number(s2.toFixed(2)),
        s3: Number(aiResult.score.toFixed(2)),
        feedback: aiResult.feedback
      });
      setScreen('result');
    } catch (e) {
      setResults({
        total: Number((s1 + s2).toFixed(1)),
        s1: Number(s1.toFixed(2)),
        s2: Number(s2.toFixed(2)),
        s3: 0,
        feedback: "Lỗi kết nối AI chấm điểm."
      });
      setScreen('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setScreen('start');
    setViolationCount(0);
    setUserMCQ(new Array(mcqQuestions.length).fill(null));
    setUserTF(tfQuestions.map(q => new Array(q.i.length).fill(null)));
    setUserShort(new Array(shortQuestions.length).fill(''));
    setResults(null);
    setIsReviewing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Cheat Modal */}
      <AnimatePresence>
        {showCheatModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] max-w-sm w-full p-8 text-center border-t-8 border-red-500 shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 uppercase">Cảnh báo vi phạm!</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Bạn không được phép rời khỏi trang thi. Vi phạm quá 3 lần bài làm sẽ tự động nộp.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 mb-6">
                Lần vi phạm: <span className="text-red-600 ml-2 text-lg">{violationCount}</span>/3
              </div>
              <button 
                onClick={() => setShowCheatModal(false)}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition shadow-lg"
              >
                TÔI ĐÃ HIỂU
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {screen === 'start' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[3rem] shadow-xl text-center border border-slate-100"
          >
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Brain className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">KHTN 8: SINH HỌC NGƯỜI</h1>
            <p className="text-slate-400 text-sm mb-8 font-medium">Hệ Nội Tiết - Da & Điều Hòa Thân Nhiệt - Sinh Sản</p>
            
            <div className="grid grid-cols-1 gap-3 mb-10 text-left">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-4 font-bold">1</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700">Trắc nghiệm lý thuyết</h4>
                  <p className="text-[10px] text-slate-500">Cấu tạo, chức năng các hệ cơ quan</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-4 font-bold">2</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700">Đúng / Sai Phân tích</h4>
                  <p className="text-[10px] text-slate-500">Bệnh lý và biện pháp phòng tránh</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white mr-4 font-bold">3</div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-700">Vận dụng thực tiễn</h4>
                  <p className="text-[10px] text-slate-500">Chăm sóc sức khỏe & Giải thích hiện tượng</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setScreen('quiz')}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition transform active:scale-95 shadow-xl shadow-blue-200 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              Bắt đầu ôn tập ngay <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {(screen === 'quiz' || (screen === 'result' && isReviewing)) && (
          <div className="space-y-12">
            {/* Section 1: MCQ */}
            <section>
              <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 font-black uppercase text-xs text-slate-500 tracking-widest mb-6 rounded-xl">
                Phần I: Câu hỏi Trắc nghiệm
              </div>
              <div className="space-y-6">
                {mcqQuestions.map((q, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
                    <p className="font-bold text-slate-800 mb-5 text-sm leading-relaxed">
                      {i + 1}. {q.q}
                    </p>
                    <div className="space-y-2">
                      {q.a.map((opt, j) => {
                        const isCorrect = q.c === j;
                        const isSelected = userMCQ[i] === j;
                        const showResult = screen === 'result';
                        
                        let statusClass = "border-slate-100 bg-slate-50";
                        if (showResult) {
                          if (isCorrect) statusClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                          else if (isSelected) statusClass = "border-red-500 bg-red-50 text-red-900";
                        } else if (isSelected) {
                          statusClass = "border-blue-500 bg-blue-50 text-blue-900";
                        }

                        return (
                          <label key={j} className="block cursor-pointer group">
                            <input 
                              type="radio" 
                              name={`mcq-${i}`} 
                              className="hidden" 
                              disabled={screen === 'result'}
                              checked={isSelected}
                              onChange={() => {
                                const next = [...userMCQ];
                                next[i] = j;
                                setUserMCQ(next);
                              }}
                            />
                            <div className={`flex items-center p-4 rounded-2xl border-2 transition-all duration-200 ${statusClass}`}>
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mr-4 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                {String.fromCharCode(65 + j)}
                              </span>
                              <span className="flex-1 text-sm font-medium">{opt}</span>
                              {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-2" />}
                              {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-2" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: True/False */}
            <section>
              <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 font-black uppercase text-xs text-slate-500 tracking-widest mb-6 rounded-xl">
                Phần II: Câu hỏi Đúng / Sai
              </div>
              <div className="space-y-6">
                {tfQuestions.map((q, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-800 mb-5 text-sm leading-relaxed">
                      {i + mcqQuestions.length + 1}. {q.q}
                    </p>
                    <div className="space-y-4">
                      {q.i.map((sub, j) => {
                        const showResult = screen === 'result';
                        const isCorrect = userTF[i][j] === q.a[j];
                        const userVal = userTF[i][j];

                        return (
                          <div key={j} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-xs font-semibold text-slate-700 block mb-3 leading-relaxed">{sub}</span>
                            <div className="flex gap-3">
                              {[true, false].map((val) => {
                                const isSelected = userTF[i][j] === val;
                                const isActualCorrect = q.a[j] === val;
                                
                                let btnClass = "bg-white text-slate-600 border-slate-200";
                                if (showResult) {
                                  if (isActualCorrect) btnClass = "bg-emerald-600 text-white border-emerald-600";
                                  else if (isSelected) btnClass = "bg-red-600 text-white border-red-600";
                                } else if (isSelected) {
                                  btnClass = val ? "bg-blue-600 text-white border-blue-600" : "bg-red-600 text-white border-red-600";
                                }

                                return (
                                  <button
                                    key={val.toString()}
                                    disabled={screen === 'result'}
                                    onClick={() => {
                                      const next = [...userTF];
                                      next[i] = [...next[i]];
                                      next[i][j] = val;
                                      setUserTF(next);
                                    }}
                                    className={`flex-1 py-3 rounded-xl border font-black tracking-widest uppercase text-[10px] transition-all duration-200 ${btnClass}`}
                                  >
                                    {val ? 'Đúng' : 'Sai'}
                                  </button>
                                );
                              })}
                            </div>
                            {showResult && (
                              <div className={`mt-2 text-[10px] font-bold uppercase flex items-center gap-1 ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {isCorrect ? 'Chính xác' : `Sai (Đáp án: ${q.a[j] ? 'Đúng' : 'Sai'})`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Short Answer */}
            <section>
              <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 font-black uppercase text-xs text-slate-500 tracking-widest mb-6 rounded-xl">
                Phần III: Vận dụng (AI Chấm điểm)
              </div>
              <div className="space-y-6 mb-32">
                {shortQuestions.map((q, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border-l-8 border-emerald-500">
                    <p className="font-bold text-slate-800 mb-4 text-sm">
                      {i + mcqQuestions.length + tfQuestions.length + 1}. {q.q}
                    </p>
                    <textarea 
                      value={userShort[i]}
                      disabled={screen === 'result'}
                      onChange={(e) => {
                        const next = [...userShort];
                        next[i] = e.target.value;
                        setUserShort(next);
                      }}
                      className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-100 h-32 outline-none resize-none transition-all"
                      placeholder="Viết câu trả lời chi tiết của em tại đây..."
                    />
                    {screen === 'result' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-2xl text-[11px] border border-blue-100 leading-relaxed italic"
                      >
                        <strong className="block not-italic text-blue-800 mb-2 uppercase tracking-tighter flex items-center gap-1">
                          <Info className="w-3 h-3" /> Đáp án tham khảo:
                        </strong> 
                        {q.ref}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {screen === 'quiz' && (
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 flex justify-center">
                <button 
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="max-w-md w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center uppercase text-xs tracking-widest disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Đang chấm điểm bằng AI...
                    </>
                  ) : (
                    'Gửi bài & Xem kết quả'
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {screen === 'result' && !isReviewing && results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100"
          >
            <div className="mb-8">
              <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mx-auto mb-6 transition-colors ${
                results.total >= 8 ? 'border-emerald-500' : results.total >= 5 ? 'border-blue-500' : 'border-red-500'
              }`}>
                <span className="text-4xl font-black text-slate-900">{results.total}</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Hoàn thành bài ôn tập</h2>
            </div>
            
            <div className="text-left space-y-4 mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2"><Dna className="w-4 h-4" /> Trắc nghiệm lý thuyết</span>
                <span className="font-black text-slate-800">{results.s1}/4.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Đúng/Sai Phân tích</span>
                <span className="font-black text-slate-800">{results.s2}/4.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm flex items-center gap-2"><Brain className="w-4 h-4" /> Tự luận vận dụng</span>
                <span className="font-black text-slate-800">{results.s3}/2.0</span>
              </div>
              <div className="pt-4 border-t mt-2 flex justify-between items-center">
                <span className="text-red-500 text-sm flex items-center gap-2 font-bold"><AlertTriangle className="w-4 h-4" /> Vi phạm chuyển Tab</span>
                <span className="font-black text-red-600">{violationCount} lần</span>
              </div>
            </div>

            <div className="p-6 bg-blue-50 text-blue-900 rounded-3xl text-sm italic text-left leading-relaxed mb-10 border border-blue-100 relative">
              <span className="absolute -top-3 left-6 px-3 bg-blue-600 text-white text-[10px] font-black rounded-full py-1 uppercase">AI Nhận xét</span>
              {results.feedback}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setIsReviewing(true)}
                className="bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-lg hover:bg-blue-700 transition uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <Info className="w-4 h-4" /> Xem lại chi tiết
              </button>
              <button 
                onClick={resetQuiz}
                className="bg-slate-100 text-slate-800 font-bold py-5 rounded-2xl hover:bg-slate-200 transition uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại bài mới
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'result' && isReviewing && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 flex justify-center">
            <button 
              onClick={() => setIsReviewing(false)}
              className="max-w-md w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl hover:bg-black transition-all flex items-center justify-center uppercase text-xs tracking-widest"
            >
              Quay lại bảng điểm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

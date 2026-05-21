import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Mic, 
  BookMarked, 
  Sun, 
  Moon, 
  Award, 
  Volume2,
  Brain,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

import { LESSONS } from './data';
import { Sentence, SelfCheck, TabType, ThemeMode } from './types';
import { ShadowingPlayer } from './components/ShadowingPlayer';
import { AudioRecorder } from './components/AudioRecorder';
import { PhraseBank } from './components/PhraseBank';
import { YouTubeWidget } from './components/YouTubeWidget';

export default function App() {
  // Global States
  const [currentTab, setCurrentTab] = useState<TabType>('shadowing');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [activeSentenceId, setActiveSentenceId] = useState<number>(101);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  // In-memory audio recordings (retains audio chunks/Blobs state while page is open)
  const [recordedBlobs, setRecordedBlobs] = useState<Record<number, Blob | null>>({});

  // LocalStorage Persisted States
  const [selfCheckStates, setSelfCheckStates] = useState<Record<number, SelfCheck>>({});
  const [learnedPhrases, setLearnedPhrases] = useState<Record<number, boolean>>({});
  const [customYouTubeVideos, setCustomYouTubeVideos] = useState<Record<number, string>>({});

  // Countdown auto-record trigger
  const [autoStartSentenceId, setAutoStartSentenceId] = useState<number | null>(null);

  // Load Saved Progress on Mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('shadowing_theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else {
      setThemeMode('dark');
    }

    // Self checks
    const savedSelfChecks = localStorage.getItem('shadowing_self_checks');
    if (savedSelfChecks) {
      try {
        setSelfCheckStates(JSON.parse(savedSelfChecks));
      } catch (e) {
        console.error('Failed to parse saved self checks', e);
      }
    }

    // Learned Phrases
    const savedPhrases = localStorage.getItem('shadowing_learned_phrases');
    if (savedPhrases) {
      try {
        setLearnedPhrases(JSON.parse(savedPhrases));
      } catch (e) {
        console.error('Failed to parse saved learned phrases', e);
      }
    }

    // Custom YouTube videos
    const savedVideos = localStorage.getItem('shadowing_youtube_videos');
    if (savedVideos) {
      try {
        setCustomYouTubeVideos(JSON.parse(savedVideos));
      } catch (e) {
        console.error('Failed to parse saved videos', e);
      }
    }
  }, []);

  // Theme Sync effect on body styling
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0a0a0b'; // Clean Minimalism dark theme base
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc'; // Clean Minimalism light theme base
    }
    localStorage.setItem('shadowing_theme', themeMode);
  }, [themeMode]);

  // Self check state handler
  const handleUpdateSelfCheck = (sentenceId: number, check: SelfCheck) => {
    setSelfCheckStates(prev => {
      const updated = { ...prev, [sentenceId]: check };
      localStorage.setItem('shadowing_self_checks', JSON.stringify(updated));
      return updated;
    });
  };

  // Switch learned phrases
  const handleTogglePhrase = (id: number) => {
    setLearnedPhrases(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('shadowing_learned_phrases', JSON.stringify(updated));
      return updated;
    });
  };

  // Video ID changes
  const handleVideoIdChange = (lessonId: number, videoId: string) => {
    setCustomYouTubeVideos(prev => {
      const updated = { ...prev, [lessonId]: videoId };
      localStorage.setItem('shadowing_youtube_videos', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveAudioBlob = (sentenceId: number, blob: Blob) => {
    setRecordedBlobs(prev => ({
      ...prev,
      [sentenceId]: blob
    }));
  };

  // Shadowing finished playing an utterance: trigger 3s pause then auto start record
  const handleTriggerAutoRecord = (sentenceId: number) => {
    setActiveSentenceId(sentenceId);
    setAutoStartSentenceId(sentenceId);
    // Transition to the Recording tab so they see the big count and waveform comparison!
    setCurrentTab('record');
  };

  // Get active lesson
  const activeLesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[0];
  const activeSentence = activeLesson.sentences.find(s => s.id === activeSentenceId) || activeLesson.sentences[0];
  const activeVideoId = customYouTubeVideos[currentLessonId] || activeLesson.youtubeVideoId || 'k7PNo_bC1gQ';

  // Calculate self check stats
  const totalSentences = LESSONS.reduce((sum, lesson) => sum + lesson.sentences.length, 0);
  const learnedSentencesCount = LESSONS.reduce((sum, lesson) => {
    return sum + lesson.sentences.filter(s => {
      const checks = selfCheckStates[s.id] || { pronunciation: false, rhythm: false, speed: false, confidence: false };
      return Object.values(checks).filter(Boolean).length === 4;
    }).length;
  }, 0);

  const learnedPhrasesCount = Object.values(learnedPhrases).filter(Boolean).length;
  
  const overallProgressPct = totalSentences > 0 
    ? Math.round(((learnedSentencesCount * 4 + learnedPhrasesCount) / (totalSentences * 4 + 30)) * 100)
    : 0;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      themeMode === 'dark' 
        ? 'bg-[#0a0a0b] text-slate-250 dark' 
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 dark:border-white/5 bg-[#121214] text-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          {/* Logo Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center text-black font-extrabold text-sm shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              EP
            </div>
            <div>
              <h1 className="text-md sm:text-base font-semibold leading-none text-white tracking-tight">EchoPractice</h1>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest hidden sm:block">Acoustic Mimicry & Shadowing Coach</p>
            </div>
          </div>

          {/* Quick Metrics & Theme controls */}
          <div className="flex items-center gap-6">
            {/* Overall progress indicator bar */}
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Overall Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-36 h-1.5 bg-slate-800 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500"
                    style={{ width: `${overallProgressPct}%` }}
                  ></div>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400">{overallProgressPct}%</span>
              </div>
            </div>

            {/* Light / Dark Mode Buttons */}
            <button
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              id="theme-toggler-btn"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95 text-slate-200"
            >
              {themeMode === 'dark' ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Primary Container Layout */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28">
        
        {/* Desktop grid layout incorporating persistent YouTube Assistant */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Content Workspace Column */}
          <div className="lg:col-span-8 space-y-6">
            
            <AnimatePresence mode="wait">
              {currentTab === 'shadowing' && (
                <motion.div
                  key="shadowing-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShadowingPlayer
                    currentLessonId={currentLessonId}
                    onSelectLesson={setCurrentLessonId}
                    activeSentenceId={activeSentenceId}
                    onSelectSentence={setActiveSentenceId}
                    speed={speechSpeed}
                    onSpeedChange={setSpeechSpeed}
                    selfCheckStates={selfCheckStates}
                    recordedBlobs={recordedBlobs}
                    onTriggerAutoRecord={handleTriggerAutoRecord}
                  />
                </motion.div>
              )}

              {currentTab === 'record' && (
                <motion.div
                  key="record-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-5 shadow-sm">
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Interactive Recording Console</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Lesson {currentLessonId} • Dialogue Line {activeLesson.sentences.findIndex(s => s.id === activeSentenceId) + 1} of 5
                      </p>
                    </div>
                    
                    {/* Quick switch inside record tab */}
                    <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/60 dark:border-white/10 self-start sm:self-auto">
                      {activeLesson.sentences.map((sent, index) => {
                        const isCurrent = sent.id === activeSentenceId;
                        return (
                          <button
                            key={sent.id}
                            id={`record-select-sentence-pill-${sent.id}`}
                            onClick={() => {
                              setActiveSentenceId(sent.id);
                              setAutoStartSentenceId(null); // Cancel existing timing countdowns
                            }}
                            className={`h-7.5 w-7.5 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                              isCurrent
                                ? 'bg-[#10B981] text-black font-extrabold'
                                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5'
                            }`}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big Custom Audio Recorder comparison Module */}
                  <AudioRecorder
                    sentence={activeSentence}
                    speed={speechSpeed}
                    selfCheck={selfCheckStates[activeSentenceId] || {
                      pronunciation: false,
                      rhythm: false,
                      speed: false,
                      confidence: false
                    }}
                    onUpdateSelfCheck={handleUpdateSelfCheck}
                    recordedBlob={recordedBlobs[activeSentenceId] || null}
                    onSaveBlob={handleSaveAudioBlob}
                    // Auto recording trigger passed down from dialogue completions
                    autoStartCountdown={autoStartSentenceId === activeSentenceId}
                    onCountdownComplete={() => setAutoStartSentenceId(null)}
                  />

                  {/* Suggest back to shadowing lesson */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-4.5 shadow-sm">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Finished self-checking this line? Go back to practice other dialogue options!
                    </div>
                    <button
                      onClick={() => setCurrentTab('shadowing')}
                      id="back-to-lesson-btn"
                      className="rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 transition duration-200 border border-slate-250/20 dark:border-white/5 cursor-pointer"
                    >
                      Dialogue Dialogue Index <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentTab === 'phrases' && (
                <motion.div
                  key="phrases-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  <PhraseBank
                    learnedPhrases={learnedPhrases}
                    onTogglePhrase={handleTogglePhrase}
                  />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* YouTube Widget Sidebar (Persistent on Desktop, stacks below on mobile) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-20 space-y-6">
              
              <YouTubeWidget
                videoId={activeVideoId}
                defaultTimestamp={activeLesson.youtubeTimestamp}
                onVideoIdChange={(vid) => handleVideoIdChange(currentLessonId, vid)}
              />

              {/* Extra instructions widget */}
              <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-5.5 space-y-3.5 shadow-sm">
                <h4 className="font-semibold text-sm flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Info className="h-4 w-4 text-[#10B981]" /> Practicing Method
                </h4>
                <ol className="list-decimal pl-4.5 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <li>
                    Select the <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">Shadowing</strong> tab, pick a lesson, and review the sentences.
                  </li>
                  <li>
                    Click <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">Listen Original</strong>. Listen to the pitch and stressed words.
                  </li>
                  <li>
                    Upon finish, you will automatically arrive in the <strong className="text-[#10B981] font-semibold bg-[#10B981]/5 px-1.5 py-0.5 rounded font-mono text-[11px]">Record Console</strong> after a 3-second delay, with recording automatically initialized!
                  </li>
                  <li>
                    Speak the exact sentence, stop recording, and play both side-by-side to compare accents. Rate your try on the Checklist!
                  </li>
                </ol>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* Floating Bottom Nav bar for mobile & desktop consistency */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-[#121214]/95 py-3.5 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.2)] backdrop-blur-lg">
        <div className="mx-auto max-w-md px-4 animate-fade-in">
          <nav className="flex justify-around items-center" id="bottom-navigation-pills">
            
            {/* Tab 1: Shadowing */}
            <button
              onClick={() => {
                setCurrentTab('shadowing');
                setAutoStartSentenceId(null);
              }}
              id="nav-tab-shadowing"
              className={`flex flex-col items-center gap-1.5 transition duration-200 select-none cursor-pointer ${
                currentTab === 'shadowing'
                  ? 'text-[#10B981] scale-105 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                currentTab === 'shadowing' ? 'bg-[#10B981]/15 text-[#10B981]' : ''
              }`}>
                <BookOpen className="h-5.5 w-5.5" />
              </div>
              <span className="text-[10px] tracking-tight">Shadowing</span>
            </button>

            {/* Tab 2: Record & Compare */}
            <button
              onClick={() => {
                setCurrentTab('record');
                setAutoStartSentenceId(null);
              }}
              id="nav-tab-record"
              className={`flex flex-col items-center gap-1.5 transition duration-200 select-none cursor-pointer ${
                currentTab === 'record'
                  ? 'text-[#10B981] scale-105 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 relative ${
                currentTab === 'record' ? 'bg-[#10B981]/15 text-[#10B981]' : ''
              }`}>
                <Mic className="h-5.5 w-5.5" />
                {autoStartSentenceId !== null && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-505 bg-yellow-500"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">Record</span>
            </button>

            {/* Tab 3: Phrase Bank */}
            <button
              onClick={() => {
                setCurrentTab('phrases');
                setAutoStartSentenceId(null);
              }}
              id="nav-tab-phrases"
              className={`flex flex-col items-center gap-1.5 transition duration-200 select-none cursor-pointer ${
                currentTab === 'phrases'
                  ? 'text-[#10B981] scale-105 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                currentTab === 'phrases' ? 'bg-[#10B981]/15 text-[#10B981]' : ''
              }`}>
                <BookMarked className="h-5.5 w-5.5" />
              </div>
              <span className="text-[10px] tracking-tight">Phrase Bank</span>
            </button>

          </nav>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Play, Eye, EyeOff, Check, BookOpen, Volume2, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { LESSONS } from './data';
import { Sentence, SelfCheck } from '../types';

interface ShadowingPlayerProps {
  currentLessonId: number;
  onSelectLesson: (id: number) => void;
  activeSentenceId: number;
  onSelectSentence: (id: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  // Checking states to evaluate color markers
  selfCheckStates: Record<number, SelfCheck>;
  recordedBlobs: Record<number, Blob | null>;
  // Callback when user plays TTS to alert parent that counting down & auto-record is triggering
  onTriggerAutoRecord: (sentenceId: number) => void;
}

export const ShadowingPlayer: React.FC<ShadowingPlayerProps> = ({
  currentLessonId,
  onSelectLesson,
  activeSentenceId,
  onSelectSentence,
  speed,
  onSpeedChange,
  selfCheckStates,
  recordedBlobs,
  onTriggerAutoRecord
}) => {
  const [hideTranscripts, setHideTranscripts] = useState(false);
  const [showIPAHints, setShowIPAHints] = useState(true);
  const [playingSentenceId, setPlayingSentenceId] = useState<number | null>(null);

  const activeLesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[0];

  // Calculate status of a sentence
  const getSentenceStatus = (sentenceId: number): 'green' | 'yellow' | 'gray' => {
    const checks = selfCheckStates[sentenceId] || {
      pronunciation: false,
      rhythm: false,
      speed: false,
      confidence: false
    };
    const hasRecording = !!recordedBlobs[sentenceId];

    const checksCount = Object.values(checks).filter(Boolean).length;

    if (checksCount === 4) {
      return 'green';
    } else if (checksCount > 0 || hasRecording) {
      return 'yellow';
    } else {
      return 'gray';
    }
  };

  // Get status color CSS class names
  const getStatusColorClass = (sentenceId: number) => {
    const status = getSentenceStatus(sentenceId);
    if (status === 'green') return 'bg-green-500';
    if (status === 'yellow') return 'bg-yellow-500';
    return 'bg-slate-400 dark:bg-slate-600';
  };

  // Play sentence using SpeechSynthesis and trigger auto recorder countdown on completion
  const handlePlaySentence = (sentence: Sentence) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = 'en-US';
      utterance.rate = speed;

      utterance.onstart = () => {
        setPlayingSentenceId(sentence.id);
        onSelectSentence(sentence.id);
      };

      utterance.onend = () => {
        setPlayingSentenceId(null);
        // Let component state handle auto record countdown sequence in parent/reusable form
        onTriggerAutoRecord(sentence.id);
      };

      utterance.onerror = (e) => {
        console.error('SpeechSynthesis error:', e);
        setPlayingSentenceId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Your browser does not support Speech Synthesis HTML APIs.');
    }
  };

  // Calculate overall lesson stats
  const completedSentences = activeLesson.sentences.filter(s => getSentenceStatus(s.id) === 'green').length;
  const inProgressSentences = activeLesson.sentences.filter(s => getSentenceStatus(s.id) === 'yellow').length;

  return (
    <div className="space-y-6">
      {/* Lesson Selector Row */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-4.5 shadow-[0_1PX_3px_rgba(0,0,0,0.02)]">
        <label htmlFor="lesson-selector-dropdown" className="font-mono text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 block mb-2.5">
          Select Practice Dialogue / Scenario:
        </label>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {LESSONS.map(lesson => {
            const isActive = lesson.id === currentLessonId;
            return (
              <button
                key={lesson.id}
                id={`select-lesson-tab-${lesson.id}`}
                onClick={() => {
                  onSelectLesson(lesson.id);
                  onSelectSentence(lesson.sentences[0].id);
                }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold select-none text-center transition duration-200 ${
                  isActive
                    ? 'bg-[#10B981] text-black shadow-[0_2px_10px_rgba(16,185,129,0.2)] font-bold'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                Lesson {lesson.id}: {lesson.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lesson Progress Dashboard Panel */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-5.5 relative overflow-hidden transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 p-3 flex gap-1.5 opacity-5 pointer-events-none">
          <BookOpen className="h-24 w-24 text-emerald-500" />
        </div>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-amber-500">
              {activeLesson.category}
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {activeLesson.title} Lesson Dialogue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              Select any sentence, listen to native speaker cadence, and auto-record to practice shadowing.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            {/* Progress indicators color definitions */}
            <div className="flex gap-4 text-xs bg-slate-50 dark:bg-white/[0.02] border border-slate-200/20 dark:border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-350">{completedSentences} Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 inline-block"></span>
                <span className="text-slate-600 dark:text-slate-350">{inProgressSentences} Trying</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip for Speed, Transcript Visibility, IPA Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-4.5 sm:flex-row sm:items-center sm:justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Speed Adjustment */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono uppercase tracking-wider">Cadence:</span>
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-0.5" id="speed-set-btns">
            {([0.75, 1.0, 1.25] as const).map(spd => (
              <button
                key={spd}
                id={`speed-${spd}`}
                onClick={() => onSpeedChange(spd)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  speed === spd
                    ? 'bg-[#10B981] text-black font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* IPA Toggle */}
          <button
            onClick={() => setShowIPAHints(!showIPAHints)}
            id="toggle-ipa-hints"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition duration-200 cursor-pointer ${
              showIPAHints
                ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400'
                : 'border-slate-200/60 dark:border-white/10 bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {showIPAHints ? 'IPA Phonetics ON' : 'IPA Phonetics OFF'}
          </button>

          {/* Transcript Show/Hide Toggle */}
          <button
            onClick={() => setHideTranscripts(!hideTranscripts)}
            id="toggle-transcripts-hide"
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition duration-200 cursor-pointer ${
              hideTranscripts
                ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                : 'border-slate-200/60 dark:border-white/10 bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {hideTranscripts ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Transcripts Hidden
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Transcripts Visible
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sentence dialogue listing flow */}
      <div className="space-y-4">
        {activeLesson.sentences.map((sentence, idx) => {
          const isActive = sentence.id === activeSentenceId;
          const isPlaying = sentence.id === playingSentenceId;
          const status = getSentenceStatus(sentence.id);

          return (
            <div
              key={sentence.id}
              onClick={() => onSelectSentence(sentence.id)}
              className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'border-[#10B981] bg-[#10B981]/[0.03] dark:bg-[#10B981]/[0.02] ring-1 ring-[#10B981] shadow-[0_2px_12px_rgba(16,185,129,0.05)]'
                  : 'border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] hover:border-slate-300 dark:hover:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Top sentence status meta strip */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  {/* Status dot labeled per color requirement */}
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getStatusColorClass(
                      sentence.id
                    )}`}
                    title={`Status: ${status === 'green' ? 'Done' : status === 'yellow' ? 'In Progress' : 'Not Started'}`}
                  ></span>
                  
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    Sentence {idx + 1} of {activeLesson.sentences.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    status === 'green'
                      ? 'bg-green-500/10 text-green-500'
                      : status === 'yellow'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500'
                  }`}>
                    {status === 'green' ? 'DONE' : status === 'yellow' ? 'TRYING' : 'NOT STARTED'}
                  </span>
                </div>
              </div>

              {/* Main Sentence Content */}
              <div className="space-y-2">
                {hideTranscripts ? (
                  <div className="rounded-xl bg-slate-100 dark:bg-white/5 py-4 px-4 border border-dashed border-slate-200 dark:border-white/10 text-center transition hover:bg-slate-200 dark:hover:bg-white/10">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center justify-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" /> Enable "Transcripts Visible" or click Play to hear the text!
                    </span>
                  </div>
                ) : (
                  <div>
                    {/* Practice Text styled as 18px exactly */}
                    <p className="text-[18px] font-medium leading-relaxed text-slate-900 dark:text-slate-100 tracking-tight select-all">
                      {sentence.text}
                    </p>
                    
                    {showIPAHints && sentence.ipa && (
                      <p className="font-mono text-xs tracking-wide text-amber-500 dark:text-amber-400 font-medium mt-1 select-all">
                        {sentence.ipa}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions strip inside the card */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                <span className="text-[11px] text-slate-450 dark:text-slate-500 font-mono">
                  {isActive ? (
                    <span className="text-[#10B981] font-semibold flex items-center gap-1">
                      Active Practice Focus <ArrowRight className="h-3 w-3" />
                    </span>
                  ) : (
                    <span>Click card to practice this line</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySentence(sentence);
                    }}
                    id={`play-tts-sentence-${sentence.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition hover:scale-105 active:scale-95 duration-200 cursor-pointer ${
                      isPlaying
                        ? 'bg-yellow-500 text-black animate-pulse'
                        : 'bg-[#10B981] text-black hover:opacity-90 shadow-[0_2px_8px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    {isPlaying ? 'Speaking...' : 'Listen Original'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-[#121214] p-4.5 text-xs text-slate-500 dark:text-slate-400 font-sans shadow-sm">
        <HelpCircle className="h-4 w-4 shrink-0 text-[#10B981] mt-0.5" />
        <div>
          <strong className="text-slate-705 dark:text-slate-350">3-Second Shadowing Countdown:</strong> Clicking <span className="font-semibold text-slate-900 dark:text-slate-100">Listen Original</span> plays the sentence. Immediately upon completion of pronunciation, a 3 second countdown activates and launches the Microphone Record process, guiding you to shadow speak right away!
        </div>
      </div>
    </div>
  );
};

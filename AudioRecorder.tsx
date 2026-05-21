import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Volume2, CheckCircle2, RotateCcw, AlertTriangle, CheckSquare, Square as SquareIcon } from 'lucide-react';
import { Sentence, SelfCheck } from '../types';

interface AudioRecorderProps {
  sentence: Sentence;
  speed: number;
  selfCheck: SelfCheck;
  onUpdateSelfCheck: (sentenceId: number, check: SelfCheck) => void;
  // Shared audio buffers so they persist as long as the page is open (in-memory)
  recordedBlob: Blob | null;
  onSaveBlob: (sentenceId: number, blob: Blob) => void;
  // External triggers
  autoStartCountdown?: boolean;
  onCountdownComplete?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  sentence,
  speed,
  selfCheck,
  onUpdateSelfCheck,
  recordedBlob,
  onSaveBlob,
  autoStartCountdown = false,
  onCountdownComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isUserPlaying, setIsUserPlaying] = useState(false);
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  // Generate memory URL for the recorded blob
  const recordUrl = recordedBlob ? URL.createObjectURL(recordedBlob) : null;

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopRecordingResources();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Handle auto-recording activator (3 second pause then record)
  useEffect(() => {
    if (autoStartCountdown) {
      setCountdown(3);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            startRecording();
            if (onCountdownComplete) onCountdownComplete();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [autoStartCountdown, sentence.id]);

  const stopRecordingResources = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setMicError(null);
    chunksRef.current = [];
    setRecordingDuration(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Web Recording API is not supported in this browser or environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onSaveBlob(sentence.id, finalBlob);
        setIsRecording(false);
        if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setMicError(
        err.message || 
        'Could not access microphone. If you are using the inside-iframe preview, please click "Open in New Tab" at the top-right to grant microphone permission.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    stopRecordingResources();
  };

  // Play reference sentence TTS
  const handlePlayOriginal = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.text);
      utterance.lang = 'en-US';
      utterance.rate = speed;
      
      utterance.onstart = () => setIsTTSPlaying(true);
      utterance.onend = () => setIsTTSPlaying(false);
      utterance.onerror = () => setIsTTSPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('SpeechSynthesis not supported.');
    }
  };

  // Play user's recorded wav/webm
  const handlePlayUserAudio = () => {
    if (recordUrl) {
      if (isUserPlaying) {
        userAudioRef.current?.pause();
        setIsUserPlaying(false);
      } else {
        if (!userAudioRef.current) {
          userAudioRef.current = new Audio(recordUrl);
        } else {
          userAudioRef.current.src = recordUrl;
        }
        
        userAudioRef.current.playbackRate = speed;
        userAudioRef.current.play();
        setIsUserPlaying(true);
        
        userAudioRef.current.onended = () => {
          setIsUserPlaying(false);
        };
      }
    }
  };

  // Checklist updates
  const setCheckValue = (key: keyof SelfCheck, value: boolean) => {
    onUpdateSelfCheck(sentence.id, {
      ...selfCheck,
      [key]: value
    });
  };

  return (
    <div id={`recorder-sentence-${sentence.id}`} className="mt-4 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-5 shadow-sm transition-all">
      {/* Target prompt display */}
      <div className="mb-5 text-center">
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Shadow Practice Focus</span>
        <h4 className="text-[18px] font-semibold leading-relaxed tracking-tight text-slate-900 dark:text-white mt-1">
          "{sentence.text}"
        </h4>
        {sentence.ipa && (
          <p className="font-mono text-xs text-amber-500 dark:text-amber-400 mt-1">
            {sentence.ipa}
          </p>
        )}
      </div>

      {/* Countdown and Recording Alert */}
      {countdown !== null && (
        <div className="mb-5 animate-bounce text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-1.5 text-xs font-bold text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            GET READY! Automatic Recording in {countdown}s...
          </div>
        </div>
      )}

      {/* Primary recording layout controls */}
      <div className="flex flex-col items-center justify-center gap-4 py-4">
        {isRecording ? (
          <button
            onClick={stopRecording}
            id="stop-recording-btn"
            className="group flex h-20 w-20 flex-col items-center justify-center rounded-full bg-red-500 font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:bg-red-600 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Square className="h-7 w-7 animate-pulse text-white" />
            <span className="text-[10px] font-mono mt-1 font-bold">{recordingDuration}s</span>
          </button>
        ) : (
          <button
            onClick={() => startRecording()}
            id="start-recording-btn"
            disabled={countdown !== null}
            className={`group flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#10B981] font-bold text-black shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-95 transition-all duration-200 cursor-pointer ${
              countdown !== null ? 'opacity-45 cursor-not-allowed' : 'hover:scale-105'
            }`}
          >
            <Mic className="h-7 w-7 text-black" />
            <span className="text-[10px] uppercase font-mono mt-1 font-bold">Record</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            Capturing from device mic...
          </div>
        )}

        {micError && (
          <div className="flex items-start gap-2 max-w-md rounded-xl bg-red-500/10 p-3.5 text-xs text-red-500 dark:bg-red-950/20 border border-red-500/10">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}
      </div>

      {/* Playback Comparisons (Side-by-Side) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-2">
        {/* Play Original */}
        <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1e] p-4 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Reference Audio</span>
            <h5 className="font-semibold text-sm mt-0.5 text-slate-900 dark:text-white">Play Original Model</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Listen to standard TTS pitch, pause timing, and stress points.</p>
          </div>
          
          <button
            onClick={handlePlayOriginal}
            id={`play-original-btn-${sentence.id}`}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold tracking-tight transition duration-200 cursor-pointer ${
              isTTSPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Volume2 className="h-4 w-4" />
            {isTTSPlaying ? 'Playing Original...' : 'Play Reference (TTS)'}
          </button>
        </div>

        {/* Play user self-recording */}
        <div className="rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a1e] p-4 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">My Practice Try</span>
            <h5 className="font-semibold text-sm mt-0.5 text-slate-900 dark:text-white">Play Back My Recording</h5>
            {recordedBlob ? (
              <p className="text-[11px] text-green-600 dark:text-green-400 font-medium mt-1">Excellent! Recording in-memory. Play it to compare.</p>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">No practice recording yet. Click Record above to try!</p>
            )}
          </div>

          <button
            onClick={handlePlayUserAudio}
            id={`play-user-btn-${sentence.id}`}
            disabled={!recordedBlob}
            className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold tracking-tight transition duration-200 cursor-pointer ${
              !recordedBlob
                ? 'bg-slate-100 dark:bg-white/5 text-slate-450 dark:text-slate-500/40 border border-slate-200/10 dark:border-white/5 cursor-not-allowed'
                : isUserPlaying
                  ? 'bg-[#10B981] text-black animate-pulse shadow-sm'
                  : 'bg-[#10B981] text-black shadow-sm'
            }`}
          >
            <Play className="h-4 w-4" />
            {isUserPlaying ? 'Playing Recording...' : recordedBlob ? 'Play Back Recording' : 'No Recording Saved'}
          </button>
        </div>
      </div>

      {/* Self-check checklist */}
      <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-4">
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
          <h5 className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-white">Speaking Evaluation Self-Check</h5>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() => setCheckValue('pronunciation', !selfCheck.pronunciation)}
            id="checkbox-pronunciation"
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition duration-200 active:scale-95 cursor-pointer ${
              selfCheck.pronunciation
                ? 'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold'
                : 'border-slate-200/60 dark:border-white/10 bg-white dark:bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {selfCheck.pronunciation ? <CheckSquare className="h-4 w-4 shrink-0" /> : <SquareIcon className="h-4 w-4 shrink-0" />}
            Pronunciation ok
          </button>

          <button
            onClick={() => setCheckValue('rhythm', !selfCheck.rhythm)}
            id="checkbox-rhythm"
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition duration-200 active:scale-95 cursor-pointer ${
              selfCheck.rhythm
                ? 'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold'
                : 'border-slate-200/60 dark:border-white/10 bg-white dark:bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {selfCheck.rhythm ? <CheckSquare className="h-4 w-4 shrink-0" /> : <SquareIcon className="h-4 w-4 shrink-0" />}
            Rhythm & stress ok
          </button>

          <button
            onClick={() => setCheckValue('speed', !selfCheck.speed)}
            id="checkbox-speed"
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition duration-200 active:scale-95 cursor-pointer ${
              selfCheck.speed
                ? 'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold'
                : 'border-slate-200/60 dark:border-white/10 bg-white dark:bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {selfCheck.speed ? <CheckSquare className="h-4 w-4 shrink-0" /> : <SquareIcon className="h-4 w-4 shrink-0" />}
            Speed natural
          </button>

          <button
            onClick={() => setCheckValue('confidence', !selfCheck.confidence)}
            id="checkbox-confidence"
            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition duration-200 active:scale-95 cursor-pointer ${
              selfCheck.confidence
                ? 'border-green-500/40 bg-green-500/5 text-green-600 dark:text-green-400 font-semibold'
                : 'border-slate-200/60 dark:border-white/10 bg-white dark:bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {selfCheck.confidence ? <CheckSquare className="h-4 w-4 shrink-0" /> : <SquareIcon className="h-4 w-4 shrink-0" />}
            Sounds confident
          </button>
        </div>
        
        {/* Dynamic status helper */}
        <div className="mt-4 flex justify-end">
          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-550">
            Saved to Local Storage per sentence • Auto-color updates instantly
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Youtube, Play, RotateCcw, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface YouTubeWidgetProps {
  videoId: string;
  defaultTimestamp?: number;
  onVideoIdChange?: (id: string) => void;
}

export const YouTubeWidget: React.FC<YouTubeWidgetProps> = ({
  videoId,
  defaultTimestamp = 0,
  onVideoIdChange
}) => {
  const [inputVal, setInputVal] = useState(videoId);
  const [currentTimestamp, setCurrentTimestamp] = useState(defaultTimestamp);
  const [key, setKey] = useState(0); // Trigger reload of iframe

  const extractVideoId = (urlOrId: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
  };

  const handleLoadVideo = () => {
    const cleanedId = extractVideoId(inputVal.trim());
    if (cleanedId && onVideoIdChange) {
      onVideoIdChange(cleanedId);
      setKey(prev => prev + 1);
    }
  };

  const handleJumpToSeconds = (seconds: number) => {
    setCurrentTimestamp(seconds);
    setKey(prev => prev + 1);
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-4.5 shadow-sm transition-all duration-300">
      <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <Youtube className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">YouTube Audio Source</h3>
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Shadow actual native dialogue</p>
          </div>
        </div>
        
        {/* Custom Input */}
        <div className="flex gap-2">
          <input
            type="text"
            id="youtube-url-id"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="YouTube Link / ID"
            className="w-full max-w-[155px] rounded-lg border border-slate-200/60 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-2.5 py-1 text-xs outline-none focus:border-[#10B981] text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={handleLoadVideo}
            id="youtube-load-btn"
            className="flex items-center gap-1 rounded-lg bg-[#10B981] px-3 py-1 text-xs font-semibold text-black hover:opacity-90 transition cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Load
          </button>
        </div>
      </div>

      {/* Embedded Iframe */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-slate-250/20 dark:border-white/5 shadow-inner">
        <iframe
          key={key}
          title="YouTube Video Practicing"
          src={`https://www.youtube.com/embed/${videoId}?start=${currentTimestamp}&autoplay=0&enablejsapi=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        ></iframe>
      </div>

      {/* Suggested Hot-points for the current lesson */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1 font-bold">Recommended:</span>
        <button
          onClick={() => handleJumpToSeconds(0)}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer font-bold"
        >
          <RotateCcw className="h-3 w-3" /> 00:00
        </button>
        <button
          onClick={() => handleJumpToSeconds(10)}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer font-bold"
        >
          <Play className="h-3 w-3" /> 00:10
        </button>
        <button
          onClick={() => handleJumpToSeconds(30)}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer font-bold"
        >
          <Play className="h-3 w-3" /> 00:30
        </button>
        <button
          onClick={() => handleJumpToSeconds(60)}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer font-bold"
        >
          <Play className="h-3 w-3" /> 01:00
        </button>
        <button
          onClick={() => handleJumpToSeconds(120)}
          className="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition cursor-pointer font-bold"
        >
          <Play className="h-3 w-3" /> 02:00
        </button>
      </div>

      {/* Help tooltip */}
      <div className="mt-3.5 flex items-start gap-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-[11px] text-slate-500 dark:text-slate-400">
        <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
        <span>
          <strong className="text-slate-700 dark:text-slate-300">Pro-Tip:</strong> Slow down dialogue inside the YouTube video setting (gear icon) to shadow speed!
        </span>
      </div>
    </div>
  );
};

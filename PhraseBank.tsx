import React, { useState } from 'react';
import { Volume2, CheckCircle2, Circle, Filter, Award, Search, HelpCircle } from 'lucide-react';
import { PHRASE_BANK_RAW } from '../data';
import { Phrase } from '../types';

interface PhraseBankProps {
  learnedPhrases: Record<number, boolean>;
  onTogglePhrase: (id: number) => void;
}

type GroupFilter = 'all' | 'small-talk' | 'business' | 'travel';
type StatusFilter = 'all' | 'learned' | 'unlearned';

export const PhraseBank: React.FC<PhraseBankProps> = ({
  learnedPhrases,
  onTogglePhrase
}) => {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayId, setActivePlayId] = useState<number | null>(null);

  // Group Details
  const groups = [
    { id: 'small-talk', name: 'Small Talk', dbCode: 'small-talk', color: 'from-emerald-500 to-teal-500' },
    { id: 'business', name: 'Business / Work', dbCode: 'business', color: 'from-sky-500 to-blue-600' },
    { id: 'travel', name: 'Travel / Daily', dbCode: 'travel', color: 'from-purple-500 to-indigo-500' }
  ];

  // Calculate stats for each group
  const getGroupStats = (groupCode: 'small-talk' | 'business' | 'travel') => {
    const groupPhrases = PHRASE_BANK_RAW.filter(p => p.group === groupCode);
    const total = groupPhrases.length;
    const learned = groupPhrases.filter(p => learnedPhrases[p.id]).length;
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { total, learned, pct };
  };

  const handlePlayTTS = (text: string, id: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      
      utterance.onstart = () => setActivePlayId(id);
      utterance.onend = () => setActivePlayId(null);
      utterance.onerror = () => setActivePlayId(null);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('SpeechSynthesis not supported');
    }
  };

  const filteredPhrases = PHRASE_BANK_RAW.filter(phrase => {
    // 1. Group Filter
    if (groupFilter !== 'all' && phrase.group !== groupFilter) return false;
    
    // 2. Status Filter
    const isLearned = !!learnedPhrases[phrase.id];
    if (statusFilter === 'learned' && !isLearned) return false;
    if (statusFilter === 'unlearned' && isLearned) return false;
    
    // 3. Search Filter
    if (searchQuery.trim() !== '') {
      return phrase.text.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border border-slate-200/10 dark:border-white/5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Phrase Bank Practice</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Master 30 common daily expressions with professional recordings and pronunciation checks</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/10 px-4 py-2.5 text-xs shadow-sm">
          <Award className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {Object.values(learnedPhrases).filter(Boolean).length} / 30 Learned
          </span>
        </div>
      </div>

      {/* Progress Cards per Group */}
      <div className="grid gap-4 sm:grid-cols-3">
        {groups.map(g => {
          const stats = getGroupStats(g.dbCode as 'small-talk' | 'business' | 'travel');
          const isSelected = groupFilter === g.dbCode;
          return (
            <div
              key={g.id}
              onClick={() => setGroupFilter(g.dbCode as GroupFilter)}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl border p-4.5 transition-all duration-300 shadow-sm ${
                isSelected 
                  ? 'border-[#10B981] bg-[#10B981]/[0.03] dark:bg-[#10B981]/[0.02] ring-1 ring-[#10B981]' 
                  : 'border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] hover:border-slate-350 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-150">{g.name}</span>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                  {stats.learned} / {stats.total}
                </span>
              </div>
              
              {/* Progress track */}
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
              
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <span>Completion</span>
                <span>{stats.pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Filters Area */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] p-4.5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Group Filter Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 font-mono mr-1">
              <Filter className="h-3 w-3" /> CATEGORIES:
            </span>
            <button
              id="filter-group-all"
              onClick={() => setGroupFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                groupFilter === 'all'
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              All Groups
            </button>
            <button
              id="filter-group-smalltalk"
              onClick={() => setGroupFilter('small-talk')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                groupFilter === 'small-talk'
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              Small Talk
            </button>
            <button
              id="filter-group-business"
              onClick={() => setGroupFilter('business')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                groupFilter === 'business'
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              Business
            </button>
            <button
              id="filter-group-travel"
              onClick={() => setGroupFilter('travel')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                groupFilter === 'travel'
                  ? 'bg-[#10B981] text-black font-bold'
                  : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              Travel
            </button>
          </div>

          {/* Status Filter Selector */}
          <div className="flex items-center gap-1.5">
            <button
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                  : 'border-slate-200/60 dark:border-white/10 bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              All Status
            </button>
            <button
              id="filter-status-learned"
              onClick={() => setStatusFilter('learned')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition cursor-pointer ${
                statusFilter === 'learned'
                  ? 'border-green-500/50 bg-green-500/10 text-green-500'
                  : 'border-slate-200/60 dark:border-white/10 bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Learned
            </button>
            <button
              id="filter-status-unlearned"
              onClick={() => setStatusFilter('unlearned')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition cursor-pointer ${
                statusFilter === 'unlearned'
                  ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  : 'border-slate-200/60 dark:border-white/10 bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Unlearned
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            id="phrase-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases..."
            className="w-full rounded-xl border border-slate-200/65 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-2 px-10 text-xs outline-none focus:border-[#10B981] text-slate-800 dark:text-slate-100 transition"
          />
        </div>
      </div>

      {/* Phrases Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filteredPhrases.length > 0 ? (
          filteredPhrases.map((phrase, idx) => {
            const isLearned = !!learnedPhrases[phrase.id];
            const groupMeta = groups.find(g => g.dbCode === phrase.group);
            return (
              <div
                key={phrase.id}
                className={`relative flex items-center justify-between rounded-2xl border p-4.5 transition-all duration-305 ${
                  isLearned
                    ? 'border-green-500/30 bg-green-500/[0.04] dark:bg-green-500/[0.02] shadow-sm'
                    : 'border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] hover:border-slate-350 dark:hover:border-white/10 shadow-sm'
                }`}
              >
                {/* Text and speech button */}
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500">
                      {groupMeta?.name || phrase.group}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                  
                  {/* Practice Text styled as 18px exactly */}
                  <p className="text-[18px] font-semibold leading-relaxed text-slate-900 dark:text-slate-100 tracking-tight select-all">
                    {phrase.text}
                  </p>
                </div>

                {/* Interactive Speech & Check Trigger Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePlayTTS(phrase.text, phrase.id)}
                    id={`play-tts-phrase-${phrase.id}`}
                    title="Listen to phrase (TTS)"
                    className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                      activePlayId === phrase.id
                        ? 'bg-[#10B981] text-black animate-pulse'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <Volume2 className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={() => onTogglePhrase(phrase.id)}
                    id={`toggle-learned-phrase-${phrase.id}`}
                    title={isLearned ? 'Mark Unlearned' : 'Mark Learned'}
                    className={`inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                      isLearned
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-600'
                    }`}
                  >
                    {isLearned ? (
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    ) : (
                      <Circle className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#121214] text-center p-12 shadow-sm">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">No phrases match your selection.</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or search query!</p>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-[#121214] p-4.5 text-xs text-slate-500 dark:text-slate-400 font-sans shadow-sm">
        <HelpCircle className="h-4 w-4 shrink-0 text-[#10B981] mt-0.5" />
        <div>
          <strong className="text-slate-750 dark:text-slate-300">Practice Suggestion:</strong> Listen to the expression multiple times using the <Volume2 className="inline h-3.5 w-3.5" /> button, mimic the native intonation and rhythm, and check-mark it as learned when you can say it smoothly from memory!
        </div>
      </div>
    </div>
  );
};

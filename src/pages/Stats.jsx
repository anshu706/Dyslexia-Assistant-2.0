import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Flame,
  Clock,
  BookOpen,
  Award,
  Calendar,
  Download,
  Trash2,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Zap,
  AlertTriangle,
  X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(ease * end));
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

export function Stats({
  sessions = [],
  onClearSessions,
  onLaunchReader,
  reducedMotion = false
}) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Compute metrics
  const totalWords = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.wordsRead || 0), 0);
  }, [sessions]);

  const totalSeconds = useMemo(() => {
    return sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  }, [sessions]);

  const totalMinutes = Math.round(totalSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const completedReadings = sessions.length;

  // Compute daily streak
  const streakDays = useMemo(() => {
    if (sessions.length === 0) return 0;
    const uniqueDates = new Set(
      sessions.map(s => new Date(s.timestamp).toDateString())
    );
    return uniqueDates.size;
  }, [sessions]);

  // Aggregate activity across the last 7 days
  const weeklyData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

      const daySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === dateStr);
      const words = daySessions.reduce((sum, s) => sum + (s.wordsRead || 0), 0);
      const duration = daySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

      days.push({
        dateStr,
        dayLabel,
        words,
        minutes: Math.round(duration / 60),
        count: daySessions.length,
      });
    }

    const maxWords = Math.max(...days.map(d => d.words), 100);
    return days.map(d => ({
      ...d,
      heightPercent: Math.max(12, Math.round((d.words / maxWords) * 100)),
    }));
  }, [sessions]);

  // Export session history as JSON or CSV
  const handleExportCSV = () => {
    if (sessions.length === 0) return;

    let csv = 'Timestamp,Date,Title,WordsRead,DurationSeconds,SpeedRate\n';
    sessions.forEach(s => {
      const d = new Date(s.timestamp).toISOString();
      const title = `"${(s.title || 'Reading').replace(/"/g, '""')}"`;
      csv += `${s.timestamp},${d},${title},${s.wordsRead || 0},${s.durationSeconds || 0},${s.speedRate || 1.0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dyslexia_reading_stats_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Private Cognitive Progress</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Reading Analytics & Streaks
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            All metrics are calculated entirely in-browser. Zero analytics trackers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {sessions.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl glass-card border border-slate-700/60 hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setResetModalOpen(true)}
                className="px-3.5 py-2 rounded-xl glass-card border border-slate-700/60 hover:border-rose-400/50 text-xs font-semibold text-slate-400 hover:text-rose-300 flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Card 1: Total Words */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="glass-panel p-6 rounded-3xl border border-cyan-500/30 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Words Read
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            <AnimatedNumber value={totalWords} />
          </div>
          <div className="mt-2 text-xs text-cyan-300 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adaptive comprehension progress</span>
          </div>
        </motion.div>

        {/* Card 2: Total Time */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="glass-panel p-6 rounded-3xl border border-violet-500/30 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Time Engaged
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center text-violet-300">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {totalHours} <span className="text-xl text-slate-400 font-semibold">hrs</span>
          </div>
          <div className="mt-2 text-xs text-violet-300">
            <AnimatedNumber value={totalMinutes} /> active minutes of audio-visual focus
          </div>
        </motion.div>

        {/* Card 3: Completed Readings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="glass-panel p-6 rounded-3xl border border-teal-500/30 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Sessions
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            <AnimatedNumber value={completedReadings} />
          </div>
          <div className="mt-2 text-xs text-teal-300">
            Passages read to completion
          </div>
        </motion.div>

        {/* Card 4: Daily Streak */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="glass-panel p-6 rounded-3xl border border-amber-500/30 relative overflow-hidden group shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Flame className="w-5 h-5 fill-amber-400 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline space-x-2">
            <span><AnimatedNumber value={streakDays} /></span>
            <span className="text-xl text-amber-400 font-semibold">{streakDays === 1 ? 'Day' : 'Days'}</span>
          </div>
          <div className="mt-2 text-xs text-amber-300">
            Keep your daily momentum burning!
          </div>
        </motion.div>
      </div>

      {/* Interactive 7-Day Activity Bar Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Weekly Reading Volume</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Words decoded per day over the last 7 calendar days
            </p>
          </div>

          {selectedDay && (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {selectedDay.dateStr}: {selectedDay.words.toLocaleString()} words ({selectedDay.minutes} min)
            </div>
          )}
        </div>

        {/* Chart Bars */}
        <div className="h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-700/50">
          {weeklyData.map((day, idx) => {
            const isHovered = selectedDay?.dateStr === day.dateStr;
            return (
              <div
                key={day.dateStr}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                onMouseEnter={() => setSelectedDay(day)}
                onMouseLeave={() => setSelectedDay(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl glass-panel text-[11px] font-semibold text-white whitespace-nowrap border border-cyan-400/40 shadow-xl"
                  >
                    {day.words} words • {day.minutes}m
                  </motion.div>
                )}

                {/* Animated Bar with Spring Physics */}
                <motion.div
                  initial={reducedMotion ? { height: `${day.heightPercent}%` } : { height: 0 }}
                  animate={{ height: `${day.heightPercent}%` }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 260, damping: 24, delay: idx * 0.05 }
                  }
                  className={`w-full max-w-[48px] rounded-2xl transition-all duration-200 relative ${
                    day.words > 0
                      ? 'bg-gradient-to-t from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800/60 border border-slate-700/40'
                  } ${isHovered ? 'brightness-125 scale-[1.03]' : ''}`}
                >
                  {day.words > 0 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-200 shadow-sm shadow-cyan-200" />
                  )}
                </motion.div>

                {/* Day Label */}
                <div className="mt-3 text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
                  {day.dayLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session History Log Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Recent Reading Logs</h2>
          </div>
          <span className="text-xs text-slate-400">
            {sessions.length} recorded session{sessions.length === 1 ? '' : 's'}
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl border border-slate-700/40 p-6 space-y-4">
            <BookOpen className="w-12 h-12 text-cyan-400/50 mx-auto" />
            <h3 className="text-base font-bold text-white">No Reading Sessions Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Launch the Reader and play any passage with synchronized speech to begin recording your personal stats.
            </p>
            <button
              onClick={onLaunchReader}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-colors"
            >
              Start Reading in Reader
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Date & Time</th>
                  <th className="pb-3 px-3">Document Title</th>
                  <th className="pb-3 px-3">Words Read</th>
                  <th className="pb-3 px-3">Duration</th>
                  <th className="pb-3 px-3">Playback Rate</th>
                  <th className="pb-3 px-3 text-right">Est. WPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sessions.slice(0, 15).map((session, i) => {
                  const date = new Date(session.timestamp);
                  const minutes = Math.max(0.1, (session.durationSeconds || 1) / 60);
                  const wpm = Math.round((session.wordsRead || 0) / minutes);

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {session.title || 'Passage'}
                      </td>
                      <td className="py-3 px-3 text-cyan-300 font-bold">
                        {session.wordsRead || 0}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {session.durationSeconds || 0}s
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {session.speedRate ? `${session.speedRate.toFixed(1)}x` : '1.0x'}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                        {wpm} wpm
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/40 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reset Analytics History?</h3>
                  <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                Permanently deletes all recorded reading sessions, daily streaks, time telemetry, and weekly volume metrics saved in local storage.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Keep Data
                </button>
                <button
                  onClick={() => {
                    setResetModalOpen(false);
                    if (onClearSessions) onClearSessions();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-colors"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

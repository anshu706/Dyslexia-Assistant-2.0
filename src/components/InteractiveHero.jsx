import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';

const DEMO_SENTENCE = "Reading should feel like opening a window, not climbing a wall.";
const WORDS = DEMO_SENTENCE.split(' ');

export function InteractiveHero({ reducedMotion = false }) {
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 0.75x, 1x, 1.25x, 1.5x
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bionicEnabled, setBionicEnabled] = useState(true);

  const timerRef = useRef(null);

  // Sound synthesis on word step if user turned sound on
  const speakCurrentWord = (word) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = speed * 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(480 / speed);

    timerRef.current = setInterval(() => {
      setActiveWordIndex((prev) => {
        const next = (prev + 1) % WORDS.length;
        if (soundEnabled) speakCurrentWord(WORDS[next]);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, soundEnabled]);

  const handleWordClick = (index) => {
    setActiveWordIndex(index);
    if (soundEnabled) speakCurrentWord(WORDS[index]);
  };

  const handleReplay = () => {
    setActiveWordIndex(0);
    setIsPlaying(true);
    if (soundEnabled) speakCurrentWord(WORDS[0]);
  };

  const renderBionicWord = (word, isCurrent) => {
    if (!bionicEnabled) return word;
    // Bionic reading: bold the first ceil(length/2) characters
    const mid = Math.ceil(word.length / 2);
    const head = word.slice(0, mid);
    const tail = word.slice(mid);

    return (
      <span className="relative z-10">
        <span className="font-extrabold text-white">{head}</span>
        <span className={isCurrent ? 'font-semibold text-slate-900' : 'text-slate-300'}>{tail}</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-700/40">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase text-cyan-300">
            Live Synchronized Highlight Preview
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bionic Toggle */}
          <button
            onClick={() => setBionicEnabled(!bionicEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              bionicEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                : 'glass-card border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Bionic Reading Fixation"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Bionic {bionicEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Audio Demo Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              soundEnabled
                ? 'bg-violet-500/20 border-violet-400/50 text-violet-300'
                : 'glass-card border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Mute voice preview' : 'Enable voice preview'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Sentence with Shared Layout Pill */}
      <div className="py-6 sm:py-10 px-2 sm:px-4 text-center sm:text-left">
        <p className="text-2xl sm:text-4xl md:text-5xl font-medium tracking-wide leading-relaxed select-none">
          {WORDS.map((word, index) => {
            const isCurrent = activeWordIndex === index;
            return (
              <span
                key={`${word}-${index}`}
                onClick={() => handleWordClick(index)}
                className={`relative inline-block mx-1.5 my-1.5 px-3 py-1 sm:px-4 sm:py-2 rounded-2xl cursor-pointer transition-colors duration-150 ${
                  isCurrent ? 'text-slate-950 font-bold' : 'text-slate-200 hover:text-white'
                }`}
              >
                {/* Framer Motion gliding pill layoutId */}
                {isCurrent && (
                  <motion.span
                    layoutId="heroWordHighlight"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 shadow-[0_0_24px_rgba(6,182,212,0.85)] z-0"
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 450, damping: 32, mass: 0.8 }
                    }
                  />
                )}
                <span className="relative z-10">
                  {renderBionicWord(word, isCurrent)}
                </span>
              </span>
            );
          })}
        </p>
      </div>

      {/* Hero Controls: Play, Replay, Speed */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/40">
        <div className="flex items-center space-x-2">
          {/* Play / Pause */}
          <motion.button
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play</span>
              </>
            )}
          </motion.button>

          {/* Replay */}
          <motion.button
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            onClick={handleReplay}
            className="p-2 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-700/60"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-1.5 glass-card px-2 py-1 rounded-xl border border-slate-700/60">
          <span className="text-[11px] text-slate-400 font-medium px-1">Speed:</span>
          {[0.75, 1, 1.25, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                speed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          💡 Click any word to jump highlight instantly
        </div>
      </div>
    </div>
  );
}

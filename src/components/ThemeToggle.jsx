import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sun, Moon, Flame } from 'lucide-react';

const THEMES = [
  {
    id: 'theme-aurora',
    name: 'Aurora',
    subtitle: 'Dark Glassmorphism',
    icon: '🌌',
    lucideIcon: Moon,
    accent: '#06b6d4',
    bgPreview: '#0b0f19',
    cardPreview: 'rgba(15, 23, 42, 0.75)',
    borderPreview: 'rgba(51, 65, 85, 0.6)',
    desc: 'Deep navy background with neon cyan and violet glows, reducing blue light fatigue.'
  },
  {
    id: 'theme-mint',
    name: 'Calm Mint',
    subtitle: 'Low-Stimulus Light',
    icon: '🌿',
    lucideIcon: Sun,
    accent: '#0d9488',
    bgPreview: '#f4f8f6',
    cardPreview: '#ffffff',
    borderPreview: '#cbd5e1',
    desc: 'Soft mint tint with soothing paper card surfaces to prevent visual glare and optical jitter.'
  },
  {
    id: 'theme-sunset',
    name: 'Sunset Glow',
    subtitle: 'Warm High-Contrast',
    icon: '🌅',
    lucideIcon: Flame,
    accent: '#f59e0b',
    bgPreview: '#1e1028',
    cardPreview: 'rgba(42, 23, 56, 0.85)',
    borderPreview: 'rgba(168, 85, 247, 0.3)',
    desc: 'Deep plum violet with warm amber highlights, optimized for high contrast without harsh white.'
  },
];

export function ThemeToggle({
  currentTheme,
  setCurrentTheme,
  reducedMotion = false,
  variant = 'compact', // 'compact' | 'segmented' | 'cards'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  // Segmented Pill Control (ideal for Studio / Settings / Navigation)
  if (variant === 'segmented') {
    return (
      <div
        className="glass-card p-1 rounded-2xl border border-slate-700/50 flex items-center space-x-1"
        role="radiogroup"
        aria-label="Color Theme Selection"
      >
        {THEMES.map((th) => {
          const isSelected = currentTheme === th.id;
          return (
            <button
              key={th.id}
              onClick={() => setCurrentTheme(th.id)}
              role="radio"
              aria-checked={isSelected}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 flex items-center space-x-2 ${
                isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeThemeSegment"
                  className="absolute inset-0 rounded-xl bg-cyan-500/20 border border-cyan-400/50 shadow-sm shadow-cyan-500/20"
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-sm">{th.icon}</span>
              <span className="relative z-10 hidden sm:inline">{th.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full Visual Theme Cards (ideal for Settings Studio)
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Color theme selector">
        {THEMES.map((th) => {
          const isSelected = currentTheme === th.id;
          return (
            <motion.button
              key={th.id}
              whileHover={reducedMotion ? {} : { scale: 1.02 }}
              whileTap={reducedMotion ? {} : { scale: 0.98 }}
              onClick={() => setCurrentTheme(th.id)}
              role="radio"
              aria-checked={isSelected}
              className={`p-4 rounded-2xl text-left transition-all border relative overflow-hidden ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20 bg-white/5'
                  : 'glass-card border-slate-700/60 hover:border-slate-500'
              }`}
            >
              {/* Preview Swatch Bar */}
              <div
                className="w-full h-8 rounded-xl mb-3 flex items-center justify-between px-2.5 border"
                style={{
                  backgroundColor: th.bgPreview,
                  borderColor: th.borderPreview,
                }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: th.accent }} />
                <span className="text-[10px] font-mono opacity-80" style={{ color: th.accent }}>
                  {th.accent}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{th.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{th.name}</h4>
                    <p className="text-[11px] text-slate-400">{th.subtitle}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
                {th.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Default: Compact Dropdown for Navigation Header
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-card border border-slate-700/50 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm"
        title="Change Visual Theme"
        aria-label={`Current theme: ${currentThemeObj.name}. Click to change.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-base">{currentThemeObj.icon}</span>
        <span className="hidden sm:inline">{currentThemeObj.name}</span>
        <Palette className="w-3.5 h-3.5 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-2.5 z-50 shadow-2xl border border-slate-700/70"
              role="menu"
            >
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Cognitive Theme</span>
                <span className="text-[10px] text-cyan-400 font-normal">500ms Cross-fade</span>
              </div>

              <div className="space-y-1 mt-1">
                {THEMES.map((th) => {
                  const isCurrent = currentTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        setCurrentTheme(th.id);
                        setIsOpen(false);
                      }}
                      role="menuitem"
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-bold shadow-sm'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">{th.icon}</span>
                        <div>
                          <div className="font-semibold text-slate-100">{th.name}</div>
                          <div className="text-[10px] text-slate-400">{th.subtitle}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: th.accent }}
                        />
                        {isCurrent && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

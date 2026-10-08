import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Keyboard,
  BarChart3,
  Sliders,
  HelpCircle,
  Home,
  Heart,
  ArrowUpRight,
  Layers,
  Cpu
} from 'lucide-react';

export function Footer({
  activeTab,
  setActiveTab,
  reducedMotion = false,
}) {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'reader', label: 'Interactive Reader', icon: BookOpen },
    { id: 'stats', label: 'Reading Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Typography Studio', icon: Sliders },
    { id: 'help', label: 'Shortcuts & FAQ', icon: HelpCircle },
  ];

  return (
    <footer className="relative z-10 glass-panel border-t border-slate-700/40 mt-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 space-y-4">
            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
              onClick={() => setActiveTab('landing')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
                <BookOpen className="w-5 h-5 text-white stroke-[2.3]" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-white bg-clip-text text-transparent">
                  Dyslexia<span className="text-cyan-400 ml-1">Assistant</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                  WCAG AAA
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering dyslexic students, educators, and lifelong readers with synchronized voice tracking, bionic eye fixation, and adaptive visual rulers.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg glass-card border border-slate-700/60 text-[11px] text-teal-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Client-Side Private</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg glass-card border border-slate-700/60 text-[11px] text-cyan-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>Zero Latency Speech</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`text-xs flex items-center space-x-2 py-1 transition-colors ${
                        isActive
                          ? 'text-cyan-400 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Shortcuts & Accessibility Actions */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pro Keyboard Controls</span>
            </h4>

            <div className="glass-card p-3.5 rounded-2xl border border-slate-700/60 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Play / Pause Voice</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 text-[10px]">
                  Space
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Toggle Bionic Anchors</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 text-[10px]">
                  B
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Toggle Focus Spotlight</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 text-[10px]">
                  R
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Skip Word Backward / Forward</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300 text-[10px]">
                  ← / →
                </kbd>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('help');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center space-x-1 transition-colors"
            >
              <span>View full keyboard map & FAQs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accessibility Commitment */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>© {currentYear} Dyslexia Assistant. Designed for neurodiverse readers.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">
              Typefaces: Lexend, Atkinson Hyperlegible, OpenDyslexic
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

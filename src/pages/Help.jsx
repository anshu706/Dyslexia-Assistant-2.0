import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Keyboard,
  Search,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Download,
  BookOpen,
  Volume2,
  Zap,
  Layers,
  Heart
} from 'lucide-react';

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordion, setOpenAccordion] = useState('faq-0');

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Speech', icon: '␣' },
    { key: 'Esc', desc: 'Stop Audio & Reset', icon: 'Esc' },
    { key: '← / →', desc: 'Step to Previous / Next Word', icon: '⇄' },
    { key: '↑ / ↓', desc: 'Increase / Decrease Reading Speed', icon: '⇅' },
    { key: 'B', desc: 'Toggle Bionic Reading Anchors', icon: 'B' },
    { key: 'R', desc: 'Toggle Focus Spotlight Ruler', icon: 'R' },
  ];

  const faqs = [
    {
      id: 'faq-0',
      category: 'Science & Accessibility',
      question: 'Why do Bionic fixation letters help dyslexic brains?',
      answer: 'Bionic Reading bolds the first few letters of words, creating artificial fixation points. Dyslexic brains often spend excess energy decoding syllables sequentially. By anchoring the eye to the strongest phonetic root, the brain completes the rest of the word using holistic pattern recognition, reducing visual fatigue.'
    },
    {
      id: 'faq-1',
      category: 'Typography',
      question: 'Why is Lexend specifically recommended over Arial or Times?',
      answer: 'Lexend was scientifically designed by educational researchers to reduce visual crowding. It features expanded character spacing, distinct letterforms (preventing b/d/p/q confusion), and hyper-consistent x-heights that stabilize the reader’s eye tracking across lines.'
    },
    {
      id: 'faq-2',
      category: 'Privacy & Security',
      question: 'Are my private essays or readings uploaded to cloud servers?',
      answer: 'No. Never. Dyslexia Assistant runs 100% locally in your web browser. We do not operate remote databases, collect telemetry, or store cookies. Your pasted documents, annotations, and reading statistics remain on your personal device only.'
    },
    {
      id: 'faq-3',
      category: 'Installation & PWA',
      question: 'How do I install Dyslexia Assistant as an offline desktop/mobile app?',
      answer: 'Dyslexia Assistant is a Progressive Web App (PWA). In Chrome or Edge, click the "Install" icon in your URL address bar or navigation bar. On Safari for iOS/iPadOS, tap "Share" and select "Add to Home Screen". Once installed, the app works entirely offline without an active internet connection.'
    },
    {
      id: 'faq-4',
      category: 'Audio & Speech Engine',
      question: 'How does the dual-mode synchronized speech engine work?',
      answer: 'Browsers historically struggle with word-level speech synchronization. Dyslexia Assistant uses a dual-engine architecture: it attempts native boundary event tracking first, and smoothly activates a predictive syllable-duration timing model if a voice does not dispatch native boundary events. You can also click any individual word to jump directly to it.'
    },
  ];

  const filteredFaqs = faqs.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
  });

  return (
    <div className="relative min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pt-8 text-left">
      {/* Title */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Knowledge Base & Shortcuts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Accessibility Guide & Help Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Keyboard controls, reading strategies, and neuroscience explanations.
        </p>
      </div>

      {/* Keyboard Shortcuts Interactive Grid */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl mb-10">
        <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-700/40">
          <Keyboard className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Full Keyboard Navigation Map</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-2xl border border-slate-700/50 flex items-center space-x-3 hover:border-cyan-400/40 transition-colors"
            >
              <div className="w-12 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs shadow-inner">
                {sc.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{sc.key}</div>
                <div className="text-[11px] text-slate-400">{sc.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar for FAQs */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search questions, research, or guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3 mb-12">
        {filteredFaqs.map((faq) => {
          const isOpen = openAccordion === faq.id;
          return (
            <div
              key={faq.id}
              className="glass-panel rounded-2xl border border-slate-700/50 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenAccordion(isOpen ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    {faq.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Advice for Educators & Parents Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 text-left space-y-4">
        <div className="flex items-center space-x-2 text-violet-300">
          <Heart className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Advice for Educators & Parents</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When working with students aged 12–25, encourage them to experiment freely with the typography sliders in the Studio. Research shows that comfortable line height (around 2.0x) and letter spacing (+4% to +6%) have a dramatic impact on reducing eye strain and increasing comprehension speed. Let the student lead their own visual setup.
        </p>
      </div>
    </div>
  );
}

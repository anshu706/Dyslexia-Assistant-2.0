import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  Eye,
  Sliders,
  Volume2,
  CheckCircle2,
  Layers,
  Heart,
  Laptop2,
  Lock,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { InteractiveHero } from '../components/InteractiveHero';

export function Landing({ onLaunchReader, onOpenSettings, reducedMotion = false }) {
  const [activeFeatureTab, setActiveFeatureTab] = useState('speech');

  const features = [
    {
      id: 'speech',
      title: 'Synchronized Speech Engine',
      badge: 'Dual Synchronization',
      icon: Volume2,
      description: 'Listen and follow along effortlessly. Our intelligent dual-mode speech engine pairs native browser synthesis with adaptive word-length timing. Click any word in the text to jump the voice right to it.',
      highlights: [
        'Boundary-accurate word highlighting',
        'Direct click-to-speak jump tokens',
        'Customizable voice, rate, and pitch',
        'Zero audio streaming latency'
      ]
    },
    {
      id: 'bionic',
      title: 'Bionic & Syllable Spacing',
      badge: 'Fixation Anchors',
      icon: Eye,
      description: 'By bolding the initial letters of every word, your brain completes the word using visual-spatial intuition, dramatically lowering the cognitive friction of phonological decoding.',
      highlights: [
        'Smart letter fixation algorithms',
        'Customizable word and letter kerning',
        'Uncluttered, left-aligned typography',
        'Lexend & OpenDyslexic typeface suite'
      ]
    },
    {
      id: 'focus',
      title: 'Interactive Focus Ruler',
      badge: 'Spotlight Guard',
      icon: Layers,
      description: 'Visual crowding and line-skipping disappear. An illuminated reading ruler tracks your mouse or touch movements, gently dimming irrelevant lines above and below your current reading gaze.',
      highlights: [
        'Dynamic cursor & touch tracking',
        'Adjustable spotlight slot height',
        'Single-sentence isolation mode',
        'Completely non-intrusive overlay'
      ]
    },
    {
      id: 'analytics',
      title: 'Private Reading Analytics',
      badge: '100% Local & Private',
      icon: Award,
      description: 'Track your growth with weekly activity bar charts, reading streaks, and word counts. Everything stays securely on your device with schema-versioned local storage.',
      highlights: [
        'Weekly reading velocity charts',
        'Daily reading streak tracker',
        'Comprehensive session logs',
        'Instant Markdown notes export'
      ]
    }
  ];

  const currentFeature = features.find(f => f.id === activeFeatureTab) || features[0];

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Top Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built for Dyslexic Students, Loved by Educators</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.12]"
          >
            Reading made <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              natural, fluid & calm.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Empowering neurodiverse learners with synchronized word-by-word voice tracking, bionic eye anchors, and focus rulers. Zero signups, zero tracking, 100% private.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <motion.button
              whileHover={reducedMotion ? {} : { scale: 1.04 }}
              whileTap={reducedMotion ? {} : { scale: 0.96 }}
              onClick={onLaunchReader}
              className="flex items-center space-x-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 transition-all"
            >
              <span>Launch Reader Now</span>
              <ArrowRight className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </motion.button>

            <motion.button
              whileHover={reducedMotion ? {} : { scale: 1.04 }}
              whileTap={reducedMotion ? {} : { scale: 0.96 }}
              onClick={onOpenSettings}
              className="flex items-center space-x-2 px-6 py-4 rounded-2xl glass-card border border-slate-700/60 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-base transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Customize Typography</span>
            </motion.button>
          </motion.div>

          {/* Quick Metrics Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Lexend & Atkinson Fonts</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero-Backend Privacy</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Offline PWA Ready</span>
            </span>
          </div>
        </div>

        {/* Live Interactive Hero Demo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16"
        >
          <InteractiveHero reducedMotion={reducedMotion} />
        </motion.div>
      </section>

      {/* Interactive Feature Showcase Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Engineered for Effortless Cognition
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Every feature is backed by cognitive reading research to eliminate eye fatigue and phonetic overload.
          </p>
        </div>

        {/* Feature Tab Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {features.map((feat) => {
            const Icon = feat.icon;
            const isActive = activeFeatureTab === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeatureTab(feat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                    : 'glass-card text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{feat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Active Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-700/50 shadow-2xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            <div className="md:col-span-7 space-y-4 text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                {currentFeature.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {currentFeature.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {currentFeature.description}
              </p>
              <ul className="space-y-2 pt-2">
                {currentFeature.highlights.map((h, i) => (
                  <li key={i} className="flex items-center space-x-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 glass-card rounded-2xl border border-cyan-500/20 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <currentFeature.icon className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Tested with dyslexic readers aged 12–25
              </div>
              <button
                onClick={onLaunchReader}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Try In Reader</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* "How Dyslexia Works" Educational Block */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-violet-500/30 shadow-2xl space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-violet-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Cognitive Science Breakdown
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                How Dyslexia Actually Works (And Why You Are Gifted)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-white">Not a Vision Defect</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dyslexia is not "seeing letters backwards." It is a delay in the brain's phonological processing highway—converting written squiggles into rapid auditory speech sounds.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-white">Spatial & Big-Picture Superpower</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Dyslexic brains show elevated 3D spatial reasoning, pattern recognition, and narrative empathy. Architects, innovators, and world-class engineers are disproportionately dyslexic.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-white">The Multi-Sensory Bridge</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When you combine visual bionic anchors with synchronized auditory speech, the brain bypasses the decoding bottleneck. Reading becomes effortless, fast, and joyful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Assurance Badge & Trust Card */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="glass-panel p-8 rounded-3xl border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 flex-shrink-0">
              <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                100% On-Device Privacy Guaranteed
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                Your essays, articles, reading logs, and notes never leave your computer. No accounts, no cookies, no cloud servers, no tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-teal-500/15 text-teal-300 text-xs font-bold border border-teal-400/30 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Offline First</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

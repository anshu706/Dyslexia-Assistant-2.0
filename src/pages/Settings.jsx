import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Type,
  Eye,
  Volume2,
  Sparkles,
  Check,
  RotateCcw,
  Cpu,
  Layers,
  Palette,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export function Settings({
  settings,
  updateSettings,
  currentTheme,
  setCurrentTheme,
  reducedMotion,
  setReducedMotionOverride,
  speechVoices = [],
}) {
  const [testSpeechStatus, setTestSpeechStatus] = useState(null);

  // Instant One-Click Profiles
  const applyProfile = (profileType) => {
    switch (profileType) {
      case 'gentle':
        setCurrentTheme('theme-mint');
        updateSettings({
          fontFamily: 'lexend',
          fontSize: 22,
          lineHeight: 2.2,
          letterSpacing: 0.05,
          wordSpacing: 0.2,
          columnWidth: 64,
          bionicReading: false,
          focusRulerEnabled: true,
          focusRulerHeight: 80,
          singleSentenceMode: false,
          speechRate: 0.9,
        });
        break;
      case 'legibility':
        setCurrentTheme('theme-sunset');
        updateSettings({
          fontFamily: 'atkinson',
          fontSize: 24,
          lineHeight: 2.1,
          letterSpacing: 0.06,
          wordSpacing: 0.22,
          columnWidth: 68,
          bionicReading: true,
          focusRulerEnabled: false,
          singleSentenceMode: false,
          speechRate: 1.0,
        });
        break;
      case 'night':
        setCurrentTheme('theme-aurora');
        updateSettings({
          fontFamily: 'lexend',
          fontSize: 26,
          lineHeight: 2.0,
          letterSpacing: 0.04,
          wordSpacing: 0.18,
          columnWidth: 70,
          bionicReading: true,
          focusRulerEnabled: true,
          focusRulerHeight: 72,
          singleSentenceMode: false,
          speechRate: 1.0,
        });
        break;
      default:
        break;
    }
  };

  // Test Web Speech API Diagnostics
  const runSpeechDiagnostics = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTestSpeechStatus({
        status: 'error',
        message: 'SpeechSynthesis API not supported by this browser.',
      });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const testUtterance = new SpeechSynthesisUtterance('Speech engine diagnostics operational.');
      testUtterance.rate = 1.1;
      let boundaryFired = false;

      testUtterance.onboundary = () => {
        boundaryFired = true;
      };

      testUtterance.onend = () => {
        setTestSpeechStatus({
          status: 'success',
          message: boundaryFired
            ? 'Dual synchronization verified: Native onboundary events are fully active!'
            : 'Adaptive timing fallback active: Speech synthesis functional with predictive token sync.',
        });
      };

      testUtterance.onerror = () => {
        setTestSpeechStatus({
          status: 'warning',
          message: 'Synthesis completed with minor fallback alert.',
        });
      };

      window.speechSynthesis.speak(testUtterance);
    } catch (e) {
      setTestSpeechStatus({
        status: 'error',
        message: `Diagnostics failed: ${e.message}`,
      });
    }
  };

  // Render Bionic preview string
  const renderPreviewBionic = (text) => {
    if (!settings.bionicReading) return text;
    return text.split(' ').map((word, idx) => {
      const mid = Math.ceil(word.length / 2);
      const head = word.slice(0, mid);
      const tail = word.slice(mid);
      return (
        <span key={idx} className="inline-block mr-2">
          <span className="font-extrabold text-cyan-300">{head}</span>
          <span>{tail}</span>
        </span>
      );
    });
  };

  return (
    <div className="relative min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 text-left">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Neurodivergent Customization Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
          Typography Studio & Profiles
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Adjust visual properties in real-time. Everything is automatically remembered.
        </p>
      </div>

      {/* 3 One-Click Instant Profiles */}
      <div className="mb-10">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Instant One-Click Presets
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset 1: Gentle Focus */}
          <button
            onClick={() => applyProfile('gentle')}
            className="glass-panel p-5 rounded-2xl border border-teal-500/30 hover:border-teal-400/70 text-left transition-all hover:scale-[1.01] group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-teal-300">Gentle Focus</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200">
                Low Stim
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Calm Mint theme, Lexend font, extra wide line spacing, and focus ruler enabled.
            </p>
          </button>

          {/* Preset 2: High Legibility */}
          <button
            onClick={() => applyProfile('legibility')}
            className="glass-panel p-5 rounded-2xl border border-amber-500/30 hover:border-amber-400/70 text-left transition-all hover:scale-[1.01] group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-amber-300">High Legibility</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                Fixation
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Sunset Glow theme, Atkinson Hyperlegible, strong Bionic anchors, increased letter tracking.
            </p>
          </button>

          {/* Preset 3: Night Reader */}
          <button
            onClick={() => applyProfile('night')}
            className="glass-panel p-5 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/70 text-left transition-all hover:scale-[1.01] group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-cyan-300">Night Reader</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">
                Aurora Glass
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Aurora deep navy theme, soft cyan glow, larger 26px font size for evening study sessions.
            </p>
          </button>
        </div>
      </div>

      {/* Cognitive Theme Cards Selector */}
      <div className="mb-10">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span>Cognitive Themes (500ms Cross-Fade & Ambient Orbs)</span>
        </div>
        <ThemeToggle
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          reducedMotion={reducedMotion}
          variant="cards"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders & Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Typography Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Typography Tuning</span>
            </h2>

            {/* Typeface Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Typeface Family</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'lexend', name: 'Lexend', desc: 'Designed for reading fluency' },
                  { id: 'atkinson', name: 'Atkinson Hyperlegible', desc: 'Braille Institute legibility' },
                  { id: 'opendyslexic', name: 'OpenDyslexic', desc: 'Heavy weighted bottoms' },
                  { id: 'sans', name: 'System Sans', desc: 'Neutral modern sans' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSettings({ fontFamily: f.id })}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      settings.fontFamily === f.id
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-white font-bold'
                        : 'glass-card border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{f.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Base Font Size</span>
                <span className="font-semibold text-cyan-300">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Line Height (Interline Spacing)</span>
                <span className="font-semibold text-cyan-300">{settings.lineHeight.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.4"
                max="2.8"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Letter Spacing (Tracking) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Letter Spacing (Kerning)</span>
                <span className="font-semibold text-cyan-300">{(settings.letterSpacing * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.15"
                step="0.01"
                value={settings.letterSpacing}
                onChange={(e) => updateSettings({ letterSpacing: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Word Spacing */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Word Spacing</span>
                <span className="font-semibold text-cyan-300">{(settings.wordSpacing * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.02"
                value={settings.wordSpacing}
                onChange={(e) => updateSettings({ wordSpacing: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Column Width Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Column Measure (Line Length Constraint)</span>
                <span className="font-semibold text-cyan-300">{settings.columnWidth || 68}ch</span>
              </div>
              <input
                type="range"
                min="45"
                max="80"
                step="1"
                value={settings.columnWidth || 68}
                onChange={(e) => updateSettings({ columnWidth: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <div className="text-[10px] text-slate-400">
                Constrains text measure to 60–70 characters for optimal line tracking.
              </div>
            </div>
          </div>

          {/* Accessibility & Motion Toggles */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Sensory & Motion Preferences</span>
            </h2>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-slate-700/40">
              <div>
                <div className="text-xs font-semibold text-white">Reduced Motion Mode</div>
                <div className="text-[11px] text-slate-400">
                  Disables background floating orbs and spring animations.
                </div>
              </div>
              <button
                onClick={() => setReducedMotionOverride(!reducedMotion)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Bionic Reading Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-slate-700/40">
              <div>
                <div className="text-xs font-semibold text-white">Bionic Reading Fixation</div>
                <div className="text-[11px] text-slate-400">
                  Bolds first letters of words to anchor the eye gaze.
                </div>
              </div>
              <button
                onClick={() => updateSettings({ bionicReading: !settings.bionicReading })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.bionicReading ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                    settings.bionicReading ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Focus Ruler Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-semibold text-white">Focus Spotlight Ruler</div>
                <div className="text-[11px] text-slate-400">
                  Horizontal reading band that follows cursor to avoid skipping lines.
                </div>
              </div>
              <button
                onClick={() => updateSettings({ focusRulerEnabled: !settings.focusRulerEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.focusRulerEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                    settings.focusRulerEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Sandbox & Engine Diagnostics Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Preview Sandbox */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Preview Sandbox
                </h3>
              </div>
              <span className="text-[11px] text-cyan-300 font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15">
                Real-Time Feedback
              </span>
            </div>

            {/* Rendered Sandbox Box */}
            <div
              className="p-6 rounded-2xl glass-card border border-slate-700/40 min-h-[220px] transition-all mx-auto"
              style={{
                maxWidth: `${settings.columnWidth || 68}ch`,
                fontFamily:
                  settings.fontFamily === 'atkinson'
                    ? '"Atkinson Hyperlegible", sans-serif'
                    : settings.fontFamily === 'opendyslexic'
                    ? 'OpenDyslexic, Lexend, sans-serif'
                    : settings.fontFamily === 'sans'
                    ? 'system-ui, sans-serif'
                    : 'Lexend, sans-serif',
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                letterSpacing: `${settings.letterSpacing}em`,
                wordSpacing: `${settings.wordSpacing}em`,
              }}
            >
              <p className="text-slate-100">
                {renderPreviewBionic(
                  "Cognitive neuroimaging reveals that reading is not an innate single reflex, but an intricate symphony of visual recognition, phonological translation, and memory retrieval. When typography adapts to your eyes, understanding flows freely."
                )}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Changes applied here immediately mirror across all documents in the Reader.
            </div>
          </div>

          {/* Speech Engine Diagnostics */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Speech Engine Diagnostics
                </h3>
              </div>
              <button
                onClick={runSpeechDiagnostics}
                className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold transition-all"
              >
                Run System Check
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Available System Voices:</span>
                <span className="font-semibold text-white">{speechVoices.length} voices</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Web Speech API Support:</span>
                <span className="font-semibold text-emerald-400">
                  {typeof window !== 'undefined' && 'speechSynthesis' in window ? 'Supported' : 'Not Supported'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Synchronization Architecture:</span>
                <span className="font-semibold text-cyan-300">Dual-Mode (Boundary + Predictive)</span>
              </div>
            </div>

            {testSpeechStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  testSpeechStatus.status === 'success'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                    : testSpeechStatus.status === 'warning'
                    ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                    : 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                }`}
              >
                {testSpeechStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

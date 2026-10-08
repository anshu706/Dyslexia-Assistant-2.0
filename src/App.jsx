import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { Navigation } from './components/Navigation';
import { Landing } from './pages/Landing';
import { Reader } from './pages/Reader';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { Footer } from './components/Footer';

const DEFAULT_SETTINGS = {
  fontFamily: 'lexend',
  fontSize: 22,
  lineHeight: 2.0,
  letterSpacing: 0.04,
  wordSpacing: 0.16,
  columnWidth: 68, // characters
  bionicReading: true,
  focusRulerEnabled: false,
  focusRulerHeight: 72,
  singleSentenceMode: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  voiceURI: '',
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('landing');

  // Schema-versioned LocalStorage state
  const [theme, setTheme] = useLocalStorage('dyslexia_theme', 'theme-aurora', 1);
  const [readerSettings, setReaderSettings] = useLocalStorage('dyslexia_settings', DEFAULT_SETTINGS, 1);
  const [sessions, setSessions] = useLocalStorage('dyslexia_sessions', [], 1);
  const [reducedMotionOverride, setReducedMotionOverride] = useLocalStorage('dyslexia_reduced_motion', false, 1);

  // Reduced motion detection
  const prefersReducedMotion = useReducedMotion(reducedMotionOverride);

  // System voices cache for settings diagnostics
  const [speechVoices, setSpeechVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        setSpeechVoices(window.speechSynthesis.getVoices() || []);
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  // Update specific reader settings cleanly
  const updateReaderSettings = (newValues) => {
    setReaderSettings((prev) => ({
      ...prev,
      ...newValues,
    }));
  };

  // Add recorded reading session
  const handleRecordSession = (newSession) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  // Clear session history
  const handleClearSessions = () => {
    setSessions([]);
  };

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.className = theme;
    document.body.className = `${theme} antialiased selection:bg-cyan-500/30 selection:text-cyan-200`;
  }, [theme]);

  // Scroll to top smoothly when changing views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Global keyboard shortcuts (B = toggle bionic, R = toggle ruler)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'b' || e.key === 'B') {
        updateReaderSettings({ bionicReading: !readerSettings.bionicReading });
      } else if (e.key === 'r' || e.key === 'R') {
        updateReaderSettings({ focusRulerEnabled: !readerSettings.focusRulerEnabled });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readerSettings]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${theme} transition-colors duration-500`}>
      {/* Dynamic Floating Ambient Background Glows */}
      {!prefersReducedMotion && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {theme === 'theme-aurora' && (
            <>
              <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-cyan-600/10 blur-[130px] animate-float-slow" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[140px] animate-float-reverse" />
              <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse-glow" />
            </>
          )}

          {theme === 'theme-mint' && (
            <>
              <div className="absolute top-[-5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-teal-300/20 blur-[120px] animate-float-slow" />
              <div className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-emerald-200/25 blur-[120px] animate-float-reverse" />
            </>
          )}

          {theme === 'theme-sunset' && (
            <>
              <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-rose-600/15 blur-[130px] animate-float-slow" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-500/15 blur-[140px] animate-float-reverse" />
              <div className="absolute top-[35%] left-[25%] w-[35vw] h-[35vw] rounded-full bg-purple-700/10 blur-[120px] animate-pulse-glow" />
            </>
          )}
        </div>
      )}

      {/* Top Main Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={theme}
        setCurrentTheme={setTheme}
        reducedMotion={prefersReducedMotion}
      />

      {/* Main Content Area with Page Transitions */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Landing
                onLaunchReader={() => setActiveTab('reader')}
                onOpenSettings={() => setActiveTab('settings')}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}

          {activeTab === 'reader' && (
            <motion.div
              key="reader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Reader
                readerSettings={readerSettings}
                updateReaderSettings={updateReaderSettings}
                onRecordSession={handleRecordSession}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Stats
                sessions={sessions}
                onClearSessions={handleClearSessions}
                onLaunchReader={() => setActiveTab('reader')}
                reducedMotion={prefersReducedMotion}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Settings
                settings={readerSettings}
                updateSettings={updateReaderSettings}
                currentTheme={theme}
                setCurrentTheme={setTheme}
                reducedMotion={prefersReducedMotion}
                setReducedMotionOverride={setReducedMotionOverride}
                speechVoices={speechVoices}
              />
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div
              key="help"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            >
              <Help />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern SaaS Footer */}
      <Footer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reducedMotion={prefersReducedMotion}
      />
    </div>
  );
}

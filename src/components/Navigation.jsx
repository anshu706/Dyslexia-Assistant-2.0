import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Sliders,
  HelpCircle,
  Home,
  Sparkles,
  Volume2,
  Menu,
  X,
  Download,
  Palette,
  Check
} from 'lucide-react';

export const THEMES = [
  { id: 'theme-aurora', name: 'Aurora', subtitle: 'Dark Glassmorphism', icon: '🌌', accent: '#06b6d4' },
  { id: 'theme-mint', name: 'Calm Mint', subtitle: 'Low-Stimulation Light', icon: '🌿', accent: '#0d9488' },
  { id: 'theme-sunset', name: 'Sunset Glow', subtitle: 'Warm High-Contrast', icon: '🌅', accent: '#f59e0b' },
];

export function Navigation({
  activeTab,
  setActiveTab,
  currentTheme,
  setCurrentTheme,
  isPlaying = false,
  reducedMotion = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Home },
    { id: 'reader', label: 'Reader', icon: BookOpen },
    { id: 'stats', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Studio', icon: Sliders },
    { id: 'help', label: 'Shortcuts & FAQ', icon: HelpCircle },
  ];

  const currentThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/30 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => setActiveTab('landing')}>
            <motion.div
              whileHover={reducedMotion ? {} : { scale: 1.05, rotate: 3 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white"
            >
              <BookOpen className="w-5 h-5 text-white stroke-[2.4]" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-cyan-100 to-white bg-clip-text text-transparent">
                  Dyslexia<span className="text-cyan-400 font-extrabold ml-1">Assistant</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                  WCAG AAA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                Fluid Reading Companion
              </p>
            </div>
          </div>

          {/* Desktop Nav Items with Shared Layout Indicator */}
          <nav className="hidden md:flex items-center space-x-1.5 glass-card px-2 py-1.5 rounded-2xl border border-slate-700/30">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 shadow-sm shadow-cyan-500/10"
                      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span className="relative z-10">{item.label}</span>
                  {item.id === 'reader' && isPlaying && (
                    <span className="relative z-10 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Switcher & Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Theme Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl glass-card border border-slate-700/40 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
                title="Change Visual Theme"
                aria-label="Theme selector"
              >
                <span className="text-base">{currentThemeObj.icon}</span>
                <span className="hidden sm:inline">{currentThemeObj.name}</span>
                <Palette className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {themeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setThemeDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 z-50 shadow-2xl border border-slate-700/60"
                    >
                      <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Select Theme
                      </div>
                      {THEMES.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => {
                            setCurrentTheme(th.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all my-0.5 ${
                            currentTheme === th.id
                              ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 font-semibold'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-base">{th.icon}</span>
                            <div>
                              <div className="font-medium text-slate-200">{th.name}</div>
                              <div className="text-[10px] text-slate-400">{th.subtitle}</div>
                            </div>
                          </div>
                          {currentTheme === th.id && (
                            <Check className="w-4 h-4 text-cyan-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <motion.button
                whileHover={reducedMotion ? {} : { scale: 1.04 }}
                whileTap={reducedMotion ? {} : { scale: 0.96 }}
                onClick={handleInstallClick}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
                title="Install offline web app"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </motion.button>
            )}

            {/* Reader Quick Launch CTA */}
            {activeTab !== 'reader' && (
              <motion.button
                whileHover={reducedMotion ? {} : { scale: 1.04 }}
                whileTap={reducedMotion ? {} : { scale: 0.96 }}
                onClick={() => setActiveTab('reader')}
                className="hidden lg:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Open Reader</span>
              </motion.button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass-card text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-slate-700/40 px-4 pt-2 pb-5 space-y-1.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

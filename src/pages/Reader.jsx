import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  FileText,
  Upload,
  Eye,
  Bookmark,
  Highlighter,
  MessageSquare,
  FileDown,
  Trash2,
  Search,
  Maximize2,
  Sparkles,
  ChevronDown,
  Layers,
  Settings2,
  Check,
  Zap,
  AlignLeft,
  X
} from 'lucide-react';
import { useSpeech, tokenizeText } from '../hooks/useSpeech';
import { FocusRuler } from '../components/FocusRuler';

export const SAMPLE_PASSAGES = [
  {
    id: 'science',
    title: 'Oceanic Bioluminescence',
    category: 'Science',
    text: `Deep beneath the ocean surface, where sunlight never pierces the gloom, creatures create their own living light. This phenomenon is called bioluminescence. Tiny lanternfish flash radiant blue patterns along their bellies to blend with the dim surface glow, while the crystal jellyfish radiates emerald pulses through its transparent dome. Biochemical reactions involving luciferin and oxygen ignite without wasting heat, proving that nature is the most efficient lighting engineer on Earth.`
  },
  {
    id: 'fiction',
    title: 'The Clockwork Compass',
    category: 'Fiction',
    text: `The clockwork compass didn't point toward the magnetic north; it pointed toward wherever you were most afraid to go. Kael tightened his leather straps as the brass needle twitched violently, humming with a frequency that resonated in his teeth. Beneath the ancient cogwheels of Eldoria, steam hissed through rusted valves, and the great bronze gears of the chronometer turned with the slow, deliberate inevitability of forgotten time.`
  },
  {
    id: 'history',
    title: 'The Library of Alexandria',
    category: 'History',
    text: `Over two thousand years ago on the sun-drenched Mediterranean coast, the Great Library of Alexandria attempted something unprecedented: gathering every manuscript, scroll, and translation in the known world under a single vaulted roof. Scholars from Athens, Memphis, and Babylon walked through marble peristyles, cataloging celestial charts and Euclid's geometry. Even as empires rose and crumbled, the thirst to preserve human curiosity burned brighter than the Pharos lighthouse itself.`
  },
  {
    id: 'mindfulness',
    title: 'The Forest Canopy Breath',
    category: 'Mindfulness',
    text: `Take a gentle, quiet breath in through your nose, feeling the cool air fill the upper canopy of your chest. As you breathe out, imagine the tension melting down through your shoulders like morning dew sliding off mossy bark. There is no rush to finish this sentence. Your eyes are free to rest on any word for as long as they need. You are present, steady, and completely capable.`
  }
];

export function Reader({
  readerSettings,
  updateReaderSettings,
  onRecordSession,
  reducedMotion = false
}) {
  // Reading content state
  const [currentText, setCurrentText] = useState(SAMPLE_PASSAGES[0].text);
  const [documentTitle, setDocumentTitle] = useState(SAMPLE_PASSAGES[0].title);
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [inputTextVal, setInputTextVal] = useState('');
  const [inputTitleVal, setInputTitleVal] = useState('');

  // Reader Enhancement settings
  const {
    fontFamily = 'lexend',
    fontSize = 22,
    lineHeight = 2.0,
    letterSpacing = 0.04, // em
    wordSpacing = 0.16, // em
    bionicReading = true,
    focusRulerEnabled = false,
    focusRulerHeight = 72,
    singleSentenceMode = false,
    speechRate = 1.0,
    speechPitch = 1.0,
    speechVolume = 1.0,
    voiceURI = '',
  } = readerSettings;

  // Annotations state: highlights, notes, bookmarks
  const [annotations, setAnnotations] = useState([]);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('yellow');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('notes'); // 'notes' | 'tools'
  const [activeWordNote, setActiveWordNote] = useState(null); // { index, word }
  const [noteInputText, setNoteInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Active word tracking for session logging
  const sessionStartTimeRef = useRef(null);
  const sessionWordCountRef = useRef(0);
  const readerContainerRef = useRef(null);

  // Initialize Speech Hook
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    isPlaying,
    isPaused,
    currentWordIndex,
    boundarySupported,
    play,
    pause,
    resume,
    stop,
    jumpToWord,
    tokens
  } = useSpeech({
    text: currentText,
    initialRate: speechRate,
    initialPitch: speechPitch,
    initialVolume: speechVolume,
    onWordChange: (idx) => {
      sessionWordCountRef.current = Math.max(sessionWordCountRef.current, idx + 1);
      // Auto-scroll active word into view smoothly
      if (idx >= 0 && readerContainerRef.current) {
        const wordEl = readerContainerRef.current.querySelector(`[data-word-index="${idx}"]`);
        if (wordEl) {
          wordEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    },
    onFinish: () => {
      recordSessionData();
    }
  });

  // Keep rate / voice in sync with settings
  useEffect(() => {
    setRate(speechRate);
  }, [speechRate, setRate]);

  useEffect(() => {
    if (voiceURI && voices.length > 0) {
      const matched = voices.find(v => v.voiceURI === voiceURI);
      if (matched) setSelectedVoice(matched);
    }
  }, [voiceURI, voices, setSelectedVoice]);

  // Session recording handler
  const recordSessionData = () => {
    if (sessionStartTimeRef.current && sessionWordCountRef.current > 0) {
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
      if (onRecordSession) {
        onRecordSession({
          title: documentTitle,
          wordsRead: sessionWordCountRef.current,
          durationSeconds: elapsedSeconds,
          speedRate: rate,
          timestamp: Date.now(),
        });
      }
    }
    sessionStartTimeRef.current = null;
    sessionWordCountRef.current = 0;
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      pause();
    } else {
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now();
      }
      play();
    }
  };

  const handleStop = () => {
    recordSessionData();
    stop();
  };

  // Switch to one of the pre-loaded sample passages
  const handleLoadSample = (sample) => {
    handleStop();
    setCurrentText(sample.text);
    setDocumentTitle(sample.title);
  };

  // Handle custom text submit
  const handleCustomTextSubmit = (e) => {
    e.preventDefault();
    if (!inputTextVal.trim()) return;
    handleStop();
    setCurrentText(inputTextVal.trim());
    setDocumentTitle(inputTitleVal.trim() || 'Custom Document');
    setCustomInputOpen(false);
    setInputTextVal('');
    setInputTitleVal('');
  };

  // Handle File Upload (.txt)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string' && content.trim()) {
        handleStop();
        setCurrentText(content.trim());
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Annotations helpers
  const handleWordRightClick = (e, index, word) => {
    e.preventDefault();
    setActiveWordNote({ index, word });
    const existing = annotations.find(a => a.wordIndex === index && a.type === 'note');
    setNoteInputText(existing ? existing.text : '');
  };

  const handleAddHighlight = (index, word) => {
    setAnnotations((prev) => {
      // Toggle or change color
      const existingIdx = prev.findIndex(a => a.wordIndex === index && a.type === 'highlight');
      if (existingIdx >= 0) {
        if (prev[existingIdx].color === selectedHighlightColor) {
          // Remove highlight
          return prev.filter((_, i) => i !== existingIdx);
        } else {
          // Update color
          const updated = [...prev];
          updated[existingIdx].color = selectedHighlightColor;
          return updated;
        }
      }
      return [
        ...prev,
        {
          id: `hl-${Date.now()}-${index}`,
          type: 'highlight',
          wordIndex: index,
          word,
          color: selectedHighlightColor,
          timestamp: Date.now(),
        }
      ];
    });
  };

  const handleSaveNote = () => {
    if (!activeWordNote) return;
    if (!noteInputText.trim()) {
      // Remove note
      setAnnotations(prev => prev.filter(a => !(a.wordIndex === activeWordNote.index && a.type === 'note')));
    } else {
      setAnnotations(prev => {
        const filtered = prev.filter(a => !(a.wordIndex === activeWordNote.index && a.type === 'note'));
        return [
          ...filtered,
          {
            id: `note-${Date.now()}-${activeWordNote.index}`,
            type: 'note',
            wordIndex: activeWordNote.index,
            word: activeWordNote.word,
            text: noteInputText.trim(),
            timestamp: Date.now(),
          }
        ];
      });
    }
    setActiveWordNote(null);
    setNoteInputText('');
  };

  const handleAddBookmark = () => {
    const idx = currentWordIndex >= 0 ? currentWordIndex : 0;
    const currentWord = tokens[idx]?.word || 'Start';
    setAnnotations(prev => [
      ...prev,
      {
        id: `bm-${Date.now()}`,
        type: 'bookmark',
        wordIndex: idx,
        word: currentWord,
        timestamp: Date.now(),
      }
    ]);
  };

  // Export Notes as Markdown or Plain Text
  const exportAnnotations = (format = 'md') => {
    if (annotations.length === 0) return;

    let content = '';
    const dateStr = new Date().toLocaleDateString();

    if (format === 'md') {
      content = `# Reading Notes & Highlights: ${documentTitle}\n*Generated by Dyslexia Assistant on ${dateStr}*\n\n`;
      content += `## Highlights\n`;
      const hls = annotations.filter(a => a.type === 'highlight');
      if (hls.length === 0) content += `*None*\n`;
      hls.forEach(h => {
        content += `- **Word ${h.wordIndex + 1}**: "${h.word}" (${h.color})\n`;
      });

      content += `\n## Notes\n`;
      const notes = annotations.filter(a => a.type === 'note');
      if (notes.length === 0) content += `*None*\n`;
      notes.forEach(n => {
        content += `- **On "${n.word}" (Word ${n.wordIndex + 1})**: ${n.text}\n`;
      });

      content += `\n## Bookmarks\n`;
      const bms = annotations.filter(a => a.type === 'bookmark');
      if (bms.length === 0) content += `*None*\n`;
      bms.forEach(b => {
        content += `- Saved bookmark at Word ${b.wordIndex + 1} ("${b.word}")\n`;
      });
    } else {
      content = `READING NOTES: ${documentTitle} (${dateStr})\n\n`;
      annotations.forEach((a, i) => {
        content += `${i + 1}. [${a.type.toUpperCase()}] Word: "${a.word}" | ${a.text || a.color || ''}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle.replace(/\s+/g, '_')}_notes.${format === 'md' ? 'md' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bionic reading word formatter
  const renderBionicWord = (word) => {
    if (!bionicReading) return word;
    const mid = Math.ceil(word.length / 2);
    const head = word.slice(0, mid);
    const tail = word.slice(mid);
    return (
      <>
        <span className="bionic-prefix">{head}</span>
        <span className="bionic-suffix">{tail}</span>
      </>
    );
  };

  // Determine current active sentence index for Single Sentence Mode
  const activeSentenceIndex = useMemo(() => {
    if (currentWordIndex < 0 || !tokens[currentWordIndex]) return -1;
    return tokens[currentWordIndex].sentenceIndex;
  }, [currentWordIndex, tokens]);

  // Highlight colors configuration
  const highlightColors = [
    { id: 'yellow', label: 'Amber Yellow', bgClass: 'hl-yellow', hex: '#eab308' },
    { id: 'cyan', label: 'Electric Cyan', bgClass: 'hl-cyan', hex: '#06b6d4' },
    { id: 'pink', label: 'Rose Pink', bgClass: 'hl-pink', hex: '#ec4899' },
    { id: 'green', label: 'Soft Green', bgClass: 'hl-green', hex: '#22c55e' },
    { id: 'purple', label: 'Violet', bgClass: 'hl-purple', hex: '#a855f7' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-20">
      {/* Focus Ruler Component */}
      <FocusRuler
        enabled={focusRulerEnabled}
        height={focusRulerHeight}
        containerRef={readerContainerRef}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Header & Passage Chooser */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-700/40 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>{documentTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-normal">
                  {tokens.length} words
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Click any word to read from there • Right-click to add a note
              </p>
            </div>
          </div>

          {/* Passage Quick Switcher & Input Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden lg:flex items-center space-x-1.5 glass-card px-2 py-1 rounded-xl border border-slate-700/50">
              <span className="text-[11px] text-slate-400 px-1 font-semibold uppercase">Samples:</span>
              {SAMPLE_PASSAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLoadSample(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    documentTitle === s.title
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {s.category}
                </button>
              ))}
            </div>

            {/* Custom Text Modal Open */}
            <button
              onClick={() => setCustomInputOpen(true)}
              className="px-3 py-1.5 rounded-xl glass-card border border-slate-700/60 hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Text</span>
            </button>

            {/* Upload .txt file */}
            <label className="px-3 py-1.5 rounded-xl glass-card border border-slate-700/60 hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drop File</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Annotations Drawer Toggle */}
            <button
              onClick={() => {
                setDrawerTab('notes');
                setDrawerOpen(!drawerOpen);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                drawerOpen && drawerTab === 'notes'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'glass-card border border-slate-700/60 text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Notes ({annotations.length})</span>
            </button>

            {/* Quick Tools Drawer Toggle */}
            <button
              onClick={() => {
                setDrawerTab('tools');
                setDrawerOpen(!drawerOpen);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                drawerOpen && drawerTab === 'tools'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'glass-card border border-slate-700/60 text-slate-200'
              }`}
              title="Reading Display & Ruler Tools"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>
          </div>
        </div>

        {/* Master Audio & Playback Control Bar */}
        <div className="sticky top-20 z-20 glass-panel p-4 rounded-2xl border border-cyan-500/30 shadow-xl mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Play, Pause, Resume, Stop Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                onClick={handlePlayToggle}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25"
                title={isPlaying ? 'Pause speech' : 'Play / Resume speech'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>{isPaused ? 'Resume' : 'Read Aloud'}</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={handleStop}
                className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-700/60"
                title="Stop and reset speech"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Bookmark Current Word Button */}
              <button
                onClick={handleAddBookmark}
                className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-amber-400 border border-slate-700/60"
                title="Bookmark current reading word"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Speech Rate Slider (0.5x - 2.5x) */}
            <div className="flex items-center space-x-3 glass-card px-3 py-1.5 rounded-xl border border-slate-700/60">
              <span className="text-xs font-semibold text-slate-300 min-w-[54px]">
                {rate.toFixed(1)}x Speed
              </span>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={rate}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setRate(val);
                  updateReaderSettings({ speechRate: val });
                }}
                className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Device Voice Selector Dropdown */}
            <div className="flex items-center space-x-2 max-w-xs">
              <Volume2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <select
                value={selectedVoice?.voiceURI || ''}
                onChange={(e) => {
                  const v = voices.find(voice => voice.voiceURI === e.target.value);
                  if (v) {
                    setSelectedVoice(v);
                    updateReaderSettings({ voiceURI: v.voiceURI });
                  }
                }}
                className="w-full text-xs font-medium bg-slate-900/80 border border-slate-700/70 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 truncate"
              >
                {voices.length === 0 ? (
                  <option value="">Standard Browser Voice</option>
                ) : (
                  voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Reading Quick Toggles: Bionic & Focus Ruler */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateReaderSettings({ bionicReading: !bionicReading })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  bionicReading
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'glass-card border border-slate-700/60 text-slate-400'
                }`}
                title="Bionic Reading guides your eyes to fixate automatically"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Bionic {bionicReading ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => updateReaderSettings({ focusRulerEnabled: !focusRulerEnabled })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  focusRulerEnabled
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/50'
                    : 'glass-card border border-slate-700/60 text-slate-400'
                }`}
                title="Focus ruler follows mouse cursor to isolate lines"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ruler {focusRulerEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => updateReaderSettings({ singleSentenceMode: !singleSentenceMode })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  singleSentenceMode
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-400/50'
                    : 'glass-card border border-slate-700/60 text-slate-400'
                }`}
                title="Single sentence mode isolates only the active sentence"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>1-Sentence</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reader Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Reading Canvas */}
          <div
            ref={readerContainerRef}
            className={`glass-panel p-6 sm:p-10 rounded-3xl border border-slate-700/40 shadow-2xl transition-all ${
              drawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'
            }`}
          >
            {/* Highlighter Color Palette Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-700/30">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Highlight color:</span>
                <div className="flex items-center space-x-1.5">
                  {highlightColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedHighlightColor(color.id)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedHighlightColor === color.id
                          ? 'scale-110 border-white shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Font: <span className="capitalize text-slate-200 font-semibold">{fontFamily}</span> • {fontSize}px
              </div>
            </div>

            {/* Reading Content Canvas with Dynamic Typography Styles */}
            <div
              className="reader-container mx-auto"
              style={{
                fontFamily:
                  fontFamily === 'atkinson'
                    ? '"Atkinson Hyperlegible", sans-serif'
                    : fontFamily === 'opendyslexic'
                    ? 'OpenDyslexic, Lexend, sans-serif'
                    : fontFamily === 'sans'
                    ? 'system-ui, sans-serif'
                    : 'Lexend, sans-serif',
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}em`,
                wordSpacing: `${wordSpacing}em`,
              }}
            >
              {tokens.map((token) => {
                const isActive = currentWordIndex === token.index;
                const highlight = annotations.find(a => a.wordIndex === token.index && a.type === 'highlight');
                const note = annotations.find(a => a.wordIndex === token.index && a.type === 'note');
                const bookmark = annotations.find(a => a.wordIndex === token.index && a.type === 'bookmark');

                // Single Sentence Mode dimming
                const isDimmed = singleSentenceMode && activeSentenceIndex >= 0 && token.sentenceIndex !== activeSentenceIndex;

                let highlightClass = '';
                if (highlight) {
                  highlightClass = `hl-${highlight.color}`;
                }

                return (
                  <span
                    key={`${token.index}-${token.word}`}
                    data-word-index={token.index}
                    onClick={() => jumpToWord(token.index)}
                    onContextMenu={(e) => handleWordRightClick(e, token.index, token.word)}
                    className={`reader-word ${isActive ? 'active-word' : ''} ${highlightClass} ${
                      isDimmed ? 'opacity-20 blur-[0.4px] transition-opacity' : 'opacity-100'
                    }`}
                    title={note ? `Note: ${note.text}` : 'Click to hear • Right-click to annotate'}
                  >
                    {renderBionicWord(token.word)}

                    {/* Bookmark indicator tag */}
                    {bookmark && (
                      <span className="inline-block ml-0.5 text-amber-400 align-super text-[10px]">
                        ★
                      </span>
                    )}

                    {/* Note indicator tag */}
                    {note && (
                      <span className="inline-block ml-0.5 text-cyan-400 align-super text-[10px]">
                        💬
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right Sliding Drawer: Notes & Reading Customizer Tools */}
          <AnimatePresence>
            {drawerOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-slate-700/50 shadow-2xl space-y-5"
              >
                {/* Drawer Header & Tabs */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
                  <div className="flex items-center space-x-1 glass-card p-1 rounded-xl">
                    <button
                      onClick={() => setDrawerTab('notes')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        drawerTab === 'notes'
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Annotations ({annotations.length})
                    </button>
                    <button
                      onClick={() => setDrawerTab('tools')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        drawerTab === 'tools'
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Typography Tools
                    </button>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-lg glass-card text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* TAB 1: Notes & Annotations Drawer */}
                {drawerTab === 'notes' && (
                  <div className="space-y-4">
                    {/* Search & Actions */}
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search notes & words..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/70 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <button
                        onClick={() => exportAnnotations('md')}
                        className="p-2 rounded-xl glass-card text-slate-300 hover:text-white border border-slate-700/60"
                        title="Export notes as Markdown"
                      >
                        <FileDown className="w-4 h-4 text-cyan-400" />
                      </button>
                    </div>

                    {/* Annotation List */}
                    <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                      {annotations.length === 0 ? (
                        <div className="text-center py-10 px-4 glass-card rounded-2xl border border-slate-700/40 text-slate-400 space-y-2">
                          <Highlighter className="w-8 h-8 text-cyan-400/60 mx-auto" />
                          <div className="text-xs font-medium">No annotations yet</div>
                          <div className="text-[11px] text-slate-500">
                            Right-click any word in the text to add a note or click the color palette to highlight.
                          </div>
                        </div>
                      ) : (
                        annotations
                          .filter(a => {
                            if (!searchTerm) return true;
                            const t = searchTerm.toLowerCase();
                            return (a.word && a.word.toLowerCase().includes(t)) || (a.text && a.text.toLowerCase().includes(t));
                          })
                          .map((item) => (
                            <div
                              key={item.id}
                              className="glass-card p-3 rounded-xl border border-slate-700/40 text-left space-y-1.5 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-cyan-300">
                                  {item.type}
                                </span>
                                <button
                                  onClick={() => setAnnotations(prev => prev.filter(x => x.id !== item.id))}
                                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                  title="Delete annotation"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div
                                onClick={() => jumpToWord(item.wordIndex)}
                                className="text-xs font-semibold text-white cursor-pointer hover:text-cyan-300 transition-colors"
                              >
                                Word #{item.wordIndex + 1}: "{item.word}"
                              </div>

                              {item.text && (
                                <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                                  {item.text}
                                </p>
                              )}

                              <div className="text-[10px] text-slate-500">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: Typography & Ruler Tools */}
                {drawerTab === 'tools' && (
                  <div className="space-y-4 text-left">
                    {/* Font Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Typeface</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'lexend', name: 'Lexend' },
                          { id: 'atkinson', name: 'Atkinson' },
                          { id: 'opendyslexic', name: 'OpenDyslexic' },
                          { id: 'sans', name: 'System Sans' },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => updateReaderSettings({ fontFamily: f.id })}
                            className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                              fontFamily === f.id
                                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-bold'
                                : 'glass-card border-slate-700/60 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Font Size</span>
                        <span className="font-semibold text-cyan-300">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="36"
                        value={fontSize}
                        onChange={(e) => updateReaderSettings({ fontSize: parseInt(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                    </div>

                    {/* Line Height Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Line Height</span>
                        <span className="font-semibold text-cyan-300">{lineHeight.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.4"
                        max="2.8"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => updateReaderSettings({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                    </div>

                    {/* Letter Spacing (Tracking) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Letter Spacing</span>
                        <span className="font-semibold text-cyan-300">{(letterSpacing * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.15"
                        step="0.01"
                        value={letterSpacing}
                        onChange={(e) => updateReaderSettings({ letterSpacing: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                    </div>

                    {/* Word Spacing */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>Word Spacing</span>
                        <span className="font-semibold text-cyan-300">{(wordSpacing * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.4"
                        step="0.02"
                        value={wordSpacing}
                        onChange={(e) => updateReaderSettings({ wordSpacing: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                      />
                    </div>

                    {/* Focus Ruler Height */}
                    {focusRulerEnabled && (
                      <div className="space-y-1 pt-2 border-t border-slate-700/40">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Focus Ruler Band Height</span>
                          <span className="font-semibold text-teal-300">{focusRulerHeight}px</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="160"
                          step="4"
                          value={focusRulerHeight}
                          onChange={(e) => updateReaderSettings({ focusRulerHeight: parseInt(e.target.value) })}
                          className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Note Edit Modal Dialog */}
      <AnimatePresence>
        {activeWordNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 rounded-2xl border border-cyan-500/40 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">
                    Annotate Word: "{activeWordNote.word}"
                  </h3>
                </div>
                <button
                  onClick={() => setActiveWordNote(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={3}
                placeholder="Type your notes, definition, or phonetic reminder..."
                value={noteInputText}
                onChange={(e) => setNoteInputText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
                autoFocus
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setActiveWordNote(null)}
                  className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Text Input Modal Dialog */}
      <AnimatePresence>
        {customInputOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 max-w-xl w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Paste Document or Essay</h3>
                </div>
                <button
                  onClick={() => setCustomInputOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Document Title (optional)"
                value={inputTitleVal}
                onChange={(e) => setInputTitleVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400"
              />

              <textarea
                rows={7}
                placeholder="Paste or write any text here to read with synchronized voice..."
                value={inputTextVal}
                onChange={(e) => setInputTextVal(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{inputTextVal.split(/\s+/).filter(Boolean).length} words detected</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCustomInputOpen(false)}
                    className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomTextSubmit}
                    disabled={!inputTextVal.trim()}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
                  >
                    Load into Reader
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

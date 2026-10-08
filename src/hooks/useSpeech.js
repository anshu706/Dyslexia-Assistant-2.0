import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Utility to split text into structured word tokens with character index positions.
 * @param {string} text
 * @returns {Array<{ index: number, word: string, cleanWord: string, charStart: number, charEnd: number, sentenceIndex: number }>}
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];

  const tokens = [];
  const wordRegex = /\S+/g;
  let match;
  let wordIndex = 0;
  let currentSentence = 0;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const charStart = match.index;
    const charEnd = charStart + word.length;
    const cleanWord = word.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '').trim();

    tokens.push({
      index: wordIndex,
      word,
      cleanWord: cleanWord || word,
      charStart,
      charEnd,
      sentenceIndex: currentSentence,
    });

    if (/[.!?][)'"\u201D]?$/.test(word)) {
      currentSentence++;
    }

    wordIndex++;
  }

  return tokens;
}

/**
 * Robust Speech Synthesis hook featuring dual synchronization:
 * 1. Native onboundary event listener with character offset mapping
 * 2. Adaptive timing estimator fallback for voices without boundary dispatch
 */
export function useSpeech({
  text = '',
  onWordChange = null,
  onFinish = null,
  initialRate = 1.0,
  initialPitch = 1.0,
  initialVolume = 1.0,
} = {}) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(initialRate);
  const [pitch, setPitch] = useState(initialPitch);
  const [volume, setVolume] = useState(initialVolume);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [boundarySupported, setBoundarySupported] = useState(false);

  // Reactive token state so consumers re-render when text changes
  const [tokens, setTokens] = useState(() => tokenizeText(text));

  // Refs for values needed inside speech callbacks (avoids stale closures)
  const tokensRef = useRef(tokens);
  const rateRef = useRef(rate);
  const pitchRef = useRef(pitch);
  const volumeRef = useRef(volume);
  const selectedVoiceRef = useRef(selectedVoice);
  const utteranceRef = useRef(null);
  const startIndexRef = useRef(0);
  const boundaryFiredRef = useRef(false);
  const fallbackTimerRef = useRef(null);
  const currentSubIndexRef = useRef(0);
  const voicesLoadedRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { selectedVoiceRef.current = selectedVoice; }, [selectedVoice]);

  // Re-tokenize when text changes
  useEffect(() => {
    const newTokens = tokenizeText(text);
    setTokens(newTokens);
    tokensRef.current = newTokens;
  }, [text]);

  // Load available system voices — only runs once, no infinite loop
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices() || [];
      if (availableVoices.length === 0) return;

      setVoices(availableVoices);

      // Only auto-select a default voice once
      if (!voicesLoadedRef.current) {
        voicesLoadedRef.current = true;
        const preferred =
          availableVoices.find(v =>
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) &&
            v.lang.startsWith('en')
          ) ||
          availableVoices.find(v => v.lang.startsWith('en')) ||
          availableVoices.find(v => v.default) ||
          availableVoices[0];
        setSelectedVoice(preferred || null);
        selectedVoiceRef.current = preferred || null;
      }
    };

    loadVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []); // Empty deps — intentionally run only once

  // Clear fallback timer
  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // Update current word index with callback notification
  const updateActiveWord = useCallback((index) => {
    setCurrentWordIndex(index);
    if (onWordChange) {
      onWordChange(index);
    }
  }, [onWordChange]);

  /**
   * Adaptive Fallback Engine:
   * Predicts duration based on syllables, word length, punctuation, and playback rate.
   */
  const scheduleFallbackStep = useCallback((subTokens, subIdx) => {
    clearFallbackTimer();
    if (subIdx >= subTokens.length) return;

    const currentToken = subTokens[subIdx];
    const globalIndex = startIndexRef.current + subIdx;
    updateActiveWord(globalIndex);
    currentSubIndexRef.current = subIdx;

    const charLen = Math.max(currentToken.cleanWord.length, 2);
    const currentRate = rateRef.current || 1.0;
    let estimatedMs = (charLen * 58 + 90) / currentRate;

    if (/[.!?]$/.test(currentToken.word)) {
      estimatedMs += 350 / currentRate;
    } else if (/[,;:]$/.test(currentToken.word)) {
      estimatedMs += 180 / currentRate;
    }

    fallbackTimerRef.current = setTimeout(() => {
      if (boundaryFiredRef.current) return;
      scheduleFallbackStep(subTokens, subIdx + 1);
    }, estimatedMs);
  }, [clearFallbackTimer, updateActiveWord]);

  // Clean cancel
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearFallbackTimer();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    utteranceRef.current = null;
  }, [clearFallbackTimer]);

  /**
   * Speak from a specific token index — reads rate/pitch/volume from refs
   * so it always uses the latest slider values, not stale closure values.
   */
  const speakFromIndex = useCallback((fromIndex = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this environment.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();
    clearFallbackTimer();

    const allTokens = tokensRef.current;
    if (!allTokens || allTokens.length === 0) return;

    const safeIndex = Math.max(0, Math.min(fromIndex, allTokens.length - 1));
    startIndexRef.current = safeIndex;
    boundaryFiredRef.current = false;

    const subTokens = allTokens.slice(safeIndex);
    const textToSpeak = subTokens.map(t => t.word).join(' ');

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Use refs for latest values — avoids stale closure
    if (selectedVoiceRef.current) utterance.voice = selectedVoiceRef.current;
    utterance.rate = rateRef.current;
    utterance.pitch = pitchRef.current;
    utterance.volume = volumeRef.current;

    // Native boundary event handler
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.charIndex !== undefined) {
        boundaryFiredRef.current = true;
        setBoundarySupported(true);
        clearFallbackTimer();

        const charIdx = event.charIndex;
        let cumulativeChars = 0;
        let matchedSubIndex = 0;

        for (let i = 0; i < subTokens.length; i++) {
          const tokenLen = subTokens[i].word.length;
          if (charIdx >= cumulativeChars && charIdx < cumulativeChars + tokenLen + 1) {
            matchedSubIndex = i;
            break;
          }
          cumulativeChars += tokenLen + 1;
        }

        const globalIdx = startIndexRef.current + matchedSubIndex;
        updateActiveWord(globalIdx);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      updateActiveWord(startIndexRef.current);

      fallbackTimerRef.current = setTimeout(() => {
        if (!boundaryFiredRef.current) {
          scheduleFallbackStep(subTokens, 0);
        }
      }, 250);
    };

    utterance.onend = () => {
      clearFallbackTimer();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      if (onFinish) {
        onFinish();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('[useSpeech] Utterance error:', e.error);
      }
      clearFallbackTimer();
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  }, [clearFallbackTimer, updateActiveWord, scheduleFallbackStep, onFinish]);

  const play = useCallback(() => {
    if (isPaused && typeof window !== 'undefined' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      const resumeIndex = currentWordIndex >= 0 ? currentWordIndex : 0;
      speakFromIndex(resumeIndex);
    }
  }, [isPaused, currentWordIndex, speakFromIndex]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      clearFallbackTimer();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isPlaying, clearFallbackTimer]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      play();
    }
  }, [isPaused, play]);

  const jumpToWord = useCallback((index) => {
    speakFromIndex(index);
  }, [speakFromIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      clearFallbackTimer();
    };
  }, [clearFallbackTimer]);

  return {
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
    tokens, // Reactive state — triggers re-renders when text changes
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Utility to split text into structured word tokens with character index positions.
 * @param {string} text 
 * @returns {Array<{ index: number, word: string, cleanWord: string, charStart: number, charEnd: number, sentenceIndex: number }>}
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];

  const tokens = [];
  // Regex to match words along with adjacent punctuation
  const wordRegex = /\S+/g;
  let match;
  let wordIndex = 0;
  let currentSentence = 0;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const charStart = match.index;
    const charEnd = charStart + word.length;
    // Strip punctuation for clean phonetic matching
    const cleanWord = word.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '').trim();

    tokens.push({
      index: wordIndex,
      word,
      cleanWord: cleanWord || word,
      charStart,
      charEnd,
      sentenceIndex: currentSentence,
    });

    // Check sentence boundary
    if (/[.!?][)'"”’]?$/.test(word)) {
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

  // Tokenized representations
  const tokensRef = useRef([]);
  const utteranceRef = useRef(null);
  const startIndexRef = useRef(0);
  const boundaryFiredRef = useRef(false);
  const fallbackTimerRef = useRef(null);
  const currentSubIndexRef = useRef(0);

  // Keep tokens updated
  useEffect(() => {
    tokensRef.current = tokenizeText(text);
  }, [text]);

  // Load available system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices() || [];
      setVoices(availableVoices);

      // Select default voice (prefer high quality English or system default)
      if (availableVoices.length > 0 && !selectedVoice) {
        const preferred =
          availableVoices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en')) ||
          availableVoices.find(v => v.lang.startsWith('en')) ||
          availableVoices.find(v => v.default) ||
          availableVoices[0];
        setSelectedVoice(preferred);
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
  }, [selectedVoice]);

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

    // Estimate millisecond duration: base 60ms per char + syllable pause, scaled by speech rate
    const charLen = Math.max(currentToken.cleanWord.length, 2);
    let estimatedMs = (charLen * 58 + 90) / (rate || 1.0);

    // Extra pause on punctuation
    if (/[.!?]$/.test(currentToken.word)) {
      estimatedMs += 350 / (rate || 1.0);
    } else if (/[,;:]$/.test(currentToken.word)) {
      estimatedMs += 180 / (rate || 1.0);
    }

    fallbackTimerRef.current = setTimeout(() => {
      // If boundary events started firing natively, cease fallback progression
      if (boundaryFiredRef.current) return;
      scheduleFallbackStep(subTokens, subIdx + 1);
    }, estimatedMs);
  }, [clearFallbackTimer, rate, updateActiveWord]);

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
   * Speak from a specific token index
   */
  const speakFromIndex = useCallback((fromIndex = 0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this environment.');
      return;
    }

    const synth = window.speechSynthesis;
    // Cancel any ongoing speech
    synth.cancel();
    clearFallbackTimer();

    const allTokens = tokensRef.current;
    if (!allTokens || allTokens.length === 0) return;

    const safeIndex = Math.max(0, Math.min(fromIndex, allTokens.length - 1));
    startIndexRef.current = safeIndex;
    boundaryFiredRef.current = false;

    // Subset of tokens to speak
    const subTokens = allTokens.slice(safeIndex);
    const textToSpeak = subTokens.map(t => t.word).join(' ');

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Native boundary event handler
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.charIndex !== undefined) {
        boundaryFiredRef.current = true;
        setBoundarySupported(true);
        clearFallbackTimer();

        // Calculate token index from charIndex
        const charIdx = event.charIndex;
        let cumulativeChars = 0;
        let matchedSubIndex = 0;

        for (let i = 0; i < subTokens.length; i++) {
          const tokenLen = subTokens[i].word.length;
          if (charIdx >= cumulativeChars && charIdx < cumulativeChars + tokenLen + 1) {
            matchedSubIndex = i;
            break;
          }
          cumulativeChars += tokenLen + 1; // +1 for the space
        }

        const globalIdx = startIndexRef.current + matchedSubIndex;
        updateActiveWord(globalIdx);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      updateActiveWord(startIndexRef.current);

      // Give 250ms for native boundary to fire; if none fires, activate fallback engine
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
      // 'canceled' or 'interrupted' is expected when jumping
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('[useSpeech] Utterance error:', e.error);
      }
      clearFallbackTimer();
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  }, [clearFallbackTimer, selectedVoice, rate, pitch, volume, updateActiveWord, scheduleFallbackStep, onFinish]);

  const play = useCallback(() => {
    if (isPaused && window.speechSynthesis.paused) {
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
    tokens: tokensRef.current,
  };
}

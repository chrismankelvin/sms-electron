// src/hooks/useInactivityTimer.js
import { useState, useEffect, useCallback, useRef } from 'react';

const useInactivityTimer = ({
  screensaverTimeout = 30 * 1000,      // 5 minutes
  countdownStartTimeout = 1 * 60 * 1000,  // 14 minutes
  logoutTimeout = 2 * 60 * 1000,          // 15 minutes
  onScreensaverShow,
  onScreensaverHide,
  onCountdownStart,
  onLogout
}) => {
  const [isScreensaverActive, setIsScreensaverActive] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const screensaverTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // 🔥 RESET TIMERS (CORE FIX)
  const resetTimers = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem('last_activity', now.toString());

    // Clear all timers
    clearTimeout(screensaverTimerRef.current);
    clearTimeout(countdownTimerRef.current);
    clearTimeout(logoutTimerRef.current);

    // Reset states
    if (isScreensaverActive) {
      setIsScreensaverActive(false);
      onScreensaverHide?.();
    }
    setIsCountdownActive(false);

    // ✅ Run timers independently (IMPORTANT FIX)

    // 5 min → screensaver
    screensaverTimerRef.current = setTimeout(() => {
      setIsScreensaverActive(true);
      onScreensaverShow?.();
    }, screensaverTimeout);

    // 14 min → countdown
    countdownTimerRef.current = setTimeout(() => {
      setIsCountdownActive(true);
      onCountdownStart?.();
    }, countdownStartTimeout);

    // 15 min → logout
    logoutTimerRef.current = setTimeout(() => {
      onLogout?.();
    }, logoutTimeout);

  }, [
    screensaverTimeout,
    countdownStartTimeout,
    logoutTimeout,
    onScreensaverShow,
    onScreensaverHide,
    onCountdownStart,
    onLogout,
    isScreensaverActive
  ]);

  // Resume (click screensaver)
  const handleResume = useCallback(() => {
    if (isScreensaverActive) {
      setIsScreensaverActive(false);
      setIsCountdownActive(false);
      onScreensaverHide?.();
      resetTimers();
    }
  }, [isScreensaverActive, resetTimers, onScreensaverHide]);

  // Remaining time (for countdown UI)
  const getLogoutTimeRemaining = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastActivityRef.current;
    return Math.max(0, logoutTimeout - elapsed);
  }, [logoutTimeout]);

  // Init
  useEffect(() => {
    const stored = localStorage.getItem('last_activity');

    if (stored) {
      const last = parseInt(stored);
      lastActivityRef.current = last;

      const elapsed = Date.now() - last;

      if (elapsed >= logoutTimeout) {
        onLogout?.();
      } else {
        // Restore correct state
        if (elapsed >= screensaverTimeout) {
          setIsScreensaverActive(true);
          onScreensaverShow?.();
        }

        if (elapsed >= countdownStartTimeout) {
          setIsCountdownActive(true);
          onCountdownStart?.();
        }

        // Restart timers correctly
        screensaverTimerRef.current = setTimeout(() => {
          setIsScreensaverActive(true);
          onScreensaverShow?.();
        }, Math.max(0, screensaverTimeout - elapsed));

        countdownTimerRef.current = setTimeout(() => {
          setIsCountdownActive(true);
          onCountdownStart?.();
        }, Math.max(0, countdownStartTimeout - elapsed));

        logoutTimerRef.current = setTimeout(() => {
          onLogout?.();
        }, Math.max(0, logoutTimeout - elapsed));
      }
    } else {
      resetTimers();
    }

    return () => {
      clearTimeout(screensaverTimerRef.current);
      clearTimeout(countdownTimerRef.current);
      clearTimeout(logoutTimerRef.current);
    };
  }, []);

  return {
    isScreensaverActive,
    isCountdownActive,
    handleResume,
    resetTimers,
    getLogoutTimeRemaining
  };
};

export default useInactivityTimer;
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export type ViolationType = 
  | 'copy' 
  | 'paste' 
  | 'cut' 
  | 'context-menu' 
  | 'screenshot' 
  | 'visibility-change'
  | 'selection';

export interface AntiCheatingConfig {
  disableSelection?: boolean;
  disableCopyPaste?: boolean;
  disableContextMenu?: boolean;
  disableScreenshot?: boolean;
  detectVisibilityChange?: boolean;
  warningThreshold?: number;
  warningTimeWindow?: number;
  onViolation?: (type: ViolationType, count: number) => void;
  onWarningThreshold?: () => void;
}

export interface AntiCheatingState {
  violationCount: number;
  isWarningShown: boolean;
  lastViolationType: ViolationType | null;
  visibilityChangeCount: number;
}

export interface UseAntiCheatingReturn {
  state: AntiCheatingState;
  resetViolations: () => void;
  isProtectionActive: boolean;
}

interface ViolationEvent {
  type: ViolationType;
  timestamp: number;
}

const DEFAULT_CONFIG: Required<Omit<AntiCheatingConfig, 'onViolation' | 'onWarningThreshold'>> = {
  disableSelection: true,
  disableCopyPaste: true,
  disableContextMenu: true,
  disableScreenshot: true,
  detectVisibilityChange: true,
  warningThreshold: 3,
  warningTimeWindow: 30000,
};

export function useAntiCheating(config: AntiCheatingConfig = {}): UseAntiCheatingReturn {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<AntiCheatingState>({
    violationCount: 0,
    isWarningShown: false,
    lastViolationType: null,
    visibilityChangeCount: 0,
  });

  const violationsRef = useRef<ViolationEvent[]>([]);
  const warningTriggeredRef = useRef(false);
  const isActiveRef = useRef(true);


  // Record violation and trigger callbacks
  const recordViolation = useCallback((type: ViolationType) => {
    if (!isActiveRef.current) return;

    const now = Date.now();
    const violation: ViolationEvent = { type, timestamp: now };
    violationsRef.current.push(violation);

    setState(prev => {
      const newCount = prev.violationCount + 1;
      const newVisibilityCount = type === 'visibility-change' 
        ? prev.visibilityChangeCount + 1 
        : prev.visibilityChangeCount;

      return {
        ...prev,
        violationCount: newCount,
        lastViolationType: type,
        visibilityChangeCount: newVisibilityCount,
      };
    });

    // Call onViolation callback
    try {
      config.onViolation?.(type, violationsRef.current.length);
    } catch (e) {
      console.error('Error in onViolation callback:', e);
    }

    // Check warning threshold for visibility changes
    if (type === 'visibility-change' && !warningTriggeredRef.current) {
      const timeWindow = mergedConfig.warningTimeWindow;
      const threshold = mergedConfig.warningThreshold;
      
      const recentViolations = violationsRef.current.filter(
        v => v.type === 'visibility-change' && (now - v.timestamp) <= timeWindow
      );

      if (recentViolations.length >= threshold) {
        warningTriggeredRef.current = true;
        setState(prev => ({ ...prev, isWarningShown: true }));
        try {
          config.onWarningThreshold?.();
        } catch (e) {
          console.error('Error in onWarningThreshold callback:', e);
        }
      }
    }
  }, [config, mergedConfig.warningThreshold, mergedConfig.warningTimeWindow]);

  // Keyboard event handler for clipboard and screenshot shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActiveRef.current) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // Block clipboard shortcuts (Ctrl/Cmd + C, V, X, A)
    if (mergedConfig.disableCopyPaste && ctrlOrCmd) {
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        recordViolation('copy');
        return;
      }
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        recordViolation('paste');
        return;
      }
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        recordViolation('cut');
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        recordViolation('selection');
        return;
      }
    }

    // Block screenshot shortcuts
    if (mergedConfig.disableScreenshot) {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        recordViolation('screenshot');
        return;
      }

      // Windows + Shift + S (Windows Snipping Tool)
      if (e.key === 's' || e.key === 'S') {
        if (e.shiftKey && (e.metaKey || e.getModifierState?.('Meta'))) {
          e.preventDefault();
          recordViolation('screenshot');
          return;
        }
      }

      // Mac: Cmd + Shift + 3 or Cmd + Shift + 4
      if (isMac && e.metaKey && e.shiftKey) {
        if (e.key === '3' || e.key === '4' || e.key === '5') {
          e.preventDefault();
          recordViolation('screenshot');
          return;
        }
      }
    }
  }, [mergedConfig.disableCopyPaste, mergedConfig.disableScreenshot, recordViolation]);

  // Context menu handler
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.disableContextMenu) return;

    e.preventDefault();
    recordViolation('context-menu');
  }, [mergedConfig.disableContextMenu, recordViolation]);

  // Visibility change handler
  const handleVisibilityChange = useCallback(() => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.detectVisibilityChange) return;

    if (document.visibilityState === 'hidden') {
      recordViolation('visibility-change');
    }
  }, [mergedConfig.detectVisibilityChange, recordViolation]);

  // Window blur handler
  const handleWindowBlur = useCallback(() => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.detectVisibilityChange) return;

    recordViolation('visibility-change');
  }, [mergedConfig.detectVisibilityChange, recordViolation]);

  // Selection start handler
  const handleSelectStart = useCallback((e: Event) => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.disableSelection) return;

    e.preventDefault();
  }, [mergedConfig.disableSelection]);

  // Copy event handler (backup for clipboard)
  const handleCopy = useCallback((e: ClipboardEvent) => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.disableCopyPaste) return;

    e.preventDefault();
    recordViolation('copy');
  }, [mergedConfig.disableCopyPaste, recordViolation]);

  // Paste event handler
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.disableCopyPaste) return;

    e.preventDefault();
    recordViolation('paste');
  }, [mergedConfig.disableCopyPaste, recordViolation]);

  // Cut event handler
  const handleCut = useCallback((e: ClipboardEvent) => {
    if (!isActiveRef.current) return;
    if (!mergedConfig.disableCopyPaste) return;

    e.preventDefault();
    recordViolation('cut');
  }, [mergedConfig.disableCopyPaste, recordViolation]);

  // Setup and cleanup event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    isActiveRef.current = true;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy as EventListener, true);
    document.addEventListener('paste', handlePaste as EventListener, true);
    document.addEventListener('cut', handleCut as EventListener, true);

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy as EventListener, true);
      document.removeEventListener('paste', handlePaste as EventListener, true);
      document.removeEventListener('cut', handleCut as EventListener, true);
    };
  }, [handleKeyDown, handleContextMenu, handleVisibilityChange, handleWindowBlur, handleSelectStart, handleCopy, handlePaste, handleCut]);

  // Reset violations function
  const resetViolations = useCallback(() => {
    violationsRef.current = [];
    warningTriggeredRef.current = false;
    setState({
      violationCount: 0,
      isWarningShown: false,
      lastViolationType: null,
      visibilityChangeCount: 0,
    });
  }, []);

  return {
    state,
    resetViolations,
    isProtectionActive: isActiveRef.current,
  };
}

export default useAntiCheating;

"use client";

import { useState, useCallback } from "react";
import L from "leaflet";

export type DrawingTool = 'none' | 'measure';

export interface HistoryEntry {
  vertices: L.LatLng[];
  description: string;
}

export interface DrawingToolsState {
  snapEnabled: boolean;
  rightAngleEnabled: boolean;
  gridEnabled: boolean;
  showMeasurements: boolean;
  showDimensions: boolean; // permanent edge labels on existing zones

  // Undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Measure tool
  activeTool: DrawingTool;
  measurePoints: L.LatLng[];
  measureResult: string | null;
}

export interface DrawingToolsActions {
  toggleSnap: () => void;
  toggleRightAngle: () => void;
  toggleGrid: () => void;
  toggleMeasurements: () => void;
  toggleDimensions: () => void;
  setActiveTool: (tool: DrawingTool) => void;

  pushState: (vertices: L.LatLng[], description: string) => void;
  undo: () => L.LatLng[] | null;
  redo: () => L.LatLng[] | null;
  clearHistory: () => void;

  addMeasurePoint: (point: L.LatLng) => void;
  clearMeasure: () => void;

  reset: () => void;
}

const MAX_HISTORY = 50;

export function useDrawingTools(): [DrawingToolsState, DrawingToolsActions] {
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [rightAngleEnabled, setRightAngleEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(true); // on by default during drawing
  const [showDimensions, setShowDimensions] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('gs-show-dimensions') === 'true';
    return false;
  });

  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushState = useCallback((vertices: L.LatLng[], description: string) => {
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      const next = [...truncated, { vertices: [...vertices], description }];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const undo = useCallback((): L.LatLng[] | null => {
    if (historyIndex <= 0) return null;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return [...history[newIndex].vertices];
  }, [history, historyIndex]);

  const redo = useCallback((): L.LatLng[] | null => {
    if (historyIndex >= history.length - 1) return null;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    return [...history[newIndex].vertices];
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const addMeasurePoint = useCallback((point: L.LatLng) => {
    setMeasurePoints(prev => {
      if (prev.length >= 2) return [point]; // reset if already 2 points
      return [...prev, point];
    });
  }, []);

  const clearMeasure = useCallback(() => {
    setMeasurePoints([]);
    setMeasureResult(null);
  }, []);

  const reset = useCallback(() => {
    setSnapEnabled(false);
    setRightAngleEnabled(false);
    setActiveTool('none');
    clearMeasure();
    clearHistory();
  }, [clearMeasure, clearHistory]);

  const toggleDimensions = useCallback(() => {
    setShowDimensions(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') localStorage.setItem('gs-show-dimensions', String(next));
      return next;
    });
  }, []);

  const state: DrawingToolsState = {
    snapEnabled,
    rightAngleEnabled,
    gridEnabled,
    showMeasurements,
    showDimensions,
    activeTool,
    measurePoints,
    measureResult,
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };

  const actions: DrawingToolsActions = {
    toggleSnap: () => setSnapEnabled(p => !p),
    toggleRightAngle: () => setRightAngleEnabled(p => !p),
    toggleGrid: () => setGridEnabled(p => !p),
    toggleMeasurements: () => setShowMeasurements(p => !p),
    toggleDimensions,
    setActiveTool,
    pushState,
    undo,
    redo,
    clearHistory,
    addMeasurePoint,
    clearMeasure,
    reset,
  };

  return [state, actions];
}

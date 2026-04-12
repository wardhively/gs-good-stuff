"use client";

import { Ruler, Magnet, Grid3x3, Undo2, Redo2, RectangleHorizontal } from "lucide-react";
import type { DrawingToolsState, DrawingToolsActions } from "@/hooks/useDrawingTools";
import { formatArea, formatFeet } from "@/lib/geometry-utils";

interface DrawingToolbarProps {
  state: DrawingToolsState;
  actions: DrawingToolsActions;
  vertexCount: number;
  areaSqFt: number | null;
  perimeterFt: number | null;
  isDrawing: boolean;
}

export default function DrawingToolbar({ state, actions, vertexCount, areaSqFt, perimeterFt, isDrawing }: DrawingToolbarProps) {
  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
        active ? 'bg-leaf text-white shadow-sm' : 'bg-linen/90 text-stone-c border border-fence hover:bg-clay'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[1000]">
      {/* Measurement HUD */}
      {state.showMeasurements && vertexCount >= 3 && areaSqFt != null && perimeterFt != null && isDrawing && (
        <div className="bg-root/80 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-full mb-2 text-center whitespace-nowrap shadow-lg">
          {formatArea(areaSqFt)} · {formatFeet(perimeterFt)}
        </div>
      )}

      {/* Tool buttons */}
      <div className="flex gap-1.5 bg-cream/90 backdrop-blur rounded-xl p-1.5 shadow-lg border border-fence-lt">
        {btn(state.showMeasurements, actions.toggleMeasurements, <Ruler className="w-4 h-4" />, 'Measurements')}
        {btn(state.snapEnabled, actions.toggleSnap, <Magnet className="w-4 h-4" />, 'Snap to Vertex')}
        {btn(state.rightAngleEnabled, actions.toggleRightAngle, <RectangleHorizontal className="w-4 h-4" />, '90° Angles')}
        {btn(state.gridEnabled, actions.toggleGrid, <Grid3x3 className="w-4 h-4" />, 'Grid Overlay')}
        <div className="w-px bg-fence mx-0.5" />
        <button
          onClick={() => { const v = actions.undo(); }}
          disabled={!state.canUndo}
          title="Undo"
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-linen/90 text-stone-c border border-fence hover:bg-clay disabled:opacity-30 transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => { const v = actions.redo(); }}
          disabled={!state.canRedo}
          title="Redo"
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-linen/90 text-stone-c border border-fence hover:bg-clay disabled:opacity-30 transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

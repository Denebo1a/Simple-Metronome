import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronUp, ChevronDown, Volume2 } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  onTogglePlay, 
  bpm, 
  onBpmChange,
  volume,
  onVolumeChange
}) => {
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const handleTap = () => {
    const now = Date.now();
    // Only keep taps within last 2 seconds
    const recentTaps = [...tapTimes, now].filter(t => now - t < 2000);
    setTapTimes(recentTaps);

    if (recentTaps.length > 1) {
      // Calculate average interval
      const intervals = [];
      for (let i = 1; i < recentTaps.length; i++) {
        intervals.push(recentTaps[i] - recentTaps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      if (newBpm >= 30 && newBpm <= 300) {
        onBpmChange(newBpm);
      }
    }
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.min(300, Math.max(30, bpm + delta));
    onBpmChange(newBpm);
  };

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8 w-full">
      
      {/* BPM Display & Slider */}
      <div className="relative group w-full max-w-[280px] sm:max-w-md flex flex-col items-center">
        <div className="flex items-baseline gap-1 mb-2">
            <h1 className="text-6xl sm:text-8xl font-bold text-white tracking-tighter select-none glow-text transition-all">
            {bpm}
            </h1>
            <span className="text-zinc-500 font-mono text-lg sm:text-xl">BPM</span>
        </div>

        <input 
          type="range" 
          min="30" 
          max="300" 
          value={bpm} 
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-cyan-300 transition-all touch-none"
        />
        
        <div className="flex justify-between w-full mt-4 sm:mt-6">
            <button 
                onClick={() => adjustBpm(-1)}
                className="p-2 sm:p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white active:scale-95"
            >
                <ChevronDown size={20} />
            </button>

            <button
                onClick={handleTap}
                className="px-4 sm:px-6 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-primary/50 hover:bg-primary/10 transition-all font-mono text-xs sm:text-sm uppercase tracking-widest active:scale-95 select-none"
            >
                TAP TEMPO
            </button>

            <button 
                onClick={() => adjustBpm(1)}
                className="p-2 sm:p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white active:scale-95"
            >
                <ChevronUp size={20} />
            </button>
        </div>
      </div>

      {/* Main Action Button */}
      <button
        onClick={onTogglePlay}
        className={`
            w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
            ${isPlaying 
                ? 'bg-zinc-800 text-accent shadow-[0_0_30px_rgba(244,114,182,0.15)] scale-95 border border-accent/20' 
                : 'bg-gradient-to-br from-primary to-cyan-700 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 border border-transparent'}
        `}
      >
        {isPlaying ? <Pause size={32} className="sm:w-10 sm:h-10" fill="currentColor" /> : <Play size={32} className="sm:w-10 sm:h-10 ml-1" fill="currentColor" />}
      </button>

      {/* Volume Control */}
      <div className="flex items-center gap-3 w-full max-w-[200px] sm:max-w-xs bg-zinc-900/50 p-2 sm:p-3 rounded-xl border border-white/5">
        <Volume2 size={16} className="text-zinc-500" />
        <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400 hover:accent-white touch-none"
        />
      </div>

    </div>
  );
};

export default Controls;
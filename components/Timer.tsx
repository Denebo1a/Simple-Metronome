import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, X } from 'lucide-react';

interface TimerProps {
  onTimerEnd: () => void;
  isPlaying: boolean;
}

const Timer: React.FC<TimerProps> = ({ onTimerEnd, isPlaying }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds
  const [showInput, setShowInput] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);

  useEffect(() => {
    let interval: number | undefined;

    if (timeLeft !== null && timeLeft > 0 && isPlaying) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            onTimerEnd();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
        setTimeLeft(null);
    }

    return () => clearInterval(interval);
  }, [timeLeft, isPlaying, onTimerEnd]);

  const startTimer = () => {
    setTimeLeft(inputMinutes * 60);
    setShowInput(false);
  };

  const cancelTimer = () => {
    setTimeLeft(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {timeLeft !== null ? (
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full animate-in fade-in slide-in-from-bottom-2">
          <TimerIcon size={14} className="text-primary animate-pulse" />
          <span className="font-mono text-primary font-bold text-xs sm:text-sm">{formatTime(timeLeft)}</span>
          <button onClick={cancelTimer} className="ml-1 text-primary hover:text-white transition-colors p-1">
            <X size={12} />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setShowInput(!showInput)}
          className={`
            p-2 rounded-full transition-all flex items-center gap-2
            ${showInput ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}
          `}
          title="Set Timer"
        >
          <TimerIcon size={20} />
          {showInput && <span className="text-xs font-medium pr-1 hidden sm:inline">Timer</span>}
        </button>
      )}

      {showInput && timeLeft === null && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-xl flex flex-col gap-3 z-50">
            <div className="flex justify-between items-center text-zinc-400 text-xs uppercase font-semibold">
                <span>Duration</span>
                <span className="text-white">{inputMinutes} min</span>
            </div>
            <input 
                type="range"
                min="1"
                max="60"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <button 
                onClick={startTimer}
                className="w-full bg-white text-black py-1.5 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
            >
                Start
            </button>
        </div>
      )}
    </div>
  );
};

export default Timer;
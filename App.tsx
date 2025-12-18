import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RhythmStep, NoteState } from './types';
import { MetronomeEngine } from './services/audioEngine';
import RhythmGrid from './components/RhythmGrid';
import Controls from './components/Controls';
import Timer from './components/Timer';
import { Settings, Info } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

const INITIAL_STEPS: RhythmStep[] = Array(16).fill(null).map((_, i) => ({
  id: i,
  state: i % 4 === 0 ? 'accent' : 'off' // Default 4/4 accent pattern
}));

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [steps, setSteps] = useState<RhythmStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Refs for AudioEngine to access latest state without re-instantiating
  const bpmRef = useRef(bpm);
  const stepsRef = useRef(steps);
  const volumeRef = useRef(volume);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Audio Engine Instance
  const engineRef = useRef<MetronomeEngine | null>(null);

  useEffect(() => {
    engineRef.current = new MetronomeEngine(
      () => bpmRef.current,
      () => stepsRef.current,
      () => volumeRef.current
    );

    engineRef.current.setOnStep((index) => {
      setCurrentStep(index);
    });

    engineRef.current.setOnStop(() => {
        setIsPlaying(false);
        setCurrentStep(0);
    });

    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      engineRef.current?.stop();
      setIsPlaying(false);
    } else {
      engineRef.current?.start();
      setIsPlaying(true);
    }
  };

  const handleTimerEnd = useCallback(() => {
    engineRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const handleStepChange = (index: number, newState: NoteState) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], state: newState };
    setSteps(newSteps);
  };

  const handleStepCountChange = (count: number) => {
      if (count > steps.length) {
          // Add steps
          const added = Array(count - steps.length).fill(null).map((_, i) => ({
              id: steps.length + i,
              state: 'off' as NoteState
          }));
          setSteps([...steps, ...added]);
      } else {
          // Remove steps
          setSteps(steps.slice(0, count));
      }
  };

  const clearPattern = () => {
      setSteps(steps.map(s => ({ ...s, state: 'off' })));
  };

  const resetPattern = () => {
      setSteps(steps.map((s, i) => ({ ...s, state: i % 4 === 0 ? 'accent' : 'off' })));
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans selection:bg-primary/30 overflow-x-hidden">
      
      {/* Header */}
      <header className="px-4 py-4 sm:px-6 sm:py-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse-fast" />
            <span className="font-bold tracking-widest uppercase text-sm text-zinc-400 hidden sm:inline">PulseForge</span>
            <span className="font-bold tracking-widest uppercase text-sm text-zinc-400 sm:hidden">PF</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
            <Timer onTimerEnd={handleTimerEnd} isPlaying={isPlaying} />
            <button className="text-zinc-500 hover:text-white transition-colors p-1"><Settings size={20} /></button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 gap-8 sm:gap-12 w-full max-w-screen-xl mx-auto">
        
        {/* Controls Section */}
        <section className="w-full flex justify-center pt-4 sm:pt-0">
            <Controls 
                isPlaying={isPlaying} 
                onTogglePlay={togglePlay}
                bpm={bpm}
                onBpmChange={setBpm}
                volume={volume}
                onVolumeChange={setVolume}
            />
        </section>

        {/* Editor Section */}
        <section className="w-full max-w-5xl">
            <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-zinc-500 text-[10px] sm:text-xs font-mono tracking-wide">RHYTHM SEQUENCE</h2>
                <div className="flex gap-2 sm:gap-3">
                     <button 
                        onClick={clearPattern}
                        className="text-[10px] font-bold uppercase text-zinc-600 hover:text-red-400 transition-colors p-1"
                     >
                        Clear
                     </button>
                     <span className="text-zinc-800 self-center">|</span>
                     <button 
                        onClick={resetPattern}
                        className="text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-colors p-1"
                     >
                        Reset 4/4
                     </button>
                </div>
            </div>
            <RhythmGrid 
                steps={steps} 
                currentStep={currentStep} 
                onStepChange={handleStepChange}
                onStepCountChange={handleStepCountChange}
                isPlaying={isPlaying}
            />
        </section>

      </main>

      <footer className="p-4 sm:p-6 text-center text-zinc-800 text-[10px] sm:text-xs font-mono">
        PRECISION AUDIO ENGINE v1.0.0
      </footer>
      
      <InstallPrompt />
    </div>
  );
};

export default App;
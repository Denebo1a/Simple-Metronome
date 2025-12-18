import React, { useRef, useEffect } from 'react';
import { RhythmStep, NoteState } from '../types';
import { Plus, Minus, Zap } from 'lucide-react';

interface RhythmGridProps {
  steps: RhythmStep[];
  currentStep: number;
  onStepChange: (index: number, newState: NoteState) => void;
  onStepCountChange: (count: number) => void;
  isPlaying: boolean;
}

const RhythmGrid: React.FC<RhythmGridProps> = ({ 
  steps, 
  currentStep, 
  onStepChange,
  onStepCountChange,
  isPlaying
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current step in view
  useEffect(() => {
    if (isPlaying && scrollRef.current) {
        const container = scrollRef.current;
        const currentElement = container.children[currentStep] as HTMLElement;
        if (currentElement) {
            const containerLeft = container.scrollLeft;
            const containerWidth = container.clientWidth;
            const elLeft = currentElement.offsetLeft;
            const elWidth = currentElement.offsetWidth;

            if (elLeft < containerLeft || elLeft + elWidth > containerLeft + containerWidth) {
                container.scrollTo({
                    left: elLeft - containerWidth / 2 + elWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }
  }, [currentStep, isPlaying]);

  const handleStepClick = (index: number) => {
    const currentState = steps[index].state;
    let nextState: NoteState = 'off';
    
    if (currentState === 'off') nextState = 'on';
    else if (currentState === 'on') nextState = 'accent';
    else if (currentState === 'accent') nextState = 'off';

    onStepChange(index, nextState);
  };

  const getStepColor = (state: NoteState, isActive: boolean) => {
    if (isActive) return 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] border-white';
    
    switch (state) {
      case 'accent':
        return 'bg-accent border-accent shadow-[0_0_10px_rgba(244,114,182,0.4)]';
      case 'on':
        return 'bg-primary border-primary shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      case 'off':
      default:
        return 'bg-surfaceHighlight border-zinc-700 hover:border-zinc-500';
    }
  };

  const getHeight = (state: NoteState) => {
    switch (state) {
      case 'accent': return 'h-20 sm:h-24';
      case 'on': return 'h-14 sm:h-16';
      case 'off': return 'h-8 sm:h-8';
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6 bg-surface/50 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
            <Zap size={14} className="text-primary" /> 
            <span className="hidden sm:inline">Pattern Editor</span>
            <span className="sm:hidden">Pattern</span>
        </h3>
        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
            <button 
                onClick={() => onStepCountChange(Math.max(4, steps.length - 4))}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white active:scale-95"
                aria-label="Decrease steps"
            >
                <Minus size={14} />
            </button>
            <span className="text-xs font-mono text-zinc-300 w-6 sm:w-8 text-center">{steps.length}</span>
            <button 
                onClick={() => onStepCountChange(Math.min(32, steps.length + 4))}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white active:scale-95"
                aria-label="Increase steps"
            >
                <Plus size={14} />
            </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="relative h-32 flex items-end gap-1 sm:gap-2 overflow-x-auto pb-4 scrollbar-hide w-full px-2 mask-linear-fade"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Step Indicators */}
        {steps.map((step, index) => {
            const isActive = isPlaying && currentStep === index;
            // Mark every 4th step for visual reference (beats)
            const isBeat = index % 4 === 0;

            return (
                <div 
                    key={step.id} 
                    className="flex flex-col items-center gap-2 group cursor-pointer relative shrink-0 snap-center"
                    onClick={() => handleStepClick(index)}
                >
                    {/* The Bar */}
                    <div 
                        className={`
                            w-5 sm:w-8 md:w-10 rounded-t-sm transition-all duration-150 ease-out border-t border-x
                            ${getStepColor(step.state, isActive)} 
                            ${getHeight(step.state)}
                        `}
                    />
                    
                    {/* Grid marker */}
                    <div className={`
                        w-1 h-1 rounded-full 
                        ${isActive ? 'bg-white' : isBeat ? 'bg-zinc-500' : 'bg-zinc-800'}
                    `} />
                    
                    {/* Number label for every 4th */}
                    {isBeat && (
                        <span className="absolute -bottom-6 text-[10px] text-zinc-600 font-mono">
                            {(index / 4) + 1}
                        </span>
                    )}
                </div>
            );
        })}
      </div>
      
      <div className="flex justify-center gap-4 text-[10px] text-zinc-500 font-mono mt-0 sm:mt-2">
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-surfaceHighlight border border-zinc-700"></div> OFF</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary"></div> NOTE</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent"></div> ACCENT</div>
      </div>
    </div>
  );
};

export default RhythmGrid;
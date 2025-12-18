import { NoteState, RhythmStep } from '../types';

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentStepIndex: number = 0;
  private nextNoteTime: number = 0.0;
  private timerID: number | null = null;
  private lookahead: number = 25.0; // How frequently to call scheduling function (in milliseconds)
  private scheduleAheadTime: number = 0.1; // How far ahead to schedule audio (in seconds)

  // Callbacks for UI updates
  private onStepCallback: ((stepIndex: number) => void) | null = null;
  private onStopCallback: (() => void) | null = null;

  // State refs (passed from React)
  private getBpm: () => number;
  private getSteps: () => RhythmStep[];
  private getVolume: () => number;

  constructor(
    getBpm: () => number, 
    getSteps: () => RhythmStep[],
    getVolume: () => number
  ) {
    this.getBpm = getBpm;
    this.getSteps = getSteps;
    this.getVolume = getVolume;
  }

  public setOnStep(callback: (stepIndex: number) => void) {
    this.onStepCallback = callback;
  }

  public setOnStop(callback: () => void) {
    this.onStopCallback = callback;
  }

  public start() {
    if (this.isPlaying) return;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.currentStepIndex = 0;
    this.nextNoteTime = this.audioContext.currentTime;
    
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.onStopCallback) {
      this.onStopCallback();
    }
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  private nextNote() {
    const bpm = this.getBpm();
    // Calculate time per 16th note (assuming grid is 16th notes)
    // 60 seconds / BPM = seconds per beat (quarter note)
    // seconds per beat / 4 = seconds per 16th note
    const secondsPerBeat = 60.0 / bpm;
    const secondsPer16th = secondsPerBeat / 4; 

    this.nextNoteTime += secondsPer16th;

    // Advance the beat number, wrap to zero
    const steps = this.getSteps();
    this.currentStepIndex++;
    if (this.currentStepIndex >= steps.length) {
      this.currentStepIndex = 0;
    }
  }

  private scheduleNote(stepIndex: number, time: number) {
    if (!this.audioContext) return;

    const steps = this.getSteps();
    // Safety check if steps changed size dynamically
    if (stepIndex >= steps.length) return;
    
    const step = steps[stepIndex];

    // Push visual update to the main thread event loop
    // We use a draw callback synchronized visually, but triggered by the audio scheduler
    // For tighter visual sync, requestAnimationFrame is often used, but this is sufficient for a metronome
    // unless extreme precision is needed for visuals.
    // To better sync visuals, we'd use a separate visual loop reading audioContext.currentTime.
    // For this implementation, we'll dispatch immediately as it's close enough for 99% of web use cases.
    const timeUntilNote = time - this.audioContext.currentTime;
    setTimeout(() => {
        if(this.onStepCallback) this.onStepCallback(stepIndex);
    }, Math.max(0, timeUntilNote * 1000));

    if (step.state === 'off') return;

    // Create Sound
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (step.state === 'accent') {
      osc.frequency.value = 1200; 
      osc.type = 'square'; // Sharper attack for accent
      // Filter for accent to make it less harsh
      // (Simplified: just volume diff)
      gainNode.gain.value = this.getVolume();
    } else {
      osc.frequency.value = 800;
      osc.type = 'sine';
      gainNode.gain.value = this.getVolume() * 0.6;
    }

    // Envelope
    osc.start(time);
    osc.stop(time + 0.05); // Short click
    
    // Quick decay to avoid clicking artifacts
    gainNode.gain.setValueAtTime(gainNode.gain.value, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  }

  private scheduler() {
    if (!this.audioContext) return;

    // while there are notes that will play this time interval, schedule them
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStepIndex, this.nextNoteTime);
      this.nextNote();
    }

    if (this.isPlaying) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }
}

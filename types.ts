export type NoteState = 'off' | 'on' | 'accent';

export interface RhythmStep {
  id: number;
  state: NoteState;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface AudioSettings {
  masterVolume: number;
  pitchStandard: number; // Hz, e.g., 440
}

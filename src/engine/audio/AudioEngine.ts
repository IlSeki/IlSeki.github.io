import * as Tone from "tone";
import { PowerupType, DebuffType } from "@/types/game";
import * as sounds from "./sounds";

/**
 * Singleton AudioEngine wrapper using Tone.js to synthesize game sound effects.
 */
export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private muted: boolean = false;
  private initialized: boolean = false;
  private ambientHumMuted: boolean = false;

  private collisionSynth: any = null;
  private powerupSynth: any = null;
  private debuffSynth: any = null;
  private ambientOsc: any = null;
  private ambientLfo: any = null;
  private ambientVolume: any = null;
  private reverb: any = null;
  private countdownSynth: any = null;
  private bumperSynth: any = null;
  private warpSynth: any = null;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initializes synths. Must be triggered from a user gesture in the browser.
   */
  public init(): void {
    if (typeof window === "undefined" || this.initialized) return;
    try {
      this.collisionSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();

      this.bumperSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 }
      }).toDestination();

      this.warpSynth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 10,
        envelope: { attack: 0.05, decay: 0.2, sustain: 0 }
      }).toDestination();

      this.powerupSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2 }
      }).toDestination();

      this.debuffSynth = new Tone.FMSynth({
        harmonicity: 0.5,
        modulationIndex: 5,
        envelope: { attack: 0.05, decay: sounds.DEBUFF_DURATION, sustain: 0 }
      }).toDestination();

      this.countdownSynth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
      }).toDestination();

      this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();
      this.powerupSynth.connect(this.reverb);

      this.ambientVolume = new Tone.Volume(-25).toDestination();
      this.ambientOsc = new Tone.Oscillator(sounds.AMBIENT_OSC_FREQ, "sine");
      this.ambientOsc.connect(this.ambientVolume);

      this.ambientLfo = new Tone.LFO(sounds.AMBIENT_LFO_FREQ, -40, -20);
      this.ambientLfo.connect(this.ambientVolume.volume);

      this.initialized = true;
    } catch (e) {
      console.error("AudioEngine initialization failed:", e);
    }
  }

  public playCollision(intensity: number): void {
    if (this.muted || !this.initialized) return;
    try {
      const db = Tone.gainToDb(Math.max(intensity * 0.4, 0.01));
      this.collisionSynth.volume.value = db;
      this.collisionSynth.triggerAttackRelease(sounds.COLLISION_FREQ_START, sounds.COLLISION_DURATION);
      this.collisionSynth.frequency.exponentialRampToValueAtTime(
        sounds.COLLISION_FREQ_END,
        Tone.now() + sounds.COLLISION_DURATION
      );
    } catch {}
  }

  public playSkibidi(): void {
    if (this.muted || !this.initialized) return;
    try {
      const now = Tone.now();
      const synth = new Tone.MonoSynth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
      }).toDestination();
      synth.volume.value = -12;
      synth.triggerAttack("F4", now);
      synth.frequency.setValueAtTime("F4", now);
      synth.frequency.exponentialRampToValueAtTime("C5", now + 0.08);
      synth.frequency.exponentialRampToValueAtTime("G4", now + 0.15);
      synth.triggerRelease(now + 0.2);
      setTimeout(() => synth.dispose(), 500);
    } catch {}
  }

  public playHawkTuah(): void {
    if (this.muted || !this.initialized) return;
    try {
      const now = Tone.now();
      const noise = new Tone.NoiseSynth({
        noise: { type: "pink" },
        envelope: { attack: 0.005, decay: 0.08, sustain: 0 }
      }).toDestination();
      noise.volume.value = -14;
      
      const poly = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 0.15, sustain: 0 }
      }).toDestination();
      poly.volume.value = -12;

      noise.triggerAttack(now);
      poly.triggerAttackRelease("C6", 0.1, now + 0.05);
      poly.frequency.exponentialRampToValueAtTime("F4", now + 0.15);

      setTimeout(() => {
        noise.dispose();
        poly.dispose();
      }, 500);
    } catch {}
  }

  public playGyatt(): void {
    if (this.muted || !this.initialized) return;
    try {
      const now = Tone.now();
      const synth = new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.4, sustain: 0 }
      }).toDestination();
      synth.volume.value = -4; 
      synth.triggerAttack("C2", now);
      synth.frequency.exponentialRampToValueAtTime("C1", now + 0.3);
      synth.triggerRelease(now + 0.4);
      setTimeout(() => synth.dispose(), 600);
    } catch {}
  }

  public playRizz(): void {
    if (this.muted || !this.initialized) return;
    try {
      const now = Tone.now();
      const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0 }
      }).toDestination();
      synth.volume.value = -10;
      synth.triggerAttackRelease("G5", 0.15, now);
      synth.frequency.exponentialRampToValueAtTime("D6", now + 0.12);
      setTimeout(() => synth.dispose(), 400);
    } catch {}
  }

  public playSigma(): void {
    if (this.muted || !this.initialized) return;
    try {
      const now = Tone.now();
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.05, decay: 0.6, sustain: 0.4, release: 0.2 }
      }).toDestination();
      synth.volume.value = -8;
      synth.triggerAttackRelease(["C3", "E3", "G3"], 0.4, now);
      setTimeout(() => synth.dispose(), 1000);
    } catch {}
  }

  public playTrampoline(): void {
    if (this.muted || !this.initialized) return;
    try {
      this.playSigma();
    } catch {}
  }

  public playBumper(): void {
    if (this.muted || !this.initialized) return;
    try {
      const rand = Math.random();
      if (rand < 0.25) {
        this.playSkibidi();
      } else if (rand < 0.50) {
        this.playHawkTuah();
      } else if (rand < 0.70) {
        this.playGyatt();
      } else {
        this.bumperSynth.volume.value = -6;
        this.bumperSynth.triggerAttackRelease("E5", 0.1);
      }
    } catch {}
  }

  public playWarp(): void {
    if (this.muted || !this.initialized) return;
    try {
      if (Math.random() < 0.6) {
        this.playRizz();
      } else {
        this.warpSynth.volume.value = -12;
        this.warpSynth.triggerAttack("C4");
        this.warpSynth.frequency.exponentialRampToValueAtTime("C6", Tone.now() + 0.25);
        this.warpSynth.triggerRelease(Tone.now() + 0.25);
      }
    } catch {}
  }

  public playPowerup(type: PowerupType): void {
    if (this.muted || !this.initialized) return;
    try {
      this.powerupSynth.volume.value = -8;
      const now = Tone.now();
      sounds.POWERUP_ARPEGGIO.forEach((note, idx) => {
        this.powerupSynth.triggerAttackRelease(
          note,
          sounds.POWERUP_NOTE_DURATION,
          now + idx * sounds.POWERUP_NOTE_DURATION
        );
      });
    } catch {}
  }

  public playDebuff(type: DebuffType): void {
    if (this.muted || !this.initialized) return;
    try {
      this.debuffSynth.volume.value = -6;
      const now = Tone.now();
      this.debuffSynth.triggerAttack(sounds.DEBUFF_GLISSANDO_START, now);
      this.debuffSynth.frequency.exponentialRampToValueAtTime(
        sounds.DEBUFF_GLISSANDO_END,
        now + sounds.DEBUFF_DURATION
      );
      this.debuffSynth.triggerRelease(now + sounds.DEBUFF_DURATION);
    } catch {}
  }

  public playCountdown(n: number): void {
    if (this.muted || !this.initialized) return;
    try {
      this.countdownSynth.volume.value = -8;
      if (n === 0) {
        this.countdownSynth.triggerAttackRelease("C5", 0.4);
      } else {
        this.countdownSynth.triggerAttackRelease("C4", 0.15);
      }
    } catch {}
  }

  public playFinish(rank: number): void {
    if (this.muted || !this.initialized) return;
    try {
      this.powerupSynth.volume.value = -6;
      const now = Tone.now();
      let notes = sounds.FINISH_FANFARE_OTHER;
      if (rank === 1) notes = sounds.FINISH_FANFARE_1ST;
      else if (rank === 2) notes = sounds.FINISH_FANFARE_2ND;
      else if (rank === 3) notes = sounds.FINISH_FANFARE_3RD;

      notes.forEach((note, idx) => {
        const startOffset = idx * 0.15;
        const duration = sounds.FINISH_NOTE_DURATIONS[idx];
        this.powerupSynth.triggerAttackRelease(note, duration, now + startOffset);
      });
    } catch {}
  }

  public startAmbient(): void {
    if (this.muted || !this.initialized || this.ambientHumMuted) return;
    try {
      Tone.start();
      this.ambientOsc.start();
      this.ambientLfo.start();
    } catch {}
  }

  public stopAmbient(): void {
    if (!this.initialized) return;
    try {
      this.ambientOsc.stop();
      this.ambientLfo.stop();
    } catch {}
  }

  public setAmbientHumMuted(muted: boolean): void {
    this.ambientHumMuted = muted;
    if (!this.initialized) return;
    try {
      if (muted) {
        this.ambientOsc.stop();
        this.ambientLfo.stop();
      } else {
        if (!this.muted) {
          Tone.start();
          this.ambientOsc.start();
          this.ambientLfo.start();
        }
      }
    } catch {}
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.initialized) {
      Tone.Destination.mute = muted;
      if (muted) {
        this.ambientOsc.stop();
        this.ambientLfo.stop();
      } else if (!this.ambientHumMuted) {
        try {
          Tone.start();
          this.ambientOsc.start();
          this.ambientLfo.start();
        } catch {}
      }
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
export default audioEngine;

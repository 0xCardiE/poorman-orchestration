import { MATCH } from '../config/constants';

export class MatchTimer {
  remaining: number;
  private running = false;

  constructor() {
    this.remaining = MATCH.durationSeconds;
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  reset(): void {
    this.remaining = MATCH.durationSeconds;
    this.running = false;
  }

  update(deltaSec: number): void {
    if (!this.running) return;
    this.remaining = Math.max(0, this.remaining - deltaSec);
  }

  isFinished(): boolean {
    return this.remaining <= 0;
  }

  formatTime(): string {
    const m = Math.floor(this.remaining / 60);
    const s = Math.floor(this.remaining % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

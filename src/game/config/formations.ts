import { PITCH_WIDTH, PITCH_HEIGHT, PITCH_MARGIN_X, PITCH_MARGIN_Y } from './constants';

/** Normalized position 0–1 from left to right, 0–1 from top to bottom */
export type FormationSlot = { x: number; y: number; role: 'def' | 'mid' | 'att' };

/** Formation name and relative positions (0–1) for 5 outfield players */
export const FORMATIONS: Record<string, FormationSlot[]> = {
  '2-1-2': [
    { x: 0.22, y: 0.4, role: 'def' },
    { x: 0.22, y: 0.6, role: 'def' },
    { x: 0.5, y: 0.5, role: 'mid' },
    { x: 0.78, y: 0.35, role: 'att' },
    { x: 0.78, y: 0.65, role: 'att' },
  ],
  '3-1-1': [
    { x: 0.2, y: 0.3, role: 'def' },
    { x: 0.2, y: 0.5, role: 'def' },
    { x: 0.2, y: 0.7, role: 'def' },
    { x: 0.5, y: 0.5, role: 'mid' },
    { x: 0.82, y: 0.5, role: 'att' },
  ],
  '2-2-1': [
    { x: 0.25, y: 0.4, role: 'def' },
    { x: 0.25, y: 0.6, role: 'def' },
    { x: 0.55, y: 0.35, role: 'mid' },
    { x: 0.55, y: 0.65, role: 'mid' },
    { x: 0.85, y: 0.5, role: 'att' },
  ],
};

export function formationToWorldPositions(
  formationKey: string,
  attackingRight: boolean
): { x: number; y: number; role: 'def' | 'mid' | 'att' }[] {
  const slots = FORMATIONS[formationKey] ?? FORMATIONS['2-1-2'];
  return slots.map((s) => {
    let x = PITCH_MARGIN_X + s.x * PITCH_WIDTH;
    let y = PITCH_MARGIN_Y + s.y * PITCH_HEIGHT;
    if (!attackingRight) {
      x = PITCH_MARGIN_X + PITCH_WIDTH - (x - PITCH_MARGIN_X);
    }
    return { x, y, role: s.role };
  });
}

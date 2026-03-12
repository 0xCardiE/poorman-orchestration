import type { ActorState, Vector2 } from '../entities/types';
import { clamp, normalize } from '../../utils/vector';

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function moveActor(
  actor: ActorState,
  input: Vector2,
  deltaSeconds: number,
  bounds: Bounds,
): void {
  const direction = normalize(input);

  actor.position.x += direction.x * actor.speed * deltaSeconds;
  actor.position.y += direction.y * actor.speed * deltaSeconds;

  actor.position.x = clamp(
    actor.position.x,
    bounds.left + actor.radius,
    bounds.right - actor.radius,
  );
  actor.position.y = clamp(
    actor.position.y,
    bounds.top + actor.radius,
    bounds.bottom - actor.radius,
  );

  if (direction.x !== 0 || direction.y !== 0) {
    actor.facing = direction;
  }
}

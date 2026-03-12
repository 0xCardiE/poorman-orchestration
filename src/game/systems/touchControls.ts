import type { PlayerActionInput } from "./playerInput";
import type { PlayerMovementInput } from "./playerMovement";
import {
  TOUCH_STICK_DEAD_ZONE,
  TOUCH_STICK_TRAVEL_RATIO
} from "../config/touchControls";

const NEUTRAL_MOVEMENT_INPUT: PlayerMovementInput = {
  down: false,
  left: false,
  right: false,
  up: false
};

type TouchControlsActions = {
  onMenu: () => void;
};

type TouchControlsState = {
  movement: PlayerMovementInput;
  passQueued: boolean;
  shootQueued: boolean;
};

export type TouchControls = {
  destroy: () => void;
  readActionInput: () => PlayerActionInput;
  readMovementInput: () => PlayerMovementInput;
  setVisible: (visible: boolean) => void;
};

export const shouldEnableTouchControls = (
  currentWindow: Pick<Window, "matchMedia"> | undefined = globalThis.window,
  currentNavigator: Pick<Navigator, "maxTouchPoints"> | undefined = globalThis.navigator
): boolean => {
  const coarsePointer = typeof currentWindow?.matchMedia === "function"
    ? currentWindow.matchMedia("(pointer: coarse)").matches
    : false;
  const touchPoints = (currentNavigator?.maxTouchPoints ?? 0) > 0;

  return coarsePointer || touchPoints;
};

export const getTouchMovementInput = (
  offsetX: number,
  offsetY: number,
  deadZone: number = TOUCH_STICK_DEAD_ZONE
): PlayerMovementInput => ({
  up: offsetY <= -deadZone,
  down: offsetY >= deadZone,
  left: offsetX <= -deadZone,
  right: offsetX >= deadZone
});

export const createTouchControls = (
  parent: HTMLElement | null,
  actions: TouchControlsActions
): TouchControls | null => {
  if (!parent || !shouldEnableTouchControls()) {
    return null;
  }

  const state: TouchControlsState = {
    movement: { ...NEUTRAL_MOVEMENT_INPUT },
    passQueued: false,
    shootQueued: false
  };

  const layer = document.createElement("div");
  layer.className = "touch-controls";

  const menuButton = createButton("touch-controls__button touch-controls__button--menu", "Menu");
  const movementPad = document.createElement("div");
  movementPad.className = "touch-controls__stick";

  const movementBase = document.createElement("div");
  movementBase.className = "touch-controls__stick-base";
  const movementThumb = document.createElement("div");
  movementThumb.className = "touch-controls__stick-thumb";
  movementPad.append(movementBase, movementThumb);

  const actionGroup = document.createElement("div");
  actionGroup.className = "touch-controls__actions";

  const passButton = createButton("touch-controls__button touch-controls__button--pass", "Pass");
  const shootButton = createButton("touch-controls__button touch-controls__button--shoot", "Shoot");
  actionGroup.append(passButton, shootButton);

  layer.append(menuButton, movementPad, actionGroup);
  parent.append(layer);

  let movementPointerId: number | null = null;

  const queuePass = (event: PointerEvent): void => {
    event.preventDefault();
    state.passQueued = true;
  };

  const queueShoot = (event: PointerEvent): void => {
    event.preventDefault();
    state.shootQueued = true;
  };

  const pressMenu = (event: PointerEvent): void => {
    event.preventDefault();
    actions.onMenu();
  };

  const updateMovement = (event: PointerEvent): void => {
    const rect = movementPad.getBoundingClientRect();
    const radius = (Math.min(rect.width, rect.height) / 2) * TOUCH_STICK_TRAVEL_RATIO;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const magnitude = Math.hypot(rawX, rawY) || 1;
    const limitedDistance = Math.min(magnitude, radius);
    const clampedX = (rawX / magnitude) * limitedDistance;
    const clampedY = (rawY / magnitude) * limitedDistance;

    movementThumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    state.movement = getTouchMovementInput(
      radius === 0 ? 0 : clampedX / radius,
      radius === 0 ? 0 : clampedY / radius
    );
  };

  const resetMovement = (): void => {
    movementPointerId = null;
    movementThumb.style.transform = "translate(0, 0)";
    state.movement = { ...NEUTRAL_MOVEMENT_INPUT };
  };

  const startMovement = (event: PointerEvent): void => {
    event.preventDefault();
    movementPointerId = event.pointerId;
    movementPad.setPointerCapture(event.pointerId);
    updateMovement(event);
  };

  const moveMovement = (event: PointerEvent): void => {
    if (movementPointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    updateMovement(event);
  };

  const endMovement = (event: PointerEvent): void => {
    if (movementPointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    if (movementPad.hasPointerCapture(event.pointerId)) {
      movementPad.releasePointerCapture(event.pointerId);
    }
    resetMovement();
  };

  movementPad.addEventListener("pointerdown", startMovement);
  movementPad.addEventListener("pointermove", moveMovement);
  movementPad.addEventListener("pointerup", endMovement);
  movementPad.addEventListener("pointercancel", endMovement);
  movementPad.addEventListener("lostpointercapture", resetMovement);
  passButton.addEventListener("pointerdown", queuePass);
  shootButton.addEventListener("pointerdown", queueShoot);
  menuButton.addEventListener("pointerup", pressMenu);

  return {
    destroy: () => {
      movementPad.removeEventListener("pointerdown", startMovement);
      movementPad.removeEventListener("pointermove", moveMovement);
      movementPad.removeEventListener("pointerup", endMovement);
      movementPad.removeEventListener("pointercancel", endMovement);
      movementPad.removeEventListener("lostpointercapture", resetMovement);
      passButton.removeEventListener("pointerdown", queuePass);
      shootButton.removeEventListener("pointerdown", queueShoot);
      menuButton.removeEventListener("pointerup", pressMenu);
      layer.remove();
    },
    readActionInput: (): PlayerActionInput => {
      const actionInput = {
        pass: state.passQueued,
        shoot: state.shootQueued
      };

      state.passQueued = false;
      state.shootQueued = false;

      return actionInput;
    },
    readMovementInput: (): PlayerMovementInput => state.movement,
    setVisible: (visible: boolean): void => {
      layer.hidden = !visible;
    }
  };
};

const createButton = (className: string, label: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.textContent = label;

  return button;
};

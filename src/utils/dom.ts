export const getRequiredElement = (elementId: string): HTMLElement => {
  const element = document.getElementById(elementId);

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Missing required element: #${elementId}`);
  }

  return element;
};

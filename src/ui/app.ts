export function createAppShell(): string {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    throw new Error('App root not found');
  }

  app.innerHTML = `
    <main class="app-shell">
      <header class="app-header">
        <h1>Browser Football Game</h1>
        <p>Arcade football for short browser sessions.</p>
      </header>
      <section id="game-root" class="game-root" aria-label="Game canvas"></section>
    </main>
  `;

  return 'game-root';
}

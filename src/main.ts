/**
 * DROP CAST: Music Hustle
 * Entry point
 */

import { Game } from './Game';

function showDebug(msg: string) {
  const el = document.getElementById('error-display');
  if (el) {
    el.style.display = 'block';
    el.style.background = 'rgba(0,100,200,0.9)';
    el.innerHTML += msg + '<br>';
  }
  console.log(msg);
}

async function main() {
  showDebug('1. main() started');

  const container = document.getElementById('game-container');
  if (!container) {
    showDebug('ERROR: Game container not found');
    return;
  }
  showDebug('2. container found');

  const game = new Game();
  showDebug('3. Game created');

  try {
    showDebug('4. calling game.init()...');
    await game.init(container);
    showDebug('5. game.init() complete');

    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => loading.remove(), 500);
    }

    // Expose game instance for debugging
    (window as any).game = game;

    showDebug('6. DROP CAST initialized');
  } catch (error) {
    showDebug('ERROR: ' + (error as Error).message);
    console.error('Failed to initialize game:', error);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}

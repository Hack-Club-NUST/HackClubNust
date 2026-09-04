import { createApp } from './app.mjs';

const PORT = Number(process.env.GAME_API_PORT ?? 8787);

createApp().listen(PORT, () => {
  console.log(`[game-api] listening on http://localhost:${PORT}`);
});

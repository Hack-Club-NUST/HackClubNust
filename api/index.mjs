import { createApp } from '../server/app.mjs';

/**
 * Vercel entry point. vercel.json routes every /api/* request here, and the
 * Express app matches on the full path, so the routes are identical to local dev.
 */
export default createApp();

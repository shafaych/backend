import {W, H} from './brand';

/** Social-UI safe margins for 9:16 (Reels / TikTok / Shorts overlays). */
export const SAFE = {top: 230, bottom: 360, left: 72, right: 96};

export const SAFE_W = W - SAFE.left - SAFE.right;
export const SAFE_H = H - SAFE.top - SAFE.bottom;
export const SAFE_CX = SAFE.left + SAFE_W / 2;
export const SAFE_CY = SAFE.top + SAFE_H / 2;
export const SAFE_BOTTOM_Y = H - SAFE.bottom;

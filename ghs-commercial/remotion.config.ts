import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Use a locally installed Chromium when available (offline / sandboxed environments).
import fs from 'node:fs';
const local = process.env.REMOTION_BROWSER_EXECUTABLE ?? ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } });
if (local) {
  Config.setBrowserExecutable(local);
  Config.setChromeMode('chrome-for-testing');
}

// Parallel browser tabs intermittently produced corrupted frames (black blocks on large animated shapes) in headless Chromium.
// A single tab renders deterministically (verified bit-identical across runs) and is about as fast here.
Config.setConcurrency(1);

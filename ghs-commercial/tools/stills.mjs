import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const frames = process.argv.slice(2).map(Number);
const entry = path.resolve('src/index.ts');
const serveUrl = await bundle({entryPoint: entry});
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const comp = await selectComposition({serveUrl, id: 'GHSCommercial', browserExecutable});
for (const f of frames) {
  await renderStill({composition: comp, serveUrl, frame: f, output: `out/s_${String(f).padStart(3,'0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable});
  console.log('frame', f);
}

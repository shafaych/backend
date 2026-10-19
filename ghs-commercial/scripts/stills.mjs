// Bundle once, render many independent stills (QA helper).
// usage: node scripts/stills.mjs <outDir> <frame> [frame...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = ['/opt/pw-browsers/chromium'].find((p) => fs.existsSync(p)) ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'GHSCommercial', browserExecutable, chromeMode: 'chrome-for-testing'});
for (const f of frames) {
  await renderStill({
    composition: comp, serveUrl, frame: Number(f), browserExecutable, chromeMode: 'chrome-for-testing',
    output: path.join(outDir, `f${String(f).padStart(4, '0')}.png`), logLevel: 'error',
  });
}
console.log('done', frames.length);

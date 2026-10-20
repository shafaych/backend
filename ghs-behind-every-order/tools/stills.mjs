// Usage: node tools/stills.mjs out_dir frame1 frame2 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.CHROMIUM;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'BehindEveryOrder', browserExecutable});
for (const f of frames) {
  await renderStill({composition: comp, serveUrl, frame: Number(f), output: path.join(outDir, `f${String(f).padStart(4, '0')}.png`), browserExecutable, scale: 0.5});
}
console.log('stills done');

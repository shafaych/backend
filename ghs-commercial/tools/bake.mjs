// Bakes each sublimated jersey (heavy SVG lighting filters) once into a 2x transparent PNG.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
for (const [id, name] of [['BakeVoltage','voltage'],['BakeGrid','grid'],['BakeContour','contour'],['BakeSplit','split']]) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  await renderStill({composition, serveUrl, output: `public/jerseys/${name}.png`, imageFormat: 'png', scale: 2, browserExecutable, timeoutInMS: 180000});
  console.log('baked', name);
}

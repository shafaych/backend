import {staticFile} from 'remotion';
const face = (family: string, w: number, f: string) =>
  `@font-face{font-family:'${family}';font-weight:${w};src:url(${staticFile('fonts/' + f)}) format('woff2');}`;
export const Fonts = () => (
  <style>{[
    face('Oswald', 500, 'oswald-500.woff2'), face('Oswald', 700, 'oswald-700.woff2'),
    face('Inter', 500, 'inter-500.woff2'), face('Inter', 600, 'inter-600.woff2'),
  ].join('')}</style>
);

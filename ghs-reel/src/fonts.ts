import {continueRender, delayRender} from 'remotion';
import {FONT_CSS} from './fontData';

const style = document.createElement('style');
style.textContent = FONT_CSS;
document.head.appendChild(style);

const handle = delayRender('fonts');
let cleared = false;
const done = () => {
  if (!cleared) {
    cleared = true;
    continueRender(handle);
  }
};
setTimeout(done, 2500);
Promise.all(
  ["800 10px 'Barlow Condensed'", "italic 800 10px 'Barlow Condensed'", "700 10px 'Inter'", "500 10px 'Inter'"].map((f) => document.fonts.load(f)),
)
  .then(done)
  .catch(done);

export const DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif";
export const BODY = "'Inter', 'Helvetica Neue', Arial, sans-serif";

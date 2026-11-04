import {continueRender, delayRender} from 'remotion';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';

// Wait (bounded) for the bundled faces; never block a render tab indefinitely.
const h = delayRender('fonts', {timeoutInMilliseconds: 60000});
let done = false;
const finish = () => { if (!done) { done = true; continueRender(h); } };
Promise.all([
  document.fonts.load("500 40px 'Barlow Condensed'"), document.fonts.load("600 40px 'Barlow Condensed'"),
  document.fonts.load("700 40px 'Barlow Condensed'"), document.fonts.load("500 40px 'Barlow'"), document.fonts.load("600 40px 'Barlow'"),
]).catch(() => undefined).finally(finish);
setTimeout(finish, 8000);

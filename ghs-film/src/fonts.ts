import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';

// Call once inside the root component: holds the frame until the bundled faces are ready.
export const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts', {timeoutInMilliseconds: 90000}));
  useEffect(() => {
    Promise.all(["500 40px 'Barlow Condensed'", "600 40px 'Barlow Condensed'", "700 40px 'Barlow Condensed'", "500 40px 'Barlow'", "600 40px 'Barlow'"].map((f) => document.fonts.load(f)))
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

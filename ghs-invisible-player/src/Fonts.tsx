import {continueRender, delayRender, staticFile} from "remotion";
import {useEffect, useState} from "react";

const faces: [string, number, string][] = [
  ["Barlow Condensed", 500, "barlow-condensed-latin-500-normal.woff2"],
  ["Barlow Condensed", 600, "barlow-condensed-latin-600-normal.woff2"],
  ["Barlow Condensed", 800, "barlow-condensed-latin-800-normal.woff2"],
  ["Barlow", 500, "barlow-latin-500-normal.woff2"],
  ["Barlow", 600, "barlow-latin-600-normal.woff2"],
];
export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(
      faces.map(async ([fam, w, file]) => {
        const f = new FontFace(fam, `url(${staticFile("fonts/" + file)})`, {weight: String(w)});
        await f.load();
        document.fonts.add(f);
      }),
    )
      .catch(() => {})
      .finally(() => continueRender(handle));
  }, [handle]);
};

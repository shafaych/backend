import React from "react";
import {C, FONT_HEAD, FONT_BODY, easeOutQuint, prog, clamp} from "./util";

export type KLine = {t: string; c?: string; size?: number; weight?: number; ls?: number; font?: "head" | "body"};

/** Masked slide-up reveal of text lines (frame-local). */
export const KLines: React.FC<{
  lines: KLine[]; frame: number; start: number; stagger?: number; dur?: number; out?: number; outDur?: number;
  size?: number; color?: string; align?: "left" | "center"; lh?: number; style?: React.CSSProperties;
}> = ({lines, frame, start, stagger = 7, dur = 22, out, outDur = 14, size = 150, color = C.porcelain, align = "left", lh = 0.9, style}) => {
  const o = out === undefined ? 1 : 1 - clamp((frame - out) / outDur);
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", opacity: o, ...style}}>
      {lines.map((l, i) => {
        const p = easeOutQuint(prog(frame, start + i * stagger, start + i * stagger + dur));
        const sz = l.size ?? size;
        return (
          <div key={i} style={{overflow: "hidden", lineHeight: lh, paddingTop: sz * 0.06, paddingBottom: sz * 0.04}}>
            <div
              style={{
                transform: `translateY(${(1 - p) * 108}%)`,
                opacity: clamp(p * 3),
                fontFamily: l.font === "body" ? FONT_BODY : FONT_HEAD,
                fontWeight: l.weight ?? 800,
                fontSize: sz,
                letterSpacing: l.ls ?? (l.font === "body" ? 2 : -1),
                color: l.c ?? color,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                lineHeight: lh,
              }}
            >
              {l.t}
            </div>
          </div>
        );
      })}
    </div>
  );
};

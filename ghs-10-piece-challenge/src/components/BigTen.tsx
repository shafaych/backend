import React from "react";
import { C, FONT } from "../theme";

/** The enormous lime "10" — shared so Scene 1 → Scene 2 reads as one continuous object. */
export const BigTen: React.FC<{ scale?: number; opacity?: number; glow?: number; y?: number; blur?: number; qOpacity?: number; slice?: number }> = ({ scale = 1, opacity = 1, glow = 0.5, y = 1130, blur = 0, qOpacity = 1, slice = 0 }) => (
  <div style={{ position: "absolute", left: 0, top: y - 520, width: 1080, height: 1040, display: "flex", alignItems: "center", justifyContent: "center", opacity, transform: `scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined }}>
    <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 880, lineHeight: 1, letterSpacing: "-0.07em", color: C.lime, transform: "translateX(-62px) scaleX(0.92)", textShadow: `0 0 ${90 * glow}px rgba(200,243,107,${0.45 * glow})` }}>
      {slice > 0 ? (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ position: i ? "absolute" : "relative", left: 0, top: 0, clipPath: `inset(${(i / 6) * 100}% 0 ${100 - ((i + 1) / 6) * 100}% 0)`, transform: `translateX(${(i % 2 ? 1 : -1) * slice * (80 + i * 40)}px)`, whiteSpace: "nowrap" }}>10</span>
          ))}
        </>
      ) : "10"}
      <span style={{ position: "absolute", right: -118, top: 36, fontSize: 250, color: C.white, opacity: qOpacity, letterSpacing: 0 }}>?</span>
    </div>
  </div>
);

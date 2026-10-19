import React from "react";

/** Original fictional crest for the hypothetical "KESTREL" brand (no real-world marks). */
export const Crest: React.FC<{ size?: number; fill: string; ink: string; progress?: number }> = ({ size = 40, fill, ink, progress = 1 }) => (
  <g opacity={progress}>
    <polygon points="0,-20 17.3,-10 17.3,10 0,20 -17.3,10 -17.3,-10" fill={fill} transform={`scale(${size / 40})`} />
    <path d="M-9 5 L0 -8 L9 5 M-9 12 L0 -1 L9 12" stroke={ink} strokeWidth={3.4} fill="none" strokeLinecap="square" transform={`scale(${size / 40})`} />
  </g>
);

import React from "react";
import { C, FONT } from "../theme";
import { Crest } from "./Crest";

/** Branded shipping box with a hinged lid. `open`: 1 = lid up, 0 = closed. Draw `children` (the garment) between back and front faces. */
export const Box: React.FC<{ open: number; tape?: number; children?: React.ReactNode; sticker?: number }> = ({ open, tape = 0, children, sticker = 0 }) => {
  const o = open;
  const bk = -60 - 28 * (1 - o);
  const lid = [
    [-120 - 6 * (1 - o), bk], [240 + 6 * (1 - o), bk],
    [166 + (1 - o) * 0 + o * 4, -48 - o * 232], [-206 + o * 16, -48 - o * 232],
  ];
  const lidPts = lid.map((p) => p.join(",")).join(" ");
  const lidEl = <polygon points={lidPts} fill="#22251f" stroke={C.lime} strokeWidth="2" strokeOpacity={0.5} />;
  return (
    <g>
      {/* interior back */}
      <polygon points="-200,-20 160,-20 240,-60 -120,-60" fill="#0b0c0b" />
      {o > 0.35 && lidEl}
      {children}
      {/* front + right faces */}
      <polygon points="-200,-20 160,-20 160,260 -200,260" fill={C.carbon} />
      <polygon points="160,-20 240,-60 240,220 160,260" fill="#0d0e0d" />
      <polygon points="-200,-20 160,-20 160,6 -200,6" fill="#000" opacity=".25" />
      {/* printed branding */}
      <g transform="translate(-20 84)">
        <Crest size={62} fill={C.lime} ink={C.carbon} />
        <text x="0" y="62" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="20" letterSpacing="7" fill={C.white} opacity=".8">KESTREL</text>
        <text x="0" y="82" textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize="10" letterSpacing="3" fill={C.white} opacity=".5">ILLUSTRATIVE BRAND</text>
      </g>
      <rect x="-200" y="214" width="360" height="46" fill={C.lime} />
      <text x="-20" y="244" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="19" letterSpacing="3.5" fill={C.carbon}>MADE BY GHS CUSTOM GEAR</text>
      {o <= 0.35 && lidEl}
      {/* lid-front */}
      {o < 0.5 && (
        <>
          <polygon points="-206,-48 166,-48 166,-20 -206,-20" fill="#22251f" opacity={1 - o * 2} />
          <polygon points="166,-48 246,-88 240,-60 160,-20 166,-20" fill="#0d0e0d" opacity={1 - o * 2} />
        </>
      )}
      {o < 0.2 && tape > 0 && (
        <g opacity={1}>
          <polygon points={`-60,-48 2,-48 82,-88 20,-88`} fill={C.lime} transform={`scale(1 1)`} opacity={tape} />
          <polygon points={`-60,-48 2,-48 2,${-48 + 28 * tape} -60,${-48 + 28 * tape}`} fill={C.lime} />
        </g>
      )}
      {sticker > 0 && (
        <g transform={`translate(110 150) scale(${sticker}) rotate(${-10 + sticker * 10})`}>
          <circle r="44" fill={C.lime} />
          <text y="12" textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize="38" fill={C.carbon} letterSpacing="-2">10</text>
        </g>
      )}
    </g>
  );
};

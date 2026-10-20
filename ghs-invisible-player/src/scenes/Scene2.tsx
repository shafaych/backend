import React from "react";
import {AbsoluteFill} from "remotion";
import {C, FONT_BODY, H, W, clamp, easeIn, easeInOut, easeOut, lerp, prog, smooth} from "../util";
import {StadiumBG, stadiumProject} from "./Stadium";
import {PlayerOnPitch, playerPose} from "./Scene1";
import {FigureSVG, solve} from "../Figure";
import {J, Lattice, SEAMS} from "../jersey";
import {KLines} from "../Kinetic";

const GS = 1.0;
const JX = 540, JY = 660;

const Label: React.FC<{x: number; y: number; tx: number; ty: number; text: string; a: number; align?: "start" | "end"}> = ({x, y, tx, ty, text, a, align = "start"}) => (
  <g opacity={a}>
    <line x1={x} y1={y} x2={tx} y2={ty} stroke={C.lime} strokeWidth={1.3} strokeDasharray={`${a * 200} 400`} />
    <circle cx={x} cy={y} r={5} fill={C.black} stroke={C.lime} strokeWidth={1.6} />
    <text x={tx + (align === "start" ? 10 : -10)} y={ty + 7} fill={C.porcelain} fontFamily={FONT_BODY} fontWeight={600} fontSize={28} letterSpacing={4} textAnchor={align}>{text}</text>
  </g>
);

export const Scene2: React.FC<{frame: number}> = ({frame}) => {
  const f = frame;
  const flash = clamp(1 - f / 9);
  const stretch = easeOut(prog(f, 0, 44));
  const base = stadiumProject(239, playerPose(239).wx, 0, 0)!;
  const cx = base[0], cy = base[1] - 220;
  const push = easeOut(prog(f, 0, 150));
  const k = lerp(1.02, 1.5, push) + 0.02 * Math.sin(f / 30);
  const tx = lerp(cx, 540, push), ty = lerp(cy, 900, push);
  const wireP = smooth(prog(f, 12, 62));
  const e = easeInOut(prog(f, 62, 140));
  const ghost = 1 - 0.7 * smooth(prog(f, 60, 100));
  const bgDim = 1 - 0.55 * smooth(prog(f, 40, 110));
  const zoomP = easeIn(prog(f, 196, 240));
  const Z = Math.exp(zoomP * Math.log(26));
  const ax = JX, ay = JY + GS * -381;
  const fadeAll = 1 - smooth(prog(f, 222, 238));
  const fadeScene = Math.max(0, 1 - prog(f, 196, 232)); // everything but thread
  const threadA = smooth(prog(f, 224, 239));

  // scan clip (figure feet -> head)
  const j = solve(playerPose(239).pose);
  const pp = base;
  const px = (pp[2] * 1.8) / 92;
  const feetY = pp[1], headY = pp[1] + (j.head[1] - 6) * px;
  const scanY = lerp(feetY + 30, headY - 20, wireP);

  const part = (id: string, dx: number, dy: number, rot: number, sc: number, depth: number, children: React.ReactNode, a = 1) => {
    const bob = Math.sin(f / 22 + depth * 2) * 7 * e;
    const px2 = Math.cos(f / 55) * 14 * depth * e;
    return (
      <g key={id} transform={`translate(${(dx * e + px2).toFixed(2)} ${(dy * e + bob).toFixed(2)}) rotate(${(rot * e).toFixed(2)}) scale(${lerp(1, sc, e)})`} opacity={a}>
        {children}
      </g>
    );
  };
  const gscale = lerp(0.32, GS, e);
  const jy = lerp(JY - 40, JY, e);
  const body = "#2b312b";
  const lab = smooth(prog(f, 108, 150));
  const L = (n: number) => clamp(lab * 6 - n);

  return (
    <AbsoluteFill style={{background: "#040504"}}>
      <svg width={W} height={H} style={{position: "absolute"}}>
        <defs>
          <clipPath id="s2-wire"><rect x={-500} y={-500} width={3000} height={scanY + 500} /></clipPath>
          <clipPath id="s2-solid"><rect x={-500} y={scanY} width={3000} height={3000} /></clipPath>
          <linearGradient id="s2-pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a423a" /><stop offset="1" stopColor="#1c211c" /></linearGradient>
          <clipPath id="s2-swatch"><path d="M0 0 L190 -26 L214 150 L22 176 Z" /></clipPath>
        </defs>
        <g transform={`translate(${lerp(ax, W / 2, zoomP)} ${lerp(ay, 960, zoomP)}) scale(${Z}) translate(${-ax} ${-ay})`}>
          <g opacity={fadeScene}>
            <g transform={`translate(${tx} ${ty}) scale(${k}) translate(${-cx} ${-cy})`}>
              <g opacity={bgDim}>
                <StadiumBG frame={239} sec={8} stretch={stretch} uid="s2" lights={1} />
              </g>
              <g opacity={ghost}>
                <g clipPath="url(#s2-solid)"><PlayerOnPitch frame={239} uid="s2p" rimBoost={0.2} /></g>
                <g clipPath="url(#s2-wire)"><PlayerOnPitch frame={239} wire={1} uid="s2w" /></g>
                {wireP > 0 && wireP < 1 && <line x1={-300} x2={1500} y1={scanY} y2={scanY} stroke={C.lime} strokeWidth={2} opacity={0.9} />}
              </g>
            </g>
          </g>

          {/* exploded jersey */}
          <g transform={`translate(${JX} ${jy}) scale(${gscale})`} opacity={clamp(prog(f, 60, 72))}>
            <g opacity={fadeScene > 0 ? 1 : 0}>
              {part("back", 95, 60, 4, 0.94, 0.4,
                <g opacity={0.7}><path d={J.back} fill="url(#s2-pg)" stroke={C.lime} strokeWidth={2.2} strokeOpacity={0.6} /><path d={J.collarCrew} fill={C.lime} opacity={0.7} /></g>)}
              {part("sleeveL", -110, -20, -14, 1, 0.9,
                <g><path d={J.sleeveL} fill="url(#s2-pg)" stroke={C.lime} strokeWidth={2.2} /><path d={J.cuffL} fill={C.lime} /></g>)}
              {part("sleeveR", 125, -10, 14, 1, 0.8,
                <g><path d={J.sleeveR} fill="url(#s2-pg)" stroke={C.lime} strokeWidth={2.2} /><path d={J.cuffR} fill={C.lime} /></g>)}
              {part("front", -40, 10, -2, 1, 1.2,
                <g>
                  <path d={J.front} fill="url(#s2-pg)" stroke={C.lime} strokeWidth={2.4} />
                  <clipPath id="s2-fc"><path d={J.front} /></clipPath>
                  <g clipPath="url(#s2-fc)"><Lattice id="s2-lat" opacity={0.12} /><path d={J.chevron} fill={C.lime} opacity={0.95} /><path d={J.insertL} fill={C.lime} opacity={0.9} /><path d={J.insertR} fill={C.lime} opacity={0.9} /><path d={J.hem} fill={C.lime} /></g>
                </g>)}
              {part("collar", 0, -150, 0, 1.25, 1.5, <path d={J.collarV} fill={C.white} stroke={C.lime} strokeWidth={2} />)}
              {part("seams", 70, 40, 0, 1, 1.0,
                <g fill="none" stroke={C.lime} strokeWidth={3} strokeLinecap="round" strokeDasharray="14 10" opacity={0.95}>
                  {SEAMS.slice(0, 7).map((s, i) => (<path key={s.k} d={s.d} transform={`translate(${(i % 2 ? 1 : -1) * 18} ${(i % 3) * 6}) rotate(${(i - 3) * 0.8})`} opacity={0.9} />))}
                </g>)}
              {part("swatch", 150, 420, 0, 1, 0.6,
                <g transform="translate(40 -60)">
                  <path d="M0 0 L190 -26 L214 150 L22 176 Z" fill="#232823" stroke={C.lime} strokeWidth={2} />
                  <g clipPath="url(#s2-swatch)"><g transform="scale(0.55) translate(180 100)"><Lattice id="s2-sw" opacity={0.85} step={26} w={2} /></g></g>
                </g>)}
            </g>
          </g>

          {/* labels */}
          <g opacity={fadeScene}>
            <Label x={JX - 330} y={JY - 150 * GS} tx={50} ty={420} text="SLEEVES" a={L(0)} />
            <Label x={JX - 120} y={JY + 100 * GS} tx={50} ty={800} text="FRONT PANEL" a={L(1)} />
            <Label x={JX - 60} y={JY + 40 * GS} tx={50} ty={950} text="SEAM STRUCTURE" a={L(2)} />
            <Label x={JX} y={JY - 380 * GS} tx={1030} ty={330} text="COLLAR" a={L(3)} align="end" />
            <Label x={JX + 230} y={JY + 150 * GS} tx={1030} ty={760} text="BACK PANEL" a={L(4)} align="end" />
            <Label x={JX + 300} y={JY + 440 * GS} tx={1030} ty={1160} text="FABRIC PATTERN" a={L(5)} align="end" />
          </g>

          {/* collar stitch focus for the dive */}
          {zoomP > 0 && (
            <g transform={`translate(${JX} ${jy}) scale(${gscale})`} opacity={clamp(zoomP * 3) * fadeAll}>
              <g transform="translate(0 -150) scale(1.25) translate(0 0)">
                <path d="M-63 -255 L0 -186 L63 -255" fill="none" stroke={C.lime} strokeWidth={2.4} strokeDasharray="7 7" />
              </g>
            </g>
          )}
        </g>

        <rect width={W} height={H} fill="#fff" opacity={flash * 0.92} />
        <g opacity={threadA}>
          <line x1={-50} y1={960} x2={W + 50} y2={960} stroke={C.lime} strokeWidth={14} opacity={0.18} />
          <line x1={-50} y1={960} x2={W + 50} y2={960} stroke="#f4ffd8" strokeWidth={4} />
        </g>
      </svg>
      <div style={{position: "absolute", left: 70, top: 1330}}>
        <KLines
          frame={f}
          start={134}
          stagger={9}
          size={150}
          out={190}
          lines={[{t: "But what about"}, {t: "the one you"}, {t: "never see?", c: C.lime}]}
          lh={0.92}
        />
      </div>
    </AbsoluteFill>
  );
};

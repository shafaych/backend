import React from 'react';
const CARBON = '#171917', GRAPHITE = '#333832', LIME = '#C8F36B', PORC = '#F5F5F0';
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - cl(x), 3);

export const Overlay: React.FC<{t: number}> = ({t}) => {
  // headline 17-20
  const lines = ['THE GAME', 'STARTS WITH', 'YOUR DESIGN.'];
  const hOut = 1 - cl((t - 19.55) / 0.3);
  const wipe = ease((t - 19.7) / 0.45); // lime line sweep into end card
  const card = t >= 20.0;
  const c = (d: number) => ease((t - 20.0 - d) / 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: 'Inter, sans-serif', overflow: 'hidden'}}>
      {/* vignette */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)'}} />
      {t >= 17 && t < 20.1 && (
        <div style={{position: 'absolute', left: 70, right: 70, top: 250, opacity: hOut}}>
          {lines.map((l, i) => {
            const e = ease((t - 17.1 - i * 0.28) / 0.6);
            return (
              <div key={i} style={{overflow: 'hidden', height: 168}}>
                <div style={{fontFamily: 'Anton', fontSize: 158, lineHeight: '168px', color: i === 2 ? LIME : PORC, letterSpacing: 2, transform: `translateY(${(1 - e) * 120}%)`, opacity: e, textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>{l}</div>
              </div>
            );
          })}
          <div style={{height: 6, width: 220 * ease((t - 18.1) / 0.6), background: LIME, marginTop: 26}} />
        </div>
      )}
      {t >= 19.7 && t < 20.15 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${wipe * 100}%`, background: CARBON, borderBottom: `8px solid ${LIME}`, boxShadow: `0 0 60px ${LIME}`}} />
      )}
      {card && (
        <div style={{position: 'absolute', inset: 0, background: CARBON}}>
          <div style={{position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: `linear-gradient(${GRAPHITE} 1px, transparent 1px), linear-gradient(90deg, ${GRAPHITE} 1px, transparent 1px)`, backgroundSize: '90px 90px'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}>
            <div style={{opacity: c(0), transform: `translateY(${(1 - c(0)) * 30}px)`}}>
              <div style={{fontFamily: 'Anton', fontSize: 330, lineHeight: '330px', color: PORC, letterSpacing: 14}}>GHS</div>
              <div style={{height: 22, width: 560 * c(0.1), background: LIME, margin: '6px auto 0'}} />
              <div style={{fontFamily: 'Anton', fontSize: 74, letterSpacing: 12, color: LIME, marginTop: 28}}>CUSTOM GEAR</div>
            </div>
            <div style={{opacity: c(0.2), fontWeight: 800, fontSize: 31, letterSpacing: 6, color: PORC, marginTop: 40}}>CUSTOM SPORTSWEAR MANUFACTURING</div>
            <div style={{opacity: c(0.4), transform: `scale(${0.9 + 0.1 * c(0.4)})`, display: 'inline-block', marginTop: 90, background: LIME, color: CARBON, fontWeight: 800, fontSize: 46, letterSpacing: 3, padding: '28px 56px', borderRadius: 100}}>DM “DESIGN” TO START</div>
            <div style={{opacity: c(0.6), fontWeight: 600, fontSize: 40, letterSpacing: 3, color: PORC, marginTop: 70}}>ghscustomgear.com</div>
          </div>
        </div>
      )}
    </div>
  );
};

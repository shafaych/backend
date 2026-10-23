import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {BODY, C, HEAD} from './brand';
import {Fonts} from './fonts';
import {Wordmark} from './GHSReel';

export const Cover = () => (
  <AbsoluteFill style={{background: C.black}}>
    <Fonts />
    <OffthreadVideo src={staticFile('ghs-factory.mp4')} startFrom={30} muted style={{position: 'absolute', left: -300, width: 1680, height: 1920, objectFit: 'cover', filter: 'blur(46px) brightness(.38)'}} />
    <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 124, lineHeight: 1.05, color: C.white, letterSpacing: 2}}>NOT STOCK<br />FOOTAGE.</div>
    <div style={{position: 'absolute', top: 700, left: 0, width: 1080, height: 608, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.55)'}}>
      <OffthreadVideo src={staticFile('ghs-factory.mp4')} startFrom={30} muted style={{width: 1080, height: 608, objectFit: 'cover', filter: 'contrast(1.06) saturate(.93)'}} />
    </div>
    <div style={{position: 'absolute', top: 1380, left: 0, right: 0, textAlign: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 84, color: C.lime}}>REAL PRODUCTION.</div>
    <div style={{position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 32, letterSpacing: 6, color: C.porcelain}}>INSIDE OUR FACTORY · GHS CUSTOM GEAR</div>
  </AbsoluteFill>
);

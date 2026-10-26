import React from "react";
import { AbsoluteFill, random } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { elipsGoyah, garisGoyah, kePx, pakaiBoil } from "../lib/motif";

// E27 aksen-gaya: hiasan reveal khas gaya di titik (x, y) — tanpa teks (dekoratif). Jenis = el.jenis atau motif.reveal:
// kilau (sapuan cahaya), target (kunci HUD), stempel (cap menghentak), selotip (2 selotip menempel), doodle (bintang+panah
// spidol bergetar), uap (asap kopi), garis (garis tipis tergambar). Partikel tetap komposisi sendiri (E25).
export type AksenGayaElemen = ElemenUI & { jenis?: string; x?: number; y?: number; ukuran?: number; jadwal: { mulai: number } };
export type AksenGayaProps = PropsDasar<AksenGayaElemen>;

export const AksenGaya: React.FC<AksenGayaProps> = (props) => {
  const { dtk, px, el, w, motif, naik } = pakaiDasar(props);
  const { W, H, zona, durasiFrame, fps } = props;
  const [x0, y0, x1, y1] = zona;
  const jenis = el.jenis ?? motif.reveal;
  const R = px(el.ukuran ?? 170);
  // jarak tepi = jangkauan terbesar animasi (stempel mulai 1,9×, target 1,8×, doodle ±1,3R) → tetap di zona aman
  const tepi = R * (({ stempel: 1.95, target: 1.85, doodle: 1.35, selotip: 1.3 } as Record<string, number>)[jenis] ?? 1);
  const cx = Math.min(x1 - tepi, Math.max(x0 + tepi, (el.x ?? 0.5) * W));
  const cy = Math.min(y1 - tepi, Math.max(y0 + tepi, (el.y ?? 0.4) * H));
  const a = el.jadwal.mulai;
  const total = durasiFrame / fps;
  const getar = pakaiBoil(motif.boil || 10);
  const pudar = 1 - naik(total - 0.35, 0.35);
  const isi = (() => {
    switch (jenis) {
      case "kilau": {
        const p = naik(a, 0.7, "standar");
        return (
          <div style={{ position: "absolute", left: x0, width: x1 - x0, top: cy - R * 0.9, height: R * 1.8, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -R, bottom: -R, width: R * 1.2, left: `${-40 + 160 * p}%`,
                          transform: "rotate(18deg)", opacity: Math.sin(Math.PI * p),
                          background: `linear-gradient(90deg, transparent, ${rgba("#FFFFFF", 0.55)}, ${rgba(w.aksen, 0.35)}, transparent)` }} />
          </div>
        );
      }
      case "target": {
        const p = naik(a, 0.45, "tegas");
        const r = R * (1.8 - 0.8 * p);
        const L = (dx: number, dy: number) => (
          <div style={{ position: "absolute", left: cx + dx * r - px(26) * (dx < 0 ? 0 : 1), top: cy + dy * r - px(26) * (dy < 0 ? 0 : 1),
                        width: px(26), height: px(26), borderColor: w.aksen, borderStyle: "solid", borderWidth: 0,
                        [dx < 0 ? "borderLeftWidth" : "borderRightWidth"]: px(4), [dy < 0 ? "borderTopWidth" : "borderBottomWidth"]: px(4) }} />
        );
        const kedip = p >= 1 ? (Math.floor((dtk - a) * 6) % 2 ? 1 : 0.55) : 1;
        return (
          <div style={{ opacity: Math.min(1, p * 2) * kedip }}>
            {L(-1, -1)}{L(1, -1)}{L(-1, 1)}{L(1, 1)}
            <div style={{ position: "absolute", left: cx - r * 0.6, width: r * 1.2, top: cy - px(1), height: px(2), background: rgba(w.aksen, 0.6) }} />
            <div style={{ position: "absolute", top: cy - r * 0.6, height: r * 1.2, left: cx - px(1), width: px(2), background: rgba(w.aksen, 0.6) }} />
            <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%",
                          border: `${px(2)}px dashed ${rgba(w.aksen, 0.7)}`, transform: `rotate(${(dtk - a) * 90}deg)` }} />
          </div>
        );
      }
      case "stempel": {
        const p = naik(a, 0.22, "tegas");
        const s = skalaPersepsi(p, 1.9);
        const guncang = p >= 1 ? Math.sin((dtk - a) * 60) * px(5) * Math.max(0, 1 - (dtk - a - 0.22) * 5) : 0;
        return (
          <div style={{ position: "absolute", left: cx - R + guncang, top: cy - R, width: R * 2, height: R * 2, opacity: Math.min(1, p * 3),
                        transform: `scale(${s}) rotate(-12deg)`, borderRadius: "50%", border: `${px(10)}px solid ${w.peringatan}`,
                        boxShadow: `inset 0 0 0 ${px(6)}px ${rgba(w.peringatan, 0.25)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={R} height={R}>
              <path d="M5 12.5 L10 17 L19 7.5" fill="none" stroke={w.peringatan} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      }
      case "selotip":
        return (
          <>
            {[0, 1].map((i) => {
              const p = naik(a + i * 0.15, 0.25, "tegas");
              const rot = i ? 24 : -18;
              return (
                <div key={i} style={{ position: "absolute", left: cx - R * 0.9 + i * R * 0.5, top: cy - px(30) + i * px(50),
                                      width: R * 1.4, height: px(56), background: rgba(w.aksen2, 0.6),
                                      transform: `rotate(${rot}deg) scale(${skalaPersepsi(p, 1.4, 1.0)})`, opacity: p,
                                      clipPath: "polygon(3% 0, 97% 5%, 100% 50%, 96% 100%, 2% 95%, 0 50%)",
                                      boxShadow: `0 ${px(3)}px ${px(6)}px rgba(0,0,0,0.2)` }} />
              );
            })}
          </>
        );
      case "doodle": {
        const p = naik(a, 0.6);
        const bintang = (i: number) => {
          const sx = cx + (random(`sx${i}`) - 0.5) * R * 2.6;
          const sy = cy + (random(`sy${i}`) - 0.5) * R * 1.6;
          const q = naik(a + i * 0.12, 0.3, "tegas");
          const s = px(30 + random(`ss${i}`) * 26) * q;
          const g = (random(`g${i}${getar}`) - 0.5) * 6;
          return (
            <svg key={i} viewBox="-12 -12 24 24" width={s * 2} height={s * 2}
                 style={{ position: "absolute", left: sx - s, top: sy - s, transform: `rotate(${g}deg)` }}>
              <path d="M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z" fill="none"
                    stroke={i % 2 ? w.aksen : w.aksen2} strokeWidth={2.2} strokeLinejoin="round" />
            </svg>
          );
        };
        return (
          <>
            <svg viewBox={`0 0 ${R * 2.6} ${R * 1.6}`} style={{ position: "absolute", left: cx - R * 1.3, top: cy - R * 0.8,
                                                                           width: R * 2.6, height: R * 1.6, overflow: "visible" }}>
              <path d={kePx(elipsGoyah(`d${getar}`), R * 2.6, R * 1.6)} fill="none" stroke={w.aksen} strokeWidth={px(5)}
                    strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
            </svg>
            {[0, 1, 2].map(bintang)}
          </>
        );
      }
      case "uap":
        return (
          <>
            {[0, 1, 2].map((i) => {
              const q = Math.max(0, dtk - a - i * 0.25);
              const naikY = q * px(120);
              return (
                <svg key={i} viewBox="0 0 40 120" width={px(60)} height={px(180)}
                     style={{ position: "absolute", left: cx - px(90) + i * px(60), top: cy - px(90) - naikY,
                              opacity: Math.min(1, q * 2) * Math.max(0, 1 - q / 2.2) * 0.8 }}>
                  <path d={`M20 118 C ${4 + Math.sin(q * 3 + i) * 8} 90, ${36 + Math.sin(q * 2 + i) * 6} 60, 20 30 S ${8} 6, 20 2`}
                        fill="none" stroke={rgba(w.utama, 0.75)} strokeWidth={4} strokeLinecap="round" />
                </svg>
              );
            })}
          </>
        );
      default: { // garis: menggaris-bawahi pita atas (CTA/judul), tidak melintang di wajah
        const p = naik(a, 0.6);
        const gy = y0 + px(140);
        return (
          <svg viewBox={`0 0 ${(x1 - x0) * 0.6} ${px(12)}`} style={{ position: "absolute", left: x0 + (x1 - x0) * 0.2, width: (x1 - x0) * 0.6,
                                                                        top: gy, height: px(12), overflow: "visible" }}>
            <path d={kePx(garisGoyah(`m${motif.boil ? getar : 0}`, motif.boil ? 1.4 : 0.01), (x1 - x0) * 0.6, px(120))} fill="none" stroke={w.aksen} strokeWidth={px(4)} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
          </svg>
        );
      }
    }
  })();
  return <AbsoluteFill style={{ opacity: pudar }}>{isi}</AbsoluteFill>;
};

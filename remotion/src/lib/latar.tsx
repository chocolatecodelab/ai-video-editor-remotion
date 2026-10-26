import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Tokens, rgba, warna } from "./kontrak";
import { motifDari, LapisTekstur } from "./motif";

// Latar penuh layar sesuai motif gaya — dipakai klip cutaway (broll native: orbit, couch-wall, ui-world, headline-wall,
// paper-cut). Hanya warna token; tidak ada warna lepas selain hitam/putih untuk cahaya & bayangan.
export const LatarGaya: React.FC<{ t: Tokens; dtk: number; W: number; H: number }> = ({ t, dtk, W, H }) => {
  const m = motifDari(t);
  const latar = warna(t, "latar");
  const aksen = warna(t, "aksen");
  const aksen2 = warna(t, "aksen-2");
  const utama = warna(t, "teks-utama");
  const geser = Math.sin(dtk * 0.6) * 40;
  let pola: React.ReactNode = null;
  switch (m.bingkai) {
    case "hud":
      pola = (
        <AbsoluteFill style={{
          backgroundImage: `linear-gradient(${rgba(aksen, 0.09)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(aksen, 0.09)} 1px, transparent 1px)`,
          backgroundSize: `${W / 12}px ${W / 12}px`, backgroundPosition: `0 ${(dtk * 30) % (W / 12)}px`,
        }} />
      );
      break;
    case "brutal":
      pola = (
        <AbsoluteFill style={{ backgroundImage: `radial-gradient(${rgba(utama, 0.16)} 22%, transparent 24%)`,
                               backgroundSize: `${W / 36}px ${W / 36}px` }} />
      );
      break;
    case "kinetik":
      pola = (
        <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(-30deg, ${rgba(aksen, 0.07)} 0 ${W / 30}px, transparent ${W / 30}px ${W / 12}px)`,
                               backgroundPosition: `${dtk * 60}px 0` }} />
      );
      break;
    case "spidol":
    case "pensil":
      pola = (
        <AbsoluteFill style={{ backgroundImage: `linear-gradient(${rgba(aksen2, 0.14)} 2px, transparent 2px)`,
                               backgroundSize: `100% ${H / 28}px` }} />
      );
      break;
    case "editorial":
      pola = (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: W * 0.08, right: W * 0.08, top: H * 0.1, height: 3, background: rgba(utama, 0.5) }} />
          <div style={{ position: "absolute", left: W * 0.08, right: W * 0.08, bottom: H * 0.1, height: 1.5, background: rgba(utama, 0.35) }} />
        </AbsoluteFill>
      );
      break;
    case "kolase":
    case "kertas":
      pola = (
        <AbsoluteFill>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: "absolute", width: W * (0.5 + random(`kw${i}`) * 0.4), height: H * 0.18,
                                  left: W * (random(`kx${i}`) - 0.3), top: H * (0.12 + i * 0.22),
                                  background: rgba([aksen, aksen2][i % 2], 0.1), transform: `rotate(${(random(`kr${i}`) - 0.5) * 14}deg)` }} />
          ))}
        </AbsoluteFill>
      );
      break;
    default:
      break;
  }
  const kaca = m.bingkai === "kaca" || m.bingkai === "jendela";
  return (
    <AbsoluteFill style={{ background: latar, overflow: "hidden" }}>
      {m.bingkai === "minimal" ? null : (
        <>
          <div style={{ position: "absolute", width: W * 1.1, height: W * 1.1, borderRadius: "50%", left: -W * 0.35 + geser, top: H * 0.05,
                        background: `radial-gradient(circle, ${rgba(aksen, kaca ? 0.35 : 0.14)}, transparent 65%)` }} />
          <div style={{ position: "absolute", width: W, height: W, borderRadius: "50%", right: -W * 0.4 - geser, bottom: H * 0.06,
                        background: `radial-gradient(circle, ${rgba(aksen2, kaca ? 0.3 : 0.12)}, transparent 65%)` }} />
        </>
      )}
      {pola}
      <LapisTekstur jenis={m.tekstur} panelHex={latar} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.28))" }} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { PropsDasar, rgba, warna, kurva } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { LapisTekstur } from "../lib/motif";
import { Teks } from "../lib/Teks";

// E13 paper-cut (klip cutaway/broll native): lapisan kertas potong (bukit bergelombang) naik bergantian dengan
// parallax & bayangan, matahari/lingkaran potong, lalu kartu judul menempel. Gerak dipatah ke 12 fps (rasa stop-motion).
export type PaperCutElemen = ElemenUI & { judul: string; sub?: string; jadwal: { lapis: number[]; kartu: number } };
export type PaperCutProps = PropsDasar<PaperCutElemen>;

const bukit = (seed: string, tinggi: number) => {
  const n = 6;
  let d = `M0 100 L0 ${tinggi}`;
  for (let i = 1; i <= n; i++) {
    const x = (i / n) * 100;
    const y = tinggi + (random(`${seed}${i}`) - 0.5) * 14;
    const cx = x - 50 / n;
    d += ` Q${cx} ${y - 10 - random(`${seed}c${i}`) * 8} ${x} ${y}`;
  }
  return `${d} L100 100 Z`;
};

export const PaperCut: React.FC<PaperCutProps> = (props) => {
  const { f, fps, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const [x0, y0, x1] = zona;
  const dtk12 = Math.floor((f / fps) * 12) / 12; // stop-motion 12 fps
  // tetap stop-motion 12 fps, tetapi dengan easing token (kertas sungguhan dipercepat/diperlambat, bukan laju tetap)
  const naik12 = (a: number, d: number) => interpolate(dtk12, [a, a + d], [0, 1], { easing: kurva(t, "standar"), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const latar = warna(t, "latar");
  const warnaLapis = [rgba(w.aksen2, 0.55), w.aksen2, rgba(w.aksen, 0.75), w.aksen];
  const pk = naik(el.jadwal.kartu, 0.4, "tegas");
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ background: latar, overflow: "hidden" }}>
        <LapisTekstur jenis={"kertas"} panelHex={latar} />
        <div style={{ position: "absolute", width: W * 0.42, height: W * 0.42, borderRadius: "50%", left: W * 0.52,
                      top: H * (0.42 - 0.12 * naik12(el.jadwal.lapis[0] ?? 0, 1.2)), background: w.peringatan,
                      boxShadow: `${px(8)}px ${px(10)}px ${px(14)}px rgba(0,0,0,0.25)` }} />
        {warnaLapis.map((c, i) => {
          const p = naik12(el.jadwal.lapis[i] ?? 0, 0.7);
          const goyang = Math.sin(dtk12 * 1.5 + i) * (i + 1) * px(6);
          return (
            <svg key={i} viewBox="0 0 100 100" preserveAspectRatio="none"
                 style={{ position: "absolute", left: -W * 0.05 + goyang, width: W * 1.1, top: H * (0.42 + i * 0.1) + (1 - p) * H * 0.6,
                          height: H * 0.7, filter: `drop-shadow(0 -${px(10)}px ${px(12)}px rgba(0,0,0,0.28))` }}>
              <path d={bukit(`b${i}`, 18 + i * 4)} fill={c} />
            </svg>
          );
        })}
        <div style={{ position: "absolute", left: x0, width: x1 - x0, top: y0 + px(40), opacity: pk,
                      transform: `translateY(${(1 - pk) * -px(120)}px) rotate(${-2 + 2 * pk}deg)` }}>
          <Jendela t={t} px={px} w={w} u={u} polos seed="paper" padding={px(40)}>
            <div style={{ ...font("judul"), fontSize: u.judul, lineHeight: 1.02, color: w.utama, textAlign: "center" }}>
              <Teks teks={el.judul} aksen={w.aksen} tunda={el.jadwal.kartu} />
            </div>
            {el.sub ? <div style={{ ...font("isi"), fontSize: u.isi * 0.85, color: w.sekunder, marginTop: px(14), textAlign: "center" }}>{el.sub}</div> : null}
          </Jendela>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

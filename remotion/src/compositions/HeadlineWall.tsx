import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// E08 headline-wall (klip cutaway/broll native): dinding kartu berita miring 3D jatuh bergantian, kamera mendorong
// pelan, lalu satu kartu (`sorot`) maju ke depan & membesar sementara yang lain meredup.
export type HeadlineWallElemen = ElemenUI & {
  judul_judul: string[]; sumber?: string[]; sorot?: number;
  jadwal: { kartu: number[]; sorot: number };
};
export type HeadlineWallProps = PropsDasar<HeadlineWallElemen>;

export const HeadlineWall: React.FC<HeadlineWallProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona, durasiFrame, fps } = props;
  const [x0, y0, x1, y1] = zona;
  const j = el.jadwal;
  const n = el.judul_judul.length;
  const sorot = el.sorot ?? Math.min(n - 1, 2);
  const ps = naik(j.sorot, 0.6, "tegas");
  // push-in kamera berkecepatan tetap (linear disengaja, gaya dolly sungguhan); perceptual-scale agar laju terasa rata
  const dorong = interpolate(dtk, [0, durasiFrame / fps], [1, 1.1], { output: "perceptual-scale", extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kol = 2;
  const lebarKartu = (x1 - x0) * 0.44;
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ perspective: px(1800) }}>
          <div style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, transformStyle: "preserve-3d",
                        transform: `scale(${dorong * 0.94}) rotateX(14deg) rotateZ(-3deg)`, transformOrigin: "50% 40%" }}>
            {el.judul_judul.map((h, i) => {
              const p = naik(j.kartu[i] ?? 0, 0.45, "tegas");
              const aktif = i === sorot;
              const baris = Math.floor(i / kol);
              const x = (x1 - x0) * 0.04 + (i % kol) * (x1 - x0) * 0.5 + (baris % 2 ? px(18) : 0);
              const y = baris * ((y1 - y0) / Math.ceil(n / kol)) * 0.92;
              const maju = aktif ? ps : 0;
              const redup = aktif ? 1 : 1 - 0.55 * ps;
              const miring = (random(`hw${i}`) - 0.5) * 4;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: lebarKartu, opacity: p * redup, zIndex: aktif ? 5 : 1,
                                      transform: `translateY(${(1 - p) * -px(220)}px) translateX(${maju * ((x1 - x0) / 2 - x - lebarKartu / 2)}px) translateZ(${maju * px(160)}px) rotate(${miring * (1 - maju)}deg) scale(${1 + 0.18 * maju})`,
                                      transformOrigin: "50% 50%" }}>
                  <Jendela t={t} px={px} w={w} u={u} polos seed={`hw${i}`} padding={px(26)}>
                    <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, marginBottom: px(10), letterSpacing: px(1),
                                  textTransform: "uppercase" }}>{el.sumber?.[i] ?? `berita · ${2 + i} jam lalu`}</div>
                    <div style={{ ...font("subjudul"), fontSize: u.isi * 0.95, lineHeight: 1.12, color: w.utama }}>
                      <Teks teks={h} aksen={w.aksen} tunda={aktif ? j.sorot : 99} />
                    </div>
                    {aktif ? <div style={{ marginTop: px(14), height: px(6), width: `${ps * 100}%`, background: w.aksen }} /> : null}
                  </Jendela>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${rgba(w.latar, 0.5)}, transparent 18%, transparent 82%, ${rgba(w.latar, 0.6)})` }} />
      </AbsoluteFill>
    </SediaMotif>
  );
};

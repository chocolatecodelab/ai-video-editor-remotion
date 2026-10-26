import React from "react";
import { AbsoluteFill, random } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { elipsGoyah, garisGoyah, kePx, pakaiBoil } from "../lib/motif";

// E14 doodle-boil: anotasi tangan di atas video — lingkaran, panah, garis bawah, bintang, kurung — tergambar lalu
// "bergetar" (boil 8–12 fps, garis digambar ulang dengan sedikit acak tiap ketukan). Label opsional tulisan tangan.
export type Anotasi = { jenis: "lingkar" | "panah" | "garis" | "bintang" | "kurung"; x: number; y: number; w?: number; h?: number;
                        teks?: string; arah?: number };
export type DoodleBoilElemen = ElemenUI & { anotasi: Anotasi[]; warna?: string; jadwal: { gores: number[]; durasi_gores: number } };
export type DoodleBoilProps = PropsDasar<DoodleBoilElemen>;

export const DoodleBoil: React.FC<DoodleBoilProps> = (props) => {
  const { px, t, el, w, naik, keluar, motif } = pakaiDasar(props);
  const { W, H, zona } = props;
  const getar = pakaiBoil(motif.boil || 10);
  const warnaGaris = el.warna === "aksen-2" ? w.aksen2 : el.warna === "utama" ? w.utama : w.aksen;
  const tebal = px(motif.bingkai === "pensil" ? 3.5 : 7);
  const garis = { fill: "none", stroke: warnaGaris, strokeWidth: tebal, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
                  pathLength: 1, strokeDasharray: 1 };
  return (
    <AbsoluteFill style={{ opacity: 1 - keluar, filter: `drop-shadow(0 ${px(3)}px ${px(4)}px ${rgba("#000000", 0.35)})` }}>
      {el.anotasi.map((a, i) => {
        const p = naik(el.jadwal.gores[i] ?? 0, el.jadwal.durasi_gores, "standar");
        const cx = a.x * W;
        const cy = a.y * H;
        const aw = (a.w ?? 0.3) * W;
        const ah = (a.h ?? 0.1) * H;
        const s = `${i}-${getar}`;
        let isi: React.ReactNode = null;
        if (a.jenis === "lingkar") {
          isi = (
            <svg viewBox={`0 0 ${aw} ${ah}`} style={{ position: "absolute", left: cx - aw / 2, top: cy - ah / 2, width: aw, height: ah, overflow: "visible" }}>
              <path d={kePx(elipsGoyah(s, 2.6), aw, ah)} {...garis} strokeDashoffset={1 - p} />
            </svg>
          );
        } else if (a.jenis === "garis") {
          isi = (
            <svg viewBox={`0 0 ${aw} ${px(16)}`} style={{ position: "absolute", left: cx - aw / 2, top: cy, width: aw, height: px(16), overflow: "visible" }}>
              <path d={kePx(garisGoyah(s, 1.8), aw, px(160))} {...garis} strokeDashoffset={1 - p} />
              <path d={kePx(garisGoyah(`${s}b`, 1.8), aw, px(160))} {...garis} strokeDashoffset={1 - Math.max(0, p * 1.4 - 0.4)} transform={`translate(${px(6)} ${px(9)})`} />
            </svg>
          );
        } else if (a.jenis === "panah") {
          const sudut = ((a.arah ?? 200) * Math.PI) / 180;
          // panjang panah dibatasi agar ekor tetap di zona aman (K00.1)
          const tepi = px(24);
          const batas = (v: number, lo: number, hi: number) => (v > 1e-6 ? (hi - lo) / v : v < -1e-6 ? (lo - hi) / -v : 1e9);
          const pj = Math.min(Math.max(aw, px(180)),
                              batas(Math.cos(sudut), cx, Math.cos(sudut) > 0 ? zona[2] - tepi : zona[0] + tepi),
                              batas(Math.sin(sudut), cy, Math.sin(sudut) > 0 ? zona[3] - tepi : zona[1] + tepi));
          const ex = cx + Math.cos(sudut) * pj;
          const ey = cy + Math.sin(sudut) * pj;
          const j = (k: string) => (random(`${s}${k}`) - 0.5) * px(10);
          const mx = (cx + ex) / 2 + Math.sin(sudut) * px(40) + j("m");
          const my = (cy + ey) / 2 - Math.cos(sudut) * px(40) + j("n");
          const ujung = Math.atan2(cy - my, cx - mx);
          const kepala = (d: number) => `M${cx + j("a")} ${cy + j("b")} L${cx - Math.cos(ujung + d) * px(40)} ${cy - Math.sin(ujung + d) * px(40)}`;
          isi = (
            <>
              <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                <path d={`M${ex + j("e")} ${ey + j("f")} Q${mx} ${my} ${cx + j("a")} ${cy + j("b")}`} {...garis} strokeDashoffset={1 - Math.min(1, p * 1.25)} />
                <path d={kepala(0.5)} {...garis} strokeDashoffset={1 - Math.max(0, p * 4 - 3)} />
                <path d={kepala(-0.5)} {...garis} strokeDashoffset={1 - Math.max(0, p * 4 - 3)} />
              </svg>
              {a.teks ? (
                <div style={{ position: "absolute", left: Math.min(Math.max(ex - px(220), zona[0]), zona[2] - px(452)), width: px(440), textAlign: "center",
                              top: ey + (Math.sin(sudut) >= 0 ? px(14) : -px(90)), transform: `rotate(${(random(`${s}r`) - 0.5) * 6}deg)`,
                              fontFamily: t.font.subjudul.family, fontWeight: t.font.subjudul.weight, fontSize: px(t.ukuran.subjudul),
                              color: warnaGaris, whiteSpace: "normal", lineHeight: 1.05, opacity: Math.min(1, p * 2), padding: `0 ${px(14)}px`, boxSizing: "border-box" }}>{a.teks}</div>
              ) : null}
            </>
          );
        } else if (a.jenis === "bintang") {
          const r = Math.max(aw, ah) / 2;
          isi = (
            <svg viewBox="-12 -12 24 24" width={r * 2} height={r * 2} style={{ position: "absolute", left: cx - r, top: cy - r,
                                                                               transform: `rotate(${(random(s) - 0.5) * 10}deg) scale(${skalaPersepsi(p, 0.4)})` }}>
              <path d="M0 -10 L2.6 -3 L10 -3 L4 1.6 L6.2 9 L0 4.6 L-6.2 9 L-4 1.6 L-10 -3 L-2.6 -3 Z" fill={rgba(warnaGaris, 0.25)}
                    stroke={warnaGaris} strokeWidth={1.8} strokeLinejoin="round" opacity={Math.min(1, p * 2)} />
            </svg>
          );
        } else if (a.jenis === "kurung") {
          isi = (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", left: cx - aw / 2, top: cy - ah / 2, width: aw, height: ah, overflow: "visible" }}>
              <path vectorEffect="non-scaling-stroke" d={`M12 ${4 + random(`${s}1`) * 3} Q2 50 ${12 + random(`${s}2`) * 3} 96`} {...garis} strokeDashoffset={1 - p} />
              <path vectorEffect="non-scaling-stroke" d={`M88 ${4 + random(`${s}3`) * 3} Q98 50 ${88 - random(`${s}4`) * 3} 96`} {...garis} strokeDashoffset={1 - p} />
            </svg>
          );
        }
        return <React.Fragment key={i}>{isi}</React.Fragment>;
      })}
    </AbsoluteFill>
  );
};

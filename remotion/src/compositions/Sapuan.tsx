import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { PropsDasar, kurva, rgba, warna } from "../lib/kontrak";
import { motifDari, pakaiBoil, LapisTekstur } from "../lib/motif";

// Transisi penutup layar (dipakai render.py untuk transisi jenis "kertas" (E13) dan "coretan" (E14)): layar tertutup
// penuh tepat di tengah durasi → potongan gambar terjadi di balik sapuan.
export type SapuanElemen = { jenis: "kertas" | "coretan" };
export type SapuanProps = PropsDasar<SapuanElemen>;

export const Sapuan: React.FC<SapuanProps> = ({ W, H, fps, durasiFrame, tokens: t, elemen: el }) => {
  const f = useCurrentFrame();
  const m = motifDari(t);
  const getar = pakaiBoil(m.boil || 10);
  const tegas = kurva(t, "tegas");
  const tengah = durasiFrame / 2;
  const warnaLapis = [warna(t, "aksen-2"), warna(t, "aksen"), warna(t, "latar")];
  if (el.jenis === "coretan") {
    // goresan spidol zig-zag tebal menutup layar lalu terhapus dari ujung awal
    const garis = Array.from({ length: 9 }, (_, i) => {
      const y = (i + 0.5) * (H / 9);
      const jit = (k: string) => (random(`${k}${i}${getar}`) - 0.5) * W * 0.05;
      return `${i % 2 ? W + 80 + jit("a") : -80 + jit("b")} ${y + jit("c")}`;
    });
    const d = `M${garis.join(" L")}`;
    const tampil = interpolate(f, [0, tengah], [0, 1], { easing: tegas, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hapus = interpolate(f, [tengah + 1, durasiFrame], [0, 1], { easing: tegas, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <AbsoluteFill>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path d={d} fill="none" stroke={warna(t, "aksen")} strokeWidth={H / 9 + 60} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={`${tampil - hapus} 2`} strokeDashoffset={-hapus} />
        </svg>
      </AbsoluteFill>
    );
  }
  // kertas: tiga lembar bertekstur naik bergantian, lalu keluar ke atas
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {warnaLapis.map((c, i) => {
        const tunda = i * fps * 0.06;
        const masuk = interpolate(f, [tunda, tengah], [1, 0], { easing: tegas, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const keluar = interpolate(f, [tengah + tunda * 0.5, durasiFrame], [0, -1.15], { easing: tegas, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = (masuk + keluar) * H * 1.15;
        return (
          <div key={i} style={{ position: "absolute", left: -W * 0.1, width: W * 1.2, top: y - H * 0.05, height: H * 1.12, background: c,
                                transform: `rotate(${(i - 1) * 2.5}deg)`, boxShadow: `0 -${H * 0.01}px ${H * 0.02}px ${rgba("#000000", 0.25)}`,
                                clipPath: "polygon(0 2%, 12% 0, 30% 1.6%, 52% 0.2%, 71% 1.8%, 88% 0.4%, 100% 1.5%, 100% 100%, 0 100%)" }}>
            <LapisTekstur jenis={"kertas"} panelHex={c} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

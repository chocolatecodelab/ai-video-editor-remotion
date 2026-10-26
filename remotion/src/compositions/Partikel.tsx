import React from "react";
import { AbsoluteFill, random } from "remotion";
import { PropsDasar } from "../lib/kontrak";
import { ElemenUI, pakaiDasar, palet } from "../lib/dasar";

// E25 partikel: ledakan titik/kotak kecil berwarna token dari titik (x, y), melambat & jatuh pelan, memudar.
// Dekoratif (tanpa teks). Posisi dijepit ke zona aman agar tidak menabrak UI platform.
export type PartikelElemen = ElemenUI & { x?: number; y?: number; jumlah?: number; jangkau?: number; jadwal: { ledak: number } };
export type PartikelProps = PropsDasar<PartikelElemen>;

export const Partikel: React.FC<PartikelProps> = (props) => {
  const { dtk, px, el, w } = pakaiDasar(props);
  const { W, H, zona, durasiFrame, fps } = props;
  const [x0, y0, x1, y1] = zona;
  const cx = (el.x ?? 0.5) * W;
  const cy = (el.y ?? 0.4) * H;
  const n = el.jumlah ?? 28;
  const jangkau = px(el.jangkau ?? 260);
  const umur = durasiFrame / fps - el.jadwal.ledak;
  const tt = Math.max(0, dtk - el.jadwal.ledak);
  const p = Math.min(1, tt / umur);
  const warna = palet(w);
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => {
        const sudut = random(`a${i}`) * Math.PI * 2;
        const kec = 0.45 + 0.55 * random(`v${i}`);
        const r = jangkau * kec * (1 - (1 - p) ** 3);
        const x = Math.min(x1 - 8, Math.max(x0 + 8, cx + Math.cos(sudut) * r));
        const y = Math.min(y1 - 8, Math.max(y0 + 8, cy + Math.sin(sudut) * r + px(60) * p * p));
        const s = px(6 + 8 * random(`s${i}`)) * (1 - 0.5 * p);
        const kotak = random(`k${i}`) > 0.6;
        return (
          <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s,
                                borderRadius: kotak ? s * 0.2 : s, background: warna[i % warna.length],
                                opacity: tt > 0 ? (1 - p) ** 1.5 : 0, transform: `rotate(${p * 360 * (kec - 0.5)}deg)` }} />
        );
      })}
    </AbsoluteFill>
  );
};

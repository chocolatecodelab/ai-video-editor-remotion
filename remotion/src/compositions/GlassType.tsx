import React from "react";
import { AbsoluteFill } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";

// E17 glass-type: huruf raksasa dari kaca buram — isi putih tipis + tepi terang + kilau melintas; huruf naik bergantian
// dari blur ke tajam. Video di balik huruf di-blur render.py (kaca: true) → kesan kaca sungguhan. *kata* = kaca beraksen.
export type GlassTypeElemen = ElemenUI & { teks: string; y?: number; ukuran?: number; jadwal: { huruf: number[]; kilau: number } };
export type GlassTypeProps = PropsDasar<GlassTypeElemen>;

export const GlassType: React.FC<GlassTypeProps> = (props) => {
  const { px, t, el, w, naik, masuk, keluar } = pakaiDasar(props);
  const { H, zona } = props;
  const [x0, , x1] = zona;
  const j = el.jadwal;
  const baris = el.teks.split("\n");
  const terpanjang = Math.max(...baris.map((b) => b.replace(/\*/g, "").length), 1);
  // huruf kapital tebal ≈ 0,68 em per huruf → muat lebar zona aman
  const ukuran = Math.min(px(el.ukuran ?? t.ukuran.judul * 2), ((x1 - x0) * 0.96) / (terpanjang * 0.68));
  let k = 0;
  const kilau = naik(j.kilau, 0.9);
  return (
    <AbsoluteFill style={{ opacity: 1 - keluar }}>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: (el.y ?? 0.32) * H, transform: "translateY(-50%)",
                    textAlign: "center", lineHeight: 0.95 }}>
        {baris.map((b, bi) => (
          <div key={bi} style={{ whiteSpace: "nowrap" }}>
            {b.split("*").map((seg, si) => seg.split("").map((ch) => {
              const i = k++;
              const p = naik(j.huruf[Math.min(i, j.huruf.length - 1)] ?? 0, 0.45);
              const aksen = si % 2 === 1;
              const isi = aksen ? rgba(w.aksen, 0.5) : "rgba(255,255,255,0.34)";
              return (
                <span key={`${bi}-${i}`} style={{
                  display: "inline-block", fontFamily: t.font.judul.family, fontWeight: t.font.judul.weight, fontSize: ukuran,
                  color: "transparent", WebkitTextStroke: `${px(3)}px rgba(255,255,255,${0.7 + 0.25 * kilau})`, paintOrder: "stroke fill",
                  backgroundImage: `linear-gradient(115deg, ${isi} 0%, ${isi} 38%, rgba(255,255,255,0.75) 48%, ${isi} 58%, ${isi} 100%)`,
                  backgroundSize: "300% 100%", backgroundPosition: `${120 - 140 * kilau}% 0`,
                  WebkitBackgroundClip: "text", backgroundClip: "text",
                  filter: `drop-shadow(0 ${px(8)}px ${px(18)}px rgba(0,0,0,0.35)) blur(${(1 - p) * px(14)}px)`,
                  opacity: p * masuk,
                  transform: `translateY(${(1 - p) * px(60)}px) scale(${skalaPersepsi(p, 0.9)})`,
                }}>{ch === " " ? " " : ch}</span>
              );
            }))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

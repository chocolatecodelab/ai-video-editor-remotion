import React from "react";
import { AbsoluteFill, random } from "remotion";
import { PropsDasar, rgba, warna } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { motifDari, LapisTekstur, pakaiBoil } from "../lib/motif";
import { Teks } from "../lib/Teks";

// E02 couch-wall (klip cutaway/broll native): ilustrasi ruang tamu warna token — dinding sebagai kanvas, sofa, lampu
// lantai bercahaya, tanaman. Bingkai besar di dinding berganti isi tiap `ganti` detik (geser + pudar); kamera diam.
export type IsiDinding = { judul: string; sub?: string };
export type CouchWallElemen = ElemenUI & { konten: IsiDinding[]; ganti?: number; jadwal: { ganti: number[] } };
export type CouchWallProps = PropsDasar<CouchWallElemen>;

export const CouchWall: React.FC<CouchWallProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const [x0, y0, x1] = zona;
  const m = motifDari(t);
  const lantaiY = H * 0.72;
  const dinding = warna(t, "latar");
  const sofa = w.aksen2;
  const g = el.jadwal.ganti;
  const idx = Math.max(0, g.filter((x) => x <= dtk).length - 1);
  // gerak diam hanya dari motif: gaya ber-boil (doodle/sketch) → daun bergetar bertahap; lainnya diam (lampu menyala stabil)
  const getar = pakaiBoil(m.boil);
  // ganti isi: durasi & easing token gaya (masuk "standar", keluar "keluar") — bukan 0,45 s linear
  const dGanti = Math.max(0.2, el.durasi_masuk);
  const bingkaiW = (x1 - x0) * 0.86;
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ background: dinding, overflow: "hidden" }}>
        <LapisTekstur jenis={m.tekstur ?? "kertas"} panelHex={dinding} />
        {/* cahaya lampu di dinding */}
        <div style={{ position: "absolute", left: W * 0.55, top: H * 0.22, width: W * 0.9, height: W * 0.9, borderRadius: "50%",
                      background: `radial-gradient(circle, ${rgba(w.aksen, 0.28)}, transparent 62%)` }} />
        {/* lantai */}
        <div style={{ position: "absolute", left: 0, right: 0, top: lantaiY, bottom: 0, background: rgba(w.utama, 0.12) }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: lantaiY, height: px(10), background: rgba(w.utama, 0.2) }} />
        {/* bingkai dinding: isi berganti */}
        <div style={{ position: "absolute", left: (W - bingkaiW) / 2, top: Math.max(y0, H * 0.17), width: bingkaiW }}>
          <div style={{ padding: px(18), background: rgba(w.utama, 0.85), boxShadow: `0 ${px(18)}px ${px(30)}px rgba(0,0,0,0.3)` }}>
            <div style={{ position: "relative", height: H * 0.26, overflow: "hidden", background: rgba(dinding, 0.96) }}>
              {el.konten.map((k, i) => {
                const a = naik(g[i], dGanti, "standar");
                const b = i + 1 < g.length ? naik(g[i + 1], dGanti, "keluar") : 0;
                if (a <= 0 || b >= 1) return null;
                return (
                  <div key={i} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
                                        justifyContent: "center", padding: px(30), opacity: a * (1 - b),
                                        transform: `translateX(${(1 - a) * px(80) - b * px(80)}px)` }}>
                    <div style={{ ...font("judul"), fontSize: u.judul * 0.85, lineHeight: 1.02, color: w.utama, textAlign: "center" }}>
                      <Teks teks={k.judul} aksen={w.aksen} tunda={g[i]} />
                    </div>
                    {k.sub ? <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, marginTop: px(16), textAlign: "center" }}>{k.sub}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: px(12), marginTop: px(18) }}>
            {el.konten.map((_, i) => (
              <div key={i} style={{ width: px(i === idx ? 34 : 12), height: px(12), borderRadius: px(12), background: i === idx ? w.aksen : rgba(w.utama, 0.25) }} />
            ))}
          </div>
        </div>
        {/* sofa */}
        <div style={{ position: "absolute", left: W * 0.1, width: W * 0.8, top: lantaiY - H * 0.15, height: H * 0.17 }}>
          <div style={{ position: "absolute", left: "8%", right: "8%", top: 0, height: "62%", background: sofa, borderRadius: px(40),
                        boxShadow: `inset 0 -${px(14)}px 0 ${rgba("#000000", 0.12)}` }} />
          <div style={{ position: "absolute", left: "12%", width: "37%", top: "38%", height: "34%", background: sofa, borderRadius: px(26),
                        filter: "brightness(1.08)", boxShadow: `0 ${px(6)}px 0 ${rgba("#000000", 0.12)}` }} />
          <div style={{ position: "absolute", right: "12%", width: "37%", top: "38%", height: "34%", background: sofa, borderRadius: px(26),
                        filter: "brightness(1.08)", boxShadow: `0 ${px(6)}px 0 ${rgba("#000000", 0.12)}` }} />
          <div style={{ position: "absolute", left: 0, width: "13%", top: "22%", height: "62%", background: sofa, borderRadius: px(30), filter: "brightness(0.92)" }} />
          <div style={{ position: "absolute", right: 0, width: "13%", top: "22%", height: "62%", background: sofa, borderRadius: px(30), filter: "brightness(0.92)" }} />
          <div style={{ position: "absolute", left: "10%", right: "10%", top: "70%", height: "22%", background: sofa, borderRadius: px(16), filter: "brightness(0.85)" }} />
          <div style={{ position: "absolute", left: "14%", width: px(14), top: "90%", height: "14%", background: rgba(w.utama, 0.7) }} />
          <div style={{ position: "absolute", right: "14%", width: px(14), top: "90%", height: "14%", background: rgba(w.utama, 0.7) }} />
          <div style={{ position: "absolute", left: "26%", width: "14%", top: "18%", height: "30%", background: w.aksen, borderRadius: px(16), transform: "rotate(-8deg)" }} />
        </div>
        {/* lampu lantai */}
        <div style={{ position: "absolute", right: W * 0.03, top: lantaiY - H * 0.33, width: W * 0.14, height: H * 0.33 }}>
          <div style={{ position: "absolute", left: "15%", right: "15%", top: 0, height: "16%", background: rgba(w.aksen, 0.9),
                        clipPath: "polygon(22% 0, 78% 0, 100% 100%, 0 100%)", boxShadow: `0 0 ${px(40)}px ${w.aksen}` }} />
          <div style={{ position: "absolute", left: "48%", width: px(8), top: "16%", bottom: px(10), background: rgba(w.utama, 0.75) }} />
          <div style={{ position: "absolute", left: "28%", right: "28%", bottom: 0, height: px(12), borderRadius: px(6), background: rgba(w.utama, 0.75) }} />
        </div>
        {/* tanaman */}
        <div style={{ position: "absolute", left: W * 0.02, top: lantaiY - H * 0.2, width: W * 0.13, height: H * 0.2 }}>
          {[-35, -12, 8, 30, 52].map((r, i) => (
            <div key={i} style={{ position: "absolute", left: "38%", bottom: "30%", width: "26%", height: "72%", borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
                                  background: i % 2 ? w.aksen2 : rgba(w.aksen2, 0.75), filter: "brightness(0.75)", transformOrigin: "50% 100%",
                                  transform: `rotate(${r + (m.boil > 0 ? (random(`daun${i}.${getar}`) - 0.5) * 4 : 0)}deg)` }} />
          ))}
          <div style={{ position: "absolute", left: "22%", right: "22%", bottom: 0, height: "32%", background: w.aksen, borderRadius: `${px(6)}px ${px(6)}px ${px(18)}px ${px(18)}px` }} />
        </div>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 60%, rgba(0,0,0,0.22))" }} />
      </AbsoluteFill>
    </SediaMotif>
  );
};

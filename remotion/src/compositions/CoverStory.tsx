import React from "react";
import { AbsoluteFill } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E16 cover-story: tata letak sampul majalah di atas talking head. `bagian`: "masthead" (nama majalah raksasa — pasang
// dengan "belakang": true agar di balik kepala, butuh roto), "isi" (judul utama, baris sampul, edisi, barcode), "semua".
export type CoverStoryElemen = ElemenUI & {
  masthead?: string; judul_utama?: string; baris?: string[]; edisi?: string; bagian?: "masthead" | "isi" | "semua";
  jadwal: { masthead: number; judul: number; baris: number[]; barcode: number };
};
export type CoverStoryProps = PropsDasar<CoverStoryElemen>;

export const CoverStory: React.FC<CoverStoryProps> = (props) => {
  const { px, el, w, u, font, naik, keluar, motif, SediaMotif, wadah } = pakaiDasar(props);
  const { zona } = props;
  const [x0, y0, x1, y1] = zona;
  const j = el.jadwal;
  const bagian = el.bagian ?? "semua";
  const lebar = x1 - x0;
  const mh = naik(j.masthead, 0.5, "tegas");
  const huruf = (el.masthead ?? "COVER").toUpperCase();
  const ukuranMh = Math.min(px(320), (lebar / Math.max(4, huruf.length)) * 1.55);
  const pita = motif.bingkai === "brutal" || motif.bingkai === "kinetik";
  // teks di atas video: warna terang (teks-utama / latar, mana yang lebih terang) di atas scrim hitam (Spek.scrim render.py)
  const lum = (h: string) => [1, 3, 5].reduce((a, i) => a + parseInt(h.slice(i, i + 2), 16), 0);
  const terang = lum(w.utama) >= lum(w.latar) ? w.utama : w.latar;
  return (
    <SediaMotif wadah={wadah}>
    <AbsoluteFill style={{ opacity: 1 - keluar }}>
      {bagian !== "masthead" ? (
        <AbsoluteFill style={{ opacity: naik(0, 0.4), background: `linear-gradient(180deg, ${rgba("#000000", 0.6)} 0%, ${rgba("#000000", 0.6)} 38%, transparent 55%, transparent 62%, ${rgba("#000000", 0.6)} 80%)` }} />
      ) : null}
      {bagian !== "isi" ? (
        <div style={{ position: "absolute", left: x0, width: lebar, top: y0 - px(10), textAlign: "center", overflow: "hidden" }}>
          {/* textLength: masthead selalu tepat selebar zona, apa pun lebar huruf font gayanya */}
          <svg width={lebar} height={ukuranMh * 0.95} viewBox={`0 0 ${lebar} ${ukuranMh * 0.95}`}
               style={{ display: "block", transform: `translateY(${(1 - mh) * 100}%)`, opacity: mh, overflow: "visible" }}>
            <text x={0} y={ukuranMh * 0.82} textLength={lebar} lengthAdjust="spacingAndGlyphs" fill={w.aksen}
                  style={{ ...font("judul"), fontSize: ukuranMh }}>{huruf}</text>
          </svg>
        </div>
      ) : null}
      {bagian !== "masthead" ? (
        <>
          {el.edisi ? (
            <div style={{ position: "absolute", left: x0, top: y0 + ukuranMh * 0.95, ...font("isi"), fontSize: u.kecil * 0.85,
                          color: terang, letterSpacing: px(3), textTransform: "uppercase", opacity: naik(j.masthead + 0.3, 0.3),
                          textShadow: `0 ${px(2)}px ${px(6)}px rgba(0,0,0,0.45)` }}>{el.edisi}</div>
          ) : null}
          <div style={{ position: "absolute", left: x0, top: y0 + ukuranMh * 1.25, width: lebar * 0.52, display: "flex", flexDirection: "column",
                        gap: px(22) }}>
            {(el.baris ?? []).map((b, i) => {
              const p = naik(j.baris[i] ?? 0, 0.35);
              return (
                <div key={i} style={{ opacity: p, transform: `translateX(${(1 - p) * px(50)}px)` }}>
                  <div style={{ width: px(46), height: px(6), background: w.aksen, marginBottom: px(8) }} />
                  <div style={{ ...font("subjudul"), fontSize: u.isi, lineHeight: 1.08, color: terang,
                                textShadow: `0 ${px(2)}px ${px(10)}px rgba(0,0,0,0.55)` }}>
                    <Teks teks={b} aksen={w.aksen} tunda={(j.baris[i] ?? 0) - el.durasi_masuk} />
                  </div>
                </div>
              );
            })}
          </div>
          {el.judul_utama ? (() => {
            const p = naik(j.judul, 0.45, "tegas");
            return (
              <div style={{ position: "absolute", left: x0, width: lebar, bottom: (props.H - y1) + px(150), textAlign: "left",
                            opacity: p, transform: `scale(${skalaPersepsi(p, 1.15, 1.0)})`, transformOrigin: "0% 100%" }}>
                <div style={{ display: "inline-block", padding: pita ? `${px(6)}px ${px(18)}px` : 0, background: pita ? w.aksen : "transparent",
                              ...font("judul"), fontSize: u.judul, lineHeight: 0.98, color: pita ? w.latar : terang,
                              textTransform: "uppercase", textShadow: pita ? "none" : `0 ${px(4)}px ${px(16)}px rgba(0,0,0,0.6)` }}>
                  <Teks teks={el.judul_utama} aksen={pita ? w.latar : w.aksen} hias={!pita} tunda={j.judul - el.durasi_masuk} />
                </div>
              </div>
            );
          })() : null}
          <div style={{ position: "absolute", right: px(0) + (props.W - x1), bottom: (props.H - y1) + px(20), opacity: naik(j.barcode, 0.3),
                        background: "#FFFFFF", padding: px(8), display: "flex", gap: px(2), alignItems: "flex-end", height: px(70) }}>
            {Array.from({ length: 26 }, (_, i) => (
              <div key={i} style={{ width: px([2, 4, 1.5, 3][i % 4]), height: "100%", background: "#111111" }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: x0, right: props.W - x1, top: y0 + ukuranMh * 0.92, height: px(2),
                        background: rgba(terang, 0.6), opacity: naik(j.masthead + 0.2, 0.3) }} />
        </>
      ) : null}
    </AbsoluteFill>
    </SediaMotif>
  );
};

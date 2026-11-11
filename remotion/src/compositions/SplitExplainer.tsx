import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E50 split-explainer (tata letak 50/50 editorial takeaway):
// Diadopsi dari referensi "AI effect.mp4" (talking-head tech explainer):
// 1. Pembagian layar presisi 50/50: paruh atas kanvas gelap studio matte untuk poin editorial, paruh bawah ruang talking-head.
// 2. Kategori overline berjarak lebar (uppercase tracking).
// 3. Langkah bernomor urut dengan angka serif raksasa (Playfair/Bodoni) aksen neon (Electric Lime).
// 4. Judul poin tebal dengan dukungan *aksen* + sub-keterangan berbobot reguler abu-abu redup.
// 5. Animasi mask slide-up berjenjang (staggered) dengan fisika spring.

export type PoinLangkah = {
  nomor?: number | string;
  judul: string;
  sub?: string;
};

export type SplitExplainerElemen = ElemenUI & {
  kategori?: string; // misal "CARANYA", "STRATEGI", "3 ATURAN"
  langkah: PoinLangkah[];
  rasio_split?: number; // default: 0.5 (50% atas)
  jadwal: {
    kategori?: number;
    langkah: number[]; // detik tiap langkah masuk
  };
};

export type SplitExplainerProps = PropsDasar<SplitExplainerElemen>;

export const SplitExplainer: React.FC<SplitExplainerProps> = (props) => {
  const { f, fps, px, t, el, w, u, font, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H } = props;

  const rawSpek = (el as any).spek ?? {};
  const j = el.jadwal ?? { langkah: [] };
  const tKat = j.kategori ?? 0.15;
  const rasio = el.rasio_split ?? 0.5;
  const tinggiAtas = H * rasio;
  const kategori = el.kategori ?? rawSpek.kategori ?? rawSpek.header ?? "CARANYA";
  const daftarLangkah: PoinLangkah[] = el.langkah ?? (el as any).items ?? rawSpek.items ?? rawSpek.langkah ?? [];

  // Spring entrance kategori
  const spKat = spring({
    frame: f - Math.round(tKat * fps),
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.6 },
  });

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {/* Paruh Atas: Kanvas Matte Studio Gelap */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: tinggiAtas,
            background: "linear-gradient(180deg, #0A0C10 0%, #11141A 100%)",
            borderBottom: "1.5px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `0 ${px(14)}px ${px(30)}px rgba(0, 0, 0, 0.45)`,
            display: "flex",
            flexDirection: "column",
            padding: `${px(50)}px ${px(40)}px ${px(24)}px ${px(40)}px`,
            boxSizing: "border-box",
            zIndex: 2,
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "10%",
              width: "80%",
              height: "60%",
              background: `radial-gradient(circle, ${rgba(w.aksen, 0.12)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Kategori Overline (Tracked Uppercase) */}
          <div
            style={{
              ...font("isi"),
              fontSize: u.kecil * 0.85,
              fontWeight: 700,
              letterSpacing: px(4),
              textTransform: "uppercase",
              color: rgba(w.utama, 0.55),
              opacity: Math.min(1, spKat * 2),
              transform: `translateY(${(1 - Math.min(1, spKat)) * px(12)}px)`,
              marginBottom: px(28),
            }}
          >
            {kategori}
          </div>

          {/* Daftar Langkah Bernomor */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: px(24),
              flex: 1,
              justifyContent: "flex-start",
            }}
          >
            {daftarLangkah.map((item, idx) => {
              const tItem = j.langkah?.[idx] ?? 0.5 + idx * 0.8;
              const spItem = spring({
                frame: f - Math.round(tItem * fps),
                fps,
                config: { damping: 13, stiffness: 130, mass: 0.65 },
              });

              if (spItem <= 0.01) return null;

              const opasitas = Math.min(1, spItem * 2.5);
              const translateY = (1 - Math.min(1, spItem)) * px(24);
              const nomorDisplay = item.nomor ?? (idx + 1);

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: px(20),
                    opacity: opasitas,
                    transform: `translateY(${translateY}px)`,
                  }}
                >
                  {/* Numeral Serif Raksasa */}
                  <div
                    style={{
                      fontFamily: t.font.judul?.family || "Playfair Display, Georgia, 'Times New Roman', serif",
                      fontStyle: "normal",
                      fontWeight: 700,
                      fontSize: px(46),
                      lineHeight: 0.95,
                      color: w.aksen,
                      fontVariantNumeric: "tabular-nums",
                      minWidth: px(32),
                      textAlign: "center",
                      textShadow: `0 0 ${px(16)}px ${rgba(w.aksen, 0.4)}`,
                    }}
                  >
                    {nomorDisplay}
                  </div>

                  {/* Konten Langkah (Judul + Sub) */}
                  <div style={{ display: "flex", flexDirection: "column", gap: px(4), flex: 1 }}>
                    <div
                      style={{
                        fontFamily: t.font.judul?.family || "Playfair Display, Georgia, 'Times New Roman', serif",
                        fontWeight: 600,
                        fontSize: u.isi * 1.08,
                        lineHeight: 1.18,
                        color: w.utama,
                        letterSpacing: px(0.2),
                      }}
                    >
                      <Teks teks={item.judul} aksen={w.aksen} />
                    </div>

                    {item.sub && (
                      <div
                        style={{
                          ...font("isi"),
                          fontSize: u.kecil * 0.88,
                          lineHeight: 1.25,
                          color: rgba(w.utama, 0.65),
                          marginTop: px(2),
                        }}
                      >
                        {item.sub}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paruh Bawah: Frame Transparan untuk Talking Head */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: tinggiAtas,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          {/* Subtle top divider drop shadow onto the footage */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: px(16),
              background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
            }}
          />
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

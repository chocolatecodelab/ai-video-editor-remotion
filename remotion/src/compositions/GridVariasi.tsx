import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar, palet } from "../lib/dasar";

// E23 grid-variasi: matriks Bento generatif "1 input ➔ N variasi"
// Kartu kaca gelap dengan header transformasi bercahaya, penghitung tabular-nums dinamis,
// dan ubin mikrokartu bergradien yang meletup (pop) secara staggered.
export type GridVariasiElemen = ElemenUI & {
  judul?: string;
  dari_label?: string;
  ke: number;
  label?: string;
  kolom?: number;
  tag?: string;
  jadwal: { ubin: number[] };
};
export type GridVariasiProps = PropsDasar<GridVariasiElemen>;

export const GridVariasi: React.FC<GridVariasiProps> = (props) => {
  const { dtk, px, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const kolom = el.kolom ?? 12;
  const total = Math.ceil(el.ke / kolom) * kolom;
  const terisi = j.ubin.filter((x) => x <= dtk).length;
  const warna = palet(w);

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          borderRadius: px(20),
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(20, 25, 36, 0.96) 0%, rgba(12, 16, 24, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: `0 ${px(24)}px ${px(50)}px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          backdropFilter: "blur(24px)",
          padding: `${px(24)}px ${px(28)}px`,
        }}
      >
        {/* Transformation Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(20) }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(12) }}>
            <span
              style={{
                padding: `${px(3)}px ${px(10)}px`,
                borderRadius: px(6),
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                ...font("isi"),
                fontSize: u.kecil * 0.8,
                color: "rgba(255, 255, 255, 0.75)",
                letterSpacing: px(0.5),
              }}
            >
              {el.dari_label ?? "1 WORKFLOW"}
            </span>

            <span style={{ color: w.aksen, fontSize: px(18), fontWeight: 800 }}>➔</span>

            <div style={{ display: "flex", alignItems: "baseline", gap: px(8) }}>
              <span
                style={{
                  ...font("judul"),
                  fontSize: u.sub * 1.35,
                  color: w.aksen,
                  fontWeight: 900,
                  fontVariantNumeric: "tabular-nums",
                  textShadow: `0 0 ${px(16)}px ${rgba(w.aksen, 0.6)}`,
                }}
              >
                {terisi}
              </span>
              <span style={{ ...font("isi"), fontSize: u.kecil * 0.85, color: "rgba(255, 255, 255, 0.65)" }}>
                {el.label ?? "variasi dihasilkan"}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: `${px(2)}px ${px(10)}px`,
              borderRadius: px(999),
              background: rgba(w.aksen, 0.15),
              border: `1px solid ${rgba(w.aksen, 0.35)}`,
              ...font("isi"),
              fontSize: u.kecil * 0.72,
              color: w.aksen,
              letterSpacing: px(0.5),
              textTransform: "uppercase",
            }}
          >
            {el.tag ?? "GENERATIVE BENTO"}
          </div>
        </div>

        {/* Bento Grid Matrix */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${kolom}, 1fr)`,
            gap: px(8),
            padding: px(12),
            borderRadius: px(14),
            background: "rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {Array.from({ length: total }, (_, k) => {
            const a = k < el.ke ? naik(j.ubin[k] ?? 0.5 + k * 0.05, 0.18) : 0;
            const aktif = a > 0;
            const wTile = warna[(k * 7) % warna.length];

            return (
              <div
                key={k}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: px(6),
                  background: aktif
                    ? `linear-gradient(135deg, ${wTile} 0%, rgba(255, 255, 255, 0.15) 100%)`
                    : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${aktif ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.05)"}`,
                  boxShadow: aktif ? `0 0 ${px(10)}px ${rgba(wTile, 0.4)}` : "none",
                  transform: `scale(${aktif ? skalaPersepsi(a, 0.55) : 1})`,
                  transition: "background 0.15s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </Wadah>
  );
};


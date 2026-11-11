import React from "react";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E10 chart-grow: visualisasi data batang & garis berkelas studio (Apple Keynote / modern fintech)
// Kolom kaca bergradien dengan specular cap highlight, floating value badge dengan tabular-nums,
// garis panduan grid beraksen, dan sorotan pahlawan (highlight) yang berpendar.
export type ChartGrowElemen = ElemenUI & {
  judul?: string;
  nilai: number[];
  label?: string[];
  akhiran?: string;
  sorot?: number;
  bentuk?: "batang" | "garis";
  catatan?: string;
  badge?: string;
  jadwal: { batang: number[]; durasi_batang: number; catatan: number };
};
export type ChartGrowProps = PropsDasar<ChartGrowElemen>;

const fmt = (n: number) =>
  Math.abs(n) >= 100
    ? Math.round(n).toLocaleString("id-ID")
    : (Math.round(n * 10) / 10).toLocaleString("id-ID");

export const ChartGrow: React.FC<ChartGrowProps> = (props) => {
  const { px, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const maks = Math.max(...el.nilai, 1);
  const sorot = el.sorot ?? el.nilai.length - 1;
  const tinggi = u.isi * 6.6;
  const garis = el.bentuk === "garis";
  const n = el.nilai.length;
  const titik = el.nilai.map((v, i) => [((i + 0.5) / n) * 100, 100 - (v / maks) * 85] as const);
  const pGaris = naik(j.batang[0], j.batang[n - 1] - j.batang[0] + j.durasi_batang);

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          padding: `${px(26)}px ${px(30)}px`,
          borderRadius: px(20),
          background: "linear-gradient(180deg, rgba(20, 25, 36, 0.96) 0%, rgba(12, 16, 24, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: `0 ${px(24)}px ${px(50)}px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14)`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(22) }}>
          <div style={{ ...font("subjudul"), fontSize: u.sub * 0.95, color: w.utama, letterSpacing: px(0.5) }}>
            <Teks teks={el.judul ?? "METRIK PERTUMBUHAN"} aksen={w.aksen} />
          </div>

          {/* Metric Status Legend Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(6),
              padding: `${px(3)}px ${px(10)}px`,
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
            <div style={{ width: px(6), height: px(6), borderRadius: "50%", background: w.aksen, boxShadow: `0 0 ${px(6)}px ${w.aksen}` }} />
            <span>{el.badge ?? "TREN NAIK"}</span>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div
          style={{
            position: "relative",
            height: tinggi,
            display: "flex",
            alignItems: "flex-end",
            gap: px(16),
            borderBottom: `${px(2)}px solid rgba(255, 255, 255, 0.15)`,
            padding: `0 ${px(8)}px`,
          }}
        >
          {/* Horizontal Grid Guidelines */}
          {[0.25, 0.5, 0.75, 1.0].map((g) => (
            <div
              key={g}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: tinggi * g * 0.85,
                height: px(1),
                borderBottom: "1px dashed rgba(255, 255, 255, 0.08)",
              }}
            />
          ))}

          {/* Line Mode Rendering */}
          {garis ? (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
                clipPath: `inset(-10% ${(1 - pGaris) * 100}% -10% -2%)`,
              }}
            >
              <defs>
                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={w.aksen} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={w.aksen} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={`M${titik.map((p) => p.join(" ")).join(" L")} L100 100 L0 100 Z`}
                fill="url(#chartLineGrad)"
              />
              {/* Main Line */}
              <path
                d={`M${titik.map((p) => p.join(" ")).join(" L")}`}
                fill="none"
                stroke={w.aksen}
                strokeWidth={px(4.5)}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          ) : null}

          {/* Line Mode Points */}
          {garis
            ? titik.map(([x, y], i) => {
                const p = naik(j.batang[i], j.durasi_batang, "tegas");
                const aktif = i === sorot;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: `translate(-50%, -50%) scale(${p})`,
                    }}
                  >
                    <div
                      style={{
                        width: px(aktif ? 22 : 14),
                        height: px(aktif ? 22 : 14),
                        borderRadius: "50%",
                        background: aktif ? w.aksen : "rgba(20, 25, 36, 0.95)",
                        border: `${px(3)}px solid ${aktif ? "#FFFFFF" : w.aksen}`,
                        boxShadow: aktif ? `0 0 ${px(16)}px ${w.aksen}` : "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "160%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        whiteSpace: "nowrap",
                        padding: `${px(2)}px ${px(8)}px`,
                        borderRadius: px(6),
                        background: aktif ? w.aksen : "rgba(0, 0, 0, 0.5)",
                        color: aktif ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)",
                        ...font(aktif ? "subjudul" : "isi"),
                        fontSize: aktif ? u.isi * 0.9 : u.kecil * 0.85,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {fmt(el.nilai[i] * p)}
                      {el.akhiran ?? ""}
                    </div>
                  </div>
                );
              })
            : /* Column Bars Mode */
              el.nilai.map((v, i) => {
                const p = naik(j.batang[i], j.durasi_batang, "tegas");
                const h = (v / maks) * tinggi * 0.85 * p;
                const aktif = i === sorot;

                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    {/* Floating Value Pill Badge */}
                    <div
                      style={{
                        position: "relative",
                        opacity: p,
                        marginBottom: px(8),
                        padding: `${px(2)}px ${px(8)}px`,
                        borderRadius: px(6),
                        background: aktif ? w.aksen : "rgba(255, 255, 255, 0.08)",
                        border: `1px solid ${aktif ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                        color: aktif ? "#FFFFFF" : "rgba(255, 255, 255, 0.75)",
                        ...font(aktif ? "subjudul" : "isi"),
                        fontSize: aktif ? u.isi * 0.88 : u.kecil * 0.82,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                        boxShadow: aktif ? `0 0 ${px(12)}px ${rgba(w.aksen, 0.6)}` : "none",
                      }}
                    >
                      {fmt(v * p)}
                      {el.akhiran ?? ""}
                    </div>

                    {/* Column Capsule Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: Math.max(h, px(4)),
                        borderRadius: `${px(10)}px ${px(10)}px 0 0`,
                        background: aktif
                          ? `linear-gradient(180deg, ${w.aksen} 0%, rgba(${w.aksen.startsWith("#") ? "37, 99, 235" : "37, 99, 235"}, 0.35) 100%)`
                          : "linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 100%)",
                        boxShadow: aktif ? `0 0 ${px(22)}px ${rgba(w.aksen, 0.65)}` : "none",
                        border: `1px solid ${aktif ? rgba(w.aksen, 0.8) : "rgba(255, 255, 255, 0.12)"}`,
                        borderBottom: "none",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Top Specular Cap Light */}
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          height: px(3),
                          background: aktif ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.4)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Bottom Labels */}
        {el.label?.length ? (
          <div style={{ display: "flex", gap: px(16), padding: `${px(12)}px ${px(8)}px 0` }}>
            {el.label.map((l, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  ...font("isi"),
                  fontSize: u.kecil * 0.9,
                  color: i === sorot ? w.utama : "rgba(255, 255, 255, 0.5)",
                  whiteSpace: "nowrap",
                  fontWeight: i === sorot ? 700 : 500,
                }}
              >
                {l}
              </div>
            ))}
          </div>
        ) : null}

        {/* Note / Caption Footer */}
        {el.catatan ? (
          <div
            style={{
              marginTop: px(18),
              padding: `${px(8)}px ${px(14)}px`,
              borderRadius: px(8),
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              ...font("isi"),
              fontSize: u.kecil * 0.95,
              color: w.utama,
              opacity: naik(j.catatan, 0.3),
            }}
          >
            <Teks teks={el.catatan} aksen={w.aksen} tunda={j.catatan - el.durasi_masuk - 0.15} />
          </div>
        ) : null}
      </div>
    </Wadah>
  );
};


import React from "react";
import { interpolate, spring } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";

// E48 validasi-badge (overlay visual perbandingan metode):
// Capsule pill badge yang bermorfosis dari status kesalahan ([✕ Salah]) ke status solusi ([✓ Benar]).
// Dilengkapi ikon SVG dinamis, efek spring bouncy, kilau spekular, dan transisi warna berkelas.

export type ValidasiBadgeElemen = ElemenUI & {
  salah_teks?: string;
  salah_sub?: string;
  benar_teks?: string;
  benar_sub?: string;
  jadwal: {
    ganti: number;
  };
};

export type ValidasiBadgeProps = PropsDasar<ValidasiBadgeElemen>;

export const ValidasiBadge: React.FC<ValidasiBadgeProps> = (props) => {
  const { f, fps, dtk, px, t, el, w, u, font, Wadah, wadah } = pakaiDasar(props, "atas");

  const tGanti = el.jadwal.ganti ?? 1.8;
  const sudahGanti = dtk >= tGanti;

  // Spring for the morph transition at tGanti
  const spGanti = spring({
    frame: f - Math.round(tGanti * fps),
    fps,
    config: { damping: 11, stiffness: 130, mass: 0.6 },
  });

  // Progress 0..1 for color and text fade
  const pGanti = interpolate(dtk, [tGanti - 0.08, tGanti + 0.16], [0, 1], {
    easing: kurva(t, "tegas"),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Specular light sweep on successful morph
  const kilau = interpolate(dtk, [tGanti + 0.05, tGanti + 0.85], [0, 1.4], {
    easing: kurva(t, "standar"),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Color values
  const warnaSalah = "#ef4444"; // rich crimson
  const warnaBenar = "#10b981"; // rich emerald / cyan
  const aksenWarna = sudahGanti ? warnaBenar : warnaSalah;

  const teksJudul = sudahGanti
    ? el.benar_teks ?? "Benar"
    : el.salah_teks ?? "Salah";

  const teksSub = sudahGanti
    ? el.benar_sub ?? "Teks rapi di balik subjek (rotoscope)"
    : el.salah_sub ?? "Teks menutupi wajah penutur";

  // Pill sizing
  const radius = px(999);

  return (
    <Wadah wadah={wadah}>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: px(16),
            padding: `${px(12)}px ${px(26)}px ${px(12)}px ${px(14)}px`,
            borderRadius: radius,
            background: "rgba(10, 15, 29, 0.88)",
            border: `1.5px solid ${rgba(aksenWarna, 0.45)}`,
            boxShadow: `
              inset 0 ${px(1.5)}px 0 rgba(255,255,255,0.3),
              inset 0 -${px(1)}px 0 rgba(0,0,0,0.5),
              0 ${px(14)}px ${px(34)}px rgba(0,0,0,0.55),
              0 0 ${px(20)}px ${rgba(aksenWarna, 0.22)}
            `,
            backdropFilter: "blur(18px)",
            transform: `scale(${skalaPersepsi(spGanti > 0 ? 1 + (1 - Math.abs(spGanti - 1)) * 0.06 : 1, 0.95)})`,
            overflow: "hidden",
            maxWidth: "92%",
          }}
        >
          {/* Specular shine sweep */}
          {sudahGanti && (
            <div
              style={{
                position: "absolute",
                top: "-40%",
                bottom: "-40%",
                width: "25%",
                left: `${-35 + kilau * 120}%`,
                transform: "rotate(20deg)",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Left Icon Capsule with Animated SVG */}
          <div
            style={{
              position: "relative",
              width: px(40),
              height: px(40),
              borderRadius: "50%",
              background: aksenWarna,
              boxShadow: `0 0 ${px(14)}px ${rgba(aksenWarna, 0.6)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transform: `rotate(${pGanti * 180}deg) scale(${skalaPersepsi(spGanti > 0 ? spGanti : 1, 0.8)})`,
              transition: "background 0.2s ease",
            }}
          >
            {!sudahGanti ? (
              /* Crosshair X Icon (Salah) */
              <svg width={px(20)} height={px(20)} viewBox="0 0 24 24" fill="none">
                <path
                  d="M 6 6 L 18 18 M 18 6 L 6 18"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              /* Checkmark Icon (Benar) */
              <svg width={px(22)} height={px(22)} viewBox="0 0 24 24" fill="none">
                <path
                  d="M 5 12.5 L 9.5 17 L 19 7"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Text Content */}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: px(8) }}>
              <span
                style={{
                  ...font("subjudul"),
                  fontSize: u.isi * 1.05,
                  fontWeight: 800,
                  letterSpacing: px(0.6),
                  color: aksenWarna,
                  textTransform: "uppercase",
                }}
              >
                {teksJudul}
              </span>

              <span
                style={{
                  ...font("isi"),
                  fontSize: u.kecil * 0.72,
                  color: rgba(w.utama, 0.4),
                  fontFamily: "monospace",
                }}
              >
                {sudahGanti ? "● VERIFIED" : "▲ WARNING"}
              </span>
            </div>

            {teksSub && (
              <span
                style={{
                  ...font("isi"),
                  fontSize: u.kecil * 0.9,
                  color: rgba(w.utama, 0.85),
                  marginTop: px(2),
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {teksSub}
              </span>
            )}
          </div>
        </div>
      </div>
    </Wadah>
  );
};

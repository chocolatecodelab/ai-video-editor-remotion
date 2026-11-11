import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// E47 layer-explosion (klip cutaway broll 3D native):
// Deconstructs the visual rotoscope depth stack into 4 isometric floating planes in 3D perspective space:
// Plane 1: Latar plate (background)
// Plane 2: Teks depth (typography tucked behind subject)
// Plane 3: Cutout subjek (rotoscope alpha mask with vector anchor points)
// Plane 4: Caption / UI overlay (foreground)
// Connected by dashed projection lines and annotated with luminous pill badges.

export type LayerExplosionElemen = ElemenUI & {
  judul?: string;
  sub?: string;
  kategori?: string;
  teks_layer?: string;
  caption_layer?: string;
  nama_lapis?: string[];
  lapis_latar_label?: string;
  lapis_teks_sub?: string;
  jadwal: {
    ledak: number;
    lapis: number[];
  };
};

export type LayerExplosionProps = PropsDasar<LayerExplosionElemen>;

// Crosshair corner HUD marker for engineering precision
const SudutCrosshair: React.FC<{ px: (v: number) => number; warna: string }> = ({ px, warna }) => (
  <svg
    width={px(18)}
    height={px(18)}
    viewBox="0 0 18 18"
    fill="none"
    style={{ opacity: 0.65 }}
  >
    <path d="M 9 0 L 9 18 M 0 9 L 18 9" stroke={warna} strokeWidth="1.2" />
    <circle cx="9" cy="9" r="3" stroke={warna} strokeWidth="1" fill="none" />
  </svg>
);

export const LayerExplosion: React.FC<LayerExplosionProps> = (props) => {
  const { f, fps, dtk, px, t, el, w, u, font, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H } = props;

  const j = el.jadwal;
  const tLedak = j.ledak ?? 0.5;
  const tLapis = j.lapis ?? [0.6, 0.85, 1.1, 1.35];

  // Spring physics for the layer separation along Z
  const spLedak = spring({
    frame: f - Math.round(tLedak * fps),
    fps,
    config: { damping: 13, stiffness: 95, mass: 0.8 },
  });

  // Smooth floating camera idle drift (cinematic breathing)
  const driftX = Math.sin(dtk * 1.2) * 1.4;
  const driftY = Math.cos(dtk * 1.5) * 1.8;
  const driftZ = Math.sin(dtk * 0.9) * 0.8;

  // Stacking parameters
  const jarakZ = px(220) * spLedak;
  const cardW = W * 0.68;
  const cardH = H * 0.44;

  const dataLapis = [
    {
      id: "latar",
      nomor: "❶",
      nama: el.nama_lapis?.[0] ?? "Latar Plate",
      ket: "Background footage",
      z: -1.6 * jarakZ,
      badgeColor: rgba(w.sekunder, 0.9),
      warnaGaris: rgba(w.sekunder, 0.35),
    },
    {
      id: "teks",
      nomor: "❷",
      nama: el.nama_lapis?.[1] ?? "Teks Depth",
      ket: "Di belakang subjek",
      z: -0.5 * jarakZ,
      badgeColor: w.aksen2 || "#38bdf8",
      warnaGaris: rgba(w.aksen2 || "#38bdf8", 0.6),
    },
    {
      id: "subjek",
      nomor: "❸",
      nama: el.nama_lapis?.[2] ?? "Subjek Roto",
      ket: "Alpha matte cutout",
      z: 0.5 * jarakZ,
      badgeColor: w.aksen || "#f59e0b",
      warnaGaris: rgba(w.aksen || "#f59e0b", 0.65),
    },
    {
      id: "caption",
      nomor: "❹",
      nama: el.nama_lapis?.[3] ?? "Caption / UI",
      ket: "Lapisan paling depan",
      z: 1.6 * jarakZ,
      badgeColor: w.utama,
      warnaGaris: rgba(w.utama, 0.5),
    },
  ];

  // Global header & HUD reveal
  const masukHeader = interpolate(dtk, [0.1, 0.6], [0, 1], {
    easing: kurva(t, "standar"),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const judulUtama = el.judul ?? "DEKONSTRUKSI LAYER";
  const subJudul = el.sub ?? "Struktur Kedalaman Rotoscope 3D";
  const teksTengah = el.teks_layer ?? "ROTOSCOPE";
  const captionTeks = el.caption_layer ?? "Memisahkan subjek dari latar belakang";

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden", background: "#050811" }}>
        {/* Gaya latar dinamis */}
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />

        {/* Ambient atmospheric lighting */}
        <div
          style={{
            position: "absolute",
            width: W * 0.9,
            height: H * 0.5,
            left: W * 0.05,
            top: H * 0.25,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${rgba(w.aksen2 || "#38bdf8", 0.16)} 0%, ${rgba(w.aksen || "#f59e0b", 0.08)} 45%, transparent 70%)`,
            filter: `blur(${px(50)}px)`,
            pointerEvents: "none",
          }}
        />

        {/* Top HUD Header */}
        <div
          style={{
            position: "absolute",
            top: H * 0.07,
            left: W * 0.08,
            right: W * 0.08,
            opacity: masukHeader,
            transform: `translateY(${px(20) * (1 - masukHeader)}px)`,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: px(12) }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: px(8),
                padding: `${px(5)}px ${px(14)}px`,
                borderRadius: px(999),
                background: "rgba(15, 23, 42, 0.7)",
                border: `1px solid ${rgba(w.aksen2 || "#38bdf8", 0.4)}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  width: px(8),
                  height: px(8),
                  borderRadius: "50%",
                  background: w.aksen2 || "#38bdf8",
                  boxShadow: `0 0 ${px(8)}px ${w.aksen2 || "#38bdf8"}`,
                }}
              />
              <span
                style={{
                  ...font("isi"),
                  fontSize: u.kecil * 0.78,
                  letterSpacing: px(1.2),
                  color: w.aksen2 || "#38bdf8",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {el.kategori ?? "Layer Deconstruction"}
              </span>
            </div>

            <div
              style={{
                ...font("isi"),
                fontSize: u.kecil * 0.75,
                color: rgba(w.utama, 0.5),
                letterSpacing: px(0.8),
                fontFamily: "monospace",
              }}
            >
              ROT_ISO: -26° / +22°
            </div>
          </div>

          <div
            style={{
              ...font("judul"),
              fontSize: u.judul * 0.72,
              lineHeight: 1.05,
              color: w.utama,
              textShadow: `0 ${px(2)}px ${px(14)}px rgba(0,0,0,0.6)`,
            }}
          >
            <Teks teks={judulUtama} aksen={w.aksen} />
          </div>

          <div
            style={{
              ...font("isi"),
              fontSize: u.isi * 0.85,
              color: rgba(w.utama, 0.7),
              marginTop: px(6),
            }}
          >
            {subJudul}
          </div>
        </div>

        {/* 3D Perspective Viewport */}
        <AbsoluteFill
          style={{
            perspective: px(1300),
            perspectiveOrigin: "50% 50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Floating Isometric Stage */}
          <div
            style={{
              position: "relative",
              width: 0,
              height: 0,
              transformStyle: "preserve-3d",
              transform: `
                translateY(${H * 0.05}px)
                rotateX(${22 + driftX}deg)
                rotateY(${-26 + driftY}deg)
                rotateZ(${5 + driftZ}deg)
              `,
            }}
          >
            {/* SVG 3D Projection Guides connecting the corners across planes */}
            {spLedak > 0.05 && (
              <svg
                style={{
                  position: "absolute",
                  left: -cardW / 2,
                  top: -cardH / 2,
                  width: cardW,
                  height: cardH,
                  pointerEvents: "none",
                  overflow: "visible",
                  transformStyle: "preserve-3d",
                  opacity: Math.min(1, spLedak * 1.5) * 0.7,
                }}
              >
                {/* Visual Corner Pins */}
                {[[0, 0], [cardW, 0], [0, cardH], [cardW, cardH]].map(([cx, cy], ci) => (
                  <circle
                    key={ci}
                    cx={cx}
                    cy={cy}
                    r={px(3)}
                    fill={rgba(w.utama, 0.4)}
                  />
                ))}
              </svg>
            )}

            {/* Render Each Layer Plane */}
            {dataLapis.map((layer, idx) => {
              const waktuBadge = tLapis[idx] ?? (0.6 + idx * 0.25);
              const spBadge = spring({
                frame: f - Math.round(waktuBadge * fps),
                fps,
                config: { damping: 12, stiffness: 140, mass: 0.6 },
              });

              return (
                <div
                  key={layer.id}
                  style={{
                    position: "absolute",
                    width: cardW,
                    height: cardH,
                    left: -cardW / 2,
                    top: -cardH / 2,
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${layer.z}px)`,
                    borderRadius: px(20),
                    background:
                      layer.id === "latar"
                        ? "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.7) 100%)"
                        : "linear-gradient(135deg, rgba(15,23,42,0.45) 0%, rgba(30,41,59,0.2) 100%)",
                    border: `1px solid ${layer.warnaGaris}`,
                    boxShadow: `
                      inset 0 ${px(1.5)}px 0 rgba(255,255,255,0.2),
                      0 ${px(16)}px ${px(36)}px rgba(0,0,0,0.45)
                    `,
                    backdropFilter: "blur(14px)",
                    overflow: "visible",
                  }}
                >
                  {/* Corner Crosshairs */}
                  <div style={{ position: "absolute", top: px(10), left: px(10) }}>
                    <SudutCrosshair px={px} warna={layer.badgeColor} />
                  </div>
                  <div style={{ position: "absolute", top: px(10), right: px(10) }}>
                    <SudutCrosshair px={px} warna={layer.badgeColor} />
                  </div>
                  <div style={{ position: "absolute", bottom: px(10), left: px(10) }}>
                    <SudutCrosshair px={px} warna={layer.badgeColor} />
                  </div>
                  <div style={{ position: "absolute", bottom: px(10), right: px(10) }}>
                    <SudutCrosshair px={px} warna={layer.badgeColor} />
                  </div>

                  {/* Luminous Pill Tag protruding on Top-Left */}
                  <div
                    style={{
                      position: "absolute",
                      left: -px(16),
                      top: -px(22),
                      display: "flex",
                      alignItems: "center",
                      gap: px(8),
                      padding: `${px(7)}px ${px(16)}px`,
                      borderRadius: px(999),
                      background: "rgba(10, 15, 29, 0.92)",
                      border: `1.5px solid ${layer.badgeColor}`,
                      boxShadow: `0 ${px(6)}px ${px(20)}px rgba(0,0,0,0.6), 0 0 ${px(12)}px ${rgba(layer.badgeColor, 0.35)}`,
                      transform: `scale(${skalaPersepsi(spBadge, 0.5)}) translateZ(${px(15)}px)`,
                      opacity: Math.min(1, spBadge * 2),
                      transformOrigin: "bottom left",
                      zIndex: 50,
                    }}
                  >
                    <span
                      style={{
                        ...font("subjudul"),
                        fontSize: u.kecil * 0.85,
                        fontWeight: 700,
                        color: layer.badgeColor,
                      }}
                    >
                      {layer.nomor}
                    </span>
                    <span
                      style={{
                        ...font("isi"),
                        fontSize: u.kecil * 0.85,
                        fontWeight: 600,
                        color: w.utama,
                        letterSpacing: px(0.5),
                      }}
                    >
                      {layer.nama}
                    </span>
                  </div>

                  {/* Layer Specific Content */}
                  {/* ----------------- LAYER 1: LATAR PLATE ----------------- */}
                  {layer.id === "latar" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: px(18),
                        borderRadius: px(12),
                        border: `1px dashed ${rgba(w.utama, 0.15)}`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: px(16),
                        background: `
                          radial-gradient(circle at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 60%),
                          radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px) 0 0 / ${px(24)}px ${px(24)}px
                        `,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          ...font("isi"),
                          fontSize: u.kecil * 0.68,
                          color: rgba(w.utama, 0.4),
                          fontFamily: "monospace",
                        }}
                      >
                        <span>// BASE_LAYER: BG_01</span>
                        <span>DEPTH: -320mm</span>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div
                          style={{
                            ...font("subjudul"),
                            fontSize: u.isi * 0.9,
                            color: rgba(w.utama, 0.5),
                            letterSpacing: px(1),
                            textTransform: "uppercase",
                          }}
                        >
                          Latar Belakang / Footage Asli
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          ...font("isi"),
                          fontSize: u.kecil * 0.65,
                          color: rgba(w.utama, 0.35),
                          fontFamily: "monospace",
                        }}
                      >
                        <span>STATUS: LOCKED</span>
                        <span>ALPHA: 1.0 (SOLID)</span>
                      </div>
                    </div>
                  )}

                  {/* ----------------- LAYER 2: TEKS DEPTH ----------------- */}
                  {layer.id === "teks" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          ...font("judul"),
                          fontSize: u.judul * 1.15,
                          lineHeight: 0.9,
                          fontWeight: 900,
                          textAlign: "center",
                          letterSpacing: px(3),
                          color: "transparent",
                          WebkitTextStroke: `${px(2)}px ${w.aksen2 || "#38bdf8"}`,
                          textShadow: `0 0 ${px(24)}px ${rgba(w.aksen2 || "#38bdf8", 0.55)}`,
                        }}
                      >
                        {teksTengah}
                      </div>

                      <div
                        style={{
                          ...font("isi"),
                          fontSize: u.kecil * 0.72,
                          color: w.aksen2 || "#38bdf8",
                          letterSpacing: px(1.5),
                          marginTop: px(12),
                          padding: `${px(4)}px ${px(12)}px`,
                          borderRadius: px(6),
                          background: rgba(w.aksen2 || "#38bdf8", 0.12),
                          border: `1px solid ${rgba(w.aksen2 || "#38bdf8", 0.3)}`,
                          textTransform: "uppercase",
                          fontFamily: "monospace",
                        }}
                      >
                        Terselip di Balik Subjek
                      </div>
                    </div>
                  )}

                  {/* ----------------- LAYER 3: CUTOUT SUBJEK ----------------- */}
                  {layer.id === "subjek" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* SVG Stylized Human Silhouette with Rotoscope Bézier Anchors */}
                      <svg
                        width={cardW * 0.65}
                        height={cardH * 0.85}
                        viewBox="0 0 200 240"
                        fill="none"
                        style={{
                          filter: `drop-shadow(0 0 ${px(16)}px ${rgba(w.aksen || "#f59e0b", 0.4)})`,
                        }}
                      >
                        <defs>
                          <linearGradient id="rotoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={w.aksen || "#f59e0b"} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={w.aksen2 || "#38bdf8"} stopOpacity="0.1" />
                          </linearGradient>
                        </defs>

                        {/* Silhouette Body Path */}
                        <path
                          d="M 100 35 
                             C 118 35, 130 50, 130 72 
                             C 130 95, 118 108, 100 108 
                             C 82 108, 70 95, 70 72 
                             C 70 50, 82 35, 100 35 Z 
                             M 100 115 
                             C 135 115, 175 132, 185 170 
                             L 185 235 
                             L 15 235 
                             L 15 170 
                             C 25 132, 65 115, 100 115 Z"
                          fill="url(#rotoGrad)"
                          stroke={w.aksen || "#f59e0b"}
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                        />

                        {/* Vector Bézier Control Anchor Handles (Rotoscope Animation Effect) */}
                        {[
                          [100, 35],
                          [130, 72],
                          [100, 108],
                          [70, 72],
                          [135, 115],
                          [185, 170],
                          [65, 115],
                          [15, 170],
                        ].map(([vx, vy], vi) => {
                          const pulsa = 1 + Math.sin(dtk * 3 + vi) * 0.25;
                          return (
                            <g key={vi}>
                              <rect
                                x={vx - 3.5}
                                y={vy - 3.5}
                                width={7}
                                height={7}
                                fill="#ffffff"
                                stroke={w.aksen || "#f59e0b"}
                                strokeWidth="1.5"
                                transform={`scale(${pulsa})`}
                                style={{ transformOrigin: `${vx}px ${vy}px` }}
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Small badge overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: px(20),
                          right: px(20),
                          padding: `${px(4)}px ${px(10)}px`,
                          borderRadius: px(4),
                          background: rgba(w.aksen || "#f59e0b", 0.15),
                          border: `1px solid ${rgba(w.aksen || "#f59e0b", 0.4)}`,
                          ...font("isi"),
                          fontSize: u.kecil * 0.65,
                          color: w.aksen || "#f59e0b",
                          fontFamily: "monospace",
                        }}
                      >
                        MATTE: ALPHA_PASS
                      </div>
                    </div>
                  )}

                  {/* ----------------- LAYER 4: CAPTION / UI OVERLAY ----------------- */}
                  {layer.id === "caption" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: px(24),
                      }}
                    >
                      <div
                        style={{
                          width: "90%",
                          padding: `${px(18)}px ${px(24)}px`,
                          borderRadius: px(16),
                          background: "rgba(15, 23, 42, 0.75)",
                          border: `1px solid rgba(255, 255, 255, 0.28)`,
                          boxShadow: `0 ${px(12)}px ${px(28)}px rgba(0,0,0,0.5)`,
                          display: "flex",
                          alignItems: "center",
                          gap: px(16),
                        }}
                      >
                        {/* Audio Waveform icon */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: px(3),
                            height: px(24),
                            padding: `0 ${px(8)}px`,
                            borderRadius: px(8),
                            background: rgba(w.aksen, 0.15),
                          }}
                        >
                          {[0.4, 0.9, 0.6, 1.0, 0.5].map((alt, ai) => (
                            <div
                              key={ai}
                              style={{
                                width: px(3),
                                height: `${Math.max(20, Math.sin(dtk * 6 + ai) * 50 + alt * 50)}%`,
                                borderRadius: px(2),
                                background: w.aksen,
                              }}
                            />
                          ))}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              ...font("subjudul"),
                              fontSize: u.isi * 0.95,
                              lineHeight: 1.2,
                              color: w.utama,
                            }}
                          >
                            <Teks teks={captionTeks} aksen={w.aksen} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>

        {/* Bottom Technical Status Bar */}
        <div
          style={{
            position: "absolute",
            bottom: H * 0.06,
            left: W * 0.08,
            right: W * 0.08,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${px(10)}px ${px(18)}px`,
            borderRadius: px(12),
            background: "rgba(10, 15, 29, 0.6)",
            border: `1px solid ${rgba(w.utama, 0.12)}`,
            backdropFilter: "blur(10px)",
            opacity: masukHeader,
          }}
        >
          <div
            style={{
              ...font("isi"),
              fontSize: u.kecil * 0.72,
              color: rgba(w.utama, 0.6),
              fontFamily: "monospace",
            }}
          >
            Z-DISPLACEMENT: {Math.round(jarakZ * 3.2)}px (EXPLODED)
          </div>

          <div
            style={{
              ...font("isi"),
              fontSize: u.kecil * 0.72,
              color: w.aksen,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: px(6),
            }}
          >
            <span>●</span>
            <span>PARALLAX DEPTH ACTIVE</span>
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

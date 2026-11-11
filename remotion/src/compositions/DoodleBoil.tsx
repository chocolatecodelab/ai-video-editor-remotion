import React from "react";
import { AbsoluteFill, interpolate, random, spring } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";

// E14 doodle-boil (Anotasi Coretan Tangan Ekspresif & Cel-Boil Animasi):
// Menggantikan garis matematika kaku dengan coretan tangan otentik (Vox / Dan Koe / YouTube Edukasi Style):
// - Lingkaran Sketsa Double-Loop: Putaran 1.25x bertumpuk natural ala spidol pena asli.
// - Panah Melengkung Dinamis: Busur bézier luwes dengan kepala panah bersayap tajam dan lancip.
// - Spidol Stabilo (Highlighter Strike): Sapuan transparan dengan tekstur penanda kata kunci.
// - Gelembung Dialog Komik (Callout Bubble): Balon percakapan sketsa tangan dengan ekor penunjuk.
// - Bintang Silang Pendar (✦ / Sparkle Burst): Bintang 4 penjuru ekspresif.
// - Siklus Cel-Boil 3-Frame Sejati (8–10 FPS): 3 set titik koordinat berbeda yang berganti secara ritmis.

export type JenisAnotasi =
  | "lingkar"
  | "panah"
  | "garis"
  | "bintang"
  | "stabilo"
  | "gelembung"
  | "kurung";

export type Anotasi = {
  jenis: JenisAnotasi;
  x: number;
  y: number;
  w?: number;
  h?: number;
  teks?: string;
  arah?: number; // derajat untuk panah (0 = kanan, 90 = bawah, 180 = kiri, 270 = atas)
};

export type DoodleBoilElemen = ElemenUI & {
  anotasi: Anotasi[];
  warna?: string;
  jadwal: {
    gores: number[];
    durasi_gores: number;
  };
};

export type DoodleBoilProps = PropsDasar<DoodleBoilElemen>;

export const DoodleBoil: React.FC<DoodleBoilProps> = (props) => {
  const { f, fps, dtk, px, t, el, w, u, font, keluar, motif } = pakaiDasar(props);
  const { W, H, zona } = props;

  // Cel-boil cycle: 3 distinct hand-drawn variation frames cycling at 8-10 fps
  const boilRate = motif.boil && motif.boil > 0 ? motif.boil : 9;
  const frameBoil = Math.floor(f / (fps / boilRate)) % 3;

  const warnaUtama = el.warna === "aksen-2" ? w.aksen2 : el.warna === "utama" ? w.utama : w.aksen || "#f59e0b";
  const tebalGaris = px(motif.bingkai === "pensil" ? 4 : 6.5);

  const garisUmum = {
    fill: "none",
    stroke: warnaUtama,
    strokeWidth: tebalGaris,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - keluar,
        filter: `drop-shadow(0 ${px(4)}px ${px(8)}px rgba(0,0,0,0.4))`,
        pointerEvents: "none",
      }}
    >
      {el.anotasi.map((a, i) => {
        const tMulai = el.jadwal.gores[i] ?? (0.2 + i * 0.35);
        const dGores = el.jadwal.durasi_gores ?? 0.45;

        // Draw-in progress 0..1
        const pGores = interpolate(dtk, [tMulai, tMulai + dGores], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        // Spring scale pop on finish
        const spPop = spring({
          frame: f - Math.round(tMulai * fps),
          fps,
          config: { damping: 12, stiffness: 150, mass: 0.6 },
        });

        const cx = a.x * W;
        const cy = a.y * H;
        const aw = (a.w ?? 0.32) * W;
        const ah = (a.h ?? 0.16) * H;

        // Seed modifier per boil frame
        const jitter = (seed: string, amp = 1.0) => {
          const raw = random(`doodle_${i}_${frameBoil}_${seed}`);
          return (raw - 0.5) * px(amp * 8);
        };

        let konten: React.ReactNode = null;

        // ================= 1. LINGKARAN SKETSA DOUBLE-LOOP =================
        if (a.jenis === "lingkar") {
          // Double-loop hand-drawn oval (curves around 1.25 times so ends overlap naturally)
          const rx = aw / 2;
          const ry = ah / 2;
          const j1 = jitter("l1", 0.6);
          const j2 = jitter("l2", 0.6);

          const pathD = `
            M ${cx - rx * 0.8} ${cy - ry * 0.4}
            C ${cx - rx * 1.05 + j1} ${cy - ry * 0.9}, ${cx - rx * 0.4} ${cy - ry * 1.05 + j2}, ${cx + rx * 0.2} ${cy - ry * 0.95}
            C ${cx + rx * 0.9} ${cy - ry * 0.85}, ${cx + rx * 1.05 + j2} ${cy - ry * 0.1}, ${cx + rx * 0.95} ${cy + ry * 0.6}
            C ${cx + rx * 0.8} ${cy + ry * 1.05 + j1}, ${cx + rx * 0.1} ${cy + ry * 1.02}, ${cx - rx * 0.5} ${cy + ry * 0.9}
            C ${cx - rx * 1.02} ${cy + ry * 0.7}, ${cx - rx * 1.08 + j2} ${cy - ry * 0.2}, ${cx - rx * 0.75} ${cy - ry * 0.55}
            C ${cx - rx * 0.4} ${cy - ry * 0.85}, ${cx + rx * 0.1} ${cy - ry * 0.9}, ${cx + rx * 0.65} ${cy - ry * 0.75}
          `;

          konten = (
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <path
                d={pathD}
                {...garisUmum}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - pGores}
              />
            </svg>
          );
        }

        // ================= 2. PANAH MELENGKUNG DINAMIS =================
        else if (a.jenis === "panah") {
          const deg = a.arah ?? 215;
          const rad = (deg * Math.PI) / 180;
          const len = Math.max(aw, px(160));

          // Start point (tail) and End point (head)
          const sx = cx + Math.cos(rad) * len;
          const sy = cy + Math.sin(rad) * len;
          const ex = cx;
          const ey = cy;

          // Perpendicular arch control point
          const midX = (sx + ex) / 2 + Math.sin(rad) * px(45) + jitter("p_m1", 0.8);
          const midY = (sy + ey) / 2 - Math.cos(rad) * px(45) + jitter("p_m2", 0.8);

          // Arrowhead angle
          const headAngle = Math.atan2(ey - midY, ex - midX);
          const wingLen = px(28);
          const wingSpread = 0.5;

          const w1x = ex - Math.cos(headAngle - wingSpread) * wingLen + jitter("w1x", 0.4);
          const w1y = ey - Math.sin(headAngle - wingSpread) * wingLen + jitter("w1y", 0.4);
          const w2x = ex - Math.cos(headAngle + wingSpread) * wingLen + jitter("w2x", 0.4);
          const w2y = ey - Math.sin(headAngle + wingSpread) * wingLen + jitter("w2y", 0.4);

          konten = (
            <>
              <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                {/* Arrow Stem Arc */}
                <path
                  d={`M ${sx} ${sy} Q ${midX} ${midY} ${ex} ${ey}`}
                  {...garisUmum}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - Math.min(1, pGores * 1.25)}
                />

                {/* Arrow Head Barbs */}
                <path
                  d={`M ${w1x} ${w1y} L ${ex} ${ey} L ${w2x} ${w2y}`}
                  {...garisUmum}
                  strokeWidth={tebalGaris * 1.1}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - Math.max(0, pGores * 4 - 3)}
                />
              </svg>

              {/* Hand-Drawn Arrow Annotation Label */}
              {a.teks && (
                <div
                  style={{
                    position: "absolute",
                    left: sx,
                    top: sy + (Math.sin(rad) >= 0 ? px(14) : -px(60)),
                    transform: `
                      translate(-50%, -50%)
                      rotate(${jitter("lbl_r", 0.4)}deg)
                      scale(${skalaPersepsi(spPop, 0.7)})
                    `,
                    opacity: Math.min(1, pGores * 2.5),
                    padding: `${px(6)}px ${px(16)}px`,
                    borderRadius: px(8),
                    background: "rgba(15, 23, 42, 0.88)",
                    border: `1.5px solid ${warnaUtama}`,
                    boxShadow: `0 ${px(8)}px ${px(20)}px rgba(0,0,0,0.5)`,
                    backdropFilter: "blur(8px)",
                    ...font("subjudul"),
                    fontSize: u.kecil * 0.95,
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: px(0.4),
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: warnaUtama, marginRight: px(6) }}>★</span>
                  {a.teks}
                </div>
              )}
            </>
          );
        }

        // ================= 3. STABILO / HIGHLIGHTER STRIKE =================
        else if (a.jenis === "stabilo") {
          const tebalStabilo = px(38);
          const yPos = cy;
          const xStart = cx - aw / 2;
          const xEnd = cx + aw / 2;

          konten = (
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs>
                <linearGradient id={`grad_stab_${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={warnaUtama} stopOpacity="0.4" />
                  <stop offset="50%" stopColor={warnaUtama} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={warnaUtama} stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path
                d={`M ${xStart} ${yPos + jitter("st_y1", 0.4)} Q ${(xStart + xEnd) / 2} ${yPos - px(4) + jitter("st_y2", 0.4)} ${xEnd} ${yPos + jitter("st_y3", 0.4)}`}
                fill="none"
                stroke={`url(#grad_stab_${i})`}
                strokeWidth={tebalStabilo}
                strokeLinecap="square"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - pGores}
                style={{ mixBlendMode: "color-burn" }}
              />
            </svg>
          );
        }

        // ================= 4. GELEMBUNG DIALOG KOMIK =================
        else if (a.jenis === "gelembung") {
          const bw = aw;
          const bh = ah;
          const bx = cx - bw / 2;
          const by = cy - bh / 2;
          const jb = (k: string) => jitter(`g_${k}`, 0.5);

          const bubbleD = `
            M ${bx + px(18)} ${by + jb("1")}
            Q ${bx + bw / 2} ${by - px(4) + jb("2")} ${bx + bw - px(18)} ${by + jb("3")}
            Q ${bx + bw + px(4) + jb("4")} ${by + bh / 2} ${bx + bw - px(18)} ${by + bh + jb("5")}
            L ${bx + bw * 0.55} ${by + bh + jb("6")}
            L ${bx + bw * 0.45 - px(20)} ${by + bh + px(35) + jb("tail")}
            L ${bx + bw * 0.38} ${by + bh + jb("7")}
            Q ${bx + px(18)} ${by + bh + jb("8")} ${bx + px(6)} ${by + bh - px(18)}
            Q ${bx - px(4) + jb("9")} ${by + bh / 2} ${bx + px(18)} ${by + jb("1")} Z
          `;

          konten = (
            <div
              style={{
                position: "absolute",
                left: bx,
                top: by,
                width: bw,
                height: bh,
                transform: `scale(${skalaPersepsi(spPop, 0.7)})`,
                opacity: Math.min(1, pGores * 2),
              }}
            >
              <svg width={bw + px(30)} height={bh + px(45)} style={{ position: "absolute", left: -px(15), top: -px(10), overflow: "visible" }}>
                <path
                  d={bubbleD}
                  fill="rgba(15, 23, 42, 0.92)"
                  stroke={warnaUtama}
                  strokeWidth={tebalGaris}
                  strokeLinejoin="round"
                />
              </svg>

              {a.teks && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `0 ${px(14)}px`,
                    ...font("subjudul"),
                    fontSize: u.isi * 0.88,
                    fontWeight: 700,
                    color: "#ffffff",
                    textAlign: "center",
                    lineHeight: 1.15,
                  }}
                >
                  {a.teks}
                </div>
              )}
            </div>
          );
        }

        // ================= 5. BINTANG SILANG PENDAR (✦ SPARKLE) =================
        else if (a.jenis === "bintang") {
          const r = Math.max(aw, ah) / 2;
          const js = (k: string) => jitter(`star_${k}`, 0.4);

          konten = (
            <div
              style={{
                position: "absolute",
                left: cx,
                top: cy,
                transform: `
                  translate(-50%, -50%)
                  scale(${skalaPersepsi(spPop, 0.3)})
                  rotate(${frameBoil * 8}deg)
                `,
                opacity: Math.min(1, pGores * 2.5),
              }}
            >
              <svg width={r * 2} height={r * 2} viewBox="-20 -20 40 40">
                <path
                  d={`
                    M 0 ${-18 + js("1")}
                    Q 0 0 ${18 + js("2")} 0
                    Q 0 0 0 ${18 + js("3")}
                    Q 0 0 ${-18 + js("4")} 0
                    Q 0 0 0 ${-18 + js("1")} Z
                  `}
                  fill={rgba(warnaUtama, 0.35)}
                  stroke={warnaUtama}
                  strokeWidth={tebalGaris * 0.85}
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        }

        // ================= 6. GARIS BAWAH BERGELOMBANG ORGANIK =================
        else if (a.jenis === "garis") {
          const len = aw;
          const gy = cy;
          const x0Line = cx - len / 2;
          const segments = 6;
          let lineD = `M ${x0Line} ${gy}`;

          for (let si = 1; si <= segments; si++) {
            const segX = x0Line + (si / segments) * len;
            const waveY = gy + (si % 2 === 0 ? px(6) : -px(6)) + jitter(`line_${si}`, 0.3);
            const ctrlX = segX - len / (segments * 2);
            lineD += ` Q ${ctrlX} ${waveY} ${segX} ${gy}`;
          }

          konten = (
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <path
                d={lineD}
                {...garisUmum}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - pGores}
              />
            </svg>
          );
        }

        return <React.Fragment key={i}>{konten}</React.Fragment>;
      })}
    </AbsoluteFill>
  );
};

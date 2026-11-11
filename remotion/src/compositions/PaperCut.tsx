import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { LapisTekstur } from "../lib/motif";
import { Teks } from "../lib/Teks";

// E13 paper-cut (klip cutaway broll craft 3D):
// Seni diorama kertas berlapis (3D Paper Cutout Craft Art) ala kerajinan tangan fisik (terinspirasi dari referensi pengguna):
// - Terowongan kertas berlapis (multi-tiered cloud framing) dengan bayangan tebal (300gsm cardstock).
// - Benda langit die-cut: matahari berjeruji lipat, bulan berkawah, planet bercincin, dan bintang berpendar.
// - Roket kertas origami melesat dengan kepulan asap awan bertingkat.
// - Kartu judul die-cut di tengah dengan tekstur serat kertas dan gerakan stop-motion 12 fps bertingkat.

export type PaperCutElemen = ElemenUI & {
  judul: string;
  sub?: string;
  kategori?: string;
  tag?: string;
  jadwal: {
    lapis: number[];
    kartu: number;
  };
};

export type PaperCutProps = PropsDasar<PaperCutElemen>;

export const PaperCut: React.FC<PaperCutProps> = (props) => {
  const { f, fps, px, t, el, w, u, font, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const [x0, y0, x1] = zona;

  // Stop-motion 12 fps timing step
  const dtk12 = Math.floor((f / fps) * 12) / 12;
  const f12 = Math.floor(f / (fps / 12));

  // Schedule timing
  const jLapis = el.jadwal.lapis ?? [0.1, 0.35, 0.6, 0.85];
  const tKartu = el.jadwal.kartu ?? 0.8;

  // Staggered reveal progress for each layer in 12 fps
  const pLapis0 = interpolate(dtk12, [jLapis[0] ?? 0.1, (jLapis[0] ?? 0.1) + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pLapis1 = interpolate(dtk12, [jLapis[1] ?? 0.35, (jLapis[1] ?? 0.35) + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pLapis2 = interpolate(dtk12, [jLapis[2] ?? 0.6, (jLapis[2] ?? 0.6) + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pLapis3 = interpolate(dtk12, [jLapis[3] ?? 0.85, (jLapis[3] ?? 0.85) + 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Spring for Title Card
  const spKartu = spring({
    frame: f12 - Math.round(tKartu * 12),
    fps: 12,
    config: { damping: 11, stiffness: 120, mass: 0.8 },
  });

  // Tactile subtle stop-motion paper wobble
  const wobbleX = Math.sin(f12 * 1.8) * px(3);
  const wobbleY = Math.cos(f12 * 2.1) * px(3);
  const wobbleRot = Math.sin(f12 * 1.4) * 0.8;

  // Rocket ascent animation
  const pRocket = interpolate(dtk12, [0.2, 3.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rocketX = W * 0.28 + Math.sin(pRocket * Math.PI * 0.8) * px(40);
  const rocketY = H * (0.88 - 0.45 * pRocket);

  // Palette from tokens or curated papercraft palette
  const warnaLatar = "#1e3a6d"; // Deep space navy
  const cCloud1 = "#2b569a";    // Mid ocean blue
  const cCloud2 = "#4b7bb8";    // Cerulean blue
  const cCloud3 = "#76a6db";    // Soft sky blue
  const cCloud4 = "#a8ceee";    // Pastel cloud white-blue
  const cAksen = w.aksen || "#f59e0b"; // Warm paper sun/gold

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ background: warnaLatar, overflow: "hidden" }}>
        {/* Subtle tactile paper texture overlay */}
        <LapisTekstur jenis="kertas" panelHex={warnaLatar} />

        {/* ================= LAYER 0: STARFIELD ================= */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.9 }}>
          {[
            [0.18, 0.32, 14], [0.38, 0.24, 10], [0.62, 0.34, 12], [0.82, 0.38, 16],
            [0.24, 0.52, 12], [0.52, 0.44, 14], [0.72, 0.56, 10], [0.15, 0.72, 14],
            [0.58, 0.65, 16], [0.85, 0.26, 12], [0.42, 0.76, 10], [0.78, 0.72, 12],
          ].map(([sx, sy, sz], si) => {
            const blink = 0.5 + 0.5 * Math.sin(f12 * 0.8 + si);
            return (
              <div
                key={si}
                style={{
                  position: "absolute",
                  left: sx * W,
                  top: sy * H,
                  width: px(sz),
                  height: px(sz),
                  opacity: blink * pLapis0,
                  transform: `scale(${blink}) rotate(${si * 30}deg)`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="#fef08a">
                  <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
              </div>
            );
          })}
        </div>

        {/* ================= LAYER 1: CELESTIAL BODIES (PROMINENT & UNOBSCURED) ================= */}
        {/* 1. Purple Striped Planet with Ring (Top Left) */}
        <div
          style={{
            position: "absolute",
            left: W * 0.25,
            top: H * 0.08,
            width: px(110),
            height: px(110),
            borderRadius: "50%",
            background: "#c084fc",
            boxShadow: `
              inset 0 -${px(10)}px 0 rgba(0,0,0,0.22),
              0 ${px(14)}px ${px(26)}px rgba(0,0,0,0.35)
            `,
            transform: `translateY(${(1 - pLapis1) * px(40)}px) scale(${pLapis1}) rotate(-14deg)`,
            opacity: pLapis1,
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {/* Planet stripes */}
          <div style={{ position: "absolute", top: "30%", width: "100%", height: "18%", background: "#9333ea", opacity: 0.75 }} />
          <div style={{ position: "absolute", top: "58%", width: "100%", height: "14%", background: "#6b21a8", opacity: 0.65 }} />
        </div>

        {/* 2. Die-Cut Cratered Paper Moon (Top Center) */}
        <div
          style={{
            position: "absolute",
            left: W * 0.48,
            top: H * 0.03,
            width: px(130),
            height: px(130),
            borderRadius: "50%",
            background: "#fef08a",
            boxShadow: `
              inset 0 -${px(12)}px 0 rgba(0,0,0,0.14),
              0 ${px(16)}px ${px(30)}px rgba(0,0,0,0.38)
            `,
            transform: `translateY(${(1 - pLapis1) * px(30)}px) scale(${pLapis1})`,
            opacity: pLapis1,
            zIndex: 10,
          }}
        >
          {/* Moon Craters */}
          <div style={{ position: "absolute", left: "28%", top: "25%", width: px(28), height: px(28), borderRadius: "50%", background: "#eab308", opacity: 0.55 }} />
          <div style={{ position: "absolute", left: "60%", top: "42%", width: px(20), height: px(20), borderRadius: "50%", background: "#eab308", opacity: 0.45 }} />
          <div style={{ position: "absolute", left: "36%", top: "62%", width: px(22), height: px(22), borderRadius: "50%", background: "#eab308", opacity: 0.4 }} />
        </div>

        {/* 3. Radiant Die-Cut Sun with Layered Rays (Top Right) */}
        <div
          style={{
            position: "absolute",
            right: -px(20),
            top: H * 0.08,
            width: px(220),
            height: px(220),
            transform: `scale(${pLapis1}) rotate(${f12 * 1.5}deg)`,
            opacity: pLapis1,
            filter: `drop-shadow(0 ${px(16)}px ${px(32)}px rgba(0,0,0,0.4))`,
            zIndex: 10,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {Array.from({ length: 16 }, (_, ri) => (
              <polygon
                key={ri}
                points="50,4 42,24 58,24"
                fill="#facc15"
                transform={`rotate(${ri * 22.5} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="34" fill="#fbbf24" />
            <circle cx="50" cy="50" r="30" fill="#f59e0b" />
          </svg>
        </div>

        {/* 4. White Puffy Die-Cut Cloud (Mid-Right) */}
        <div
          style={{
            position: "absolute",
            right: W * 0.05,
            top: H * 0.28,
            width: px(140),
            height: px(80),
            transform: `scale(${pLapis2})`,
            opacity: pLapis2,
            filter: `drop-shadow(0 ${px(8)}px ${px(18)}px rgba(0,0,0,0.25))`,
            zIndex: 15,
          }}
        >
          <svg viewBox="0 0 100 60" width="100%" height="100%">
            <path
              d="M 20,45 
                 C 10,45 0,35 0,25 
                 C 0,15 12,8 24,10 
                 C 30,2 45,0 55,8 
                 C 65,2 80,4 85,14 
                 C 95,16 100,26 95,36 
                 C 95,44 86,45 80,45 Z"
              fill="#ffffff"
            />
          </svg>
        </div>

        {/* 5. Layered Saturn Planet with Ring (Mid-Left) */}
        <div
          style={{
            position: "absolute",
            left: W * 0.04,
            top: H * 0.46,
            width: px(130),
            height: px(130),
            transform: `translateY(${(1 - pLapis2) * px(40)}px) scale(${pLapis2}) rotate(-24deg)`,
            opacity: pLapis2,
            zIndex: 15,
          }}
        >
          <svg viewBox="0 0 120 120" width="100%" height="100%" style={{ overflow: "visible" }}>
            <circle cx="60" cy="60" r="38" fill="#60a5fa" />
            <ellipse
              cx="60"
              cy="60"
              rx="62"
              ry="20"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="9"
              strokeDasharray="210"
              strokeDashoffset="-32"
            />
          </svg>
        </div>

        {/* 6. Striped Green Planet (Bottom Right) */}
        <div
          style={{
            position: "absolute",
            right: W * 0.16,
            bottom: H * 0.12,
            width: px(100),
            height: px(100),
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: `
              inset 0 -${px(10)}px 0 rgba(0,0,0,0.2),
              0 ${px(14)}px ${px(26)}px rgba(0,0,0,0.35)
            `,
            transform: `scale(${pLapis2})`,
            opacity: pLapis2,
            zIndex: 15,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: "38%", width: "100%", height: "16%", background: "#22c55e", opacity: 0.65 }} />
        </div>

        {/* ================= LAYER 2: TOP & SIDE ORGANIC CLOUD FRAMING ================= */}
        {/* Top Cloud Header Layer 1 (Darker) */}
        <div
          style={{
            position: "absolute",
            top: -px(10),
            left: 0,
            right: 0,
            height: H * 0.16,
            filter: `drop-shadow(0 ${px(14)}px ${px(24)}px rgba(0,0,0,0.35))`,
            zIndex: 20,
          }}
        >
          <svg viewBox="0 0 1000 240" preserveAspectRatio="none" width="100%" height="100%">
            <path
              d="M 0,0 L 1000,0 L 1000,120
                 C 920,180 840,160 760,110
                 C 680,60 560,90 480,140
                 C 400,190 280,180 200,120
                 C 140,70 60,90 0,140 Z"
              fill={cCloud1}
            />
          </svg>
        </div>

        {/* Top Cloud Header Layer 2 (Lighter cyan) */}
        <div
          style={{
            position: "absolute",
            top: -px(10),
            left: 0,
            right: 0,
            height: H * 0.12,
            filter: `drop-shadow(0 ${px(12)}px ${px(20)}px rgba(0,0,0,0.28))`,
            zIndex: 22,
          }}
        >
          <svg viewBox="0 0 1000 180" preserveAspectRatio="none" width="100%" height="100%">
            <path
              d="M 0,0 L 1000,0 L 1000,80
                 C 940,140 820,110 740,70
                 C 640,30 520,70 440,110
                 C 360,150 240,130 160,80
                 C 100,50 40,60 0,90 Z"
              fill={cCloud2}
            />
          </svg>
        </div>

        {/* ================= LAYER 3: ORIGAMI ROCKET CRAFT ================= */}
        <div
          style={{
            position: "absolute",
            left: rocketX,
            top: rocketY,
            width: px(120),
            height: px(180),
            transform: `translate(-50%, -50%) rotate(${-22 + wobbleRot * 3}deg)`,
            filter: `drop-shadow(0 ${px(16)}px ${px(26)}px rgba(0,0,0,0.45))`,
            zIndex: 35,
          }}
        >
          {/* Billowing Paper Smoke Clouds trailing behind rocket */}
          <div
            style={{
              position: "absolute",
              top: "90%",
              left: "50%",
              transform: "translateX(-50%)",
              width: px(95),
              height: px(280),
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 100 280" width="100%" height="100%" style={{ overflow: "visible" }}>
              <path
                d="M 30,0 C 10,40 -20,100 -40,240 L 140,240 C 120,100 90,40 70,0 Z"
                fill="rgba(255,255,255,0.94)"
                filter={`drop-shadow(0 ${px(8)}px ${px(14)}px rgba(0,0,0,0.2))` }
              />
              <path
                d="M 38,0 C 25,30 5,80 -10,220 L 110,220 C 95,80 75,30 62,0 Z"
                fill="#ffffff"
              />
            </svg>
          </div>

          {/* Paper Origami Rocket Fuselage */}
          <svg viewBox="0 0 100 150" width="100%" height="100%" style={{ overflow: "visible" }}>
            {/* Thruster Flames */}
            <polygon points="40,110 50,145 60,110" fill="#f59e0b" />
            <polygon points="44,110 50,135 56,110" fill="#fef08a" />

            {/* Left Fin */}
            <polygon points="25,90 2,120 28,115" fill="#b91c1c" />
            {/* Right Fin */}
            <polygon points="75,90 98,120 72,115" fill="#b91c1c" />

            {/* Main Body (Red Paper Cutout) */}
            <path
              d="M 50,10
                 C 68,35 75,70 75,110
                 L 25,110
                 C 25,70 32,35 50,10 Z"
              fill="#ef4444"
            />
            {/* Shaded Left Half (Die-Cut Crease Depth) */}
            <path
              d="M 50,10
                 C 32,35 25,70 25,110
                 L 50,110 Z"
              fill="#dc2626"
            />

            {/* Cockpit Glass Cutout */}
            <circle cx="50" cy="55" r="14" fill="#ffffff" />
            <circle cx="50" cy="55" r="10" fill="#38bdf8" />
            <circle cx="47" cy="52" r="3.5" fill="#ffffff" />
          </svg>
        </div>

        {/* ================= LAYER 4: BOTTOM FOREGROUND CLOUDS ================= */}
        {/* Tier 1: Mid-Blue Cloud Bank */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: H * 0.28,
            filter: `drop-shadow(0 -${px(14)}px ${px(24)}px rgba(0,0,0,0.32))`,
            zIndex: 40,
          }}
        >
          <svg viewBox="0 0 1000 380" preserveAspectRatio="none" width="100%" height="100%">
            <path
              d="M 0,380 L 1000,380 L 1000,160
                 C 920,100 820,130 740,190
                 C 640,90 480,80 390,170
                 C 310,110 180,120 100,200
                 C 50,160 10,180 0,220 Z"
              fill={cCloud2}
            />
          </svg>
        </div>

        {/* Tier 2: Light Sky Blue Cloud Bank (Foreground Front) */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: H * 0.22,
            filter: `drop-shadow(0 -${px(12)}px ${px(22)}px rgba(0,0,0,0.25))`,
            zIndex: 42,
          }}
        >
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" width="100%" height="100%">
            <path
              d="M 0,300 L 1000,300 L 1000,130
                 C 940,90 850,110 780,160
                 C 690,70 540,60 450,150
                 C 370,90 230,100 150,180
                 C 90,140 20,160 0,200 Z"
              fill={cCloud4}
            />
          </svg>
        </div>

        {/* ================= LAYER 5: CENTER DIE-CUT PAPER TITLE CARD ================= */}
        <div
          style={{
            position: "absolute",
            left: x0,
            width: x1 - x0,
            top: y0 + px(110),
            opacity: Math.min(1, spKartu * 2),
            transform: `
              translateY(${(1 - spKartu) * px(120) + wobbleY}px)
              rotate(${-1.5 + wobbleRot}deg)
            `,
            zIndex: 60,
          }}
        >
          {/* Physical Die-Cut Cardboard Card */}
          <div
            style={{
              position: "relative",
              padding: `${px(40)}px ${px(36)}px`,
              borderRadius: px(26),
              background: "#fffdf8",
              border: `2px solid #e2d9c8`,
              boxShadow: `
                0 ${px(4)}px 0 #d1c4ae,
                0 ${px(22)}px ${px(45)}px rgba(0,0,0,0.5)
              `,
              textAlign: "center",
            }}
          >
            {/* Paper Pin Tag at Top Center */}
            <div
              style={{
                position: "absolute",
                top: -px(13),
                left: "50%",
                transform: "translateX(-50%)",
                width: px(44),
                height: px(16),
                borderRadius: px(4),
                background: "rgba(226, 217, 200, 0.9)",
                border: "1px dashed rgba(160, 145, 125, 0.6)",
                boxShadow: `0 ${px(2)}px ${px(6)}px rgba(0,0,0,0.15)`,
              }}
            />

            {/* Category Tag (Optional & Customizable) */}
            {(el.tag || el.kategori) && (
              <div
                style={{
                  display: "inline-block",
                  padding: `${px(4)}px ${px(14)}px`,
                  borderRadius: px(999),
                  background: "#f3ede2",
                  border: "1px solid #dfd5c4",
                  marginBottom: px(12),
                  ...font("isi"),
                  fontSize: u.kecil * 0.78,
                  fontWeight: 700,
                  color: "#6b5845",
                  letterSpacing: px(1.2),
                  textTransform: "uppercase",
                }}
              >
                {el.tag ?? el.kategori}
              </div>
            )}

            {/* Main Title */}
            <div
              style={{
                ...font("judul"),
                fontSize: u.judul * 0.92,
                lineHeight: 1.05,
                color: "#1c1917",
                letterSpacing: -px(0.5),
              }}
            >
              <Teks teks={el.judul} aksen={cAksen} tunda={tKartu} />
            </div>

            {/* Subtitle */}
            {el.sub && (
              <div
                style={{
                  ...font("isi"),
                  fontSize: u.isi * 0.85,
                  color: "#57534e",
                  marginTop: px(12),
                  lineHeight: 1.3,
                }}
              >
                {el.sub}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { Teks } from "../lib/Teks";

// E01 orbit (klip cutaway/broll native):
// Parallax orbital 3D multi-cincin dengan depth-of-field (DoF) blur pada orbit belakang,
// kartu pahlawan tengah dengan specular rim-lighting, dan chip satelit beraksen kaca.
export type OrbitElemen = ElemenUI & {
  pusat: string;
  sub?: string;
  satelit: string[];
  putaran?: number;
  tag?: string;
  jadwal: { masuk: number };
};
export type OrbitProps = PropsDasar<OrbitElemen>;

export const Orbit: React.FC<OrbitProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, durasiFrame, fps } = props;
  const total = durasiFrame / fps;
  const putar = interpolate(dtk, [0, total], [0, (el.putaran ?? 1) * Math.PI * 2], {
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const pm = naik(el.jadwal.masuk, 0.6, "tegas");
  const cx = W / 2;
  const cy = H * 0.44;
  const rx = W * 0.36;
  const ry = W * 0.17;
  const tilt = Math.sin(putar * 0.5) * 6;
  const n = el.satelit.length;

  const satelit = el.satelit.map((s, i) => {
    const a = putar + (i / n) * Math.PI * 2;
    const z = Math.sin(a);
    const x = cx + Math.cos(a) * rx * pm;
    const y = cy + z * ry * pm;
    const skala = 0.75 + 0.4 * (z + 1) / 2;
    return { s, i, x, y, z, skala };
  });

  const renderChip = (o: (typeof satelit)[number]) => {
    const diDepan = o.z > 0;
    const dofBlur = diDepan ? 0 : (1 - (o.z + 1) / 2) * px(4);

    return (
      <div
        key={o.i}
        style={{
          position: "absolute",
          left: o.x,
          top: o.y,
          transform: `translate(-50%, -50%) scale(${o.skala * pm})`,
          opacity: 0.35 + 0.65 * ((o.z + 1) / 2),
          zIndex: diDepan ? 5 : 1,
          filter: dofBlur > 0 ? `blur(${dofBlur}px)` : "none",
        }}
      >
        <div
          style={{
            padding: `${px(12)}px ${px(24)}px`,
            borderRadius: px(999),
            background: diDepan
              ? "linear-gradient(135deg, rgba(24, 30, 44, 0.94) 0%, rgba(14, 18, 28, 0.97) 100%)"
              : "rgba(18, 22, 32, 0.8)",
            border: `1px solid ${diDepan ? rgba(w.aksen, 0.5) : "rgba(255, 255, 255, 0.1)"}`,
            boxShadow: diDepan
              ? `0 ${px(12)}px ${px(28)}px rgba(0, 0, 0, 0.55), 0 0 ${px(16)}px ${rgba(w.aksen, 0.4)}`
              : "none",
            backdropFilter: "blur(16px)",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: px(8),
          }}
        >
          <div
            style={{
              width: px(7),
              height: px(7),
              borderRadius: "50%",
              background: diDepan ? w.aksen : "rgba(255, 255, 255, 0.4)",
              boxShadow: diDepan ? `0 0 ${px(6)}px ${w.aksen}` : "none",
            }}
          />
          <div style={{ ...font("subjudul"), fontSize: u.isi * 0.95, color: diDepan ? w.utama : "rgba(255, 255, 255, 0.6)" }}>
            <Teks teks={o.s} aksen={w.aksen} hias={false} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />

        <AbsoluteFill style={{ transform: `rotate(${tilt * 0.3}deg)` }}>
          {/* Outer Ambient Glow Ellipse */}
          <div
            style={{
              position: "absolute",
              left: cx - rx * 1.15,
              top: cy - ry * 1.15,
              width: rx * 2.3,
              height: ry * 2.3,
              borderRadius: "50%",
              border: `1px solid rgba(255, 255, 255, 0.05)`,
            }}
          />

          {/* Main Glowing Orbit Track */}
          <div
            style={{
              position: "absolute",
              left: cx - rx,
              top: cy - ry,
              width: rx * 2,
              height: ry * 2,
              borderRadius: "50%",
              border: `${px(2)}px dashed ${rgba(w.aksen, 0.45 * pm)}`,
              boxShadow: `0 0 ${px(24)}px ${rgba(w.aksen, 0.15 * pm)}`,
            }}
          />

          {/* Inner Guide Ellipse */}
          <div
            style={{
              position: "absolute",
              left: cx - rx * 0.85,
              top: cy - ry * 0.85,
              width: rx * 1.7,
              height: ry * 1.7,
              borderRadius: "50%",
              border: `1px solid rgba(255, 255, 255, 0.08)`,
            }}
          />

          {/* Ground Floor Shadow */}
          <div
            style={{
              position: "absolute",
              left: cx - W * 0.35,
              top: cy + W * 0.34,
              width: W * 0.7,
              height: W * 0.1,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, rgba(0, 0, 0, 0.55), transparent 70%)`,
              opacity: pm,
            }}
          />

          {/* Satelit yang berada di belakang (z <= 0) */}
          {satelit.filter((o) => o.z <= 0).map(renderChip)}

          {/* Kartu Pahlawan Pusat (Hero Card) */}
          <div
            style={{
              position: "absolute",
              left: cx,
              top: cy,
              zIndex: 3,
              width: W * 0.48,
              transform: `translate(-50%, -50%) scale(${skalaPersepsi(pm, 0.6)}) rotateY(${Math.sin(putar) * 10}deg)`,
              opacity: pm,
            }}
          >
            <div
              style={{
                borderRadius: px(24),
                padding: `${px(36)}px ${px(32)}px`,
                background: "linear-gradient(180deg, rgba(22, 28, 42, 0.96) 0%, rgba(12, 16, 26, 0.98) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: `0 ${px(30)}px ${px(60)}px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.25)`,
                backdropFilter: "blur(24px)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Specular Edge Glow on Top */}
              <div
                style={{
                  position: "absolute",
                  left: "15%",
                  right: "15%",
                  top: 0,
                  height: px(2),
                  background: `linear-gradient(90deg, transparent, ${w.aksen}, transparent)`,
                }}
              />

              {/* Tag / Category Badge */}
              {el.tag ? (
                <div style={{ display: "inline-block", marginBottom: px(12) }}>
                  <span
                    style={{
                      padding: `${px(3)}px ${px(12)}px`,
                      borderRadius: px(999),
                      background: rgba(w.aksen, 0.18),
                      border: `1px solid ${rgba(w.aksen, 0.35)}`,
                      ...font("isi"),
                      fontSize: u.kecil * 0.72,
                      color: w.aksen,
                      letterSpacing: px(1),
                      textTransform: "uppercase",
                    }}
                  >
                    {el.tag}
                  </span>
                </div>
              ) : null}

              {/* Center Title */}
              <div style={{ ...font("judul"), fontSize: u.judul * 0.92, lineHeight: 1.05, color: w.utama }}>
                <Teks teks={el.pusat} aksen={w.aksen} />
              </div>

              {/* Center Subtitle */}
              {el.sub ? (
                <div style={{ ...font("isi"), fontSize: u.kecil * 0.95, color: "rgba(255, 255, 255, 0.65)", marginTop: px(12) }}>
                  {el.sub}
                </div>
              ) : null}
            </div>

            {/* Bottom Mirror Reflection */}
            <div
              style={{
                transform: "scaleY(-1)",
                opacity: 0.15,
                marginTop: px(12),
                maskImage: "linear-gradient(transparent 35%, black)",
                WebkitMaskImage: "linear-gradient(transparent 35%, black)",
                height: px(90),
                overflow: "hidden",
              }}
            >
              <div style={{ ...font("judul"), fontSize: u.judul * 0.92, textAlign: "center", color: w.utama }}>
                {el.pusat.replace(/\*/g, "")}
              </div>
            </div>
          </div>

          {/* Satelit yang berada di depan (z > 0) */}
          {satelit.filter((o) => o.z > 0).map(renderChip)}
        </AbsoluteFill>
      </AbsoluteFill>
    </SediaMotif>
  );
};


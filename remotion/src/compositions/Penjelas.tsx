import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// Grafis penjelas untuk talking head (referensi "Motion graphic penjelas"):
//   E32 LowerThird     — Kapsul siaran broadcast tech-creator: avatar/verified mark, specular sheen, dual-line mask reveal
//   E33 Langkah        — Stepper alur kerja node bercahaya: rel konektor aktif, active node radar bounce, step cards
//   E34 SebelumSesudah — Split card perbandingan: laser divider line, tactile scrubber knob (◀ ❙ ▶), status badges
//   E35 Callout        — Tactical HUD viewfinder: dual rotating reticle, corner crosshairs, elbow leader line, glass tag
//   E36 Linimasa       — Milestone roadmap bercahaya: rel vertikal beraksen, ping wave ring, date badge capsules

// ------------------------------------------------------------------ E32 lower third
export type LowerThirdElemen = ElemenUI & {
  nama: string;
  peran?: string;
  jadwal: { pita: number; nama: number; peran: number };
  tag?: string;
};
export const LowerThird: React.FC<PropsDasar<LowerThirdElemen>> = (props) => {
  const { px, el, w, u, font, naik, keluar, SediaMotif, motif, wadah } = pakaiDasar(props);
  const [x0, , x1, y1] = props.zona;
  const j = el.jadwal;
  const pita = naik(j.pita, 0.45, "tegas");
  const nm = naik(j.nama, 0.4);
  const pr = naik(j.peran, 0.4);
  const tajam = ["hud", "brutal", "editorial", "minimal", "kinetik"].includes(motif.bingkai);
  const lebar = (x1 - x0) * 0.82;

  // Specular sheen melintas sekali setelah pita terbuka
  const kilau = interpolate(pita, [0.3, 1], [-20, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ opacity: 1 - keluar }}>
        <div style={{ position: "absolute", left: x0, top: y1 - px(520), width: lebar }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: px(16) }}>
            {/* Left Accent Lightbar with glowing cap */}
            <div
              style={{
                width: px(8),
                borderRadius: tajam ? 0 : px(8),
                background: `linear-gradient(180deg, ${w.aksen} 0%, ${w.aksen2 ?? w.aksen} 100%)`,
                transform: `scaleY(${pita})`,
                transformOrigin: "50% 100%",
                boxShadow: `0 0 ${px(16)}px ${rgba(w.aksen, 0.65)}`,
              }}
            />

            {/* Main Broadcast Capsule Card */}
            <div
              style={{
                flex: 1,
                clipPath: `inset(0 ${(1 - pita) * 100}% 0 0)`,
                borderRadius: tajam ? px(4) : px(18),
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(135deg, rgba(20, 24, 35, 0.94) 0%, rgba(12, 16, 24, 0.97) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                boxShadow: `0 ${px(18)}px ${px(36)}px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                backdropFilter: "blur(20px)",
                padding: `${px(18)}px ${px(24)}px`,
              }}
            >
              {/* Specular sheen beam */}
              <div
                style={{
                  position: "absolute",
                  top: "-40%",
                  bottom: "-40%",
                  width: px(60),
                  left: `${kilau}%`,
                  transform: "rotate(20deg)",
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent)",
                  pointerEvents: "none",
                }}
              />

              {/* Top row: Verified badge & Tag */}
              <div style={{ display: "flex", alignItems: "center", gap: px(10), marginBottom: px(6) }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: px(20),
                    height: px(20),
                    borderRadius: "50%",
                    background: rgba(w.aksen, 0.2),
                    border: `1px solid ${rgba(w.aksen, 0.45)}`,
                    color: w.aksen,
                    fontWeight: 700,
                  }}
                >
                  <svg viewBox="0 0 24 24" width={px(12)} height={px(12)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                {el.tag ? (
                  <span
                    style={{
                      padding: `${px(2)}px ${px(8)}px`,
                      borderRadius: px(999),
                      background: "rgba(255, 255, 255, 0.08)",
                      ...font("isi"),
                      fontSize: u.kecil * 0.7,
                      color: "rgba(255, 255, 255, 0.65)",
                      letterSpacing: px(0.5),
                      textTransform: "uppercase",
                    }}
                  >
                    {el.tag}
                  </span>
                ) : null}
              </div>

              {/* Title / Name Mask Reveal */}
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    ...font("judul"),
                    fontSize: u.sub * 1.08,
                    lineHeight: 1.08,
                    color: w.utama,
                    transform: `translateY(${(1 - nm) * 110}%)`,
                  }}
                >
                  <Teks teks={el.nama} aksen={w.aksen} hias={false} />
                </div>
              </div>

              {/* Subtitle / Role Mask Reveal */}
              {el.peran ? (
                <div style={{ overflow: "hidden", marginTop: px(6) }}>
                  <div
                    style={{
                      ...font("isi"),
                      fontSize: u.kecil * 0.95,
                      color: "rgba(255, 255, 255, 0.72)",
                      transform: `translateY(${(1 - pr) * 110}%)`,
                      letterSpacing: px(0.5),
                      display: "flex",
                      alignItems: "center",
                      gap: px(6),
                    }}
                  >
                    <span style={{ color: w.aksen }}>•</span>
                    <span>{el.peran}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E33 langkah berurutan
export type LangkahElemen = ElemenUI & {
  judul?: string;
  item: string[];
  jadwal: { langkah: number[] };
};
export const Langkah: React.FC<PropsDasar<LangkahElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props, "atas");
  const j = el.jadwal;
  const n = el.item.length;
  const d = u.isi * 1.55;
  const tajam = ["hud", "brutal", "editorial", "kinetik"].includes(motif.bingkai);
  const aktif = Math.max(0, j.langkah.filter((x) => x <= dtk).length - 1);

  const kemajuan =
    n < 2
      ? naik(j.langkah[0] ?? 0, 0.35, "tegas")
      : interpolate(
          dtk,
          j.langkah.slice(0, n),
          el.item.map((_, i) => i / (n - 1)),
          {
            easing: Array.from({ length: n - 1 }, () => kurva(t, "standar")),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          padding: `${px(24)}px ${px(28)}px`,
          borderRadius: px(20),
          background: "linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(12, 15, 22, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: `0 ${px(24)}px ${px(48)}px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(24px)",
        }}
      >
        {el.judul ? (
          <div style={{ textAlign: "center", marginBottom: px(20), ...font("subjudul"), fontSize: u.sub * 0.95, color: w.utama }}>
            <Teks teks={el.judul} aksen={w.aksen} />
          </div>
        ) : null}

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          {/* Background Track */}
          <div
            style={{
              position: "absolute",
              left: `${50 / n}%`,
              right: `${50 / n}%`,
              top: d / 2 - px(3),
              height: px(6),
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: px(6),
            }}
          />

          {/* Active Radiant Fill Track */}
          <div
            style={{
              position: "absolute",
              left: `${50 / n}%`,
              top: d / 2 - px(3),
              height: px(6),
              borderRadius: px(6),
              background: `linear-gradient(90deg, ${w.aksen}, ${w.aksen2 ?? "#34D399"})`,
              boxShadow: `0 0 ${px(12)}px ${w.aksen}`,
              width: `${(100 - 100 / n) * kemajuan}%`,
            }}
          />

          {el.item.map((it, i) => {
            const p = naik(j.langkah[i], 0.35, "tegas");
            const on = i <= aktif && p > 0.5;
            const sedangAktif = i === aktif;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: px(14),
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* Node Ring */}
                <div
                  style={{
                    width: d,
                    height: d,
                    borderRadius: tajam ? px(6) : "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: on
                      ? `linear-gradient(135deg, ${w.aksen} 0%, ${w.aksen2 ?? w.aksen} 100%)`
                      : "rgba(30, 36, 50, 0.95)",
                    border: `${px(3.5)}px solid ${on ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)"}`,
                    transform: `scale(${skalaPersepsi(p, 0.6) + (sedangAktif ? 0.08 * Math.sin(Math.min(1, Math.max(0, dtk - j.langkah[i]) / 0.3) * Math.PI) : 0)})`,
                    boxShadow: on
                      ? `0 0 ${px(22)}px ${rgba(w.aksen, 0.8)}, inset 0 1px 2px rgba(255,255,255,0.4)`
                      : "none",
                    ...font("judul"),
                    fontSize: u.isi * 0.95,
                    color: on ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {i + 1}
                </div>

                {/* Step Text Label Card */}
                <div
                  style={{
                    padding: `${px(6)}px ${px(12)}px`,
                    borderRadius: px(8),
                    background: sedangAktif ? "rgba(255, 255, 255, 0.07)" : "transparent",
                    border: `1px solid ${sedangAktif ? rgba(w.aksen, 0.3) : "transparent"}`,
                    ...font("subjudul"),
                    fontSize: u.kecil * 0.95,
                    color: on ? w.utama : "rgba(255, 255, 255, 0.45)",
                    opacity: 0.4 + 0.6 * p,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  <Teks teks={it} aksen={w.aksen} hias={false} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E34 sebelum & sesudah
export type SebelumSesudahElemen = ElemenUI & {
  sebelum: string;
  sesudah: string;
  label?: [string, string];
  jadwal: { wipe: number; durasi_wipe: number };
};
export const SebelumSesudah: React.FC<PropsDasar<SebelumSesudahElemen>> = (props) => {
  const { px, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const wp = naik(j.wipe, j.durasi_wipe, "standar");
  const [lb, ls] = el.label ?? ["Sebelum", "Sesudah"];

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          padding: px(28),
          borderRadius: px(20),
          background: "linear-gradient(180deg, rgba(18, 22, 32, 0.95) 0%, rgba(10, 14, 20, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: `0 ${px(24)}px ${px(50)}px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(24px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Split Container */}
        <div style={{ position: "relative" }}>
          {/* Sisi Sebelum */}
          <div
            style={{
              opacity: 1 - 0.55 * wp,
              padding: `${px(14)}px ${px(18)}px`,
              borderRadius: px(12),
              background: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: px(8), marginBottom: px(8) }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(6),
                  padding: `${px(2)}px ${px(10)}px`,
                  borderRadius: px(999),
                  background: "rgba(239, 68, 68, 0.18)",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  ...font("isi"),
                  fontSize: u.kecil * 0.72,
                  color: "#F87171",
                  letterSpacing: px(1),
                  textTransform: "uppercase",
                }}
              >
                <svg viewBox="0 0 24 24" width={px(10)} height={px(10)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                {lb}
              </span>
            </div>
            <div
              style={{
                ...font("subjudul"),
                fontSize: u.isi * 0.96,
                lineHeight: 1.25,
                color: "rgba(255, 255, 255, 0.8)",
                textDecoration: wp > 0.5 ? "line-through" : undefined,
                textDecorationColor: "#F87171",
              }}
            >
              <Teks teks={el.sebelum} aksen="#F87171" hias={wp <= 0.5} />
            </div>
          </div>

          {/* Divider laser line */}
          <div style={{ height: px(2), background: "rgba(255, 255, 255, 0.1)", margin: `${px(18)}px 0` }} />

          {/* Sisi Sesudah */}
          <div
            style={{
              clipPath: `inset(0 ${(1 - wp) * 100}% 0 0)`,
              padding: `${px(14)}px ${px(18)}px`,
              borderRadius: px(12),
              background: rgba(w.aksen, 0.08),
              border: `1px solid ${rgba(w.aksen, 0.3)}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: px(8), marginBottom: px(8) }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(6),
                  padding: `${px(2)}px ${px(10)}px`,
                  borderRadius: px(999),
                  background: rgba(w.aksen, 0.22),
                  border: `1px solid ${rgba(w.aksen, 0.45)}`,
                  ...font("isi"),
                  fontSize: u.kecil * 0.72,
                  color: w.aksen,
                  letterSpacing: px(1),
                  textTransform: "uppercase",
                }}
              >
                <svg viewBox="0 0 24 24" width={px(10)} height={px(10)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {ls}
              </span>
            </div>
            <div style={{ ...font("subjudul"), fontSize: u.isi * 0.98, lineHeight: 1.25, color: w.utama }}>
              <Teks teks={el.sesudah} aksen={w.aksen} hias={true} />
            </div>
          </div>

          {/* Laser Scrubber Knob Guide */}
          <div
            style={{
              position: "absolute",
              top: -px(10),
              bottom: -px(10),
              left: `${wp * 100}%`,
              width: px(4),
              background: `linear-gradient(180deg, transparent, ${w.aksen}, ${w.aksen2 ?? w.aksen}, transparent)`,
              opacity: wp > 0 && wp < 1 ? 1 : 0,
              boxShadow: `0 0 ${px(18)}px ${w.aksen}`,
              transform: "translateX(-50%)",
            }}
          >
            {/* Knob handle badge */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: px(32),
                height: px(24),
                borderRadius: px(999),
                background: w.aksen,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: px(10),
                color: "#FFFFFF",
                boxShadow: `0 0 ${px(10)}px ${rgba(w.aksen, 0.8)}`,
              }}
            >
              ◀▶
            </div>
          </div>
        </div>
      </div>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E35 callout lingkaran (HUD Viewfinder)
export type CalloutElemen = ElemenUI & {
  x: number;
  y: number;
  teks: string;
  tag?: string;
  jadwal: { lingkar: number; label: number };
};
export const Callout: React.FC<PropsDasar<CalloutElemen>> = (props) => {
  const { dtk, px, el, w, u, font, naik, keluar, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const [x0, y0, x1, y1] = zona;
  const j = el.jadwal;
  const cx = el.x * W;
  const cy = el.y * H;
  const r = px(64);
  const pl = naik(j.lingkar, 0.4, "tegas");
  const pt = naik(j.label, 0.35);

  const tDenyut = dtk - j.lingkar;
  const denyut =
    tDenyut > 0 && tDenyut < (2 * 2 * Math.PI) / 5
      ? 1 + 0.12 * Math.max(0, Math.sin(tDenyut * 5)) * (1 - tDenyut / ((2 * 2 * Math.PI) / 5))
      : 1;

  const kanan = cx < (x0 + x1) / 2;
  const lx = kanan ? Math.min(x1 - px(380), cx + r + px(70)) : Math.max(x0, cx - r - px(450));
  const ly = Math.min(y1 - px(120), Math.max(y0, cy - px(160)));

  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ opacity: 1 - keluar }}>
        {/* HUD Target at (cx, cy) */}
        <div
          style={{
            position: "absolute",
            left: cx - r,
            top: cy - r,
            width: 2 * r,
            height: 2 * r,
            borderRadius: "50%",
            border: `${px(3)}px solid ${w.aksen}`,
            transform: `scale(${skalaPersepsi(pl, 0.4) * denyut})`,
            opacity: pl,
            boxShadow: `0 0 0 ${px(8) * denyut}px ${rgba(w.aksen, 0.15)}, 0 0 ${px(20)}px ${rgba(w.aksen, 0.4)}`,
          }}
        />

        {/* Outer dashed rotating reticle ring */}
        <div
          style={{
            position: "absolute",
            left: cx - r * 1.3,
            top: cy - r * 1.3,
            width: 2.6 * r,
            height: 2.6 * r,
            borderRadius: "50%",
            border: `${px(1.5)}px dashed rgba(255, 255, 255, 0.4)`,
            transform: `rotate(${dtk * 30}deg)`,
            opacity: pl * 0.7,
          }}
        />

        {/* Center Target Dot */}
        <div
          style={{
            position: "absolute",
            left: cx - px(4),
            top: cy - px(4),
            width: px(8),
            height: px(8),
            borderRadius: "50%",
            background: w.aksen,
            boxShadow: `0 0 ${px(8)}px ${w.aksen}`,
            opacity: pl,
          }}
        />

        {/* Angled leader line with joint dot */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d={`M${cx + (kanan ? r : -r) * 0.7} ${cy - r * 0.7} L${kanan ? lx : lx + px(380)} ${ly + px(36)}`}
            stroke={w.aksen}
            strokeWidth={px(3)}
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - pt}
          />
        </svg>

        {/* Callout Glass Badge Card */}
        <div
          style={{
            position: "absolute",
            left: lx,
            top: ly,
            width: px(380),
            opacity: pt,
            transform: `translateY(${(1 - pt) * px(18)}px)`,
            borderRadius: px(14),
            background: "linear-gradient(135deg, rgba(20, 24, 34, 0.94) 0%, rgba(12, 16, 24, 0.98) 100%)",
            border: `1px solid ${rgba(w.aksen, 0.4)}`,
            boxShadow: `0 ${px(16)}px ${px(32)}px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
            backdropFilter: "blur(20px)",
            padding: `${px(14)}px ${px(18)}px`,
          }}
        >
          {el.tag ? (
            <div style={{ display: "flex", alignItems: "center", gap: px(6), marginBottom: px(4) }}>
              <span
                style={{
                  padding: `${px(1)}px ${px(6)}px`,
                  borderRadius: px(4),
                  background: rgba(w.aksen, 0.18),
                  ...font("isi"),
                  fontSize: u.kecil * 0.7,
                  color: w.aksen,
                  letterSpacing: px(0.5),
                  textTransform: "uppercase",
                }}
              >
                {el.tag}
              </span>
            </div>
          ) : null}
          <div style={{ ...font("subjudul"), fontSize: u.kecil * 1.08, color: w.utama, lineHeight: 1.2 }}>
            <Teks teks={el.teks} aksen={w.aksen} />
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E36 linimasa (Milestone Roadmap)
export type TitikWaktu = { tahun: string; label: string };
export type LinimasaElemen = ElemenUI & {
  judul?: string;
  titik: TitikWaktu[];
  jadwal: { garis: number; titik: number[] };
};
export const Linimasa: React.FC<PropsDasar<LinimasaElemen>> = (props) => {
  const { px, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const n = el.titik.length;
  const pg = naik(j.garis, j.titik[n - 1] - j.garis + 0.3, "standar");

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          padding: `${px(26)}px ${px(32)}px`,
          borderRadius: px(20),
          background: "linear-gradient(180deg, rgba(20, 24, 34, 0.95) 0%, rgba(12, 16, 22, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: `0 ${px(24)}px ${px(48)}px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(24px)",
        }}
      >
        {el.judul ? (
          <div style={{ marginBottom: px(20), ...font("subjudul"), fontSize: u.sub, color: w.utama }}>
            <Teks teks={el.judul} aksen={w.aksen} />
          </div>
        ) : null}

        <div style={{ position: "relative", paddingLeft: px(46) }}>
          {/* Background Rail */}
          <div
            style={{
              position: "absolute",
              left: px(14),
              top: px(12),
              bottom: px(12),
              width: px(4),
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: px(4),
            }}
          />

          {/* Active Radiant Rail */}
          <div
            style={{
              position: "absolute",
              left: px(14),
              top: px(12),
              height: `calc((100% - ${px(24)}px) * ${pg})`,
              width: px(4),
              borderRadius: px(4),
              background: `linear-gradient(180deg, ${w.aksen}, ${w.aksen2 ?? "#34D399"})`,
              boxShadow: `0 0 ${px(10)}px ${w.aksen}`,
            }}
          />

          {el.titik.map((tt, i) => {
            const p = naik(j.titik[i], 0.35, "tegas");
            const akhir = i === n - 1;
            const on = p > 0.5;

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  marginBottom: i < n - 1 ? px(28) : 0,
                  opacity: 0.25 + 0.75 * p,
                  transform: `translateX(${(1 - p) * px(24)}px)`,
                }}
              >
                {/* Milestone Node */}
                <div
                  style={{
                    position: "absolute",
                    left: -px(48),
                    top: px(4),
                    width: px(28),
                    height: px(28),
                    borderRadius: "50%",
                    background: on
                      ? `linear-gradient(135deg, ${w.aksen} 0%, ${w.aksen2 ?? w.aksen} 100%)`
                      : "rgba(30, 36, 50, 0.95)",
                    border: `${px(3)}px solid ${on ? "#FFFFFF" : "rgba(255, 255, 255, 0.3)"}`,
                    transform: `scale(${skalaPersepsi(p, 0.6)})`,
                    boxShadow: on ? `0 0 ${px(16)}px ${rgba(w.aksen, 0.8)}` : "none",
                  }}
                />

                {/* Milestone Year / Date Pill */}
                <div style={{ display: "flex", alignItems: "center", gap: px(10) }}>
                  <span
                    style={{
                      padding: `${px(2)}px ${px(10)}px`,
                      borderRadius: px(999),
                      background: akhir ? rgba(w.aksen, 0.25) : "rgba(255, 255, 255, 0.08)",
                      border: `1px solid ${akhir ? w.aksen : "rgba(255, 255, 255, 0.12)"}`,
                      ...font("judul"),
                      fontSize: u.isi * (akhir ? 1.05 : 0.92),
                      color: akhir ? w.aksen : w.utama,
                    }}
                  >
                    {tt.tahun}
                  </span>
                </div>

                {/* Milestone Label */}
                <div
                  style={{
                    ...font("isi"),
                    fontSize: u.kecil * 0.95,
                    color: "rgba(255, 255, 255, 0.75)",
                    marginTop: px(6),
                    lineHeight: 1.25,
                  }}
                >
                  {tt.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Wadah>
  );
};


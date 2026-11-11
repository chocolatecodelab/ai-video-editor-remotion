import React from "react";
import { interpolate, spring } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";

// E22 timeline (NLE Studio Video Editor Mockup — 100% Recyclable & Parameterized):
// Komposisi editor video profesional yang sepenuhnya dinamis (tidak ada teks kaku/hardcoded):
// - Header Seri Opsional: Tampil hanya bila 'seri_judul' atau 'nomor_efek' disediakan di props
// - Studio Window: Nama aplikasi/studio ('nama_studio'), timecode dinamis, monitor preview
// - Multi-Track Timeline: Trek V2, V1, A1 dll. dapat diubah nama, label, dan warnanya lewat 'trek'
// - Playhead Scrubber: Jarum scrub interaktif bergerak melintasi klip
// - Teks & Chip Bawah: Menggunakan 'teks_bawah' / 'judul' dan 'chip' dinamis

export type Trek = {
  nama: string;
  label?: string;
  warna?: string;
  offset_persen?: number;
  lebar_persen?: number;
};

export type TimelineElemen = ElemenUI & {
  judul?: string;
  sub?: string;
  seri_judul?: string;
  seri_sub?: string;
  nomor_efek?: number | string;
  label_efek?: string;
  nama_studio?: string;
  teks_bawah?: string;
  trek?: Trek[];
  chip?: string[];
  catatan?: string;
  jadwal: {
    trek?: number[];
    chip?: number[];
    playhead: [number, number];
  };
};

export type TimelineProps = PropsDasar<TimelineElemen>;

const DEFAULT_TREKS: Trek[] = [
  { nama: "V2", label: "B-roll", warna: "#ea580c", offset_persen: 32, lebar_persen: 45 },
  { nama: "V1", label: "Video Utama", warna: "#2563eb", offset_persen: 5, lebar_persen: 90 },
  { nama: "A1", label: "Audio", warna: "#10b981", offset_persen: 5, lebar_persen: 90 },
];

export const Timeline: React.FC<TimelineProps> = (props) => {
  const { durasiFrame } = props;
  const { f, fps, dtk, px, t, el, w, u, font, Wadah, wadah } = pakaiDasar(props, "tengah");

  const j = el.jadwal;
  const tPlayhead = j.playhead ?? [0.4, (durasiFrame / fps) - 0.4];
  const phProgress = Math.min(1, Math.max(0, (dtk - tPlayhead[0]) / Math.max(0.1, tPlayhead[1] - tPlayhead[0])));

  const treks = el.trek && el.trek.length ? el.trek : DEFAULT_TREKS;
  const namaStudio = el.nama_studio ?? "TIMELINE STUDIO";
  const teksBawah = el.teks_bawah ?? (el.judul !== namaStudio ? el.judul : "");

  // Spring animation for window entry
  const spWindow = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  // Calculate dynamic timecode
  const formatTimecode = (detik: number) => {
    const m = Math.floor(detik / 60);
    const s = Math.floor(detik % 60);
    const ms = Math.floor((detik % 1) * 30);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(ms).padStart(2, "0")}`;
  };

  const hasHeaderSeries = Boolean(el.seri_judul || el.nomor_efek !== undefined || el.label_efek);

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${skalaPersepsi(spWindow, 0.94)})`,
          opacity: Math.min(1, spWindow * 2),
        }}
      >
        {/* ================= 1. OPTIONAL HEADER & BADGES (ONLY IF PROVIDED) ================= */}
        {hasHeaderSeries && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: px(18),
            }}
          >
            {/* Main Series Capsule */}
            {el.seri_judul && (
              <div
                style={{
                  padding: `${px(5)}px ${px(18)}px`,
                  borderRadius: px(12),
                  background: "#ffffff",
                  boxShadow: `0 ${px(4)}px ${px(14)}px rgba(0,0,0,0.35)`,
                  marginBottom: px(8),
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: u.kecil * 0.9,
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: -px(0.3),
                  }}
                >
                  {el.seri_judul}
                </span>
                {el.seri_sub && (
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: u.kecil * 0.9,
                      fontWeight: 500,
                      color: "#6b7280",
                      marginLeft: px(6),
                    }}
                  >
                    {el.seri_sub}
                  </span>
                )}
              </div>
            )}

            {/* Effect Number + Label Pill */}
            {(el.nomor_efek !== undefined || el.label_efek) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(8),
                  marginBottom: px(10),
                }}
              >
                {el.nomor_efek !== undefined && (
                  <div
                    style={{
                      padding: `${px(4)}px ${px(12)}px`,
                      borderRadius: px(8),
                      background: w.aksen || "#ea580c",
                      color: "#ffffff",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 800,
                      fontSize: u.isi * 0.8,
                      boxShadow: `0 ${px(4)}px ${px(12)}px rgba(234, 88, 12, 0.35)`,
                    }}
                  >
                    {el.nomor_efek}
                  </div>
                )}

                {el.label_efek && (
                  <div
                    style={{
                      padding: `${px(5)}px ${px(18)}px`,
                      borderRadius: px(8),
                      background: "#ffffff",
                      color: "#0f172a",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 800,
                      fontSize: u.isi * 0.85,
                      letterSpacing: -px(0.3),
                      boxShadow: `0 ${px(4)}px ${px(14)}px rgba(0,0,0,0.25)`,
                    }}
                  >
                    {el.label_efek}
                  </div>
                )}
              </div>
            )}

            {/* Segment Progress Dashes */}
            <div style={{ display: "flex", gap: px(5) }}>
              {Array.from({ length: 14 }, (_, di) => {
                const active = di <= Math.floor(phProgress * 14);
                return (
                  <div
                    key={di}
                    style={{
                      width: px(16),
                      height: px(4),
                      borderRadius: px(2),
                      background: active ? (w.aksen || "#ea580c") : "rgba(255, 255, 255, 0.2)",
                      boxShadow: active ? `0 0 ${px(6)}px ${w.aksen || "#ea580c"}` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 2. DESKTOP NLE STUDIO WINDOW MOCKUP ================= */}
        <div
          style={{
            width: "100%",
            borderRadius: px(20),
            background: "#ffffff",
            boxShadow: `
              0 ${px(18)}px ${px(45)}px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.14)
            `,
            overflow: "hidden",
            color: "#1e293b",
          }}
        >
          {/* Window Chrome Title Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${px(10)}px ${px(16)}px`,
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            {/* Traffic Lights + Dynamic Studio Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: px(10) }}>
              <div style={{ display: "flex", gap: px(6) }}>
                <div style={{ width: px(10), height: px(10), borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: px(10), height: px(10), borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: px(10), height: px(10), borderRadius: "50%", background: "#10b981" }} />
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: px(6),
                  padding: `${px(3)}px ${px(10)}px`,
                  borderRadius: px(6),
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    width: px(6),
                    height: px(6),
                    borderRadius: "50%",
                    background: w.aksen || "#ea580c",
                  }}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: u.kecil * 0.65,
                    fontWeight: 700,
                    color: "#334155",
                    letterSpacing: px(0.6),
                    textTransform: "uppercase",
                  }}
                >
                  {namaStudio}
                </span>
              </div>
            </div>

            {/* Window Right Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: px(6) }}>
              <div
                style={{
                  padding: `${px(3)}px ${px(9)}px`,
                  borderRadius: px(6),
                  background: "#f1f5f9",
                  fontSize: u.kecil * 0.6,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                Inspect
              </div>
              <div
                style={{
                  padding: `${px(3)}px ${px(9)}px`,
                  borderRadius: px(6),
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  fontSize: u.kecil * 0.6,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  color: "#166534",
                }}
              >
                Export
              </div>
            </div>
          </div>

          {/* Video Player Canvas Viewport */}
          <div
            style={{
              position: "relative",
              height: px(200),
              background: "#090d16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Inner Video Preview Frame (Talking Head Canvas) */}
            <div
              style={{
                position: "relative",
                width: px(120),
                height: px(170),
                borderRadius: px(10),
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: `0 ${px(8)}px ${px(24)}px rgba(0,0,0,0.6)`,
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Silhouette Avatar */}
              <div
                style={{
                  width: px(46),
                  height: px(46),
                  borderRadius: "50%",
                  background: w.aksen2 || "#38bdf8",
                  opacity: 0.85,
                  marginBottom: px(8),
                }}
              />
              <div
                style={{
                  width: px(75),
                  height: px(32),
                  borderRadius: px(16),
                  background: "#3b82f6",
                  opacity: 0.7,
                }}
              />

              {/* Dynamic In-Video Subtitle / Subtext if provided */}
              {el.sub && (
                <div
                  style={{
                    position: "absolute",
                    bottom: px(10),
                    left: px(8),
                    right: px(8),
                    padding: `${px(3)}px ${px(6)}px`,
                    borderRadius: px(4),
                    background: "rgba(0,0,0,0.75)",
                    color: "#ffffff",
                    fontSize: px(8),
                    fontWeight: 600,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {el.sub}
                </div>
              )}
            </div>

            {/* Transport Bar at Bottom of Canvas */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: px(26),
                background: "rgba(15, 23, 42, 0.9)",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `0 ${px(14)}px`,
                fontSize: px(9),
                fontFamily: "monospace",
                color: "#94a3b8",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: px(6) }}>
                <span>▶</span>
                <span>{formatTimecode(dtk)} / {formatTimecode(durasiFrame / fps)}</span>
              </div>
              <div style={{ color: w.aksen2 || "#38bdf8" }}>HD · 1080×1920</div>
            </div>
          </div>

          {/* ================= 3. NLE MULTI-TRACK TIMELINE ================= */}
          <div
            style={{
              padding: `${px(14)}px ${px(16)}px ${px(16)}px ${px(16)}px`,
              background: "#0f172a",
              color: "#ffffff",
            }}
          >
            {/* Timecode Ruler Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: px(8),
                paddingLeft: px(46),
                fontSize: px(9),
                fontFamily: "monospace",
                color: "#64748b",
              }}
            >
              <span>00:00</span>
              <span>00:15</span>
              <span>00:30</span>
              <span>00:45</span>
              <span>01:00</span>
            </div>

            {/* Tracks Container with Playhead Needle */}
            <div style={{ position: "relative" }}>
              {/* Vertical Playhead Scrub Needle */}
              <div
                style={{
                  position: "absolute",
                  top: -px(8),
                  bottom: -px(6),
                  left: `calc(${px(46)}px + (100% - ${px(46)}px) * ${phProgress})`,
                  width: px(2),
                  background: "#ffffff",
                  boxShadow: `0 0 ${px(8)}px #ffffff`,
                  zIndex: 40,
                  pointerEvents: "none",
                }}
              >
                {/* Scrub Knob Top Handle */}
                <div
                  style={{
                    position: "absolute",
                    top: -px(8),
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: px(11),
                    height: px(11),
                    borderRadius: "50%",
                    background: "#ffffff",
                    boxShadow: `0 ${px(2)}px ${px(6)}px rgba(0,0,0,0.5)`,
                  }}
                />
              </div>

              {/* Render Dynamic Tracks */}
              {treks.map((tr, ti) => {
                const trNama = tr.nama;
                const trLabel = tr.label ?? (trNama === "V2" ? "B-roll" : trNama === "V1" ? "Video Utama" : "Audio");
                const trColor = tr.warna ?? (ti === 0 ? "#ea580c" : ti === 1 ? "#2563eb" : "#10b981");
                const isAudio = trNama.toLowerCase().startsWith("a");
                const offset = tr.offset_persen ?? (ti === 0 ? 32 : 5);
                const lebar = tr.lebar_persen ?? (ti === 0 ? 45 : 90);

                return (
                  <div
                    key={ti}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: isAudio ? px(30) : px(36),
                      marginBottom: px(7),
                      background: "#1e293b",
                      borderRadius: px(7),
                      padding: `0 ${px(8)}px`,
                    }}
                  >
                    <div
                      style={{
                        width: px(36),
                        fontSize: px(11),
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        color: "#94a3b8",
                      }}
                    >
                      {trNama}
                    </div>

                    <div style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
                      {!isAudio ? (
                        /* Video Clip Block */
                        <div
                          style={{
                            position: "absolute",
                            left: `${offset}%`,
                            width: `${lebar}%`,
                            height: px(26),
                            borderRadius: px(6),
                            background: trColor,
                            boxShadow: `0 ${px(2)}px ${px(8)}px ${rgba(trColor, 0.4)}`,
                            display: "flex",
                            alignItems: "center",
                            padding: `0 ${px(10)}px`,
                            fontSize: px(10.5),
                            fontWeight: 700,
                            color: "#ffffff",
                            fontFamily: "Inter, sans-serif",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {trLabel}
                        </div>
                      ) : (
                        /* Audio Waveform Block */
                        <div
                          style={{
                            position: "absolute",
                            left: `${offset}%`,
                            width: `${lebar}%`,
                            height: px(20),
                            borderRadius: px(4),
                            background: rgba(trColor, 0.2),
                            border: `1px solid ${rgba(trColor, 0.4)}`,
                            display: "flex",
                            alignItems: "center",
                            gap: px(2),
                            padding: `0 ${px(6)}px`,
                            overflow: "hidden",
                          }}
                        >
                          {Array.from({ length: 44 }, (_, wi) => {
                            const waveH = 20 + 70 * Math.abs(Math.sin(wi * 0.45));
                            return (
                              <div
                                key={wi}
                                style={{
                                  flex: 1,
                                  height: `${waveH}%`,
                                  borderRadius: px(1),
                                  background: trColor,
                                  opacity: 0.85,
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= 4. DYNAMIC BOTTOM KEYWORD & CHIPS ================= */}
        {(teksBawah || el.chip?.length || el.catatan) && (
          <div style={{ marginTop: px(20), textAlign: "center" }}>
            {/* Dynamic Bottom Subtitle / Keyword */}
            {teksBawah && (
              <div
                style={{
                  ...font("judul"),
                  fontSize: u.judul * 0.82,
                  fontWeight: 900,
                  color: w.utama,
                  letterSpacing: -px(0.5),
                  textShadow: `0 ${px(4)}px ${px(16)}px rgba(0,0,0,0.6)`,
                }}
              >
                {teksBawah}
              </div>
            )}

            {/* Milestone Word Chips */}
            {el.chip?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: px(10), marginTop: px(12) }}>
                {el.chip.map((c, i) => {
                  const a = j.chip?.[i]
                    ? interpolate(dtk, [j.chip[i], j.chip[i] + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                    : 1;
                  const isTerakhir = i === el.chip!.length - 1;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: `${px(5)}px ${px(16)}px`,
                        borderRadius: px(999),
                        ...font("subjudul"),
                        fontSize: u.kecil * 0.85,
                        fontWeight: 700,
                        opacity: a,
                        transform: `scale(${skalaPersepsi(a, 0.7)})`,
                        background: isTerakhir ? (w.aksen || "#ea580c") : "rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        border: isTerakhir ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {c}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {el.catatan && (
              <div
                style={{
                  marginTop: px(10),
                  ...font("isi"),
                  fontSize: u.kecil * 0.82,
                  color: w.aksen || "#ea580c",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: px(6),
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={px(13)}
                  height={px(13)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{el.catatan}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Wadah>
  );
};

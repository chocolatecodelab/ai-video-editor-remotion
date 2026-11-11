import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";

// E24 form-ganti: formulir konfigurasi & parameter AI/studio (label : nilai)
// Card kaca gelap dengan breadcrumb header, diff token transisi (lama ➔ baru),
// glowing active row spotlight, dan lencana validasi pop beraksen.
export type BarisForm = { label: string; lama?: string; baru: string };
export type FormGantiElemen = ElemenUI & {
  judul?: string;
  baris: BarisForm[];
  lencana?: string;
  tag?: string;
  jadwal: { ganti: number[] };
};
export type FormGantiProps = PropsDasar<FormGantiElemen>;

export const FormGanti: React.FC<FormGantiProps> = (props) => {
  const { dtk, px, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const mono = { fontFamily: "Consolas, 'Cascadia Mono', monospace" } as const;

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
          padding: `${px(22)}px ${px(26)}px`,
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(18) }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(10) }}>
            <svg
              viewBox="0 0 24 24"
              width={px(16)}
              height={px(16)}
              fill="none"
              stroke={w.aksen}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span style={{ ...mono, fontSize: u.kecil * 0.9, color: w.utama, fontWeight: 700 }}>
              {el.judul ?? "variant.config"}
            </span>
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
            {el.tag ?? "CONFIG DIFF"}
          </div>
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: px(10) }}>
          {el.baris.map((b, i) => {
            const g = naik(j.ganti[i] ?? 0.5 + i * 0.3, 0.22);
            const l = naik((j.ganti[i] ?? 0.5 + i * 0.3) + 0.18, 0.22);
            const aktif = dtk >= (j.ganti[i] ?? 0) && (i === el.baris.length - 1 || dtk < (j.ganti[i + 1] ?? 99));

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(14),
                  padding: `${px(8)}px ${px(14)}px`,
                  borderRadius: px(12),
                  background: aktif ? rgba(w.aksen, 0.12) : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${aktif ? rgba(w.aksen, 0.35) : "rgba(255, 255, 255, 0.06)"}`,
                  boxShadow: aktif ? `0 0 ${px(16)}px ${rgba(w.aksen, 0.2)}` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Parameter Label */}
                <div style={{ width: u.kecil * 3.8, ...mono, fontSize: u.kecil * 0.85, color: "rgba(255, 255, 255, 0.65)" }}>
                  {b.label}
                </div>

                {/* Value Container with Transition */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    height: u.kecil * 1.8,
                    borderRadius: px(8),
                    background: "rgba(0, 0, 0, 0.35)",
                    border: `1px solid ${g > 0 ? rgba(w.aksen, 0.45) : "rgba(255, 255, 255, 0.1)"}`,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Old Value */}
                  {b.lama ? (
                    <div
                      style={{
                        position: "absolute",
                        left: px(12),
                        top: "50%",
                        transform: `translateY(${-50 - 65 * g}%)`,
                        opacity: 1 - g,
                        ...mono,
                        fontSize: u.kecil * 0.88,
                        color: "#F87171",
                        textDecoration: "line-through",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.lama}
                    </div>
                  ) : null}

                  {/* New Value */}
                  <div
                    style={{
                      position: "absolute",
                      left: px(12),
                      top: "50%",
                      transform: `translateY(${-50 + 65 * (1 - g)}%)`,
                      opacity: g,
                      ...mono,
                      fontSize: u.kecil * 0.9,
                      fontWeight: 700,
                      color: "#34D399",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.baru}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    minWidth: u.kecil * 3.6,
                    padding: `${px(4)}px ${px(12)}px`,
                    borderRadius: px(999),
                    background: "rgba(52, 211, 153, 0.18)",
                    border: "1px solid rgba(52, 211, 153, 0.35)",
                    ...font("isi"),
                    fontSize: u.kecil * 0.78,
                    color: "#34D399",
                    opacity: l,
                    transform: `scale(${skalaPersepsi(l, 0.6)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: px(4),
                    fontWeight: 600,
                  }}
                >
                  <svg viewBox="0 0 24 24" width={px(11)} height={px(11)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{el.lencana ?? "DIGANTI"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Wadah>
  );
};


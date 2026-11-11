import React from "react";
import { interpolate, random, spring, useCurrentFrame } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E07 checklist / E40 checklist-pop:
// Panel checklist modern ala Notion / Linear / Apple Reminders.
// Header dengan progress badge, baris item floating card dengan nomor urut,
// micro-spring tactile checkbox, checkmark elastis, dan percikan partikel aksen saat tercentang.
export type ChecklistElemen = {
  judul?: string;
  item: string[];
  stagger: number; // detik antar item (di-resolve Python, dicek QA E07.3)
  pop?: boolean;
  kategori?: string;
};
export type ChecklistProps = PropsDasar<ChecklistElemen>;

const CENTANG = 0.3; // detik, dari pustaka efek E07
const BOUNCE = 0.25;

export const waktuItem = (el: ChecklistElemen & { durasi_masuk: number }, i: number) =>
  el.durasi_masuk * 0.5 + i * el.stagger;

export const Checklist: React.FC<ChecklistProps> = (props) => {
  const { px, t, el, w, u, font, ease, motif, Wadah, wadah } = pakaiDasar(
    props as unknown as PropsDasar<ChecklistElemen & { jadwal: Record<string, unknown> }>
  );
  const f = useCurrentFrame();
  const s = (detik: number) => detik * props.fps;
  const jarak = px(Number(t.gerak["jarak-naik"]));
  const kotak = u.isi * 1.05;
  const bulat = ["spidol", "pensil", "kertas", "kolase"].includes(motif.bingkai);

  // Menghitung jumlah item yang sudah tercentang pada frame saat ini
  const totalItem = el.item.length;
  let jumlahSelesai = 0;
  for (let idx = 0; idx < totalItem; idx++) {
    const cMulai = s(waktuItem(el, idx)) + s(0.15) + s(CENTANG);
    if (f >= cMulai) {
      jumlahSelesai++;
    }
  }
  const rasioProgres = totalItem > 0 ? jumlahSelesai / totalItem : 0;

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          padding: px(t.spasi["padding-kartu"]),
          borderRadius: px(20),
          background: "linear-gradient(180deg, rgba(20, 24, 33, 0.94) 0%, rgba(13, 16, 23, 0.97) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: `0 ${px(24)}px ${px(50)}px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Header Bar */}
        {(el.judul || el.kategori) ? (
          <div style={{ marginBottom: px(20) }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: px(8) }}>
              <div style={{ display: "flex", alignItems: "center", gap: px(10) }}>
                {el.kategori ? (
                  <span
                    style={{
                      padding: `${px(2)}px ${px(10)}px`,
                      borderRadius: px(999),
                      background: rgba(w.aksen, 0.15),
                      border: `1px solid ${rgba(w.aksen, 0.3)}`,
                      ...font("isi"),
                      fontSize: u.kecil * 0.75,
                      color: w.aksen,
                      letterSpacing: px(0.5),
                      textTransform: "uppercase",
                    }}
                  >
                    {el.kategori}
                  </span>
                ) : null}
                {el.judul ? (
                  <div style={{ ...font("subjudul"), fontSize: u.sub * 1.02, color: w.utama, lineHeight: 1.1 }}>
                    <Teks teks={el.judul} aksen={w.aksen} />
                  </div>
                ) : null}
              </div>

              {/* Progress counter badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: px(6),
                  padding: `${px(3)}px ${px(10)}px`,
                  borderRadius: px(999),
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  ...font("isi"),
                  fontSize: u.kecil * 0.75,
                  color: jumlahSelesai === totalItem ? "#34D399" : "rgba(255, 255, 255, 0.7)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span>{jumlahSelesai} / {totalItem}</span>
                <span style={{ display: "inline-flex", alignItems: "center", color: jumlahSelesai === totalItem ? "#34D399" : w.aksen }}>
                  {jumlahSelesai === totalItem ? (
                    <svg viewBox="0 0 24 24" width={px(10)} height={px(10)} fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    <span style={{ fontSize: px(7), lineHeight: 1 }}>●</span>
                  )}
                </span>
              </div>
            </div>

            {/* Progress line track */}
            <div style={{ width: "100%", height: px(3), borderRadius: px(3), background: "rgba(255, 255, 255, 0.08)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${rasioProgres * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${w.aksen}, ${w.aksen2 ?? "#34D399"})`,
                  transition: "width 0.3s ease",
                  boxShadow: `0 0 ${px(8)}px ${w.aksen}`,
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Item Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: px(12) }}>
          {el.item.map((teks, i) => {
            const mulai = s(waktuItem(el, i));
            const baris = interpolate(f, [mulai, mulai + s(0.25)], [0, 1], {
              easing: ease,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cMulai = mulai + s(0.15);
            const goresan = interpolate(f, [cMulai, cMulai + s(CENTANG)], [0, 1], {
              easing: ease,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const bAwal = cMulai + s(CENTANG);
            const b = interpolate(f, [bAwal, bAwal + s(BOUNCE)], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pantul = 1 + (el.pop ? 0.28 : 0.16) * Math.sin(Math.PI * b);
            const sp = el.pop
              ? spring({
                  frame: f - Math.round(mulai),
                  fps: props.fps,
                  config: { damping: 9, stiffness: 180, mass: 0.55 },
                })
              : 1;
            const masukPop = el.pop
              ? `scale(${skalaPersepsi(sp, 0.6)}) rotate(${(1 - sp) * -4}deg)`
              : `translateY(${(1 - baris) * jarak * 0.5}px)`;

            const tercentang = goresan >= 1;

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: px(16),
                  padding: `${px(12)}px ${px(16)}px`,
                  borderRadius: px(12),
                  background: tercentang ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.025)",
                  border: `1px solid ${tercentang ? rgba(w.aksen, 0.35) : "rgba(255, 255, 255, 0.08)"}`,
                  opacity: el.pop ? Math.min(1, sp * 2) : baris,
                  transform: masukPop,
                  transformOrigin: "0% 50%",
                  transition: "border 0.2s ease, background 0.2s ease",
                }}
              >
                {/* Left: Checkbox + Number + Text */}
                <div style={{ display: "flex", alignItems: "center", gap: px(14), flex: 1 }}>
                  {/* Particle burst saat tercentang */}
                  {b > 0 && b < 1
                    ? Array.from({ length: 8 }, (_, k) => {
                        const a = (k / 8) * Math.PI * 2 + random(`c${i}${k}`);
                        const r = kotak * (0.8 + 1.2 * b);
                        return (
                          <div
                            key={k}
                            style={{
                              position: "absolute",
                              left: kotak / 2 + Math.cos(a) * r,
                              top: "50%",
                              marginTop: Math.sin(a) * r - px(3),
                              width: px(6),
                              height: px(6),
                              borderRadius: "50%",
                              background: k % 2 === 0 ? w.aksen : (w.aksen2 ?? "#34D399"),
                              opacity: 1 - b,
                              boxShadow: `0 0 ${px(6)}px ${w.aksen}`,
                            }}
                          />
                        );
                      })
                    : null}

                  {/* Checkbox Ring / Box */}
                  <div
                    style={{
                      width: kotak,
                      height: kotak,
                      flexShrink: 0,
                      transform: `scale(${pantul})`,
                      borderRadius: bulat ? "50%" : px(8),
                      border: `${px(2.5)}px solid ${goresan > 0 ? w.aksen : "rgba(255, 255, 255, 0.3)"}`,
                      background: goresan > 0
                        ? `linear-gradient(135deg, ${w.aksen} 0%, ${w.aksen2 ?? w.aksen} 100%)`
                        : "rgba(0, 0, 0, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: goresan > 0 ? `0 0 ${px(14)}px ${rgba(w.aksen, 0.55)}` : "none",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={kotak * 0.72} height={kotak * 0.72}>
                      <path
                        d="M4.5 12.5 L9.5 17.5 L19.5 6.5"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={3.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - goresan}
                      />
                    </svg>
                  </div>

                  {/* Step Number badge */}
                  <span
                    style={{
                      ...font("isi"),
                      fontFamily: "monospace",
                      fontSize: u.kecil * 0.8,
                      color: "rgba(255, 255, 255, 0.4)",
                      letterSpacing: px(0.5),
                    }}
                  >
                    0{i + 1}
                  </span>

                  {/* Item Text */}
                  <div
                    style={{
                      ...font("isi"),
                      fontSize: u.isi * 0.96,
                      color: tercentang ? w.utama : "rgba(255, 255, 255, 0.85)",
                      lineHeight: 1.2,
                      flex: 1,
                    }}
                  >
                    <Teks teks={teks} aksen={w.aksen} tunda={waktuItem(el, i)} />
                  </div>
                </div>

                {/* Right Status Badge */}
                {tercentang ? (
                  <div
                    style={{
                      padding: `${px(2)}px ${px(8)}px`,
                      borderRadius: px(6),
                      background: "rgba(52, 211, 153, 0.15)",
                      border: "1px solid rgba(52, 211, 153, 0.3)",
                      ...font("isi"),
                      fontSize: u.kecil * 0.68,
                      color: "#34D399",
                      fontWeight: 600,
                      letterSpacing: px(0.5),
                      whiteSpace: "nowrap",
                    }}
                  >
                    DONE
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </Wadah>
  );
};


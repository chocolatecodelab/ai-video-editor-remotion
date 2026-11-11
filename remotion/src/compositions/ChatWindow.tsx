import React from "react";
import { spring } from "remotion";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E49 chat-window (simulasi percakapan AI & audit chaining):
// Diadopsi dari referensi "AI effect.mp4" (talking-head tech explainer):
// 1. Jendela macOS bersih dengan traffic lights vector SVG, judul jendela, dan pill role (contoh, jawab, audit).
// 2. Balon dialog 2 sisi: balon pengguna (gelap kontras) di kanan & balon AI (krem/terang halus) di kiri.
// 3. Mode komparasi bertingkat (cascading dual windows: Chat 1 vs Chat 2).
// 4. Slanted thought pills (awan pertanyaan audiens bersudut miring dinamis).
// 100% parameter generik, murni vector SVG, tanpa OS emoji, anti-jitter.

export type BalonChat = {
  peran: "user" | "ai";
  pengirim?: string; // default: "KAMU" atau "AI"
  pesan: string; // mendukung *kata* aksen
};

export type SpekJendelaChat = {
  judul?: string;
  tag?: string;
  warna_tag?: string;
  balon: BalonChat[];
};

export type ChatWindowElemen = ElemenUI & {
  utama: SpekJendelaChat;
  kedua?: SpekJendelaChat; // jika ada, muncul bertingkat di kanan bawah (mode audit/komparasi)
  pikiran?: string[]; // daftar pil pertanyaan miring (slanted thought pills)
  jadwal: {
    masuk_utama?: number;
    balon_utama?: number[];
    masuk_kedua?: number;
    balon_kedua?: number[];
    pikiran?: number[];
  };
};

export type ChatWindowProps = PropsDasar<ChatWindowElemen>;

export const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const { f, fps, px, el, w, u, font, Wadah, wadah } = pakaiDasar(props, "tengah");

  const j = el.jadwal ?? {};
  const tUtama = j.masuk_utama ?? 0.2;
  const tKedua = j.masuk_kedua ?? 2.2;
  const adaKedua = Boolean(el.kedua);

  const elAny = el as any;
  const rawBalon = elAny.utama?.balon ?? elAny.balon ?? (elAny.spek?.pesan ? elAny.spek.pesan.map((p: any) => ({
    peran: typeof p === "object" && p.peran ? p.peran : "user",
    pengirim: typeof p === "object" ? p.pengirim : undefined,
    pesan: typeof p === "string" ? p : p.pesan ?? "Contoh percakapan"
  })) : [
    { peran: "user", pesan: "Bagaimana cara *otomatisasi* video?" },
    { peran: "ai", pesan: "Gunakan pipeline *modular* berbasis token." }
  ]);

  const utama: SpekJendelaChat = {
    judul: el.utama?.judul ?? elAny.judul ?? elAny.spek?.judul ?? "Chat dengan AI",
    tag: el.utama?.tag ?? elAny.tag ?? elAny.spek?.tag ?? "AI",
    warna_tag: el.utama?.warna_tag ?? elAny.warna_tag ?? elAny.spek?.warna_tag,
    balon: rawBalon
  };

  // Spring entrance untuk jendela utama
  const spUtama = spring({
    frame: f - Math.round(tUtama * fps),
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.65 },
  });

  // Spring entrance untuk jendela kedua (cascading)
  const spKedua = adaKedua
    ? spring({
        frame: f - Math.round(tKedua * fps),
        fps,
        config: { damping: 13, stiffness: 130, mass: 0.7 },
      })
    : 0;

  // Komponen Jendela Kartu
  const renderJendela = (
    spek: SpekJendelaChat | undefined,
    sp: number,
    jadwalBalon: number[] | undefined,
    isSecondary: boolean,
  ) => {
    if (!spek || sp <= 0.01) return null;

    const opasitas = Math.min(1, sp * 2.5);
    const skala = skalaPersepsi(sp, 0.75, 1.0);
    const tagColor = spek.warna_tag ?? (isSecondary ? "#A78BFA" : w.aksen);

    return (
      <div
        style={{
          width: isSecondary ? "82%" : "92%",
          borderRadius: px(20),
          background: "rgba(248, 248, 246, 0.96)",
          border: "1.5px solid rgba(0, 0, 0, 0.08)",
          boxShadow: `
            0 ${px(20)}px ${px(45)}px rgba(0, 0, 0, 0.35),
            0 ${px(4)}px ${px(12)}px rgba(0, 0, 0, 0.15)
          `,
          overflow: "hidden",
          transform: `scale(${skala})`,
          opacity: opasitas,
          transformOrigin: isSecondary ? "100% 100%" : "50% 50%",
          marginBottom: isSecondary ? 0 : px(12),
        }}
      >
        {/* Header Jendela (macOS Chrome) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${px(10)}px ${px(18)}px`,
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            background: "rgba(238, 238, 235, 0.9)",
          }}
        >
          {/* Traffic light dots */}
          <div style={{ display: "flex", gap: px(6), alignItems: "center" }}>
            <div style={{ width: px(9), height: px(9), borderRadius: "50%", background: "#FF5F56" }} />
            <div style={{ width: px(9), height: px(9), borderRadius: "50%", background: "#FFBD2E" }} />
            <div style={{ width: px(9), height: px(9), borderRadius: "50%", background: "#27C93F" }} />
            <span
              style={{
                marginLeft: px(8),
                ...font("isi"),
                fontSize: u.kecil * 0.78,
                color: "#4B5563",
                fontWeight: 600,
              }}
            >
              {spek.judul ?? "Chat dengan AI"}
            </span>
          </div>

          {/* Pill Badge */}
          {spek.tag && (
            <span
              style={{
                padding: `${px(2)}px ${px(10)}px`,
                borderRadius: px(999),
                background: rgba(tagColor, 0.22),
                border: `1px solid ${rgba(tagColor, 0.45)}`,
                ...font("isi"),
                fontSize: u.kecil * 0.7,
                color: "#1E293B",
                fontWeight: 700,
                letterSpacing: px(0.5),
              }}
            >
              {spek.tag}
            </span>
          )}
        </div>

        {/* Isi Percakapan (Chat Bubbles) */}
        <div style={{ padding: `${px(18)}px ${px(20)}px`, display: "flex", flexDirection: "column", gap: px(14) }}>
          {spek.balon.map((b, bi) => {
            const tBalon = jadwalBalon?.[bi] ?? tUtama + 0.3 + bi * 0.6;
            const spBalon = spring({
              frame: f - Math.round(tBalon * fps),
              fps,
              config: { damping: 12, stiffness: 150, mass: 0.6 },
            });

            if (spBalon <= 0.01) return null;

            const isUser = b.peran === "user";
            const pengirimLabel = b.pengirim ?? (isUser ? "KAMU" : "AI");

            return (
              <div
                key={bi}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  opacity: Math.min(1, spBalon * 3),
                  transform: `translateY(${(1 - Math.min(1, spBalon)) * px(16)}px) scale(${skalaPersepsi(spBalon, 0.88, 1.0)})`,
                }}
              >
                {/* Label Pengirim */}
                <span
                  style={{
                    ...font("isi"),
                    fontSize: u.kecil * 0.68,
                    fontWeight: 700,
                    letterSpacing: px(1),
                    color: "#64748B",
                    marginBottom: px(4),
                    padding: `0 ${px(4)}px`,
                  }}
                >
                  {pengirimLabel}
                </span>

                {/* Bubble Container */}
                <div
                  style={{
                    maxWidth: "88%",
                    padding: `${px(12)}px ${px(18)}px`,
                    borderRadius: isUser ? `${px(16)}px ${px(4)}px ${px(16)}px ${px(16)}px` : `${px(4)}px ${px(16)}px ${px(16)}px ${px(16)}px`,
                    background: isUser ? "#0F172A" : "#FFFFFF",
                    color: isUser ? "#FFFFFF" : "#1E293B",
                    boxShadow: isUser
                      ? `0 ${px(4)}px ${px(14)}px rgba(15, 23, 42, 0.25)`
                      : `0 ${px(4)}px ${px(14)}px rgba(0, 0, 0, 0.08)`,
                    border: isUser ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
                    lineHeight: 1.35,
                    ...font("isi"),
                    fontSize: u.isi * 0.9,
                  }}
                >
                  <Teks teks={b.pesan} aksen={tagColor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Jendela Utama */}
        {renderJendela(utama, spUtama, j.balon_utama, false)}

        {/* Jendela Kedua (Cascading Stack di kanan bawah jika ada) */}
        {adaKedua && el.kedua && (
          <div
            style={{
              position: "absolute",
              right: "-2%",
              bottom: "-15%",
              width: "90%",
              zIndex: 3,
            }}
          >
            {renderJendela(el.kedua, spKedua, j.balon_kedua, true)}
          </div>
        )}

        {/* Slanted Thought Pills (Awan pertanyaan miring audiens) */}
        {el.pikiran && el.pikiran.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: px(12),
              bottom: -px(32),
              display: "flex",
              flexDirection: "column",
              gap: px(8),
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            {el.pikiran.map((pk, pi) => {
              const tPk = j.pikiran?.[pi] ?? tUtama + 0.8 + pi * 0.35;
              const spPk = spring({
                frame: f - Math.round(tPk * fps),
                fps,
                config: { damping: 11, stiffness: 140, mass: 0.6 },
              });

              if (spPk <= 0.01) return null;

              const rotasi = [-4.5, 3.2, -2.8, 4.0][pi % 4];

              return (
                <div
                  key={pi}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: `${px(6)}px ${px(14)}px`,
                    borderRadius: px(999),
                    background: "#8B5CF6",
                    color: "#FFFFFF",
                    ...font("isi"),
                    fontSize: u.kecil * 0.8,
                    fontWeight: 700,
                    letterSpacing: px(0.5),
                    textTransform: "uppercase",
                    boxShadow: `0 ${px(6)}px ${px(16)}px rgba(139, 92, 246, 0.45)`,
                    transform: `rotate(${rotasi}deg) scale(${skalaPersepsi(spPk, 0.7, 1.0)})`,
                    opacity: Math.min(1, spPk * 3),
                  }}
                >
                  {pk}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Wadah>
  );
};

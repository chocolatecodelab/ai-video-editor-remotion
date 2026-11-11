import React from "react";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E20 terminal: CLI modern berkelas (Warp / Raycast / Claude Code style)
// Window chrome dengan traffic lights, breadcrumb tab bar, git branch badge,
// syntax token highlighting dinamis, glowing block cursor, dan status output berjenjang.
export type TerminalElemen = ElemenUI & {
  judul?: string;
  perintah: string;
  keluaran?: string[];
  jadwal: { ketik: number[]; enter: number; baris: number[] };
  path?: string;
  branch?: string;
  waktu_eksekusi?: string;
};
export type TerminalProps = PropsDasar<TerminalElemen>;

// Tokenizer perintah sederhana untuk syntax highlighting developer
const sorotPerintah = (teks: string, wAksen: string) => {
  const kata = teks.split(" ");
  return kata.map((k, idx) => {
    let warnaToken = "rgba(255, 255, 255, 0.92)";
    if (idx === 0) {
      warnaToken = "#38BDF8"; // Perintah utama (cyan)
    } else if (k.startsWith("--") || k.startsWith("-")) {
      warnaToken = "#C084FC"; // Flag / opsi (violet)
    } else if (k.includes("/") || k.includes("\\") || k.includes(".")) {
      warnaToken = wAksen; // Path / file (aksen)
    }
    return (
      <span key={idx} style={{ color: warnaToken }}>
        {k}{idx < kata.length - 1 ? " " : ""}
      </span>
    );
  });
};

export const Terminal: React.FC<TerminalProps> = (props) => {
  const { dtk, px, t, el, w, u, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const mono = { fontFamily: "Consolas, 'Cascadia Mono', 'Fira Code', monospace", fontWeight: 600 } as const;
  const polos = el.perintah.replace(/\*/g, "");
  const n = j.ketik.filter((x) => x <= dtk).length;
  const teksKetik = polos.slice(0, n);
  const selesaiKetik = dtk >= j.enter;
  const kursorAktif = !selesaiKetik && (n < polos.length && n > 0 ? true : Math.floor(dtk * 2.5) % 2 === 0);

  const pathDisplay = el.path ?? "~/pipeline";
  const branchDisplay = el.branch ?? "main";
  const durasiDisplay = el.waktu_eksekusi ?? (selesaiKetik ? "0.38s" : "--");

  return (
    <Wadah wadah={wadah}>
      <div
        style={{
          width: "100%",
          borderRadius: px(16),
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(17, 24, 39, 0.96) 0%, rgba(10, 15, 26, 0.98) 100%)",
          border: `1px solid rgba(255, 255, 255, 0.14)`,
          boxShadow: `0 ${px(24)}px ${px(48)}px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Terminal Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${px(12)}px ${px(16)}px`,
            background: "rgba(255, 255, 255, 0.04)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", alignItems: "center", gap: px(8) }}>
            <div style={{ width: px(12), height: px(12), borderRadius: "50%", background: "#FF5F56", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} />
            <div style={{ width: px(12), height: px(12), borderRadius: "50%", background: "#FFBD2E", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} />
            <div style={{ width: px(12), height: px(12), borderRadius: "50%", background: "#27C93F", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }} />
          </div>

          {/* Center Tab Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(8),
              padding: `${px(4)}px ${px(14)}px`,
              borderRadius: px(6),
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              ...mono,
              fontSize: u.kecil * 0.78,
              color: "rgba(255, 255, 255, 0.75)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={px(13)}
              height={px(13)}
              fill="none"
              stroke={w.aksen}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span>{pathDisplay}</span>
            <span style={{ opacity: 0.35 }}>|</span>
            <span style={{ color: "#34D399" }}>⎇ {branchDisplay}</span>
          </div>

          {/* Right Status Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(6),
              padding: `${px(3)}px ${px(10)}px`,
              borderRadius: px(999),
              background: selesaiKetik ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${selesaiKetik ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
              ...mono,
              fontSize: u.kecil * 0.72,
              color: selesaiKetik ? "#34D399" : "rgba(255, 255, 255, 0.5)",
            }}
          >
            <div style={{ width: px(6), height: px(6), borderRadius: "50%", background: selesaiKetik ? "#34D399" : "rgba(255,255,255,0.4)" }} />
            <span>{durasiDisplay}</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div style={{ padding: `${px(18)}px ${px(22)}px`, minHeight: px(140) }}>
          {/* Prompt line */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: px(10),
              ...mono,
              fontSize: u.kecil * 1.05,
              lineHeight: 1.5,
              marginBottom: px(12),
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: `${px(1)}px ${px(6)}px`,
                borderRadius: px(4),
                background: rgba(w.aksen, 0.18),
                color: w.aksen,
                fontSize: u.kecil * 0.85,
                fontWeight: 800,
              }}
            >
              ❯
            </div>
            <div style={{ flex: 1, wordBreak: "break-all" }}>
              {sorotPerintah(teksKetik, w.aksen)}
              <span
                style={{
                  display: "inline-block",
                  width: px(9),
                  height: u.kecil * 1.1,
                  marginLeft: px(4),
                  verticalAlign: "text-bottom",
                  background: w.aksen,
                  boxShadow: kursorAktif ? `0 0 ${px(10)}px ${w.aksen}` : "none",
                  opacity: kursorAktif ? 1 : 0,
                  transition: "opacity 0.1s ease",
                }}
              />
            </div>
          </div>

          {/* Output lines */}
          {(el.keluaran ?? []).map((baris, i) => {
            const a = naik(j.baris[i] ?? j.enter + 0.15 * i, 0.22);
            const selesai = baris.trimStart().startsWith("✓");
            const info = baris.trimStart().startsWith("ℹ") || baris.trimStart().startsWith("[");
            const teksBersih = selesai ? baris.trimStart().replace(/^✓\s*/, "") : baris;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: px(10),
                  ...mono,
                  fontSize: u.kecil * 0.92,
                  lineHeight: 1.55,
                  opacity: a,
                  transform: `translateX(${(1 - a) * px(12)}px)`,
                  marginTop: px(4),
                  color: selesai ? "#34D399" : info ? "#38BDF8" : "rgba(255, 255, 255, 0.82)",
                }}
              >
                {selesai ? (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: px(18),
                      height: px(18),
                      borderRadius: "50%",
                      background: "rgba(52, 211, 153, 0.18)",
                      border: "1px solid rgba(52, 211, 153, 0.4)",
                      color: "#34D399",
                      flexShrink: 0,
                      marginTop: px(2),
                    }}
                  >
                    <svg viewBox="0 0 24 24" width={px(11)} height={px(11)} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                ) : (
                  <div
                    style={{
                      width: px(6),
                      height: px(6),
                      borderRadius: "50%",
                      background: info ? "#38BDF8" : "rgba(255, 255, 255, 0.35)",
                      flexShrink: 0,
                      marginTop: px(8),
                      marginLeft: px(6),
                      marginRight: px(6),
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <Teks teks={teksBersih} aksen={w.aksen} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${px(6)}px ${px(16)}px`,
            background: "rgba(0, 0, 0, 0.25)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            ...mono,
            fontSize: u.kecil * 0.65,
            color: "rgba(255, 255, 255, 0.4)",
          }}
        >
          <span>UTF-8 · zsh</span>
          <span>{el.judul ?? "TERMINAL"}</span>
        </div>
      </div>
    </Wadah>
  );
};


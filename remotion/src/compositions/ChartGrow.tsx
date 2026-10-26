import React from "react";
import { PropsDasar, rgba } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// E10 chart-grow: grafik batang tumbuh berurutan (atau garis tergambar) di dalam bingkai gaya; nilai menghitung naik;
// batang `sorot` (default terakhir) berwarna aksen + label. Jadwal batang dari Python (tick SFX sama frame).
export type ChartGrowElemen = ElemenUI & {
  judul?: string; nilai: number[]; label?: string[]; akhiran?: string; sorot?: number; bentuk?: "batang" | "garis"; catatan?: string;
  jadwal: { batang: number[]; durasi_batang: number; catatan: number };
};
export type ChartGrowProps = PropsDasar<ChartGrowElemen>;

const fmt = (n: number) => (Math.abs(n) >= 100 ? Math.round(n).toLocaleString("id-ID") : (Math.round(n * 10) / 10).toLocaleString("id-ID"));

export const ChartGrow: React.FC<ChartGrowProps> = (props) => {
  const { px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const maks = Math.max(...el.nilai, 1);
  const sorot = el.sorot ?? el.nilai.length - 1;
  const tinggi = u.isi * 6.2;
  const tajam = ["hud", "brutal", "editorial", "minimal"].includes(motif.bingkai);
  const garis = el.bentuk === "garis";
  const n = el.nilai.length;
  const titik = el.nilai.map((v, i) => [((i + 0.5) / n) * 100, 100 - (v / maks) * 88] as const);
  const pGaris = naik(j.batang[0], j.batang[n - 1] - j.batang[0] + j.durasi_batang);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul ?? "data"} seed={el.judul ?? "chart"}>
        <div style={{ position: "relative", height: tinggi, display: "flex", alignItems: "flex-end", gap: px(18),
                      borderBottom: `${px(2)}px solid ${rgba(w.utama, 0.25)}`, padding: `0 ${px(6)}px` }}>
          {[0.25, 0.5, 0.75].map((g) => (
            <div key={g} style={{ position: "absolute", left: 0, right: 0, bottom: tinggi * g, height: px(1), background: rgba(w.utama, 0.08) }} />
          ))}
          {garis ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible",
                                                                             clipPath: `inset(-10% ${(1 - pGaris) * 100}% -10% -2%)` }}>
              <path d={`M${titik.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke={w.aksen} strokeWidth={px(6)}
                    vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          ) : null}
          {garis ? titik.map(([x, y], i) => {
            const p = naik(j.batang[i], j.durasi_batang, "tegas");
            const aktif = i === sorot;
            return (
              <div key={i} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${p})` }}>
                <div style={{ width: px(aktif ? 26 : 18), height: px(aktif ? 26 : 18), borderRadius: tajam ? 0 : px(26),
                              background: aktif ? w.aksen : w.panel, border: `${px(3)}px solid ${w.aksen}` }} />
                <div style={{ position: "absolute", bottom: "160%", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap",
                              ...font(aktif ? "subjudul" : "isi"), fontSize: aktif ? u.isi : u.kecil, color: aktif ? w.aksen : w.sekunder,
                              fontVariantNumeric: "tabular-nums" }}>{fmt(el.nilai[i] * p)}{el.akhiran ?? ""}</div>
              </div>
            );
          }) : el.nilai.map((v, i) => {
            const p = naik(j.batang[i], j.durasi_batang, "tegas");
            const h = (v / maks) * tinggi * 0.88 * p;
            const aktif = i === sorot;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ ...font(aktif ? "subjudul" : "isi"), fontSize: aktif ? u.isi : u.kecil, color: aktif ? w.aksen : w.sekunder,
                              opacity: p, marginBottom: px(8), fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {fmt(v * p)}{el.akhiran ?? ""}
                </div>
                <div style={{ width: "100%", height: h, borderRadius: tajam ? 0 : `${px(10)}px ${px(10)}px 0 0`,
                              background: aktif ? w.aksen : rgba(w.utama, 0.22),
                              boxShadow: aktif && motif.bingkai === "kaca" ? `0 0 ${px(24)}px ${rgba(w.aksen, 0.6)}` : undefined,
                              border: motif.bingkai === "brutal" || motif.bingkai === "spidol" ? `${px(3)}px solid ${w.utama}` : undefined }} />
              </div>
            );
          })}
        </div>
        {el.label?.length ? (
          <div style={{ display: "flex", gap: px(18), padding: `${px(10)}px ${px(6)}px 0` }}>
            {el.label.map((l, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", ...font("isi"), fontSize: u.kecil,
                                    color: i === sorot ? w.utama : w.sekunder, whiteSpace: "nowrap" }}>{l}</div>
            ))}
          </div>
        ) : null}
        {el.catatan ? (
          <div style={{ marginTop: px(16), ...font("isi"), fontSize: u.kecil, color: w.utama, opacity: naik(j.catatan, 0.3) }}>
            <Teks teks={el.catatan} aksen={w.aksen} tunda={j.catatan - el.durasi_masuk - 0.15} />
          </div>
        ) : null}
      </Jendela>
    </Wadah>
  );
};

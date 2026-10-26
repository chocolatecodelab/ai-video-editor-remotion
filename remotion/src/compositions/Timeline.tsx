import React from "react";
import { PropsDasar, rgba, skalaPersepsi } from "../lib/kontrak";
import { Jendela, ElemenUI, pakaiDasar, palet } from "../lib/dasar";

// E22 timeline: trek editor (label + blok/wajik) muncul berurutan, playhead berjalan, lalu chip kata muncul di bawah
// (mis. "semua · pas · dengan · tiap · kata"); chip terakhir beraksen.
export type Trek = { nama: string; blok?: number; bentuk?: "blok" | "wajik" };
export type TimelineElemen = ElemenUI & {
  judul?: string; trek?: Trek[]; chip?: string[]; catatan?: string;
  jadwal: { trek: number[]; chip: number[]; playhead: [number, number] };
};
export type TimelineProps = PropsDasar<TimelineElemen>;

const DEFAULT: Trek[] = [{ nama: "TEKS", blok: 5 }, { nama: "B-ROLL", blok: 5 }, { nama: "EFEK", blok: 5, bentuk: "wajik" }];

export const Timeline: React.FC<TimelineProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const trek = el.trek ?? DEFAULT;
  const warna = palet(w);
  const ph = Math.min(1, Math.max(0, (dtk - j.playhead[0]) / (j.playhead[1] - j.playhead[0])));
  const tinggi = u.kecil * 1.25;
  const labelW = u.kecil * 4.6;
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} judul={el.judul ?? "workflow.timeline"}>
        <div style={{ position: "relative" }}>
          {trek.map((tr, i) => {
            const a = naik(j.trek[i], 0.3);
            const n = tr.blok ?? 5;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", height: tinggi, marginBottom: px(10) }}>
                <div style={{ width: labelW, ...font("isi"), fontSize: u.kecil * 0.82, color: a > 0.5 ? w.aksen : w.sekunder,
                              letterSpacing: px(1), whiteSpace: "nowrap" }}>{a > 0.5 ? "✓ " : ""}{tr.nama}</div>
                <div style={{ flex: 1, display: "flex", gap: px(10), alignItems: "center" }}>
                  {Array.from({ length: n }, (_, k) => {
                    const b = naik(j.trek[i] + k * 0.07, 0.2);
                    const c = warna[i % warna.length];
                    return tr.bentuk === "wajik" ? (
                      <div key={k} style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                        <div style={{ width: tinggi * 0.45, height: tinggi * 0.45, background: c, transform: `rotate(45deg) scale(${b})` }} />
                      </div>
                    ) : (
                      <div key={k} style={{ flex: 1, height: tinggi * 0.62, borderRadius: px(8), background: c,
                                            opacity: b, transform: `scaleX(${0.3 + 0.7 * b})`, transformOrigin: "0% 50%" }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", top: -px(6), bottom: px(4), width: px(3), background: w.peringatan,
                        left: `calc(${labelW}px + (100% - ${labelW}px) * ${ph})`, opacity: ph > 0 && ph < 1 ? 1 : 0 }} />
        </div>
      </Jendela>
      {el.chip?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: px(12), marginTop: px(26) }}>
          {el.chip.map((c, i) => {
            const a = naik(j.chip[i], 0.25);
            const akhir = i === el.chip!.length - 1;
            return (
              <div key={i} style={{ padding: `${px(6)}px ${px(20)}px`, borderRadius: px(999), ...font("subjudul"),
                                    fontSize: u.kecil, opacity: a, transform: `scale(${skalaPersepsi(a, 0.6)})`,
                                    background: akhir ? w.aksen : w.panel, color: akhir ? w.latar : w.utama,
                                    border: akhir ? "none" : w.garis }}>{c}</div>
            );
          })}
        </div>
      ) : null}
      {el.catatan && el.chip?.length ? (
        <div style={{ textAlign: "center", marginTop: px(14), ...font("isi"), fontSize: u.kecil,
                      color: rgba(w.aksen, naik(j.chip[j.chip.length - 1], 0.3)) }}>✓ {el.catatan}</div>
      ) : null}
    </Wadah>
  );
};

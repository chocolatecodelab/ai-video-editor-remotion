import React from "react";
import { interpolate } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { Jendela, pakaiDasar } from "../lib/dasar";
import { HiasKata, progresHias } from "../lib/motif";

// E18 prompt-ui: kotak prompt ala aplikasi AI — label seri, chip lampiran, teks diketik (kursor), tombol kirim,
// lalu (opsional) menyusut jadi pil berisi kata kunci. Jadwal ketik dihitung Python (perangkat.py) agar SFX klik
// per huruf jatuh tepat di frame huruf muncul. Bingkai & hiasan kata kunci mengikuti motif gaya.
export type PromptUIElemen = {
  label?: string;
  teks: string; // *kata* = aksen
  lampiran?: string;
  kata_ciut?: string;
  opasitas?: number; // menimpa warna.panel-opasitas (kontras teks di atas latar terang)
  jadwal: { ketik: number[]; lampiran: number | null; kirim: number; ciut: number | null; durasi_ciut: number };
};
export type PromptUIProps = PropsDasar<PromptUIElemen>;

type Seg = { t: string; aksen: boolean };
const bagi = (teks: string): Seg[] => teks.split("*").map((t, i) => ({ t, aksen: i % 2 === 1 })).filter((s) => s.t);

export const PromptUI: React.FC<PromptUIProps> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props, "atas");
  const j = el.jadwal;
  const tegas = kurva(t, "tegas");
  const ciut = j.ciut === null ? 0 : interpolate(dtk, [j.ciut, j.ciut + j.durasi_ciut], [0, 1], {
    easing: tegas, extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const hias = progresHias(dtk, j.kirim);

  const n = j.ketik.filter((x) => x <= dtk).length;
  const segs = bagi(el.teks);
  let sisa = n;
  const tampil = segs.map((s) => {
    const k = Math.max(0, Math.min(s.t.length, sisa));
    sisa -= k;
    return { ...s, t: s.t.slice(0, k) };
  });
  const mengetik = n > 0 && n < j.ketik.length && dtk - j.ketik[n - 1] < 0.25;
  const kursor = mengetik || Math.floor(dtk * 2) % 2 === 0 ? 1 : 0;
  const lamp = j.lampiran === null ? 0 : naik(j.lampiran, 0.25);
  const kirim = interpolate(dtk, [j.kirim, j.kirim + 0.12, j.kirim + 0.3], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tombolAktif = dtk >= j.kirim ? 1 : interpolate(n, [0, j.ketik.length], [0.35, 0.8]);
  const kataCiut = el.kata_ciut ?? (segs.find((s) => s.aksen)?.t ?? segs[0]?.t ?? "");
  const tajam = motif.bingkai === "hud" || motif.bingkai === "brutal" || motif.bingkai === "editorial";
  const pil = tajam ? px(4) : px(999);

  return (
    <Wadah wadah={wadah}>
      <div style={{ position: "relative" }}>
        <div style={{ opacity: 1 - ciut, transform: `scale(${skalaPersepsi(ciut, 1, 0.35)})`, transformOrigin: "50% 0%" }}>
          {el.label ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: px(t.spasi["jarak-item"]) * 0.6 }}>
              <div style={{ display: "inline-block" }}>
                <Jendela t={t} px={px} w={w} u={u} polos kecil seed="label" radius={pil} padding={0}>
                  <div style={{ padding: `${px(4)}px ${px(18)}px`, ...font("isi"), fontSize: u.kecil, color: w.sekunder,
                                whiteSpace: "nowrap" }}>{el.label}</div>
                </Jendela>
              </div>
            </div>
          ) : null}
          <Jendela t={t} px={px} w={w} u={u} polos seed="prompt" padding={px(t.spasi["padding-kartu"]) * 0.75}>
            {el.lampiran ? (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: px(10) }}>
                <div style={{ display: "flex", alignItems: "center", gap: px(10), padding: `${px(6)}px ${px(16)}px`,
                              borderRadius: pil, background: rgba(w.utama, 0.1), border: `${px(1.5)}px solid ${rgba(w.utama, 0.18)}`,
                              opacity: lamp, transform: `scale(${skalaPersepsi(lamp, 0.8)})`, transformOrigin: "100% 50%" }}>
                  <svg viewBox="0 0 24 24" width={u.kecil * 0.8} height={u.kecil * 0.8}>
                    <path d="M7 3h7l5 5v13H7z M14 3v5h5" fill="none" stroke={w.sekunder} strokeWidth={1.8} strokeLinejoin="round" />
                  </svg>
                  <span style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder }}>{el.lampiran}</span>
                </div>
              </div>
            ) : null}
            <div style={{ ...font("isi"), fontSize: u.isi, color: w.utama, lineHeight: 1.25, minHeight: u.isi * 1.25 }}>
              {tampil.map((s, i) => (s.aksen ? (
                <HiasKata key={i} jenis={motif.aksen} p={hias} warnaTeks={w.aksen} seed={`p${i}`}>{s.t}</HiasKata>
              ) : (
                <span key={i}>{s.t}</span>
              )))}
              <span style={{ display: "inline-block", width: px(4), height: u.isi * 1.05, marginLeft: px(4),
                             verticalAlign: "text-bottom", background: w.aksen, opacity: dtk < j.kirim ? kursor : 0 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: px(18) }}>
              <div style={{ display: "flex", gap: px(8), alignItems: "center" }}>
                <svg viewBox="0 0 24 24" width={u.kecil * 0.9} height={u.kecil * 0.9}>
                  <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke={w.aksen} strokeWidth={2.2} strokeLinecap="round" />
                </svg>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ width: px(7), height: px(7), borderRadius: tajam ? 0 : px(7), background: w.sekunder,
                                        opacity: 0.35 + 0.5 * (mengetik ? Math.abs(Math.sin(dtk * 6 + k)) : 0.3) }} />
                ))}
              </div>
              <div style={{ width: u.isi * 1.15, height: u.isi * 1.15, borderRadius: tajam ? px(4) : u.isi, display: "flex",
                            alignItems: "center", justifyContent: "center", background: rgba(w.aksen, tombolAktif),
                            transform: `scale(${skalaPersepsi(kirim, 1, 0.88)})` }}>
                <svg viewBox="0 0 24 24" width={u.isi * 0.6} height={u.isi * 0.6}>
                  <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke={w.latar} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Jendela>
        </div>
        {j.ciut !== null ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center",
                        opacity: interpolate(ciut, [0.4, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                        transform: `scale(${skalaPersepsi(ciut, 0.7)})`, transformOrigin: "50% 0%" }}>
            <div style={{ display: "inline-block" }}>
              <Jendela t={t} px={px} w={w} u={u} polos kecil seed="ciut" radius={pil} padding={0}>
                <div style={{ padding: `${px(10)}px ${px(28)}px`, ...font("subjudul"), fontSize: u.isi, color: w.aksen,
                              whiteSpace: "nowrap" }}>{kataCiut}</div>
              </Jendela>
            </div>
          </div>
        ) : null}
      </div>
    </Wadah>
  );
};

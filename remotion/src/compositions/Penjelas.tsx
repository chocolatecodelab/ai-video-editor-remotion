import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { PropsDasar, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, Jendela, pakaiDasar } from "../lib/dasar";
import { Teks } from "../lib/Teks";

// Grafis penjelas untuk talking head (referensi "Motion graphic penjelas"), semuanya ber-bingkai & ber-font gaya:
//   E32 LowerThird     — nama + peran/topik, pita aksen menyapu lalu teks naik dari masker; di atas pita caption
//   E33 Langkah        — 2–4 langkah bernomor di pita atas, garis penghubung terisi, langkah aktif menyala
//   E34 SebelumSesudah — dua kondisi; garis wipe menyapu dari "sebelum" ke "sesudah"
//   E35 Callout        — lingkaran berdenyut di titik (x, y) + garis penunjuk ke label
//   E36 Linimasa       — titik waktu (tahun + label) muncul bergantian di garis yang tergambar

// ------------------------------------------------------------------ E32 lower third
export type LowerThirdElemen = ElemenUI & { nama: string; peran?: string; jadwal: { pita: number; nama: number; peran: number } };
export const LowerThird: React.FC<PropsDasar<LowerThirdElemen>> = (props) => {
  const { px, t, el, w, u, font, naik, keluar, SediaMotif, motif, wadah } = pakaiDasar(props);
  const [x0, , x1, y1] = props.zona;
  const j = el.jadwal;
  const pita = naik(j.pita, 0.45, "tegas");
  const nm = naik(j.nama, 0.4);
  const pr = naik(j.peran, 0.4);
  const tajam = ["hud", "brutal", "editorial", "minimal", "kinetik"].includes(motif.bingkai);
  const lebar = (x1 - x0) * 0.78;
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ opacity: 1 - keluar }}>
        <div style={{ position: "absolute", left: x0, top: y1 - px(560), width: lebar }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: px(14) }}>
            <div style={{ width: px(10), borderRadius: tajam ? 0 : px(10), background: w.aksen, transform: `scaleY(${pita})`, transformOrigin: "50% 100%" }} />
            <div style={{ flex: 1, clipPath: `inset(0 ${(1 - pita) * 100}% 0 0)` }}>
              <Jendela t={t} px={px} w={w} u={u} polos seed={el.nama} padding={px(22)} radius={tajam ? px(4) : undefined}>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ ...font("judul"), fontSize: u.sub * 1.05, lineHeight: 1.05, color: w.utama, transform: `translateY(${(1 - nm) * 110}%)` }}>
                    <Teks teks={el.nama} aksen={w.aksen} hias={false} />
                  </div>
                </div>
                {el.peran ? (
                  <div style={{ overflow: "hidden", marginTop: px(8) }}>
                    <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, transform: `translateY(${(1 - pr) * 110}%)`,
                                  letterSpacing: px(0.5) }}>{el.peran}</div>
                  </div>
                ) : null}
              </Jendela>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E33 langkah berurutan
export type LangkahElemen = ElemenUI & { item: string[]; jadwal: { langkah: number[] } };
export const Langkah: React.FC<PropsDasar<LangkahElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props, "atas");
  const j = el.jadwal;
  const n = el.item.length;
  const d = u.isi * 1.5;
  const tajam = ["hud", "brutal", "editorial", "kinetik"].includes(motif.bingkai);
  const aktif = Math.max(0, j.langkah.filter((x) => x <= dtk).length - 1);
  // garis progres tiba di titik ke-i tepat pada langkah[i] (detik yang sama dengan titik menyala & bunyi langkah-titik
  // dari perangkat.py), dengan easing token per segmen — bukan satu garis linear yang lepas dari jadwal titik
  const kemajuan = n < 2 ? naik(j.langkah[0] ?? 0, 0.35, "tegas")
    : interpolate(dtk, j.langkah.slice(0, n), el.item.map((_, i) => i / (n - 1)), {
        easing: Array.from({ length: n - 1 }, () => kurva(t, "standar")), extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} polos seed="langkah" padding={px(26)}>
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
          <div style={{ position: "absolute", left: `${50 / n}%`, right: `${50 / n}%`, top: d / 2 - px(3), height: px(6), background: rgba(w.utama, 0.15) }} />
          <div style={{ position: "absolute", left: `${50 / n}%`, top: d / 2 - px(3), height: px(6), background: w.aksen,
                        width: `${(100 - 100 / n) * kemajuan}%` }} />
          {el.item.map((it, i) => {
            const p = naik(j.langkah[i], 0.35, "tegas");
            const on = i <= aktif && p > 0.5;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: px(12), position: "relative" }}>
                <div style={{ width: d, height: d, borderRadius: tajam ? px(6) : d, display: "flex", alignItems: "center", justifyContent: "center",
                              background: on ? w.aksen : w.panel, border: `${px(4)}px solid ${on ? w.aksen : rgba(w.utama, 0.3)}`,
                              transform: `scale(${skalaPersepsi(p, 0.6) + (i === aktif ? 0.08 * Math.sin(Math.min(1, Math.max(0, dtk - j.langkah[i]) / 0.3) * Math.PI) : 0)})`,
                              boxShadow: on && motif.bingkai === "kaca" ? `0 0 ${px(18)}px ${rgba(w.aksen, 0.7)}` : undefined,
                              ...font("judul"), fontSize: u.isi * 0.9, color: on ? w.latar : w.sekunder }}>{i + 1}</div>
                <div style={{ ...font("subjudul"), fontSize: u.kecil, color: on ? w.utama : w.sekunder, opacity: 0.4 + 0.6 * p, textAlign: "center",
                              lineHeight: 1.1 }}>
                  <Teks teks={it} aksen={w.aksen} hias={false} />
                </div>
              </div>
            );
          })}
        </div>
      </Jendela>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E34 sebelum & sesudah
export type SebelumSesudahElemen = ElemenUI & { sebelum: string; sesudah: string; label?: [string, string]; jadwal: { wipe: number; durasi_wipe: number } };
export const SebelumSesudah: React.FC<PropsDasar<SebelumSesudahElemen>> = (props) => {
  const { px, t, el, w, u, font, naik, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const wp = naik(j.wipe, j.durasi_wipe, "standar");
  const [lb, ls] = el.label ?? ["Sebelum", "Sesudah"];
  const sisi = (label: string, teks: string, warnaLabel: string, coret: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", gap: px(12) }}>
      <div style={{ alignSelf: "flex-start", padding: `${px(4)}px ${px(16)}px`, borderRadius: px(999), background: rgba(warnaLabel, 0.18),
                    ...font("isi"), fontSize: u.kecil, color: warnaLabel, letterSpacing: px(1), textTransform: "uppercase" }}>{label}</div>
      <div style={{ ...font("subjudul"), fontSize: u.isi, lineHeight: 1.15, color: w.utama, textDecoration: coret ? "line-through" : undefined,
                    textDecorationColor: rgba(w.peringatan, 0.7) }}>
        <Teks teks={teks} aksen={w.aksen} hias={!coret} />
      </div>
    </div>
  );
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} polos seed={el.sesudah} padding={px(30)}>
        <div style={{ position: "relative" }}>
          <div style={{ opacity: 1 - 0.55 * wp }}>{sisi(lb, el.sebelum, w.peringatan, wp > 0.5)}</div>
          <div style={{ height: px(2), background: rgba(w.utama, 0.15), margin: `${px(22)}px 0` }} />
          <div style={{ clipPath: `inset(0 ${(1 - wp) * 100}% 0 0)` }}>{sisi(ls, el.sesudah, w.aksen, false)}</div>
          <div style={{ position: "absolute", top: -px(10), bottom: -px(10), left: `${wp * 100}%`, width: px(5), background: w.aksen,
                        opacity: wp > 0 && wp < 1 ? 1 : 0, boxShadow: `0 0 ${px(16)}px ${rgba(w.aksen, 0.8)}` }} />
        </div>
      </Jendela>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E35 callout lingkaran
export type CalloutElemen = ElemenUI & { x: number; y: number; teks: string; jadwal: { lingkar: number; label: number } };
export const Callout: React.FC<PropsDasar<CalloutElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, keluar, SediaMotif, motif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const [x0, y0, x1, y1] = zona;
  const j = el.jadwal;
  const cx = el.x * W;
  const cy = el.y * H;
  const r = px(70);
  const pl = naik(j.lingkar, 0.4, "tegas");
  const pt = naik(j.label, 0.35);
  // dua denyut meluruh untuk menarik perhatian, lalu diam (gerak diam terus-menerus = kesan generik)
  const tDenyut = dtk - j.lingkar;
  const denyut = tDenyut > 0 && tDenyut < (2 * 2 * Math.PI) / 5
    ? 1 + 0.12 * Math.max(0, Math.sin(tDenyut * 5)) * (1 - tDenyut / ((2 * 2 * Math.PI) / 5)) : 1;
  const kanan = cx < (x0 + x1) / 2;
  const lx = kanan ? Math.min(x1 - px(380), cx + r + px(70)) : Math.max(x0, cx - r - px(450));
  const ly = Math.min(y1 - px(120), Math.max(y0, cy - px(160)));
  const tajam = motif.bingkai === "hud" || motif.bingkai === "brutal";
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ opacity: 1 - keluar }}>
        <div style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: tajam ? px(8) : "50%",
                      border: `${px(6)}px solid ${w.aksen}`, transform: `scale(${skalaPersepsi(pl, 0.4) * denyut})`, opacity: pl,
                      boxShadow: `0 0 0 ${px(10) * denyut}px ${rgba(w.aksen, 0.18)}` }} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={`M${cx + (kanan ? r : -r) * 0.7} ${cy - r * 0.7} L${kanan ? lx : lx + px(380)} ${ly + px(40)}`} stroke={w.aksen}
                strokeWidth={px(4)} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pt} />
        </svg>
        <div style={{ position: "absolute", left: lx, top: ly, width: px(380), opacity: pt, transform: `translateY(${(1 - pt) * px(20)}px)` }}>
          <Jendela t={t} px={px} w={w} u={u} polos kecil seed={el.teks} padding={px(16)}>
            <div style={{ ...font("subjudul"), fontSize: u.kecil * 1.05, color: w.utama, lineHeight: 1.15 }}>
              <Teks teks={el.teks} aksen={w.aksen} />
            </div>
          </Jendela>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E36 linimasa
export type TitikWaktu = { tahun: string; label: string };
export type LinimasaElemen = ElemenUI & { titik: TitikWaktu[]; jadwal: { garis: number; titik: number[] } };
export const Linimasa: React.FC<PropsDasar<LinimasaElemen>> = (props) => {
  const { px, t, el, w, u, font, naik, motif, Wadah, wadah } = pakaiDasar(props);
  const j = el.jadwal;
  const n = el.titik.length;
  const pg = naik(j.garis, j.titik[n - 1] - j.garis + 0.3, "standar");
  const tajam = ["hud", "brutal", "editorial", "kinetik"].includes(motif.bingkai);
  return (
    <Wadah wadah={wadah}>
      <Jendela t={t} px={px} w={w} u={u} polos seed="linimasa" padding={px(28)}>
        <div style={{ position: "relative", paddingLeft: px(46) }}>
          <div style={{ position: "absolute", left: px(14), top: px(10), bottom: px(10), width: px(5), background: rgba(w.utama, 0.15) }} />
          <div style={{ position: "absolute", left: px(14), top: px(10), height: `calc((100% - ${px(20)}px) * ${pg})`, width: px(5), background: w.aksen }} />
          {el.titik.map((tt, i) => {
            const p = naik(j.titik[i], 0.35, "tegas");
            const akhir = i === n - 1;
            return (
              <div key={i} style={{ position: "relative", marginBottom: i < n - 1 ? px(26) : 0, opacity: 0.25 + 0.75 * p,
                                    transform: `translateX(${(1 - p) * px(30)}px)` }}>
                <div style={{ position: "absolute", left: -px(46), top: px(6), width: px(34), height: px(34), borderRadius: tajam ? px(4) : px(34),
                              background: p > 0.5 ? w.aksen : w.panel, border: `${px(4)}px solid ${w.aksen}`, transform: `scale(${skalaPersepsi(p, 0.5)})` }} />
                <div style={{ ...font("judul"), fontSize: u.isi * (akhir ? 1.15 : 0.95), color: akhir ? w.aksen : w.utama, lineHeight: 1 }}>{tt.tahun}</div>
                <div style={{ ...font("isi"), fontSize: u.kecil, color: w.sekunder, marginTop: px(4) }}>{tt.label}</div>
              </div>
            );
          })}
        </div>
      </Jendela>
    </Wadah>
  );
};

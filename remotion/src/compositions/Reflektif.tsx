import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { PropsDasar, Tokens, kurva, rgba, skalaPersepsi } from "../lib/kontrak";
import { ElemenUI, pakaiDasar } from "../lib/dasar";
import { LatarGaya } from "../lib/latar";
import { DefKabur, useKaburGerak } from "../lib/kabur";
import { HiasKata, LapisTekstur, Motif, progresHias } from "../lib/motif";
import { Teks } from "../lib/Teks";

// Grafis untuk video reflektif/motivasi (permintaan pengguna 2026-10-27, proyek "Life Isn't a Race"):
// E51 kinetik-kata (tipografi kinetik per kata, sinkron ucapan), lalu tiga adegan metafora cutaway:
// E52 lintasan (jalur bercabang ke tujuan berbeda), E53 dua-linimasa (milik orang lain vs milikmu), E54 bab-baru
// (halaman buku berbalik ke bab baru). Warna, font & hiasan kata dari token gaya (motif) — tidak ada warna lepas
// selain hitam/putih untuk cahaya & bayangan.

const jepit = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Titik pada kurva Bézier kubik. */
const bez = (p: [number, number][], t: number): [number, number] => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
};
const panjangBez = (p: [number, number][]) => {
  let L = 0;
  let [x, y] = p[0];
  for (let i = 1; i <= 48; i++) {
    const [nx, ny] = bez(p, i / 48);
    L += Math.hypot(nx - x, ny - y);
    [x, y] = [nx, ny];
  }
  return L;
};

// ------------------------------------------------------------------ E51 kinetik-kata (overlay)
// Frasa ucapan tampil kata demi kata TEPAT saat diucapkan (jadwal dari words.json, perangkat.py): tiap kata naik dari
// balik masker, kata *aksen* bergaya miring warna aksen + hiasan motif gaya. Frasa berikutnya menggantikan frasa
// sebelumnya (keluar naik + pudar). Tanpa panel: teks langsung di atas video, bayangan lembut warna latar gaya.
export type KataKinetik = { w: string; aksen: boolean };
export type KinetikKataElemen = ElemenUI & {
  frasa: KataKinetik[][];
  skala_teks?: number;
  jadwal: { kata: number[][]; frasa: [number, number][] };
};
const PEGAS_KATA = { damping: 200, stiffness: 170, mass: 0.7 };
// Frasa yang keluar naik ke balik masker di tepi atas kotak elemen (clip-path hanya sisi atas): tetap di zona aman yang
// ditata pipeline (K00.1) walau elemen menempel di tepi atas zona, tanpa menggeser posisi teks (kontras K01.4 tetap).
const KELUAR_NAIK = 26;
/** Satu kata: naik dari balik masker saat diucapkan, dengan motion blur vertikal selama bergerak cepat. */
const KataMasuk: React.FC<{ k: KataKinetik; tk: number; f: number; fps: number; dtk: number; tinggi: number; motif: Motif;
                            aksen: string; seed: string; px: (v: number) => number }> = ({ k, tk, f, fps, dtk, tinggi, motif, aksen, seed, px }) => {
  const mulai = Math.round(tk * fps);
  const sp = spring({ frame: f - mulai, fps, config: PEGAS_KATA });
  const spLalu = spring({ frame: f - 1 - mulai, fps, config: PEGAS_KATA });
  const kabur = useKaburGerak(0, (sp - spLalu) * 1.05 * tinggi);
  const isi = k.aksen ? (
    <HiasKata jenis={motif.aksen} p={progresHias(dtk, tk + 0.25)} warnaTeks={aksen} seed={seed}>
      <span style={{ fontStyle: "italic" }}>{k.w}</span>
    </HiasKata>
  ) : k.w;
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top",
                   padding: `${px(4)}px ${px(6)}px ${px(14)}px`, margin: "0 0.07em" }}>
      <DefKabur def={kabur.def} />
      <span style={{ display: "inline-block", opacity: dtk < tk ? 0 : 1, filter: kabur.url,
                     translate: `0 ${(1 - sp) * 105}%`, rotate: `${(1 - sp) * 7}deg`, transformOrigin: "0 100%" }}>
        {isi}
      </span>
    </span>
  );
};

export const KinetikKata: React.FC<PropsDasar<KinetikKataElemen>> = (props) => {
  const { dtk, fps, f, px, el, w, u, font, motif, Wadah, wadah } = pakaiDasar(props, "atas", { masukSendiri: true });
  const j = el.jadwal;
  return (
    <Wadah wadah={wadah}>
      <div style={{ position: "relative", width: "100%", clipPath: `inset(0px -${props.W}px -${props.H}px -${props.W}px)` }}>
        {el.frasa.map((kata, fi) => {
          const [a, b] = j.frasa[fi];
          if (dtk < a - 0.05 || dtk > b + 0.02) return null;
          const terakhir = fi === el.frasa.length - 1;
          const pergi = terakhir ? 0 : interpolate(dtk, [b - 0.3, b], [0, 1], jepit);
          const n = kata.reduce((s, k) => s + k.w.length + 1, 0);
          const ukuran = u.judul * (el.skala_teks ?? 1) * (n <= 12 ? 1.3 : n <= 22 ? 1.06 : 0.9);
          const garis = interpolate(dtk, [a, a + 0.5], [0, 1], jepit);
          return (
            <div key={fi} style={{ position: fi === 0 ? "relative" : "absolute", top: 0, left: 0, right: 0,
                                   textAlign: "center", opacity: 1 - pergi, translate: `0 ${-pergi * px(KELUAR_NAIK)}px` }}>
              {/* garis editorial pendek di atas frasa (aksen gaya), tergambar dari tengah */}
              <div style={{ width: px(120), height: px(5), margin: `0 auto ${px(18)}px`, background: w.aksen, scale: `${garis} 1` }} />
              <div style={{ ...font("judul"), fontSize: ukuran, lineHeight: 1.14, color: w.utama,
                            textShadow: `0 0 ${px(14)}px ${rgba(w.latar, 0.85)}, 0 ${px(1)}px ${px(3)}px ${rgba(w.latar, 0.9)}` }}>
                {kata.map((k, ki) => (
                  <KataMasuk key={ki} k={k} tk={j.kata[fi][ki]} f={f} fps={fps} dtk={dtk} tinggi={ukuran * 1.14 + px(18)}
                             motif={motif} aksen={w.aksen} seed={`${fi}${ki}`} px={px} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Wadah>
  );
};

// ------------------------------------------------------------------ E52 lintasan (cutaway)
// "Kita tidak berlari ke tujuan yang sama": beberapa jalur lari mulai dari satu garis start, lalu bercabang ke tujuan
// berbeda; tiap pelari bergerak dengan kecepatannya sendiri. Jalur yang ditandai *…* (milikmu) berwarna aksen.
export type LintasanElemen = ElemenUI & {
  judul: string;
  sub?: string;
  tujuan: string[];
  start?: string;
  jadwal: { judul: number; garis: number[]; pelari: number; tujuan: number[] };
};
/** Pelari di jalur: posisi dari kurva Bézier, motion blur searah gerak (sumbu x/y). */
const Pelari: React.FC<{ p: [number, number][]; dtk: number; fps: number; mulai: number; kecepatan: number; kamu: boolean;
                         warna: string; latar: string; px: (v: number) => number }> = ({ p, dtk, fps, mulai, kecepatan, kamu, warna, latar, px }) => {
  const posisi = (x: number) => {
    const pp = Math.max(0, Math.min(1, (x - mulai) / (2.6 / kecepatan)));
    return bez(p, 1 - (1 - pp) ** 2);
  };
  const [rx, ry] = posisi(dtk);
  const [lx, ly] = posisi(dtk - 1 / fps);
  const kabur = useKaburGerak(rx - lx, ry - ly);
  return (
    <g filter={kabur.url}>
      {kabur.def}
      <circle cx={rx} cy={ry + px(6)} r={px(16)} fill="#000" opacity={0.12} />
      <circle cx={rx} cy={ry} r={px(kamu ? 17 : 13)} fill={warna} />
      <circle cx={rx} cy={ry} r={px(kamu ? 7 : 5)} fill={latar} />
    </g>
  );
};

export const Lintasan: React.FC<PropsDasar<LintasanElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const j = el.jadwal;
  const n = el.tujuan.length;
  const y0 = H * 0.7;                                   // garis start (di atas pita caption)
  // tujuan di bawah pita judul (label tujuan ±150 px di atas bendera tidak boleh menyentuh judul)
  const ujung = [0.14, 0.38, 0.62, 0.86].slice(0, n).map((x, i) => [W * (n === 3 ? [0.18, 0.5, 0.82][i] : x),
                                                                    H * [0.41, 0.37, 0.44, 0.39][i % 4]] as [number, number]);
  const jalur = ujung.map(([ex, ey], i) => {
    const sx = W * 0.5 + (i - (n - 1) / 2) * px(64);
    return [[sx, y0], [sx, y0 - H * 0.12], [ex, ey + H * 0.16], [ex, ey]] as [number, number][];
  });
  const kecepatan = [1.0, 0.72, 1.25, 0.86];
  const pj = naik(j.judul, 0.6);
  // gerak kamera pelan: adegan sedikit mendekat sepanjang klip
  const dorong = interpolate(dtk, [0, props.durasiFrame / props.fps], [1, 1.06], jepit);
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ scale: String(dorong), transformOrigin: "50% 60%" }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* garis start: tick + label */}
            <line x1={W * 0.5 - px(170)} x2={W * 0.5 + px(170)} y1={y0} y2={y0} stroke={w.utama} strokeWidth={px(4)}
                  opacity={naik(0.05, 0.4)} />
            {jalur.map((p, i) => {
              const L = panjangBez(p);
              const pg = naik(j.garis[i], 1.1);
              const kamu = el.tujuan[i].includes("*");
              const d = `M${p[0][0]},${p[0][1]} C${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]}`;
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke={kamu ? rgba(w.aksen, 0.18) : rgba(w.utama, 0.08)} strokeWidth={px(46)}
                        strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - pg)} />
                  <path d={d} fill="none" stroke={kamu ? w.aksen : rgba(w.utama, 0.55)} strokeWidth={px(kamu ? 7 : 4)}
                        strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - pg)} />
                  {dtk >= j.pelari && (
                    <Pelari p={p} dtk={dtk} fps={props.fps} mulai={j.pelari} kecepatan={kecepatan[i % 4]} kamu={kamu}
                            warna={kamu ? w.aksen : w.utama} latar={w.latar} px={px} />
                  )}
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: y0 + px(18), textAlign: "center", ...font("isi"),
                        fontSize: u.kecil * 0.9, letterSpacing: px(8), color: w.sekunder, opacity: naik(0.05, 0.4) }}>
            {el.start ?? "START"}
          </div>
          {ujung.map(([ex, ey], i) => {
            const pt = naik(j.tujuan[i], 0.45);
            const s = spring({ frame: Math.round((dtk - j.tujuan[i]) * props.fps), fps: props.fps, config: { damping: 12, stiffness: 160 } });
            const kamu = el.tujuan[i].includes("*");
            const lebarLabel = px(260);
            const kiri = Math.max(zona[0], Math.min(zona[2] - lebarLabel, ex - lebarLabel / 2));
            return (
              <React.Fragment key={i}>
                {/* bendera kertas di tujuan */}
                <div style={{ position: "absolute", left: ex - px(4), top: ey - px(78), width: px(6), height: px(80),
                              background: w.utama, opacity: pt, scale: `1 ${s}`, transformOrigin: "50% 100%" }} />
                <div style={{ position: "absolute", left: ex + px(2), top: ey - px(78), width: px(56), height: px(38),
                              background: kamu ? w.aksen : w.aksen2, opacity: pt, scale: `${s} 1`, transformOrigin: "0 50%",
                              clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
                <div style={{ position: "absolute", left: kiri, width: lebarLabel, top: ey - px(150), textAlign: "center",
                              ...font(kamu ? "subjudul" : "isi"), fontSize: kamu ? u.isi * 1.05 : u.kecil, lineHeight: 1.1,
                              color: kamu ? w.aksen : w.sekunder, opacity: pt, translate: `0 ${(1 - pt) * px(16)}px`,
                              fontStyle: kamu ? "italic" : undefined }}>
                  {el.tujuan[i].replace(/\*/g, "")}
                </div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
        {/* judul di zona atas */}
        <div style={{ position: "absolute", left: zona[0], right: W - zona[2], top: zona[1], textAlign: "center",
                      opacity: pj, translate: `0 ${(1 - pj) * px(24)}px` }}>
          {el.sub && (
            <div style={{ ...font("isi"), fontSize: u.kecil, letterSpacing: px(6), textTransform: "uppercase", color: w.sekunder,
                          marginBottom: px(12) }}>{el.sub}</div>
          )}
          <div style={{ ...font("judul"), fontSize: u.judul * 0.95, lineHeight: 1.08, color: w.utama }}>
            <Teks teks={el.judul} aksen={w.aksen} tunda={j.judul + 0.3} />
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E53 dua-linimasa (cutaway)
// "Jangan ikuti linimasa orang lain": dua linimasa vertikal berdampingan. Milik mereka: lurus, tonggak berjarak sama,
// tercentang cepat-cepat. Milikmu: garis aksen berkelok, tonggak di tempatnya sendiri, muncul dengan tempo sendiri.
export type DuaLinimasaElemen = ElemenUI & {
  judul: string;
  sub?: string;
  label_a: string;
  label_b: string;
  titik_a: string[];
  titik_b: string[];
  jadwal: { garis_a: [number, number]; garis_b: [number, number]; a: number[]; b: number[]; akhir: number };
};
export const DuaLinimasa: React.FC<PropsDasar<DuaLinimasaElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H, zona } = props;
  const j = el.jadwal;
  const ya = H * 0.36, yb = H * 0.68;                     // rentang vertikal linimasa
  const xa = W * 0.36, xb = W * 0.64;
  const pa = naik(j.garis_a[0], j.garis_a[1] - j.garis_a[0], "standar");
  const pb = naik(j.garis_b[0], j.garis_b[1] - j.garis_b[0], "lambat" in t.easing ? "lambat" : "standar");
  // garis milikmu berkelok: x = xb + amplitudo·sin
  const kelok = (y: number) => xb + Math.sin(((y - ya) / (yb - ya)) * Math.PI * 2.4) * px(34);
  const titikB = el.titik_b.map((_, i) => ya + (yb - ya) * [0.12, 0.47, 0.62, 0.93, 0.3][i % 5]);
  const titikA = el.titik_a.map((_, i) => ya + (yb - ya) * ((i + 1) / (el.titik_a.length + 0.4)));
  const dB = Array.from({ length: 41 }, (_, i) => {
    const y = ya + ((yb - ya) * i) / 40;
    return `${i ? "L" : "M"}${kelok(y)},${y}`;
  }).join(" ");
  const pj = naik(0.05, 0.6);
  const pakhir = naik(j.akhir, 0.5);
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <div style={{ position: "absolute", left: zona[0], right: W - zona[2], top: zona[1], textAlign: "center",
                      opacity: pj, translate: `0 ${(1 - pj) * px(24)}px` }}>
          <div style={{ ...font("judul"), fontSize: u.judul * 0.95, lineHeight: 1.08, color: w.utama }}>
            <Teks teks={el.judul} aksen={w.aksen} tunda={0.4} />
          </div>
          {el.sub && <div style={{ ...font("isi"), fontSize: u.isi * 0.9, color: w.sekunder, marginTop: px(12) }}>{el.sub}</div>}
        </div>
        {/* kepala kolom */}
        {[[xa, el.label_a, w.sekunder], [xb, el.label_b, w.aksen]].map(([x, label, c], i) => (
          <div key={i} style={{ position: "absolute", left: Number(x) - px(160), width: px(320), top: ya - px(96), textAlign: "center",
                                ...font("isi"), fontWeight: 700, fontSize: u.kecil, letterSpacing: px(6), textTransform: "uppercase",
                                color: String(c), opacity: naik(0.25 + i * 0.2, 0.4) }}>{String(label)}</div>
        ))}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          {/* milik mereka: lurus, abu */}
          <line x1={xa} x2={xa} y1={ya} y2={ya + (yb - ya) * pa} stroke={rgba(w.utama, 0.45)} strokeWidth={px(5)} strokeLinecap="round" />
          {/* milikmu: berkelok, aksen, tergambar dengan masker dash */}
          <path d={dB} fill="none" stroke={w.aksen} strokeWidth={px(8)} strokeLinecap="round" strokeLinejoin="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pb} />
        </svg>
        {el.titik_a.map((lb, i) => {
          const p = naik(j.a[i], 0.25, "tegas" in t.easing ? "tegas" : "standar");
          return (
            <React.Fragment key={`a${i}`}>
              <div style={{ position: "absolute", left: xa - px(13), top: titikA[i] - px(13), width: px(26), height: px(26),
                            borderRadius: "50%", background: w.latar, border: `${px(5)}px solid ${rgba(w.utama, 0.6)}`,
                            scale: String(p), boxSizing: "border-box" }} />
              <div style={{ position: "absolute", right: W - xa + px(32), top: titikA[i] - px(28), textAlign: "right",
                            ...font("isi"), fontSize: u.kecil, color: w.sekunder, opacity: p, maxWidth: xa - zona[0] - px(32) }}>
                {lb}
              </div>
            </React.Fragment>
          );
        })}
        {el.titik_b.map((lb, i) => {
          const p = naik(j.b[i], 0.45);
          const x = kelok(titikB[i]);
          return (
            <React.Fragment key={`b${i}`}>
              <div style={{ position: "absolute", left: x - px(18), top: titikB[i] - px(18), width: px(36), height: px(36),
                            borderRadius: "50%", background: w.aksen, scale: String(skalaPersepsi(p, 0.2)), opacity: p,
                            boxShadow: `0 0 0 ${px(7)}px ${rgba(w.aksen, 0.18)}` }} />
              <div style={{ position: "absolute", left: x + px(40), top: titikB[i] - px(34), ...font("subjudul"), fontStyle: "italic",
                            fontSize: u.isi, color: w.utama, opacity: p, translate: `${(1 - p) * px(18)}px 0`,
                            maxWidth: zona[2] - x - px(40) }}>
                {lb}
              </div>
            </React.Fragment>
          );
        })}
        {/* penutup: cap kertas "on your time" di bawah linimasa milikmu */}
        <div style={{ position: "absolute", left: 0, right: 0, top: yb + px(40), textAlign: "center", opacity: pakhir,
                      scale: String(skalaPersepsi(pakhir, 1.3)) }}>
          <span style={{ position: "relative", display: "inline-block", padding: `${px(14)}px ${px(30)}px`, ...font("subjudul"),
                         fontSize: u.isi * 1.05, color: w.aksen, border: `${px(4)}px solid ${w.aksen}`, rotate: "-3deg",
                         background: rgba(w.latar, 0.85) }}>
            <LapisTekstur jenis="kertas" panelHex={w.latar} />
            <Teks teks={(el as { cap?: string }).cap ?? "on *your* time"} aksen={w.utama} hias={false} />
          </span>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

// ------------------------------------------------------------------ E54 bab-baru (cutaway)
// "Bab yang berbeda dalam hidupmu": buku terbuka, beberapa halaman berbalik (3D, bayangan lipatan), lalu kamera
// mendekat ke halaman kanan yang memuat kepala bab baru. Cocok sebagai penutup.
export type BabBaruElemen = ElemenUI & {
  judul: string;
  sub?: string;
  kepala?: string;
  nomor?: string;
  jadwal: { balik: number[]; judul: number; dorong: number };
};
/** Halaman yang berbalik (rotateY 0 → −180°) dengan blur searah balikan sebesar kecepatan tepi halaman. */
const HalamanBalik: React.FC<{ tb: number; i: number; n: number; dtk: number; fps: number; t: Tokens; hal: number;
                               isi: (seed: number) => React.ReactNode; kertas: string; px: (v: number) => number }> =
  ({ tb, i, n, dtk, fps, t, hal, isi, kertas, px }) => {
    const putar = (x: number) => interpolate(x, [tb, tb + 0.55], [0, 1], { easing: kurva(t, "standar"), ...jepit });
    const p = putar(dtk);
    const sudut = -180 * p;
    const rad = (sudut * Math.PI) / 180;
    // tepi bebas bergerak di bidang halaman sejauh hal·|sin|·Δsudut per frame → blur arah x lokal
    const kabur = useKaburGerak(hal * Math.abs(Math.sin(rad)) * Math.PI * (p - putar(dtk - 1 / fps)), 0);
    if (p >= 1) return null;
    const terang = Math.abs(Math.cos(rad));
    const muka = (belakang: boolean) => (
      <div style={{ position: "absolute", inset: 0, background: kertas, backfaceVisibility: "hidden", overflow: "hidden",
                    transform: belakang ? "rotateY(180deg)" : undefined,
                    borderRadius: belakang ? `${px(10)}px 0 0 ${px(10)}px` : `0 ${px(10)}px ${px(10)}px 0`,
                    filter: [`brightness(${belakang ? 0.8 + 0.2 * terang : 0.82 + 0.18 * terang})`, kabur.url].filter(Boolean).join(" ") }}>
        <LapisTekstur jenis="kertas" panelHex={kertas} />
        {isi(i * 3 + (belakang ? 2 : 1))}
      </div>
    );
    return (
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 50%", transformStyle: "preserve-3d",
                    transform: `rotateY(${sudut}deg)`, zIndex: n - i }}>
        <DefKabur def={kabur.def} />
        {muka(false)}
        {muka(true)}
      </div>
    );
  };

export const BabBaru: React.FC<PropsDasar<BabBaruElemen>> = (props) => {
  const { dtk, px, t, el, w, u, font, naik, SediaMotif, wadah } = pakaiDasar(props);
  const { W, H } = props;
  const j = el.jadwal;
  const bw = W * 0.88, bh = H * 0.42;                    // buku terbuka
  const hal = bw / 2;
  const kertas = w.latar;
  const pDorong = naik(j.dorong, 1.6, "standar");
  const skala = interpolate(pDorong, [0, 1], [1, 1.42], jepit);
  const geserX = interpolate(pDorong, [0, 1], [0, -hal * 0.5], jepit);
  const pJudul = naik(j.judul, 0.6);
  const masuk = naik(0, 0.5);
  const garisTeks = (seed: number, n: number, op: number) => (
    <div style={{ position: "absolute", inset: `${px(70)}px ${px(56)}px`, display: "flex", flexDirection: "column", gap: px(22), opacity: op }}>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ height: px(10), borderRadius: px(5), background: rgba(w.utama, 0.16),
                              width: `${[92, 100, 86, 97, 74, 100, 90, 60][(i + seed) % 8]}%` }} />
      ))}
    </div>
  );
  return (
    <SediaMotif wadah={wadah}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <LatarGaya t={t} dtk={dtk} W={W} H={H} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, transparent 40%, ${rgba("#000000", 0.18)} 100%)` }} />
        <div style={{ position: "absolute", left: (W - bw) / 2, top: H * 0.27, width: bw, height: bh, perspective: px(2600),
                      scale: String(skala * (0.94 + 0.06 * masuk)), translate: `${geserX}px ${(1 - masuk) * px(40)}px`,
                      opacity: masuk, transformOrigin: "75% 50%" }}>
          {/* bayangan buku */}
          <div style={{ position: "absolute", inset: `${px(18)}px -${px(10)}px -${px(26)}px`, borderRadius: px(10),
                        background: rgba("#000000", 0.22), filter: `blur(${px(22)}px)` }} />
          {/* halaman kiri (bab lama) */}
          <div style={{ position: "absolute", left: 0, top: 0, width: hal, height: bh, background: kertas, borderRadius: `${px(10)}px 0 0 ${px(10)}px`,
                        boxShadow: `inset -${px(40)}px 0 ${px(40)}px -${px(20)}px ${rgba("#000000", 0.22)}`, overflow: "hidden" }}>
            <LapisTekstur jenis="kertas" panelHex={kertas} />
            {garisTeks(0, 8, 1)}
          </div>
          {/* halaman kanan (bab baru) */}
          <div style={{ position: "absolute", left: hal, top: 0, width: hal, height: bh, background: kertas, borderRadius: `0 ${px(10)}px ${px(10)}px 0`,
                        boxShadow: `inset ${px(40)}px 0 ${px(40)}px -${px(20)}px ${rgba("#000000", 0.18)}`, overflow: "hidden" }}>
            <LapisTekstur jenis="kertas" panelHex={kertas} />
            <div style={{ position: "absolute", inset: `${px(54)}px ${px(44)}px`, textAlign: "center", display: "flex", flexDirection: "column",
                          justifyContent: "center", opacity: pJudul, translate: `0 ${(1 - pJudul) * px(20)}px` }}>
              <div style={{ ...font("isi"), fontSize: u.kecil * 0.85, letterSpacing: px(7), textTransform: "uppercase", color: w.sekunder }}>
                {el.kepala ?? "Chapter"}
              </div>
              {el.nomor && (
                <div style={{ ...font("judul"), fontSize: u.judul * 1.1, lineHeight: 1, color: w.aksen, margin: `${px(6)}px 0` }}>{el.nomor}</div>
              )}
              <div style={{ width: px(70), height: px(4), background: w.aksen, margin: `${px(10)}px auto ${px(16)}px`,
                            scale: `${naik(j.judul + 0.2, 0.5)} 1` }} />
              <div style={{ ...font("subjudul"), fontSize: u.isi * 1.02, lineHeight: 1.12, color: w.utama }}>
                <Teks teks={el.judul} aksen={w.aksen} tunda={j.judul + 0.3} />
              </div>
              {el.sub && <div style={{ ...font("isi"), fontSize: u.kecil * 0.9, color: w.sekunder, marginTop: px(12) }}>{el.sub}</div>}
            </div>
          </div>
          {/* lipatan tengah */}
          <div style={{ position: "absolute", left: hal - px(3), top: 0, width: px(6), height: bh, background: rgba("#000000", 0.18) }} />
          {/* halaman yang berbalik: dari kanan ke kiri, bersumbu di punggung buku */}
          <div style={{ position: "absolute", left: hal, top: 0, width: hal, height: bh, transformStyle: "preserve-3d" }}>
            {j.balik.map((tb, i) => (
              <HalamanBalik key={i} tb={tb} i={i} n={j.balik.length} dtk={dtk} fps={props.fps} t={t} hal={hal} kertas={kertas}
                            isi={(seed) => garisTeks(seed, 8, 1)} px={px} />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </SediaMotif>
  );
};

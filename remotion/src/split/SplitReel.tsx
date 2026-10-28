// SplitReel — layout split talking-head 9:16 (modul pakai-ulang, dari pola video OTCA):
// separuh atas = panggung ilustrasi dari PUSTAKA adegan (merepresentasikan ucapan, bukan teks),
// separuh bawah = rekaman talent (zoom potong per kalimat + push-in pelan), caption karaoke di garis sambung.
// Semua waktu dari props (di-resolve pipeline/scripts/split.py dari anchor kata); warna/font/easing dari token gaya.
// Audio TIDAK di sini: suara, musik ber-ducking, dan SFX dicampur & di-master oleh split.py (K06).

import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { Tokens, rgba } from "../lib/kontrak";
import { pakaiFontToken } from "../lib/font";
import { Adegan, Konteks, Panggung, denyut, mix, prog } from "./alat";
import { PUSTAKA } from "./Adegan";
import { Warna, ambilWarna } from "./Ikon";

export type Kata = { w: string; s: number; e: number };

export type SplitReelProps = {
  W: number;
  H: number;
  fps: number;
  durasiFrame: number;
  tokens: Tokens;
  zona: [number, number, number, number];
  tinggi_panggung: number;
  /** Tinggi pita gradasi (px) tempat panggung & rekaman saling memudar — tanpa garis potong di tengah frame. */
  gradasi: number;
  /** K10 menyatu: grain film di seluruh frame (token `grain`) + sapuan cahaya aksen melintasi rekaman di tiap potongan. */
  menyatu?: { grain?: boolean; sapuan?: boolean };
  footage: { src: string; geser_y: number; titik_zoom_y: number };
  zoom: [number, number][];
  adegan: Adegan[];
  /** Grid ketukan musik (split.py sinkron_ketukan): `titik` = detik tiap ketukan di video → denyut halus grafis. */
  ketukan?: { bpm: number; titik?: number[]; denyut?: number } | null;
  /** Hook visual detik pertama (roadmap #7): punch-in panggung & talent, gelombang cincin, kilat cahaya. */
  hook?: { aktif?: boolean; kuat?: number; durasi?: number };
  /** Logo klien permanen (OTCA): besar di tengah selama hook, meluncur ke slot atas, kembali besar di adegan `kartu` (modul otca-kartu). */
  logo?: { src: string; rasio: number; lebar_atas: number; lebar_besar: number; y_atas: number; y_besar: number; hook_s: number };
  kata: Kata[];
  caption: { y: number; kata_maks: number; karakter_maks: number; jeda_pecah: number };
};

/** Halaman caption: pecah per jeda / jumlah kata / panjang karakter (token caption). */
const halaman = (kata: Kata[], c: SplitReelProps["caption"]) => {
  const hasil: Kata[][] = [];
  let kini: Kata[] = [];
  for (const k of kata) {
    const akhir = kini[kini.length - 1];
    const panjang = kini.reduce((n, x) => n + x.w.length + 1, 0) + k.w.length;
    if (akhir && (k.s - akhir.e > c.jeda_pecah || kini.length >= c.kata_maks || panjang > c.karakter_maks)) {
      hasil.push(kini);
      kini = [];
    }
    kini.push(k);
  }
  if (kini.length) hasil.push(kini);
  return hasil;
};

const Footage: React.FC<{ pr: SplitReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const z = pr.zoom;
  let i = 0;
  while (i < z.length - 2 && z[i + 1][0] <= t) i++;
  const u = Math.min(1, (t - z[i][0]) / Math.max(0.01, z[i + 1][0] - z[i][0]));
  // push-in linear disengaja (gerak kamera konstan di dalam satu potongan, K05.1 pengecualian kamera)
  const s = z[i][1] * (1 + 0.03 * u) * hookZoom(pr, t, 0.06);
  const atas = pr.tinggi_panggung;
  const grade = pr.tokens.grade as { kontras: number; saturasi: number };
  const G = pr.gradasi;
  return (
    <div style={{ position: "absolute", top: atas - G, left: 0, width: pr.W, height: pr.H - atas + G, overflow: "hidden",
      maskImage: `linear-gradient(180deg, transparent 0px, black ${G}px)`, WebkitMaskImage: `linear-gradient(180deg, transparent 0px, black ${G}px)` }}>
      <div style={{ position: "absolute", top: G - pr.footage.geser_y, left: 0, width: pr.W, height: pr.H, scale: String(s),
        transformOrigin: `${pr.W / 2}px ${pr.footage.titik_zoom_y}px` }}>
        <OffthreadVideo src={staticFile(pr.footage.src)} muted
          style={{ width: pr.W, height: pr.H, filter: `contrast(${1 + grade.kontras}) saturate(${grade.saturasi})` }} />
      </div>
      {/* grade palet gaya agar rekaman menyatu dengan panggung (K10): bayangan ke latar, rona dingin aksen tipis */}
      <div style={{ position: "absolute", inset: 0, background: rgba(wr.latar, 0.18), mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: rgba(wr.aksen, 0.07), mixBlendMode: "soft-light" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${rgba(wr.latar, 0.85)} 0px, ${rgba(wr.latar, 0)} ${G * 1.5}px)` }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 180px ${rgba(wr.latar, 0.6)}` }} />
    </div>
  );
};

const LatarPanggung: React.FC<{ pr: SplitReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const W = pr.W;
  const Hs = pr.tinggi_panggung;
  return (
    <svg width={W} height={Hs} style={{ position: "absolute", top: 0, left: 0, ...pudarBawah(pr.gradasi) }}>
      <defs>
        <radialGradient id="sr-latar" cx="0.5" cy="0.55" r="0.75">
          <stop offset="0" stopColor={wr.panel} />
          <stop offset="1" stopColor={wr.latar} />
        </radialGradient>
      </defs>
      <rect width={W} height={Hs} fill="url(#sr-latar)" />
      {Array.from({ length: 30 }, (_, i) => {
        const x = random(`px${i}`) * W;
        const kec = 0.3 + random(`ps${i}`) * 0.7;
        const y = (((random(`py${i}`) * Hs - f * kec) % Hs) + Hs) % Hs;
        return <circle key={i} cx={x} cy={y} r={1.2 + random(`pr${i}`) * 2.4} fill={wr.aksen} opacity={0.1 + 0.25 * random(`po${i}`)} />;
      })}
    </svg>
  );
};

/** Masker CSS: elemen memudar ke transparan di `g` px terbawah (pita gradasi panggung → rekaman). */
const pudarBawah = (g: number): React.CSSProperties => {
  const m = `linear-gradient(180deg, black calc(100% - ${g}px), transparent 100%)`;
  return { maskImage: m, WebkitMaskImage: m, maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" };
};

/** Punch-in hook: skala `1 + kuat·amp` di frame 0 → 1 saat hook selesai (ease-out kuat, tanpa overshoot). Frame 0
 *  sudah penuh (tanpa fade) agar thumbnail/scroll langsung berisi gerak. */
const hookZoom = (pr: SplitReelProps, t: number, amp: number) => {
  const h = pr.hook;
  if (h?.aktif === false) return 1;
  const d = h?.durasi ?? 0.9;
  const u = interpolate(t, [0, d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.exp) });
  return 1 + (h?.kuat ?? 1) * amp * (1 - u);
};

/** Hook detik pertama: gelombang cincin aksen dari pusat adegan pembuka + kilat cahaya yang meluruh. Ditumpuk di atas
 *  panggung (screen) sehingga gerak terkuat video ada sebelum kalimat pertama selesai. */
const HookPembuka: React.FC<{ pr: SplitReelProps; wr: Warna; cx: number; cy: number }> = ({ pr, wr, cx, cy }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const h = pr.hook;
  const d = h?.durasi ?? 0.9;
  if (h?.aktif === false || t > d + 0.1) return null;
  const kuat = h?.kuat ?? 1;
  const u = interpolate(t, [0, d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const kilat = Math.exp(-t / 0.18) * 0.55 * kuat;
  const R = Math.hypot(pr.W, pr.tinggi_panggung);
  return (
    <svg width={pr.W} height={pr.tinggi_panggung} style={{ position: "absolute", top: 0, left: 0, mixBlendMode: "screen",
      pointerEvents: "none", ...pudarBawah(pr.gradasi * 0.6) }}>
      <circle cx={cx} cy={cy} r={mix(60, R * 0.75, u)} fill="none" stroke={wr.aksen} strokeWidth={mix(14, 1, u)}
        opacity={(1 - u) * 0.9 * kuat} filter="url(#sr-glow)" />
      <circle cx={cx} cy={cy} r={mix(20, R * 0.5, Math.min(1, u * 1.25))} fill="none" stroke="#FFFFFF" strokeWidth={mix(4, 0.5, u)}
        opacity={(1 - u) * 0.5 * kuat} />
      <circle cx={cx} cy={cy} r={R * 0.6} fill="url(#sr-cahaya)" opacity={kilat * 2} />
      <rect width={pr.W} height={pr.tinggi_panggung} fill={wr.aksen} opacity={kilat * 0.35} />
    </svg>
  );
};

/** Cincin aksen yang "membawa" match cut iris: menyempit ke titik di akhir adegan lama lalu membuka dari titik yang sama
 *  di adegan baru — satu bentuk, satu gerak, jatuh di ketukan (potongan sudah di-snap split.py). */
const CincinIris: React.FC<{ pr: SplitReelProps; wr: Warna; p: Panggung }> = ({ pr, wr, p }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  for (let i = 1; i < pr.adegan.length; i++) {
    const a = pr.adegan[i];
    if (a.masuk !== "iris" || pr.adegan[i - 1].keluar !== "iris") continue;
    if (t < a.mulai - IRIS_TUTUP || t > a.mulai + IRIS_BUKA) continue;
    const [x, y] = titikIris(a, p);
    const R = jariPenuh(x, y, p);
    const r = irisJari(t, a.mulai, R);
    const u = t < a.mulai ? (a.mulai - t) / IRIS_TUTUP : (t - a.mulai) / IRIS_BUKA;
    return (
      <svg width={p.W} height={p.tinggi} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none",
        ...pudarBawah(pr.gradasi * 0.6) }}>
        <circle cx={x} cy={y} r={Math.max(2, r)} fill="none" stroke={wr.aksen} strokeWidth={mix(10, 3, u)}
          opacity={mix(1, 0.2, u)} filter="url(#sr-glow)" />
        <circle cx={x} cy={y} r={mix(26, 6, u)} fill={wr.aksen} opacity={(1 - u) * 0.9} filter="url(#sr-glow)" />
      </svg>
    );
  }
  return null;
};

/** Logo klien: posisi/lebar mengikuti hook (besar → slot atas) dan adegan kartu akhir (slot atas → besar). */
const LogoKlien: React.FC<{ pr: SplitReelProps; cx: number }> = ({ pr, cx }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const l = pr.logo;
  if (!l) return null;
  const kartu = pr.adegan.find((x) => x.modul === "otca-kartu");
  const ez = (a: number, d: number) =>
    interpolate(t, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const u1 = ez(l.hook_s, 0.6);
  const u2 = kartu ? ez(kartu.mulai, 0.7) : 0;
  const lebar = mix(mix(l.lebar_besar, l.lebar_atas, u1), l.lebar_besar * 0.92, u2);
  const y = mix(mix(l.y_besar, l.y_atas, u1), l.y_besar, u2);
  const kilap = Math.exp(-Math.abs(t - l.hook_s) / 0.25) * 0.5;
  return (
    <Img src={staticFile(l.src)} style={{ position: "absolute", left: cx - lebar / 2, top: y - (lebar * l.rasio) / 2, width: lebar,
      filter: `drop-shadow(0 0 ${14 + 24 * kilap}px rgba(203,157,49,${0.45 + kilap}))` }} />
  );
};

const IRIS_TUTUP = 0.3;
const IRIS_BUKA = 0.5;
const titikIris = (a: Adegan, p: Panggung): [number, number] => a.titik ?? [p.cx, p.tinggi * 0.48];
const jariPenuh = (x: number, y: number, p: Panggung) => Math.hypot(Math.max(x, p.W - x), Math.max(y, p.tinggi - y)) + 20;
/** Jari-jari iris di detik t untuk potongan di `cut`: ease-in menutup (mempercepat ke titik), ease-out membuka. */
const irisJari = (t: number, cut: number, R: number) =>
  t < cut
    ? R * interpolate(t, [cut - IRIS_TUTUP, cut], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) })
    : R * interpolate(t, [cut, cut + IRIS_BUKA], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

const Defs: React.FC<{ wr: Warna }> = ({ wr }) => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <radialGradient id="sr-cahaya">
        <stop offset="0" stopColor={wr.aksen} stopOpacity={0.45} />
        <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="ot-emas" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="1080" y2="900">
        <stop offset="0" stopColor={wr.aksen} />
        <stop offset="0.5" stopColor={wr.aksen2} />
        <stop offset="1" stopColor={wr.bahaya} />
      </linearGradient>
      <radialGradient id="sr-cahaya2">
        <stop offset="0" stopColor={wr.aksen2} stopOpacity={0.45} />
        <stop offset="1" stopColor={wr.aksen2} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="sr-vignet" cx="0.45" cy="0.75" r="0.6">
        <stop offset="0.35" stopColor={wr.latar} stopOpacity={0} />
        <stop offset="1" stopColor={wr.latar} stopOpacity={0.95} />
      </radialGradient>
      <linearGradient id="sr-sorot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity={0.04} />
      </linearGradient>
      <linearGradient id="sr-kaca" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.1} />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
      </linearGradient>
      <filter id="sr-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);

/** Wadah adegan: masuk/keluar blur-zoom (motif transisi glass-tech) atau "match" (silang pudar tanpa zoom, agar
 *  bentuk yang sama di dua adegan terbaca sebagai satu gerak). */
const Wadah: React.FC<{ k: Konteks; wr: Warna; font: string; gradasi: number; titikKeluar?: [number, number] }> = ({
  k, wr, font, gradasi, titikKeluar,
}) => {
  const { a, p } = k;
  const Modul = PUSTAKA[a.modul];
  if (!Modul) throw new Error(`modul adegan tidak dikenal: ${a.modul}`);
  const t = k.f / k.fps;
  if (t < a.mulai - 0.05 || t > a.selesai + 0.5) return null;
  const iris = { masuk: a.masuk === "iris", keluar: a.keluar === "iris" && !!titikKeluar };
  if (iris.keluar && t >= a.selesai) return null;
  // iris: adegan dibatasi lingkaran (clip-path) yang menyempit/membuka di titik bersama — tanpa pudar/blur/zoom
  let klip: string | undefined;
  if (iris.masuk && t < a.mulai + IRIS_BUKA) {
    const [x, y] = titikIris(a, p);
    klip = `circle(${irisJari(t, a.mulai, jariPenuh(x, y, p)).toFixed(1)}px at ${x}px ${y}px)`;
  } else if (iris.keluar && titikKeluar && t > a.selesai - IRIS_TUTUP) {
    const [x, y] = titikKeluar;
    klip = `circle(${irisJari(t, a.selesai, jariPenuh(x, y, p)).toFixed(1)}px at ${x}px ${y}px)`;
  }
  const match = { masuk: a.masuk === "match" || iris.masuk, keluar: a.keluar === "match" || iris.keluar };
  // adegan pertama tampil penuh di frame 0 (hook visual roadmap #7), tanpa fade masuk
  const tin = a.mulai <= 0 || iris.masuk ? 1 : prog(k, a.mulai, match.masuk ? 0.25 : 0.45);
  const tout = iris.keluar ? 0 : prog(k, a.selesai, match.keluar ? 0.25 : 0.4, "keluar");
  const zm = (match.masuk ? 1 : mix(1.1, 1, tin)) * (match.keluar ? 1 : mix(1, 0.9, tout));
  const blur = (match.masuk ? 0 : (1 - tin) * 12) + (match.keluar ? 0 : tout * 12);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: p.W, height: p.tinggi, opacity: tin * (1 - tout),
      scale: String(zm), filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transformOrigin: `${p.cx}px ${p.tinggi / 2}px`,
      ...pudarBawah(gradasi * 0.6), clipPath: klip }}>
      <svg viewBox={`0 0 ${p.W} ${p.tinggi}`} width={p.W} height={p.tinggi} style={{ overflow: "visible" }}>
        <Modul k={k} wr={wr} font={font} />
      </svg>
    </div>
  );
};

/** Kabut cahaya aksen tipis di pita gradasi: mengikat panggung & rekaman tanpa garis potong. */
const Sambungan: React.FC<{ pr: SplitReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const k = { f, fps: pr.fps, tok: pr.tokens } as Konteks;
  const g = prog(k, 0, 0.7);
  const G = pr.gradasi;
  const d = denyut(f / pr.fps, pr.ketukan?.titik) * (pr.ketukan?.denyut ?? 1);
  return (
    <div style={{ position: "absolute", top: pr.tinggi_panggung - G, left: 0, width: pr.W, height: G * 2, opacity: Math.min(1, (0.55 + 0.3 * d) * g),
      background: `radial-gradient(ellipse 60% 22% at 50% 50%, ${rgba(wr.aksen, 0.16)}, ${rgba(wr.aksen, 0)})` }} />
  );
};

/** Grain film (token grain: kekuatan, ukuran) — pola baru tiap frame, sama di panggung & rekaman agar menyatu (K10). */
const Grain: React.FC<{ pr: SplitReelProps }> = ({ pr }) => {
  const f = useCurrentFrame();
  const g = pr.tokens.grain as { kekuatan: number; ukuran: number };
  return (
    <svg width={pr.W} height={pr.H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: g.kekuatan * 0.04 }}>
      <filter id="sr-grain">
        <feTurbulence type="fractalNoise" baseFrequency={0.9 / g.ukuran} numOctaves={2} seed={f} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={pr.W} height={pr.H} filter="url(#sr-grain)" />
    </svg>
  );
};

/** Sapuan cahaya aksen diagonal melintasi seluruh frame (panggung + rekaman) di tiap potongan blur-zoom:
 *  cahaya yang sama "menyentuh" talent & grafis sehingga keduanya terasa satu ruang (K10). */
const SapuanCahaya: React.FC<{ pr: SplitReelProps; wr: Warna }> = ({ pr, wr }) => {
  const f = useCurrentFrame();
  const k = { f, fps: pr.fps, tok: pr.tokens } as Konteks;
  const t = f / pr.fps;
  const a = pr.adegan.find((x) => x.mulai > 0 && x.masuk !== "match" && x.masuk !== "iris" && t >= x.mulai - 0.15 && t < x.mulai + 0.85);
  if (!a) return null;
  const u = prog(k, a.mulai - 0.15, 0.95);
  return (
    <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: Math.sin(u * Math.PI),
      background: `linear-gradient(105deg, transparent 38%, ${rgba(wr.aksen, 0.22)} 48%, ${rgba("#FFFFFF", 0.12)} 50%, ${rgba(wr.aksen, 0.22)} 52%, transparent 62%)`,
      translate: `${mix(-pr.W, pr.W, u)}px 0px` }} />
  );
};

const Caption: React.FC<{ pr: SplitReelProps; wr: Warna; tok: Tokens; hal: Kata[][] }> = ({ pr, wr, tok, hal }) => {
  const f = useCurrentFrame();
  const t = f / pr.fps;
  const idx = hal.findIndex((h, i) => {
    const lanjut = hal[i + 1];
    const akhir = lanjut ? Math.min(lanjut[0].s, h[h.length - 1].e + 0.6) : h[h.length - 1].e + 0.8;
    return t >= h[0].s - 0.05 && t < akhir;
  });
  if (idx < 0) return null;
  const h = hal[idx];
  const k = { f, fps: pr.fps, tok } as Konteks;
  const cap = tok.caption as { stroke: number; redup: number };
  const masuk = prog(k, h[0].s - 0.08, 0.25);
  return (
    <div style={{ position: "absolute", top: pr.caption.y, left: 0, width: pr.W, display: "flex", justifyContent: "center",
      translate: `0px ${mix(14, 0, masuk)}px`, opacity: masuk }}>
      <div style={{ translate: "0 -50%", padding: "14px 34px", borderRadius: 999, background: rgba(wr.panel, 0.72),
        border: `2px solid ${wr.garis}`, boxShadow: `0 10px 30px ${rgba("#000000", 0.45)}, 0 0 40px ${rgba(wr.aksen, 0.18)}`,
        display: "flex", gap: "0 16px", maxWidth: pr.W - 200, flexWrap: "wrap", justifyContent: "center",
        fontFamily: tok.font.caption.family, fontWeight: tok.font.caption.weight, fontSize: tok.ukuran.caption, lineHeight: 1.15 }}>
        {h.map((w, i) => {
          const aktif = t >= w.s && t < Math.max(w.e, h[i + 1]?.s ?? w.e + 0.3);
          const sudah = t >= w.s;
          return (
            <span key={i} style={{ color: aktif ? wr.aksen : wr.teks, opacity: sudah ? 1 : cap.redup,
              WebkitTextStroke: `${cap.stroke}px ${String(tok.warna.stroke)}`, paintOrder: "stroke fill",
              textShadow: aktif ? `0 0 18px ${rgba(wr.aksen, 0.6)}` : "none" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const SplitReel: React.FC<SplitReelProps> = (pr) => {
  const f = useCurrentFrame();
  const tok = pakaiFontToken(pr.tokens);
  const wr = ambilWarna(tok);
  const p: Panggung = { W: pr.W, tinggi: pr.tinggi_panggung, cx: (pr.zona[0] + pr.zona[2]) / 2, atas: pr.zona[1],
    bawah: pr.tinggi_panggung - 70 };
  const hal = React.useMemo(() => halaman(pr.kata, pr.caption), [pr.kata, pr.caption]);
  const t = f / pr.fps;
  // denyut ketukan: panggung "bernapas" ±1,2 % + cahaya aksen tipis — talent & caption tidak ikut berdenyut
  const d = denyut(t, pr.ketukan?.titik) * (pr.ketukan?.denyut ?? 1);
  const skalaPanggung = hookZoom(pr, t, 0.12) * (1 + 0.012 * d);
  const [hx, hy] = pr.adegan[0] ? titikIris(pr.adegan[0], p) : [p.cx, p.tinggi / 2];
  return (
    <AbsoluteFill style={{ backgroundColor: wr.latar }}>
      <Defs wr={wr} />
      <Footage pr={pr} wr={wr} />
      <LatarPanggung pr={pr} wr={wr} />
      <div style={{ position: "absolute", inset: 0, scale: String(skalaPanggung), transformOrigin: `${p.cx}px ${p.tinggi / 2}px` }}>
        {pr.adegan.map((a, i) => (
          <Wadah key={i} k={{ f, fps: pr.fps, tok, p, a }} wr={wr} font={tok.font.judul.family} gradasi={pr.gradasi}
            titikKeluar={a.keluar === "iris" && pr.adegan[i + 1]?.masuk === "iris" ? titikIris(pr.adegan[i + 1], p) : undefined} />
        ))}
        <CincinIris pr={pr} wr={wr} p={p} />
      </div>
      {d > 0.01 ? (
        <div style={{ position: "absolute", top: 0, left: 0, width: pr.W, height: pr.tinggi_panggung, mixBlendMode: "screen",
          opacity: 0.12 * d, background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${rgba(wr.aksen, 0.5)}, ${rgba(wr.aksen, 0)})`,
          ...pudarBawah(pr.gradasi) }} />
      ) : null}
      <LogoKlien pr={pr} cx={p.cx} />
      <HookPembuka pr={pr} wr={wr} cx={hx} cy={hy} />
      <Sambungan pr={pr} wr={wr} />
      {pr.menyatu?.sapuan !== false ? <SapuanCahaya pr={pr} wr={wr} /> : null}
      {pr.menyatu?.grain !== false ? <Grain pr={pr} /> : null}
      <Caption pr={pr} wr={wr} tok={tok} hal={hal} />
    </AbsoluteFill>
  );
};

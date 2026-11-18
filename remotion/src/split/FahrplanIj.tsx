// Bahasa visual "Fahrplan" untuk Info Jerman (tema terang SplitReel): papan keberangkatan split-flap + peta U-Bahn.
// Tiga jalur kerja = tiga jalur kereta: 1 Ausbildung kuning, 2 FSJ merah logo (hemat, hanya garis jalurnya),
// 3 Kerja Profesional charcoal. Kertas krem, kartu putih datar ber-bayangan lembut, Lato Black/Regular (guideline 2026).
// Semua primitif deterministik berbasis frame; warna dari token (Warna), teks/timing dari props adegan.

import React from "react";
import { Easing, random } from "remotion";
import { rgba } from "../lib/kontrak";
import { Konteks, detik, gambar, mix, progE } from "./alat";
import { Warna } from "./Ikon";

export const OUT = Easing.out(Easing.cubic);
export const OUT_BACK = Easing.out(Easing.back(1.6));
export const IN_OUT = Easing.inOut(Easing.cubic);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const pe = (k: Konteks, t: number, d: number, e: (x: number) => number = OUT) => progE(k, t, d, e);

/** Warna tiap jalur: garis + teks di atasnya (teks charcoal di atas kuning — tidak pernah putih di atas kuning). */
export const jalur = (wr: Warna) => [
  { garis: wr.aksen, teks: wr.teks, nama: "AUSBILDUNG" },
  { garis: wr.aksen2, teks: "#FFFFFF", nama: "FSJ" },
  { garis: wr.teks, teks: wr.latar, nama: "KERJA PROFESIONAL" },
];

/** Bayangan kartu datar (brand: lembut, bukan glow). */
export const BayangDef: React.FC<{ id: string; o?: number }> = ({ id, o = 0.16 }) => (
  <defs>
    <filter id={id} x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx={0} dy={12} stdDeviation={14} floodColor="#25272B" floodOpacity={o} />
    </filter>
  </defs>
);

/** Lencana nomor jalur (kotak membulat ala rambu U-Bahn). Pusat (0,0). */
export const Lencana: React.FC<{ wr: Warna; i: number; s?: number; font: string }> = ({ wr, i, s = 1, font }) => {
  const j = jalur(wr)[i];
  return (
    <g transform={`scale(${s})`}>
      <rect x={-34} y={-34} width={68} height={68} rx={16} fill={j.garis} />
      <text x={0} y={16} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={46} fill={j.teks}>{i + 1}</text>
    </g>
  );
};

const HURUF = "ABCDEFGHIJKLMNOPRSTUVWZ0123456789";

/** Satu sel split-flap. `e` = detik sejak sel mulai berputar (<0 = kosong). Huruf acak berputar `n` kali lalu berhenti
 *  pada target; flap atas melipat turun di tiap ganti huruf (bobot mekanis: cepat, berhenti tegas). */
export const SelFlap: React.FC<{ ch: string; e: number; n: number; w: number; h: number; font: string; wr: Warna; seed: string;
  warnaSel?: string; warnaTeks?: string }> = ({ ch, e, n, w, h, font, wr, seed, warnaSel, warnaTeks }) => {
  const LAJU = 0.055;
  const idx = e < 0 ? -1 : Math.floor(e / LAJU);
  const tampil = idx < 0 ? " " : idx >= n || ch === " " ? ch : HURUF[Math.floor(random(`${seed}-${idx}`) * HURUF.length)];
  const fase = idx >= 0 && idx < n && ch !== " " ? (e / LAJU) % 1 : 1;
  const bg = warnaSel ?? "#2F3238";
  const fg = warnaTeks ?? wr.latar;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={7} fill={bg} />
      <text x={0} y={h * 0.3} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={h * 0.78} fill={fg}>{tampil}</text>
      {/* flap atas melipat: setengah atas sel menutup lalu terbuka ke bawah */}
      {fase < 1 ? (
        <rect x={-w / 2} y={-h / 2} width={w} height={(h / 2) * (1 - fase)} rx={6} fill={rgba("#000000", 0.35 * (1 - fase))} />
      ) : null}
      <rect x={-w / 2} y={-1.5} width={w} height={3} fill={rgba("#000000", 0.45)} />
    </g>
  );
};

/** Baris teks split-flap: sel ke-i mulai `t0 + i·jeda`. Pusat kiri (0,0). */
export const BarisFlap: React.FC<{ k: Konteks; teks: string; t0: number; w?: number; h?: number; gap?: number; font: string; wr: Warna;
  seed: string; jeda?: number; warnaSel?: string; warnaTeks?: string; panjang?: number }> = ({
  k, teks, t0, w = 46, h = 66, gap = 5, font, wr, seed, jeda = 0.022, warnaSel, warnaTeks, panjang,
}) => {
  const t = detik(k);
  const n = Math.max(teks.length, panjang ?? 0);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`translate(${i * (w + gap) + w / 2} 0)`}>
          <SelFlap ch={teks[i] ?? " "} e={t - (t0 + i * jeda)} n={4 + (i % 3)} w={w} h={h} font={font} wr={wr} seed={`${seed}${i}`}
            warnaSel={warnaSel} warnaTeks={warnaTeks} />
        </g>
      ))}
    </g>
  );
};

/** Titik & arah pada polyline (u 0..1 berdasarkan panjang). */
export const titikJalur = (pts: [number, number][], u: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let sisa = clamp01(u) * total;
  for (let i = 0; i < seg.length; i++) {
    if (sisa <= seg[i] || i === seg.length - 1) {
      const v = seg[i] ? sisa / seg[i] : 0;
      const [a, b] = [pts[i], pts[i + 1]];
      return { x: mix(a[0], b[0], v), y: mix(a[1], b[1], v), sudut: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI };
    }
    sisa -= seg[i];
  }
  return { x: pts[0][0], y: pts[0][1], sudut: 0 };
};

export const dPath = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");

/** Garis jalur U-Bahn: tepi krem tipis (agar persilangan terbaca) + garis warna; p = tergambar. */
export const GarisJalur: React.FC<{ pts: [number, number][]; c: string; p: number; lebar?: number; latar: string }> = ({ pts, c, p, lebar = 22, latar }) => (
  <g>
    <path d={dPath(pts)} fill="none" stroke={latar} strokeWidth={lebar + 12} strokeLinecap="round" strokeLinejoin="round" {...gambar(p)} />
    <path d={dPath(pts)} fill="none" stroke={c} strokeWidth={lebar} strokeLinecap="round" strokeLinejoin="round" {...gambar(p)} />
  </g>
);

/** Stasiun: lingkaran putih ber-cincin charcoal; `nyala` 0..1 = kereta tiba (cincin kuning memantul). */
export const Stasiun: React.FC<{ wr: Warna; p: number; r?: number; nyala?: number; c?: string }> = ({ wr, p, r = 20, nyala = 0, c }) => (
  <g transform={`scale(${Math.max(0.001, OUT_BACK(clamp01(p)))})`}>
    {nyala > 0 ? <circle r={r + 6 + 26 * nyala} fill="none" stroke={c ?? wr.aksen} strokeWidth={6} opacity={1 - nyala} /> : null}
    <circle r={r} fill="#FFFFFF" stroke={wr.teks} strokeWidth={8} />
  </g>
);

/** Kereta: kapsul berwarna jalur dengan jendela, berorientasi lintasan. */
export const Kereta: React.FC<{ wr: Warna; c: string; s?: number; sudut?: number }> = ({ wr, c, s = 1, sudut = 0 }) => (
  <g transform={`rotate(${sudut}) scale(${s})`}>
    <rect x={-70} y={-26} width={140} height={52} rx={26} fill={c} stroke={wr.teks} strokeWidth={6} />
    {[-38, -6, 26].map((x) => <rect key={x} x={x - 12} y={-12} width={24} height={16} rx={5} fill={rgba("#FFFFFF", 0.9)} />)}
    <rect x={-70} y={10} width={140} height={6} fill={rgba(wr.teks, 0.25)} />
  </g>
);

/** Kartu putih datar ber-bayangan; pusat (0,0). */
export const Kartu: React.FC<{ w: number; h: number; bayang: string; r?: number; isi?: string; garisTepi?: string }> = ({ w, h, bayang, r = 26, isi = "#FFFFFF", garisTepi }) => (
  <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={isi} filter={`url(#${bayang})`}
    stroke={garisTepi} strokeWidth={garisTepi ? 4 : 0} />
);

/** Label teks Lato pada kartu/papan. */
export const Teks: React.FC<{ x?: number; y?: number; s: number; font: string; c: string; w?: 400 | 900; anchor?: "start" | "middle" | "end";
  o?: number; children: React.ReactNode; spasi?: number }> = ({ x = 0, y = 0, s, font, c, w = 900, anchor = "middle", o = 1, children, spasi }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={font} fontWeight={w} fontSize={s} fill={c} opacity={o} letterSpacing={spasi}>{children}</text>
);

// ---------- ikon garis datar (stroke charcoal, isi putih/krem; pusat 0,0, ±60 px) ----------

const st = (c: string, w = 7) => ({ stroke: c, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const ln = (c: string, w = 7) => ({ fill: "none", ...st(c, w) });

export const IkonBuku: React.FC<{ wr: Warna; buka?: number }> = ({ wr, buka = 1 }) => {
  const a = mix(0, 1, buka);
  return (
    <g>
      <path d={`M 0 -36 Q ${-30 * a - 6} -48 ${-60 * a - 4} -40 L ${-60 * a - 4} 34 Q ${-30 * a - 6} 26 0 38 Z`} fill="#FFFFFF" {...st(wr.teks)} />
      <path d={`M 0 -36 Q ${30 * a + 6} -48 ${60 * a + 4} -40 L ${60 * a + 4} 34 Q ${30 * a + 6} 26 0 38 Z`} fill="#FFFFFF" {...st(wr.teks)} />
      {buka > 0.6 ? [-18, -4, 10].map((y) => <path key={y} d={`M ${-44 * a} ${y} Q ${-24 * a} ${y - 6} ${-10} ${y}`} {...ln(wr.teks, 4)} opacity={0.5} />) : null}
    </g>
  );
};

export const IkonGir: React.FC<{ wr: Warna; putar: number; r?: number; isi?: string }> = ({ wr, putar, r = 46, isi }) => (
  <g transform={`rotate(${putar})`}>
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-11} y={-r - 12} width={22} height={24} rx={5} fill={isi ?? "#FFFFFF"} stroke={wr.teks} strokeWidth={6}
        transform={`rotate(${i * 45})`} />
    ))}
    <circle r={r} fill={isi ?? "#FFFFFF"} stroke={wr.teks} strokeWidth={7} />
    <circle r={r * 0.36} fill={wr.latar} stroke={wr.teks} strokeWidth={6} />
  </g>
);

export const IkonHati: React.FC<{ c: string; garisC: string; s?: number }> = ({ c, garisC, s = 1 }) => (
  <path transform={`scale(${s})`} d="M 0 40 C -70 -4 -54 -62 -16 -54 C -6 -52 0 -44 0 -36 C 0 -44 6 -52 16 -54 C 54 -62 70 -4 0 40 Z"
    fill={c} stroke={garisC} strokeWidth={7} strokeLinejoin="round" />
);

export const IkonPalang: React.FC<{ wr: Warna; c: string }> = ({ wr, c }) => (
  <g>
    <rect x={-52} y={-52} width={104} height={104} rx={24} fill="#FFFFFF" stroke={wr.teks} strokeWidth={7} />
    <path d="M -12 -32 H 12 V -12 H 32 V 12 H 12 V 32 H -12 V 12 H -32 V -12 H -12 Z" fill={c} stroke={wr.teks} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const IkonOrang: React.FC<{ wr: Warna; isi?: string; s?: number }> = ({ wr, isi = "#FFFFFF", s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -34 40 L -34 14 Q -34 -14 0 -14 Q 34 -14 34 14 L 34 40" fill={isi} {...st(wr.teks)} />
    <circle cx={0} cy={-38} r={19} fill={isi} {...st(wr.teks)} />
  </g>
);

export const IkonKoper: React.FC<{ wr: Warna; isi?: string }> = ({ wr, isi = "#FFFFFF" }) => (
  <g>
    <path d="M -20 -36 V -50 Q -20 -58 -12 -58 H 12 Q 20 -58 20 -50 V -36" {...ln(wr.teks)} />
    <rect x={-58} y={-36} width={116} height={82} rx={14} fill={isi} {...st(wr.teks)} />
    <path d="M -58 -4 H 58" {...ln(wr.teks, 5)} />
  </g>
);

/** Ijazah/sertifikat: kartu dengan pita. */
export const IkonIjazah: React.FC<{ wr: Warna; pita: string }> = ({ wr, pita }) => (
  <g>
    <rect x={-78} y={-54} width={156} height={108} rx={12} fill="#FFFFFF" {...st(wr.teks)} />
    {[-26, -8, 10].map((y, i) => <path key={y} d={`M -54 ${y} H ${i === 0 ? 40 : 20}`} {...ln(wr.teks, 5)} opacity={0.45} />)}
    <circle cx={48} cy={22} r={18} fill={pita} stroke={wr.teks} strokeWidth={5} />
    <path d="M 40 36 L 34 62 L 48 54 L 62 62 L 56 36" fill={pita} stroke={wr.teks} strokeWidth={5} strokeLinejoin="round" />
  </g>
);

export const IkonDokumen: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g>
    <path d="M -40 -54 H 20 L 42 -32 V 54 H -40 Z" fill="#FFFFFF" {...st(wr.teks)} />
    <path d="M 20 -54 V -32 H 42" {...ln(wr.teks, 5)} />
    {[-14, 4, 22].map((y) => <path key={y} d={`M -24 ${y} H 26`} {...ln(wr.teks, 5)} opacity={0.45} />)}
  </g>
);

export const IkonBendera: React.FC<{ wr: Warna; kibar: number; c: string }> = ({ wr, kibar, c }) => (
  <g>
    <path d="M -30 56 V -56" {...ln(wr.teks)} />
    <path d={`M -30 -54 Q ${0} ${-64 + 8 * kibar} 30 -54 T 64 -50 V -6 Q 44 ${-10 - 8 * kibar} 18 -4 T -30 -10 Z`} fill={c} {...st(wr.teks, 6)} />
  </g>
);

export const IkonBalon: React.FC<{ wr: Warna; isi?: string; w?: number; h?: number }> = ({ wr, isi = "#FFFFFF", w = 120, h = 84 }) => (
  <g>
    <path d={`M ${-w / 2 + 18} ${-h / 2} H ${w / 2 - 18} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 18} V ${h / 2 - 18} Q ${w / 2} ${h / 2} ${w / 2 - 18} ${h / 2}
      H ${-w / 2 + 40} L ${-w / 2 + 14} ${h / 2 + 22} L ${-w / 2 + 20} ${h / 2} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 18} V ${-h / 2 + 18}
      Q ${-w / 2} ${-h / 2} ${-w / 2 + 18} ${-h / 2} Z`} fill={isi} {...st(wr.teks)} />
  </g>
);

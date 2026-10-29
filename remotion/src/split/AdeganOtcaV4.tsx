// Pustaka adegan OTCA v4 "benang emas" untuk SplitReel (brand OTCA: hitam dominan, garis gradien emas tebal 7,
// Montserrat). Semua ilustrasi digambar dengan satu bahasa: garis emas metalik (gradien userSpaceOnUse yang bergeser
// pelan = kilap logam), permukaan hitam-emas gelap, cahaya lembut, kedalaman 2.5D lewat drift berlapis.
// Waktu = detik absolut dari anchor kata (split.json → split.py). Adegan memipih/membuka lewat transisi "garis".

import React from "react";
import { Easing, interpolate, random, staticFile } from "remotion";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Cahaya, G, Orang, Warna, garis } from "./Ikon";
import { BERLIN, INDONESIA, JAKARTA, JERMAN, TITIK_DARAT } from "./data/peta";

type PropsAdegan = { k: Konteks; wr: Warna; font: string };

/** Tebal garis brand OTCA. */
const T = 7;
const EMAS = "url(#o4-emas)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Gradien emas metalik (pantulan berulang → kilap logam) yang bergeser pelan, permukaan gelap, cahaya, bloom. */
const EmasDefs: React.FC<{ k: Konteks; wr: Warna }> = ({ k, wr }) => {
  const g = (detik(k) * 40) % 600; // kilap berjalan konstan (gerak diam material, disengaja linear)
  return (
    <defs>
      <linearGradient id="o4-emas" gradientUnits="userSpaceOnUse" x1={g} y1={0} x2={g + 320} y2={190} spreadMethod="reflect">
        <stop offset="0" stopColor={wr.bahaya} />
        <stop offset="0.45" stopColor={wr.aksen} />
        <stop offset="0.7" stopColor={wr.aksen2} />
        <stop offset="1" stopColor={wr.aksen} />
      </linearGradient>
      <linearGradient id="o4-isi" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A1F08" />
        <stop offset="1" stopColor="#080603" />
      </linearGradient>
      <linearGradient id="o4-isi-emas" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={wr.aksen2} />
        <stop offset="0.5" stopColor={wr.aksen} />
        <stop offset="1" stopColor={wr.bahaya} />
      </linearGradient>
      <radialGradient id="o4-sinar">
        <stop offset="0" stopColor={wr.aksen2} stopOpacity={0.55} />
        <stop offset="0.4" stopColor={wr.aksen} stopOpacity={0.18} />
        <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="o4-berkas" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={wr.aksen2} stopOpacity={0.35} />
        <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="o4-air" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1C1405" stopOpacity={0.95} />
        <stop offset="1" stopColor="#000000" stopOpacity={0.4} />
      </linearGradient>
      <filter id="o4-bloom" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
};

/** Debu emas melayang (bokeh) per adegan — lapisan kedalaman depan. */
const Debu: React.FC<{ k: Konteks; n?: number; seed: string; o?: number }> = ({ k, n = 14, seed, o = 1 }) => {
  const t = detik(k);
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const x = random(`${seed}x${i}`) * k.p.W;
        const y0 = 260 + random(`${seed}y${i}`) * 520;
        const y = y0 - ((t * (8 + 14 * random(`${seed}v${i}`))) % 140);
        const r = 2 + random(`${seed}r${i}`) * 5;
        return <circle key={i} cx={x + Math.sin(t * 0.7 + i) * 10} cy={y} r={r} fill="#FDF1A4" opacity={0.08 + 0.22 * random(`${seed}o${i}`)} />;
      })}
    </g>
  );
};

/** Pegas teredam untuk hentakan (cap, getar). */
const getar = (t: number, t0: number, amp: number, f = 9, luruh = 7) =>
  t < t0 ? 0 : amp * Math.exp(-(t - t0) * luruh) * Math.sin((t - t0) * f * Math.PI * 2);

// ---------------------------------------------------------------- objek bersama

/** Sertifikat emas (pusat di 0,0; 360 × 250). retak 0→1 = retakan cahaya merambat; redup = jadi kertas biasa. */
const Sertifikat: React.FC<{ wr: Warna; font: string; p?: number; retak?: number; redup?: number; level?: string; segel?: number }> = ({
  wr, font, p = 1, retak = 0, redup = 0, level = "B2", segel = 1,
}) => {
  const st = redup > 0 ? wr.teks : EMAS;
  return (
    <g>
      <rect x={-180} y={-125} width={360} height={250} rx={14} fill="url(#o4-isi)" opacity={mix(0.95, 0.7, redup) * Math.min(1, p * 2)} />
      <rect x={-180} y={-125} width={360} height={250} rx={14} {...garis(st, T)} {...gambar(p)} opacity={mix(1, 0.45, redup)}
        filter="url(#sr-glow)" />
      <rect x={-160} y={-105} width={320} height={210} rx={8} {...garis(wr.aksen, 2)} opacity={0.55 * p * (1 - redup * 0.6)} />
      <g opacity={Math.max(0, p * 2 - 1)}>
        <rect x={-90} y={-82} width={180} height={14} rx={7} fill={redup > 0 ? wr.teks : "url(#o4-isi-emas)"} opacity={mix(1, 0.35, redup)} />
        {[[-120, -40, 240], [-120, -12, 190], [-120, 16, 215]].map(([x, y, w], i) => (
          <rect key={i} x={x} y={y} width={w} height={7} rx={3.5} fill={wr.teks} opacity={0.32 * (1 - redup * 0.5)} />
        ))}
        <path d="M -120 74 Q -95 58 -70 74 T -20 70" {...garis(wr.teks, 3)} opacity={0.4} />
      </g>
      <G x={104} y={58} s={segel} o={Math.min(1, segel * 3)}>
        <path d="M -22 20 L -34 70 L -12 58 L 0 76 L 6 26 Z M 22 20 L 34 70 L 12 58 L 0 76 L -6 26 Z" fill={wr.bahaya} opacity={mix(1, 0.4, redup)} />
        <circle r={44} fill={redup > 0 ? "#3A3A3A" : "url(#o4-isi-emas)"} filter="url(#sr-glow)" />
        <circle r={34} fill="none" stroke="#1A1206" strokeWidth={2.5} strokeDasharray="3 4" opacity={0.6} />
        <text x={0} y={11} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill="#1A1206">
          {level}
        </text>
      </G>
      {retak > 0 ? <Retakan wr={wr} p={retak} /> : null}
    </g>
  );
};

/** Retakan cahaya zig-zag melintasi sertifikat (kiri atas → kanan bawah), cabang kecil menyusul. */
const Retakan: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => {
  const d = "M -150 -125 L -112 -78 L -126 -40 L -70 -8 L -84 30 L -22 52 L -30 88 L 18 125";
  const cabang = "M -70 -8 L -30 -26 L -8 -14 M -84 30 L -120 58";
  return (
    <g>
      <path d={d} {...garis(wr.aksen2, 16)} opacity={0.35 * p} filter="url(#o4-bloom)" {...gambar(p)} />
      <path d={d} {...garis("#FFFFFF", 4)} {...gambar(p)} />
      <path d={cabang} {...garis("#FFFFFF", 2.5)} {...gambar(Math.max(0, p * 1.6 - 0.6))} />
    </g>
  );
};

/** Gedung universitas klasik (pusat bawah di 0,0; ±150 lebar, 230 tinggi): tangga, 5 pilar, pediment, kubah kecil. */
const Gedung: React.FC<{ wr: Warna; p: number; nyala?: number }> = ({ wr, p, nyala = 0 }) => (
  <g filter="url(#sr-glow)">
    <path d="M -160 0 H 160 M -145 -14 H 145 M -132 -28 H 132" {...garis(EMAS, 5)} {...gambar(p)} />
    {[-100, -50, 0, 50, 100].map((x, i) => (
      <path key={x} d={`M ${x - 12} -28 V -150 M ${x + 12} -28 V -150`} {...garis(EMAS, 4)} {...gambar(Math.min(1, Math.max(0, p * 2 - 0.4 - i * 0.08)))} />
    ))}
    <path d="M -140 -150 H 140 L 0 -222 Z" {...garis(EMAS, T)} fill="url(#o4-isi)" fillOpacity={0.8 * p} {...gambar(p)} />
    <circle cx={0} cy={-178} r={14} {...garis(EMAS, 4)} {...gambar(p)} />
    {[-75, -25, 25, 75].map((x) => (
      <rect key={x} x={x - 12} y={-128} width={24} height={60} rx={12} fill={wr.aksen2} opacity={0.5 * nyala} />
    ))}
  </g>
);

/** Ikon garis emas (±50 px), dipakai di gunung es, kuliah, radar. */
const Ikon: React.FC<{ jenis: string; p: number; wr: Warna; st?: string; lebar?: number }> = ({ jenis, p, wr, st = EMAS, lebar = 6 }) => {
  const g = { ...garis(st, lebar), ...gambar(p) };
  const isi = { fill: "url(#o4-isi)", fillOpacity: 0.9 * p };
  switch (jenis) {
    case "telinga":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -22 -10 C -26 -52 30 -62 34 -18 C 36 4 18 12 12 26 C 6 42 -2 54 -18 50" {...g} />
          <path d="M -6 -10 C -6 -30 18 -30 18 -12 C 18 0 4 2 4 14" {...garis(st, 4)} {...gambar(p)} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${48 + i * 16} -28 Q ${58 + i * 18} -6 ${48 + i * 16} 16`} {...garis(st, 4)} opacity={0.7 - i * 0.25}
              {...gambar(Math.max(0, p * 2 - 1))} />
          ))}
        </g>
      );
    case "bicara":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -44 -36 H 34 Q 46 -36 46 -24 V 14 Q 46 26 34 26 H -6 L -26 44 L -22 26 H -44 Q -56 26 -56 14 V -24 Q -56 -36 -44 -36 Z" {...g} {...isi} />
          {[-24, -5, 14].map((x, i) => (
            <circle key={x} cx={x} cy={-5} r={5} fill={wr.aksen2} opacity={Math.max(0, Math.min(1, p * 3 - 1.5 - i * 0.3))} />
          ))}
        </g>
      );
    case "pena":
      return (
        <g filter="url(#sr-glow)">
          <path d="M 30 -48 L 44 -34 L -14 24 L -34 30 L -28 10 Z" {...g} {...isi} />
          <path d="M 18 -36 L 32 -22" {...garis(st, 4)} {...gambar(p)} />
          <path d="M -52 50 Q -36 38 -22 48 T 8 46 T 40 48" {...garis(st, 4)} {...gambar(Math.max(0, p * 2 - 1))} />
        </g>
      );
    case "buku":
      return (
        <g filter="url(#sr-glow)">
          <path d="M 0 -30 Q -26 -44 -56 -36 V 34 Q -26 26 0 40 Q 26 26 56 34 V -36 Q 26 -44 0 -30 Z" {...g} {...isi} />
          <path d="M 0 -30 V 40" {...garis(st, 4)} {...gambar(p)} />
          {[-14, 0, 14].map((y) => (
            <path key={y} d={`M -44 ${y - 8} Q -24 ${y - 14} -10 ${y - 6} M 10 ${y - 6} Q 24 ${y - 14} 44 ${y - 8}`} {...garis(st, 2.5)}
              opacity={0.6} {...gambar(Math.max(0, p * 2 - 1))} />
          ))}
        </g>
      );
    case "toga":
      return (
        <g filter="url(#sr-glow)">
          <path d="M 0 -40 L 62 -14 L 0 12 L -62 -14 Z" {...g} {...isi} />
          <path d="M -36 0 V 26 Q 0 44 36 26 V 0" {...g} />
          <path d="M 50 -10 V 30" {...garis(st, 4)} {...gambar(p)} />
          <circle cx={50} cy={36} r={6} fill={wr.aksen} opacity={p} />
        </g>
      );
    case "tas":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -40 -20 H 40 L 48 50 H -48 Z" {...g} {...isi} />
          <path d="M -18 -20 V -32 Q -18 -52 0 -52 Q 18 -52 18 -32 V -20" {...g} />
        </g>
      );
    case "kereta":
      return (
        <g filter="url(#sr-glow)">
          <rect x={-38} y={-52} width={76} height={90} rx={18} {...g} {...isi} />
          <rect x={-26} y={-38} width={52} height={30} rx={6} {...garis(st, 4)} {...gambar(p)} />
          <circle cx={-18} cy={16} r={6} fill={wr.aksen2} opacity={p} />
          <circle cx={18} cy={16} r={6} fill={wr.aksen2} opacity={p} />
          <path d="M -26 38 L -40 56 M 26 38 L 40 56" {...g} />
        </g>
      );
    case "rumah":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -48 -6 L 0 -50 L 48 -6 V 46 H -48 Z" {...g} {...isi} />
          <path d="M -12 46 V 14 H 12 V 46" {...garis(st, 4)} {...gambar(p)} />
        </g>
      );
    case "mik":
      return (
        <g filter="url(#sr-glow)">
          <rect x={-16} y={-54} width={32} height={58} rx={16} {...g} {...isi} />
          <path d="M -30 -14 Q -30 22 0 22 Q 30 22 30 -14 M 0 22 V 44 M -18 44 H 18" {...g} />
        </g>
      );
    case "tangan":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -26 50 V -6 Q -26 -16 -18 -16 Q -10 -16 -10 -6 V -34 Q -10 -44 -2 -44 Q 6 -44 6 -34 V -10 V -42 Q 6 -52 14 -52 Q 22 -52 22 -42 V -8 V -30 Q 22 -40 30 -40 Q 38 -40 38 -30 V 18 Q 38 50 10 56 H -26 Z" {...g} {...isi} />
          <path d="M -26 8 L -44 -10 Q -52 -18 -46 -24 Q -38 -30 -30 -20 L -26 -14" {...g} />
        </g>
      );
    case "gelembung":
      return (
        <g filter="url(#sr-glow)">
          <path d="M -40 -28 H 40 Q 52 -28 52 -16 V 12 Q 52 24 40 24 H 4 L -14 40 L -12 24 H -40 Q -52 24 -52 12 V -16 Q -52 -28 -40 -28 Z" {...g} {...isi} />
          <path d="M -30 -8 H 30 M -30 6 H 12" {...garis(st, 4)} opacity={0.7} {...gambar(Math.max(0, p * 2 - 1))} />
        </g>
      );
    case "gir":
      return (
        <g filter="url(#sr-glow)">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <rect key={i} x={-9} y={-56} width={18} height={20} rx={4} fill={wr.aksen} opacity={p} transform={`rotate(${(a * 180) / Math.PI})`} />;
          })}
          <circle r={40} {...g} {...isi} />
          <circle r={14} {...garis(st, 5)} {...gambar(p)} />
        </g>
      );
    default:
      return null;
  }
};

/** Pelajar: sosok (Orang) + topi toga di kepala → langsung terbaca "anak yang akan kuliah", bukan ikon pengguna generik.
 *  `langkah` diteruskan ke Orang (tanpa = siluet dada). Kaki di (0,0). */
const Pelajar: React.FC<{ wr: Warna; p?: number; langkah?: number }> = ({ wr, p = 1, langkah }) => {
  const kepalaY = langkah === undefined ? -116 : -142;
  const r = langkah === undefined ? 25 : 22;
  return (
    <g>
      <Orang wr={wr} stroke={EMAS} p={p} langkah={langkah} isi="#0B0803" />
      <g transform={`translate(0 ${kepalaY - r + 4})`} opacity={Math.min(1, p * 1.5)} filter="url(#sr-glow)">
        <path d={`M 0 ${-r * 0.95} L ${r * 1.9} ${-r * 0.3} L 0 ${r * 0.35} L ${-r * 1.9} ${-r * 0.3} Z`} fill="url(#o4-isi-emas)" />
        <path d={`M ${-r * 1.05} ${-r * 0.05} V ${r * 0.5} Q 0 ${r * 1.05} ${r * 1.05} ${r * 0.5} V ${-r * 0.05}`} fill="#0B0803"
          stroke={wr.aksen} strokeWidth={3} />
        <path d={`M ${r * 1.5} ${-r * 0.42} V ${r * 0.75}`} stroke={wr.aksen2} strokeWidth={3} strokeLinecap="round" />
        <circle cx={r * 1.5} cy={r * 0.85} r={4} fill={wr.aksen2} />
      </g>
    </g>
  );
};

/** Pesawat kertas tampak atas (dart), hidung ke ATAS (0,-90); dipakai setelah sertifikat terlipat & di peta rute. */
const DART: [number, number][] = [[0, -170], [128, 112], [18, 82], [0, 124], [-18, 82], [-128, 112]];
const PesawatKertas: React.FC<{ wr: Warna; o?: number }> = ({ wr, o = 1 }) => (
  <g opacity={o} filter="url(#sr-glow)">
    <path d={`M ${DART.map(([x, y]) => `${x} ${y}`).join(" L ")} Z`} fill="url(#o4-isi-emas)" stroke={wr.aksen2} strokeWidth={4}
      strokeLinejoin="round" />
    <path d="M 0 -170 L 0 124 M 0 -170 L 18 82 M 0 -170 L -18 82" fill="none" stroke="#1A1206" strokeWidth={3} strokeLinejoin="round" opacity={0.55} />
  </g>
);

// ---------------------------------------------------------------- 1. HOOK "Halo, parents! Hati-hati ya!"
// Frame 0: sertifikat emas sudah di layar + segel jatuh menghentak (impact di ±0,08 s = cincin hook SplitReel).
// "parents": siluet orang tua & anak memandang dari samping. "Hati-hati": retakan cahaya merambat, sertifikat miring.
export const Otca4Segel: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const hentak = tk(a, "stempel", 0.08);
  const parents = tk(a, "parents", 1.14);
  const hati = tk(a, "retak", 1.94);
  const turun = interpolate(t, [a.mulai, hentak], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const sx = 104;
  const sy = 58;
  const segelS = mix(1.7, 1, turun);
  const goyang = getar(t, hentak, 7, 6, 8) + getar(t, hati + 0.15, 4, 5, 6);
  const miring = mix(-4, -9, progE(k, hati, 0.6, INOUT));
  const retak = prog(k, hati, 0.45, "tegas");
  const keluarga = prog(k, parents, 0.7);
  const cx = p.cx;
  const cy = 500;
  const d1 = drift(k, 0.5);
  const d2 = drift(k, 1);
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <G x={cx} y={cy}>
        <Cahaya r={480} o={0.55 + 0.4 * Math.exp(-Math.max(0, t - hentak) * 3)} />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M 0 0 L ${-60 + i * 15} -620 L ${-30 + i * 15} -620 Z`} fill="url(#o4-berkas)"
            opacity={0.16 * keluarga} transform={`rotate(${-48 + i * 12})`} />
        ))}
      </G>
      {/* orang tua & anak bergandengan (lapis jauh, kiri bawah) memandang sertifikat */}
      <G x={cx - 370 + d1.x} y={770 + d1.y} s={1.3} o={keluarga * 0.85}>
        <Orang wr={wr} stroke={EMAS} p={keluarga} langkah={0} isi="#0B0803" />
        <G x={78} y={0} s={0.68}>
          <Orang wr={wr} stroke={EMAS} p={keluarga} langkah={0} isi="#0B0803" />
        </G>
        <path d="M 22 -82 Q 44 -70 62 -62" {...garis(EMAS, 6)} {...gambar(keluarga)} />
      </G>
      <G x={cx + d2.x} y={cy + goyang + d2.y} r={miring} s={1.25}>
        <Sertifikat wr={wr} font={font} retak={retak} segel={t < hentak ? 0 : 1 + getar(t, hentak, 0.14, 3, 9)} />
        {t < hentak ? (
          <G x={sx} y={sy - mix(170, 0, turun)} s={segelS}>
            {/* jejak gerak (motion trail) di atas segel yang jatuh */}
            {[3, 2, 1].map((j) => (
              <circle key={j} cy={-j * 26} r={44 - j * 3} fill={wr.aksen} opacity={0.1 + 0.04 * (3 - j)} />
            ))}
            <circle r={44} fill="url(#o4-isi-emas)" filter="url(#sr-glow)" />
            <circle r={34} fill="none" stroke="#1A1206" strokeWidth={2.5} strokeDasharray="3 4" opacity={0.6} />
            <text x={0} y={11} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill="#1A1206">
              B2
            </text>
          </G>
        ) : null}
        {/* debu emas terlontar dari titik hentak */}
        {Array.from({ length: 16 }, (_, i) => {
          const u = prog(k, hentak, 0.8);
          if (u <= 0 || u >= 1) return null;
          const ang = (i / 16) * Math.PI * 2 + random(`d${i}`) * 0.4;
          const jr = 50 + (60 + 160 * random(`dr${i}`)) * u;
          return <circle key={i} cx={sx + Math.cos(ang) * jr} cy={sy + Math.sin(ang) * jr * 0.7 + 60 * u * u} r={3 + 3 * random(`ds${i}`)}
            fill={wr.aksen2} opacity={1 - u} />;
        })}
        {retak > 0 && retak < 1 ? <circle cx={-150 + 168 * retak} cy={-125 + 250 * retak} r={30} fill="url(#o4-sinar)" /> : null}
      </G>
      <Debu k={k} seed="s1" />
    </>
  );
};

// ---------------------------------------------------------------- 2. "Anak sudah punya sertifikat … belum tentu siap studi di Jerman"
// Dua tebing di garis benang emas: anak + sertifikat di kiri, kampus Jerman di kanan. Jembatan emas memanjang
// lalu berhenti putus di tengah jurang ("belum tentu"); celah menyala + tanda tanya ("siap").
export const Otca4Jembatan: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const Y = a.garis_y ?? 600;
  const anak = tk(a, "anak", 0.15);
  const sert = tk(a, "sertifikat", 1.2);
  const jerman = tk(a, "jerman", 2.1);
  const belum = tk(a, "belum", 2.8);
  const siap = tk(a, "siap", 5.0);
  const studi = tk(a, "studi", 5.7);
  const tebing = prog(k, a.mulai + 0.15, 0.7);
  const orang = prog(k, anak, 0.6);
  const kartu = prog(k, sert, 0.5);
  const kampus = progE(k, jerman, 1.1, INOUT);
  const jembatan = progE(k, belum, 1.9, Easing.out(Easing.cubic));
  const celah = prog(k, siap, 0.5);
  const dorong = progE(k, studi, 1.2, INOUT);
  const kiriX = 320;
  const kananX = 740;
  const ujung = mix(kiriX, 610, jembatan);
  const d1 = drift(k, 0.4);
  const d2 = drift(k, 0.9);
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <G x={p.cx} y={Y} s={mix(1.16, 1.24, dorong)}>
        <G x={-p.cx} y={-Y}>
          <G x={d1.x} y={d1.y}>
            <G x={kananX + 125} y={Y - 210}>
              <Cahaya r={300} o={0.5 * kampus} />
            </G>
            {/* tebing kiri & kanan; jurang gelap di antaranya */}
            <path d={`M -20 ${Y} H ${kiriX} L ${kiriX - 40} ${Y + 260} H -20 Z`} fill="url(#o4-isi)" opacity={tebing} />
            <path d={`M ${kananX} ${Y} H 1100 V ${Y + 260} H ${kananX + 40} Z`} fill="url(#o4-isi)" opacity={tebing} />
            <path d={`M -20 ${Y} H ${kiriX} L ${kiriX - 40} ${Y + 260}`} {...garis(EMAS, T)} {...gambar(tebing)} filter="url(#sr-glow)" />
            <path d={`M 1100 ${Y} H ${kananX} L ${kananX + 40} ${Y + 260}`} {...garis(EMAS, T)} {...gambar(tebing)} filter="url(#sr-glow)" />
            <G x={kananX + 125} y={Y} s={mix(0.6, 0.95, kampus)} o={kampus}>
              <Gedung wr={wr} p={kampus} nyala={prog(k, jerman + 0.6, 0.8)} />
            </G>
          </G>
          {/* jembatan: papan emas memanjang dari tebing kiri, berhenti putus */}
          <g filter="url(#sr-glow)">
            <line x1={kiriX} y1={Y - 4} x2={ujung} y2={Y - 4} {...garis(EMAS, T)} opacity={jembatan > 0 ? 1 : 0} />
            <path d={`M ${kiriX} ${Y - 70} Q ${(kiriX + ujung) / 2} ${Y - 30} ${ujung} ${Y - 62}`} {...garis(EMAS, 3)} opacity={0.8 * Math.min(1, jembatan * 4)} />
            {Array.from({ length: 12 }, (_, i) => {
              const x = kiriX + 20 + i * 24;
              if (x > ujung - 6) return null;
              return <line key={i} x1={x} y1={Y - 4} x2={x} y2={Y - 60 + Math.abs(Math.sin(i * 0.5)) * 8} {...garis(EMAS, 2.5)} opacity={0.7} />;
            })}
            {jembatan > 0.98 ? (
              <G x={ujung - 6} y={Y + 2} r={38 + getar(t, belum + 1.9, 10, 1.5, 2.5)}>
                <rect x={0} y={-3} width={34} height={7} rx={3} fill={wr.aksen} />
              </G>
            ) : null}
          </g>
          {/* celah menyala + tanda tanya */}
          <G x={(ujung + kananX) / 2} y={Y - 30}>
            <ellipse rx={mix(40, 110, celah)} ry={mix(30, 140, celah)} fill="url(#o4-sinar)" opacity={celah} />
            <G y={-150} s={mix(0.4, 0.9, prog(k, siap, 0.6, "tegas"))} o={celah}>
              <path d="M -60 -30 Q -60 -90 0 -90 Q 60 -90 60 -38 Q 60 -4 20 10 Q 4 16 4 40" {...garis(EMAS, 12)} filter="url(#o4-bloom)"
                {...gambar(celah)} />
              <circle cx={4} cy={78} r={10} fill={wr.aksen2} opacity={Math.max(0, celah * 2 - 1)} />
            </G>
          </G>
          {/* anak + sertifikat di tebing kiri */}
          <G x={200 + d2.x} y={Y - 4 + d2.y} s={1.15} o={orang}>
            <Pelajar wr={wr} p={orang} />
            <G x={62} y={-90} s={mix(0.05, 0.3, kartu)} r={-8} o={kartu}>
              <Cahaya r={260} o={0.9} />
              <Sertifikat wr={wr} font={font} />
            </G>
          </G>
        </G>
      </G>
      <Debu k={k} seed="s2" o={0.8} />
    </>
  );
};

// ---------------------------------------------------------------- 3. "Karena sertifikat menunjukkan level bahasa yang berhasil dicapai"
// Tangga isometrik A1→C2 di atas benang emas; anak tangga menyala berurutan, sosok naik ke B2, bendera ditancap.
const LEVEL = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const Otca4Tangga: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const Y = a.garis_y ?? 690;
  const sert = tk(a, "sertifikat", 0.9);
  const level = tk(a, "level", 2.4);
  const capai = tk(a, "dicapai", 4.0);
  const bangun = prog(k, a.mulai + 0.1, 0.9);
  const kartu = prog(k, sert, 0.6);
  const lw = 132;
  const lh = 58;
  const x0 = p.cx - 3 * lw;
  const anak = (i: number) => ({ x: x0 + i * lw, y: Y - (i + 1) * lh });
  // sosok naik satu anak tangga per ketukan kecil dari "level" sampai B2 (indeks 3)
  const naik = interpolate(t, [level, capai - 0.1], [0, 3], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const i0 = Math.floor(naik);
  const fr = naik - i0;
  const pa = anak(Math.min(i0, 3));
  const pb = anak(Math.min(i0 + 1, 3));
  const lompat = Math.sin(fr * Math.PI) * 40;
  const ox = mix(pa.x, pb.x, fr) + lw / 2;
  const oy = mix(pa.y, pb.y, fr) - lompat;
  const bendera = prog(k, capai, 0.5, "tegas");
  const d1 = drift(k, 0.5);
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <G x={d1.x * 0.5} y={d1.y * 0.5}>
        <line x1={0} x2={p.W} y1={Y} y2={Y} {...garis(EMAS, T)} filter="url(#sr-glow)" opacity={0.9} />
        {LEVEL.map((nm, i) => {
          const s = anak(i);
          const muncul = prog(k, a.mulai + 0.1 + i * 0.09, 0.6);
          const nyala = i <= 3 ? prog(k, level + i * 0.32, 0.35) : 0;
          const h = Y - s.y;
          return (
            <g key={nm} opacity={muncul * bangun}>
              <rect x={s.x} y={s.y} width={lw - 8} height={h} fill="url(#o4-isi)" />
              <rect x={s.x} y={s.y} width={lw - 8} height={h} fill="url(#o4-isi-emas)" opacity={0.18 * nyala} />
              <path d={`M ${s.x} ${Y} V ${s.y} H ${s.x + lw - 8} V ${Y}`} {...garis(i <= 3 ? EMAS : wr.aksen, i <= 3 ? T : 3)}
                opacity={i <= 3 ? 0.6 + 0.4 * nyala : 0.45} {...gambar(muncul)} filter="url(#sr-glow)" />
              <path d={`M ${s.x + 14} ${s.y - 16} H ${s.x + lw + 6} L ${s.x + lw - 8} ${s.y} H ${s.x} Z`} fill={wr.aksen} opacity={0.25 + 0.5 * nyala} />
              <text x={s.x + (lw - 8) / 2} y={s.y + 52} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34}
                fill={i <= 3 ? wr.aksen2 : wr.teks} opacity={i <= 3 ? 0.55 + 0.45 * nyala : 0.35}>
                {nm}
              </text>
            </g>
          );
        })}
        {/* sertifikat kecil (kiri atas) terhubung garis putus ke anak tangga B2 */}
        <G x={x0 + 70} y={330} s={mix(0.2, 0.42, kartu)} r={-6} o={kartu}>
          <Cahaya r={300} o={0.6} />
          <Sertifikat wr={wr} font={font} />
        </G>
        <path d={`M ${x0 + 120} 360 Q ${anak(3).x - 60} ${300} ${anak(3).x + lw / 2} ${anak(3).y - 150}`} {...garis(wr.aksen2, 3)}
          strokeDasharray="4 12" opacity={prog(k, level, 0.5) * 0.8} />
      </G>
      <G x={ox} y={oy} s={0.8} o={prog(k, a.mulai + 0.4, 0.5)}>
        <Pelajar wr={wr} langkah={naik * Math.PI} />
      </G>
      <G x={anak(3).x + lw - 26} y={anak(3).y} s={0.75} o={bendera}>
        <line x1={0} y1={0} x2={0} y2={-150} {...garis("#FFFFFF", 5)} {...gambar(bendera)} />
        <path d={`M 0 -150 Q 40 ${-160 + Math.sin(t * 6) * 8} 80 -146 Q 100 -140 110 -130 Q 60 ${-118 - Math.sin(t * 6) * 8} 0 -104 Z`}
          fill="url(#o4-isi-emas)" opacity={Math.max(0, bendera * 2 - 1)} filter="url(#sr-glow)" />
        {Array.from({ length: 10 }, (_, i) => {
          const u = prog(k, capai, 0.8);
          if (u <= 0 || u >= 1) return null;
          const ang = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={50 + Math.cos(ang) * 120 * u} cy={-130 + Math.sin(ang) * 120 * u} r={5} fill={wr.aksen2} opacity={1 - u} />;
        })}
      </G>
      <Debu k={k} seed="s3" o={0.7} />
    </>
  );
};

// ---------------------------------------------------------------- 4. "Tapi belum tentu menggambarkan seberapa siap … akademik dan sehari-harinya"
// Gunung es: benang emas = permukaan air. Di atas hanya puncak bersegel (sertifikat); tubuh es raksasa sudah samar
// di bawah air. Kamera menyelam ("siap") → tubuh es menyala, kemampuan akademik (kiri) & sehari-hari (kanan) muncul.
export const Otca4GunungEs: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const Y = a.garis_y ?? 430;
  const gambarkan = tk(a, "menggambarkan", 1.6);
  const siap = tk(a, "siap", 2.8);
  const akademik = tk(a, "akademik", 6.4);
  const harian = tk(a, "harian", 7.5);
  const puncak = prog(k, a.mulai + 0.1, 0.7);
  const sinar = prog(k, gambarkan, 0.6);
  const selam = progE(k, siap, 1.4, INOUT);
  const kamY = mix(0, -205, selam);
  const tubuh = mix(0.22 * prog(k, a.mulai + 0.3, 0.8), 1, prog(k, siap + 0.2, 1.0));
  const cx = p.cx;
  const ombak = (x: number) => Math.sin(x / 60 + t * 2) * 5;
  const permukaan = Array.from({ length: 28 }, (_, i) => {
    const x = (i / 27) * (p.W + 40) - 20;
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${(Y + ombak(x)).toFixed(1)}`;
  }).join(" ");
  // tubuh es bersegi (lebar di dekat permukaan, menukik dalam) — tepi bergerigi alami, bukan poligon simetris
  const es = [[-150, 0], [-250, 60], [-300, 150], [-420, 240], [-380, 330], [-430, 420], [-300, 520], [-170, 560], [-40, 640],
    [110, 590], [240, 610], [350, 500], [420, 400], [380, 300], [430, 210], [300, 120], [250, 40], [170, 0]];
  const esD = es.map(([x, y], i) => `${i ? "L" : "M"} ${cx + x} ${Y + y}`).join(" ");
  const segi = `M ${cx - 300} ${Y + 150} L ${cx - 60} ${Y + 250} L ${cx + 300} ${Y + 120} M ${cx - 60} ${Y + 250} L ${cx - 40} ${Y + 640}
    M ${cx - 430} ${Y + 420} L ${cx - 60} ${Y + 250} L ${cx + 420} ${Y + 400} M ${cx - 170} ${Y + 560} L ${cx + 110} ${Y + 590}`;
  const kiri = [["toga", -235, 215], ["buku", -150, 345], ["gelembung", -290, 330]] as const;
  const kanan = [["tas", 150, 215], ["kereta", 285, 300], ["rumah", 165, 360]] as const;
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <defs>
        <filter id="o4-lembut" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <linearGradient id="o4-atas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#000000" stopOpacity={1} />
          <stop offset="1" stopColor="#000000" stopOpacity={0} />
        </linearGradient>
      </defs>
      <G y={kamY}>
        {/* air (bawah benang) + berkas cahaya kaustik lembut */}
        <rect x={0} y={Y} width={p.W} height={900} fill="url(#o4-air)" opacity={0.9} />
        <g filter="url(#o4-lembut)">
          {Array.from({ length: 4 }, (_, i) => (
            <path key={i} d={`M ${170 + i * 240} ${Y} L ${80 + i * 240 + Math.sin(t * 0.8 + i) * 30} ${Y + 650} L ${200 + i * 240 + Math.sin(t * 0.8 + i) * 30} ${Y + 650} L ${250 + i * 240} ${Y} Z`}
              fill="url(#o4-berkas)" opacity={0.35 + 0.15 * Math.sin(t * 1.3 + i * 2)} />
          ))}
        </g>
        <G x={cx} y={Y + 320}>
          <Cahaya r={520} o={0.25 + 0.35 * tubuh} />
        </G>
        <path d={esD + " Z"} {...garis(EMAS, T)} fill="url(#o4-isi)" fillOpacity={0.9 * tubuh} opacity={Math.min(1, 0.35 + tubuh)} filter="url(#sr-glow)" />
        <path d={segi} {...garis(wr.aksen, 2)} opacity={0.35 * tubuh} />
        {kiri.map(([j, dx, dy], i) => (
          <G key={j} x={cx + dx} y={Y + dy} s={mix(0.5, 1.05, prog(k, akademik + i * 0.18, 0.5, "tegas"))} o={prog(k, akademik + i * 0.18, 0.35)}>
            <Cahaya r={100} o={0.55} />
            <Ikon jenis={j} p={prog(k, akademik + i * 0.18, 0.6)} wr={wr} />
          </G>
        ))}
        {kanan.map(([j, dx, dy], i) => (
          <G key={j} x={cx + dx} y={Y + dy} s={mix(0.5, 1.05, prog(k, harian + i * 0.18, 0.5, "tegas"))} o={prog(k, harian + i * 0.18, 0.35)}>
            <Cahaya r={100} o={0.55} />
            <Ikon jenis={j} p={prog(k, harian + i * 0.18, 0.6)} wr={wr} />
          </G>
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const x = cx - 380 + random(`b${i}`) * 760;
          const y = Y + 650 - ((t * (40 + 30 * random(`bv${i}`)) + random(`bo${i}`) * 600) % 620);
          return <circle key={i} cx={x} cy={y} r={3 + 5 * random(`br${i}`)} {...garis(wr.aksen2, 2)} opacity={0.4 * tubuh} />;
        })}
        {/* puncak di atas air: segel sertifikat */}
        <path d={`M ${cx - 150} ${Y} L ${cx - 70} ${Y - 110} L ${cx - 20} ${Y - 190} L ${cx + 40} ${Y - 150} L ${cx + 110} ${Y - 70} L ${cx + 170} ${Y}`}
          {...garis(EMAS, T)} fill="url(#o4-isi)" {...gambar(puncak)} filter="url(#sr-glow)" />
        <path d={`M ${cx - 20} ${Y - 190} L ${cx - 5} ${Y - 60} L ${cx + 110} ${Y - 70} M ${cx - 5} ${Y - 60} L ${cx - 70} ${Y - 110}`}
          {...garis(wr.aksen, 2)} opacity={0.4 * puncak} />
        <G x={cx + 10} y={Y - 78} s={0.95 * puncak}>
          <Cahaya r={190} o={0.55 + 0.45 * sinar} />
          <circle r={44} fill="url(#o4-isi-emas)" filter="url(#sr-glow)" />
          <circle r={34} fill="none" stroke="#1A1206" strokeWidth={2.5} strokeDasharray="3 4" opacity={0.6} />
          <text x={0} y={11} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={30} fill="#1A1206">
            B2
          </text>
        </G>
        {/* permukaan air = benang emas */}
        <path d={permukaan} {...garis(EMAS, T)} filter="url(#sr-glow)" />
        <path d={permukaan} {...garis(wr.aksen2, 2)} opacity={0.5} transform="translate(0 16)" />
      </G>
      {/* saat menyelam: puncak & permukaan yang naik ke area logo dipudarkan ke hitam */}
      <rect x={0} y={0} width={p.W} height={300} fill="url(#o4-atas)" opacity={selam} />
      <Debu k={k} seed="s4" o={0.6} />
    </>
  );
};

// ---------------------------------------------------------------- 5. Perkuliahan: dosen, materi, diskusi, bertanya, pendapat, jelas
// Ruang kuliah 2.5D dilihat dari belakang deret kursi: mahasiswa = siluet gelap ber-rim emas (disinari papan),
// kamera dolly pelan; tiap kata menyalakan satu elemen di ruang yang sama — bukan ikon lepas.
export const Otca4Kuliah: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const kuliah = tk(a, "kuliah", 0.3);
  const dosen = tk(a, "dosen", 3.1);
  const materi = tk(a, "materi", 4.7);
  const diskusi = tk(a, "diskusi", 5.8);
  const tanya = tk(a, "tanya", 7.0);
  const pendapat = tk(a, "pendapat", 8.9);
  const jelas = tk(a, "jelas", 10.4);
  const ruang = prog(k, kuliah, 1.0);
  const dolly = progE(k, a.mulai, Math.max(1, a.selesai - a.mulai), INOUT);
  const cx = p.cx;
  const terang = 0.8 + 0.2 * prog(k, jelas, 0.4);
  const deret = [
    { y: 600, rx: 260, n: 5, s: 0.82 },
    { y: 680, rx: 360, n: 6, s: 0.95 },
    { y: 770, rx: 470, n: 7, s: 1.1 },
  ];
  const kursi = (r: number, i: number) => {
    const d = deret[r];
    const u = (i + 0.5) / d.n;
    const ang = mix(-0.8, 0.8, u);
    return { x: cx + Math.sin(ang) * d.rx, y: d.y - Math.cos(ang) * 34 + 34, s: d.s };
  };
  const gel = (t0: number, n = 3) =>
    t < t0 ? [] : Array.from({ length: n }, (_, i) => ({ u: ((t - t0) * 0.9 + i / n) % 1, i }));
  const pembicara = kursi(1, 4);
  const penanya = kursi(0, 1);
  const berdiri = prog(k, pendapat, 0.6, "tegas");
  const papanNyala = prog(k, materi, 0.6);
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <defs>
        <linearGradient id="o4-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wr.aksen2} />
          <stop offset="0.35" stopColor={wr.aksen} />
          <stop offset="0.75" stopColor={wr.aksen} stopOpacity={0} />
        </linearGradient>
      </defs>
      <G x={cx} y={480} s={mix(1.04, 1.13, dolly)}>
        <G x={-cx} y={-480} o={terang}>
          {/* lantai & dinding perspektif */}
          <path d={`M 20 860 L 230 470 H 850 L 1060 860`} {...garis(wr.aksen, 2)} opacity={0.28 * ruang} />
          <path d={`M 230 470 V 250 M 850 470 V 250`} {...garis(wr.aksen, 2)} opacity={0.18 * ruang} />
          {/* papan */}
          <G x={cx + 60} y={370}>
            <Cahaya r={380} o={0.3 + 0.45 * papanNyala} />
            <rect x={-240} y={-100} width={480} height={190} rx={12} {...garis(EMAS, T)} fill="url(#o4-isi)" {...gambar(ruang)} filter="url(#sr-glow)" />
            {[0, 1, 2, 3].map((i) => {
              const u = prog(k, materi + i * 0.12, 0.45, "tegas");
              const h = [50, 90, 70, 120][i];
              return <rect key={i} x={-190 + i * 52} y={60 - h * u} width={34} height={h * u} rx={4} fill="url(#o4-isi-emas)" opacity={0.9} />;
            })}
            <path d="M 30 40 L 80 0 L 130 20 L 200 -50" {...garis(wr.aksen2, 5)} {...gambar(prog(k, materi + 0.3, 0.7))} filter="url(#sr-glow)" />
            <path d="M 30 -60 H 120 M 30 -36 H 90" {...garis(wr.teks, 4)} opacity={0.5} {...gambar(prog(k, materi + 0.15, 0.5))} />
          </G>
          {/* dosen berdiri di kiri papan + gelombang suara */}
          <G x={cx - 300} y={575} s={1.05} o={prog(k, dosen - 0.5, 0.5)}>
            <G y={-150}>
              <Cahaya r={170} o={0.5} />
            </G>
            <Orang wr={wr} stroke={EMAS} p={prog(k, dosen - 0.5, 0.7)} langkah={0} isi="#0B0803" />
            {gel(dosen).map(({ u, i }) => (
              <path key={i} d={`M ${40 + u * 110} -190 Q ${70 + u * 140} -140 ${40 + u * 110} -90`} {...garis(wr.aksen2, 5)} opacity={(1 - u) * 0.9} />
            ))}
          </G>
          {/* deret kursi: siluet mahasiswa dari belakang, rim emas dari cahaya papan */}
          {deret.map((d, r) => (
            <g key={r}>
              {Array.from({ length: d.n }, (_, i) => {
                const s = kursi(r, i);
                const ada = prog(k, kuliah + 0.25 + r * 0.12 + i * 0.04, 0.4);
                const angkat = r === 1 && i === 4 ? berdiri * 52 : 0;
                return (
                  <g key={i} opacity={ada} transform={`translate(${s.x} ${s.y - angkat}) scale(${s.s})`}>
                    <path d="M -34 10 Q -34 -34 0 -34 Q 34 -34 34 10 Z" fill="#070502" stroke="url(#o4-rim)" strokeWidth={3.5} />
                    <circle cx={0} cy={-56} r={21} fill="#070502" stroke="url(#o4-rim)" strokeWidth={3.5} />
                  </g>
                );
              })}
              <path d={`M ${cx - d.rx - 40} ${d.y + 44} Q ${cx} ${d.y - 30} ${cx + d.rx + 40} ${d.y + 44}`} {...garis(EMAS, 5)}
                {...gambar(prog(k, kuliah + r * 0.15, 0.8))} opacity={0.85} filter="url(#sr-glow)" />
            </g>
          ))}
          {/* diskusi: dua gelembung bergantian di antara kursi */}
          {[kursi(0, 0), kursi(0, 3)].map((s, i) => {
            const u = prog(k, diskusi + i * 0.35, 0.4, "tegas");
            return (
              <G key={i} x={s.x + (i ? 50 : -10)} y={s.y - 130} s={0.85 * u} o={u}>
                <Ikon jenis="gelembung" p={u} wr={wr} />
              </G>
            );
          })}
          {/* bertanya: tangan terangkat + tanda tanya */}
          <G x={penanya.x + 46} y={penanya.y - 112} s={0.8 * prog(k, tanya, 0.45, "tegas")} o={prog(k, tanya, 0.3)}>
            <Ikon jenis="tangan" p={prog(k, tanya, 0.6)} wr={wr} />
            <path d="M 50 -90 Q 50 -116 72 -116 Q 94 -116 94 -96 Q 94 -82 78 -76 Q 72 -72 72 -62" {...garis(wr.aksen2, 6)}
              {...gambar(prog(k, tanya + 0.25, 0.4))} />
            <circle cx={72} cy={-46} r={4} fill={wr.aksen2} opacity={prog(k, tanya + 0.5, 0.2)} />
          </G>
          {/* menyampaikan pendapat: berdiri disorot, mik + gelombang ke papan */}
          <G x={pembicara.x} y={pembicara.y - 52 * berdiri} o={berdiri}>
            <path d="M -50 -300 L 50 -300 L 100 40 L -100 40 Z" fill="url(#o4-berkas)" opacity={0.4} />
            <G y={-80}>
              <Cahaya r={150} o={0.7} />
            </G>
            <G x={40} y={-60} s={0.5}>
              <Ikon jenis="mik" p={berdiri} wr={wr} />
            </G>
            {gel(pendapat + 0.3).map(({ u, i }) => (
              <path key={i} d={`M ${30 + u * 70} ${-110 - u * 80} Q ${70 + u * 90} ${-80 - u * 70} ${60 + u * 100} ${-30 - u * 60}`}
                {...garis(wr.aksen2, 4)} opacity={(1 - u) * 0.85} />
            ))}
          </G>
          {/* jelas: cincin kejernihan dari pembicara */}
          {[0, 0.25].map((dl, i) => {
            const u = prog(k, jelas + dl, 0.9);
            return u > 0 && u < 1 ? (
              <ellipse key={i} cx={pembicara.x} cy={pembicara.y - 100} rx={40 + 420 * u} ry={20 + 160 * u} {...garis(wr.aksen2, 5 * (1 - u))} opacity={1 - u} />
            ) : null;
          })}
        </G>
      </G>
      <Debu k={k} seed="s5" o={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 6. "Jadi, jangan hanya fokus pada level sertifikat"
// Jendela bidik kamera: sertifikat tajam di depan, sosok anak buram di belakang. "fokus" → rack focus:
// sertifikat buram & meredup, anak menjadi tajam dan bercahaya; braket bidik pindah ke anak.
export const Otca4Fokus: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const jadi = tk(a, "jadi", 0.15);
  const fokus = tk(a, "fokus", 1.5);
  const masuk = prog(k, jadi, 0.35, "tegas");
  const rak = progE(k, fokus, 0.9, INOUT);
  const blurS = mix(0, 9, rak);
  const blurO = mix(9, 0, rak);
  const cx = p.cx;
  const kotak = (x: number, y: number, w: number, h: number) => {
    const L = 46;
    return `M ${x} ${y + L} V ${y} H ${x + L} M ${x + w - L} ${y} H ${x + w} V ${y + L} M ${x + w} ${y + h - L} V ${y + h} H ${x + w - L} M ${x + L} ${y + h} H ${x} V ${y + h - L}`;
  };
  const bx = mix(cx - 250, cx - 140, rak);
  const by = mix(400, 270, rak);
  const bw = mix(500, 280, rak);
  const bh = mix(330, 470, rak);
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <defs>
        <filter id="o4-rak-s" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={blurS} />
        </filter>
        <filter id="o4-rak-o" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blurO} />
        </filter>
      </defs>
      {/* sosok anak (jauh) */}
      <G x={cx} y={730} s={mix(1.55, 1.75, rak)}>
        <G y={-150}>
          <Cahaya r={260} o={mix(0.15, 0.9, rak)} />
        </G>
        <g filter="url(#o4-rak-o)" opacity={mix(0.4, 1, rak)}>
          <Pelajar wr={wr} />
        </g>
      </G>
      {/* sertifikat (dekat) */}
      <G x={cx + mix(0, 150, rak)} y={mix(560, 640, rak)} s={mix(1.2, 0.95, rak) * mix(0.9, 1, masuk)} r={mix(-3, 8, rak)}>
        <g filter="url(#o4-rak-s)" opacity={mix(1, 0.3, rak)}>
          <Sertifikat wr={wr} font={font} />
        </g>
      </G>
      {/* braket bidik + titik fokus */}
      <g opacity={masuk} filter="url(#sr-glow)">
        <path d={kotak(bx, by, bw, bh)} {...garis(EMAS, T)} />
        <circle cx={bx + bw / 2} cy={by + bh / 2} r={10} fill="none" stroke={wr.aksen2} strokeWidth={3} opacity={0.8} />
        <path d={`M ${bx + bw / 2 - 24} ${by + bh / 2} H ${bx + bw / 2 - 14} M ${bx + bw / 2 + 14} ${by + bh / 2} H ${bx + bw / 2 + 24}`}
          {...garis(wr.aksen2, 3)} />
      </g>
      {/* skala fokus di bawah bingkai */}
      <g opacity={masuk * 0.8}>
        {Array.from({ length: 21 }, (_, i) => {
          const x = cx - 250 + i * 25 - ((rak * 125) % 25);
          return <line key={i} x1={x} x2={x} y1={772} y2={i % 5 === 0 ? 752 : 762} {...garis(wr.aksen, 2.5)} />;
        })}
        <path d={`M ${cx} 790 l -9 14 h 18 Z`} fill={wr.aksen2} />
      </g>
      <circle cx={cx + 300} cy={300} r={8} fill={wr.aksen} opacity={masuk * (Math.sin(t * 6) > 0 ? 1 : 0.35)} />
    </>
  );
};

// ---------------------------------------------------------------- 7. "Perhatikan … mendengar, berbicara, menulis, membaca … seimbang … digunakan"
// Radar 4 sumbu diagonal (lebih pendek vertikal → aman dari logo & pita gradasi): ikon tiap kemampuan di ujung
// sumbu; poligon tumbuh timpang per kata, lalu seimbang ("seimbang") dan berdenyut + centang ("digunakan").
export const Otca4Radar: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const mulai = tk(a, "perhatikan", 0.2);
  const kemampuan = tk(a, "kemampuan", 1.6);
  const waktu = [tk(a, "dengar", 2.1), tk(a, "bicara", 3.0), tk(a, "tulis", 3.8), tk(a, "baca", 5.0)];
  const seimbang = tk(a, "seimbang", 6.2);
  const guna = tk(a, "digunakan", 7.9);
  const cx = p.cx;
  const cy = 500;
  const R = 215;
  const grid = prog(k, mulai, 0.8);
  const timpang = [0.42, 0.3, 0.88, 0.75];
  const imb = prog(k, seimbang, 0.7, "tegas");
  const nilai = timpang.map((v, i) => mix(mix(0.12, v, prog(k, waktu[i], 0.5, "tegas")) * prog(k, kemampuan, 0.4), 0.92, imb));
  const h = Math.SQRT1_2;
  const arah = [[-h, -h], [h, -h], [h, h], [-h, h]]; // dengar (kiri atas), bicara (kanan atas), tulis (kanan bawah), baca (kiri bawah)
  const pts = nilai.map((v, i) => [cx + arah[i][0] * R * v, cy + arah[i][1] * R * v]);
  const poli = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
  const kotak = (f: number) => arah.map(([dx, dy], i) => `${i ? "L" : "M"} ${cx + dx * R * f} ${cy + dy * R * f}`).join(" ") + " Z";
  const ikon = ["telinga", "bicara", "pena", "buku"];
  const denyut = t > guna ? 0.5 + 0.5 * Math.cos((t - guna) * 5) : 0;
  const centang = prog(k, guna, 0.5, "tegas");
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <G x={cx} y={cy}>
        <Cahaya r={400} o={0.35 + 0.35 * imb} />
      </G>
      {[0.33, 0.66, 1].map((f, i) => (
        <path key={f} d={kotak(f)} {...garis(wr.aksen, i === 2 ? 3 : 2)} opacity={0.45} {...gambar(prog(k, mulai + i * 0.12, 0.7))} />
      ))}
      {arah.map(([dx, dy], i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + dx * R * grid} y2={cy + dy * R * grid} {...garis(wr.aksen, 2)} opacity={0.5} />
      ))}
      <path d={poli} {...garis(EMAS, T)} fill="url(#o4-isi-emas)" fillOpacity={0.22 + 0.2 * imb + 0.15 * denyut} filter="url(#sr-glow)"
        opacity={prog(k, kemampuan, 0.4)} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={10} fill={wr.aksen2} opacity={prog(k, kemampuan, 0.4)} filter="url(#sr-glow)" />
      ))}
      {ikon.map((j, i) => {
        const u = prog(k, waktu[i] - 0.1, 0.45, "tegas");
        const x = cx + arah[i][0] * (R + 120) * 1.18;
        const y = cy + arah[i][1] * (R + 70);
        return (
          <G key={j} x={x} y={y} s={mix(0.5, 0.95, u) * (1 + 0.08 * denyut)} o={0.3 + 0.7 * u}>
            <circle r={62} {...garis(EMAS, 4)} fill="url(#o4-isi)" opacity={0.95} />
            <Ikon jenis={j} p={u} wr={wr} lebar={5} />
          </G>
        );
      })}
      {[0, 0.2].map((d, i) => {
        const u = prog(k, seimbang + d, 0.9);
        return u > 0 && u < 1 ? <path key={i} d={kotak(0.92 + u * 0.55)} {...garis(wr.aksen2, 5 * (1 - u))} opacity={1 - u} /> : null;
      })}
      <G x={cx} y={cy} s={mix(0.4, 0.8, centang)} o={centang}>
        <circle r={56} fill="url(#o4-isi-emas)" filter="url(#o4-bloom)" />
        <path d="M -24 2 L -6 20 L 28 -18" {...garis("#1A1206", 10)} {...gambar(prog(k, guna + 0.15, 0.4))} />
      </G>
      <Debu k={k} seed="s7" o={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 8. "… bukan hanya bukti level bahasa, tapi kemampuan yang benar-benar terpakai"
// Sertifikat (bukti) meredup jadi kertas biasa, lalu terlipat bertahap (sudut atas melipat ke tengah → dart) menjadi
// pesawat kertas emas ("kemampuan") yang meluncur ("terpakai") ke Jakarta = titik awal peta adegan berikut (match cut).
const KERTAS: [number, number][] = [[0, -125], [180, -125], [180, 125], [0, 125], [-180, 125], [-180, -125]];
const LIPAT1: [number, number][] = [[0, -150], [150, -20], [150, 125], [0, 125], [-150, 125], [-150, -20]];
const morf = (u: number): [number, number][] => {
  const urut = [0, 5, 2, 3, 4, 1]; // KERTAS → titik DART yang bersesuaian (hidung, sayap kanan, badan, ekor, badan, sayap kiri)
  const dart = urut.map((j) => DART[j]);
  return KERTAS.map(([x, y], i) => {
    if (u < 0.5) {
      const v = u / 0.5;
      return [mix(x, LIPAT1[i][0], v), mix(y, LIPAT1[i][1], v)];
    }
    const v = (u - 0.5) / 0.5;
    return [mix(LIPAT1[i][0], dart[i][0], v), mix(LIPAT1[i][1], dart[i][1], v)];
  });
};
export const Otca4Origami: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const bukti = tk(a, "bukti", 2.7);
  const tapi = tk(a, "tapi", 4.1);
  const pakai = tk(a, "terpakai", 5.8);
  const muncul = prog(k, a.mulai + 0.1, 0.6);
  const redup = prog(k, bukti, 0.6);
  const lipat = progE(k, tapi, 1.4, INOUT);
  const luncur = progE(k, pakai, Math.max(0.4, a.selesai - pakai), Easing.inOut(Easing.cubic));
  const cx = p.cx;
  const cy = 500;
  const [tx, ty] = JAKARTA;
  const kx = cx - 260;
  const ky = cy - 260;
  const bz = (u: number): [number, number] => [
    (1 - u) * (1 - u) * cx + 2 * (1 - u) * u * kx + u * u * tx,
    (1 - u) * (1 - u) * cy + 2 * (1 - u) * u * ky + u * u * ty,
  ];
  const [px, py] = bz(luncur);
  const [qx, qy] = bz(Math.min(1, luncur + 0.02));
  const arahTerbang = luncur > 0 ? (Math.atan2(qy - py, qx - px) * 180) / Math.PI + 90 : 0;
  const skala = mix(1, 0.3, luncur) * mix(0.92, 1, muncul);
  const poli = morf(lipat).map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
  const jejak = Array.from({ length: 30 }, (_, i) => bz((i / 29) * luncur));
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <G x={cx} y={cy}>
        <Cahaya r={420} o={0.3 + 0.4 * lipat * (1 - luncur)} />
      </G>
      {luncur > 0 ? (
        <polyline points={jejak.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} {...garis(wr.aksen2, 4)} strokeDasharray="2 14" opacity={0.85} />
      ) : null}
      <G x={px} y={py} s={skala} r={mix(0, -20, lipat) * (1 - luncur) + arahTerbang}>
        {lipat < 0.02 ? (
          <Sertifikat wr={wr} font={font} p={muncul} redup={redup} />
        ) : lipat < 0.98 ? (
          <g filter="url(#sr-glow)">
            <path d={poli} {...garis(lipat > 0.5 ? EMAS : wr.teks, mix(4, T, lipat))} fill={lipat > 0.6 ? "url(#o4-isi-emas)" : "url(#o4-isi)"}
              fillOpacity={lipat > 0.6 ? mix(0, 1, (lipat - 0.6) / 0.4) : 0.8} />
            <path d={`M 0 ${mix(-125, -170, lipat)} L 0 ${mix(125, 124, lipat)}`} {...garis(wr.aksen2, 3)} opacity={Math.min(1, lipat * 2)} />
            {lipat < 0.5 ? (
              <path d={`M ${mix(-180, -150, lipat * 2)} ${mix(-125, -20, lipat * 2)} L 0 ${mix(-125, -150, lipat * 2)} L ${mix(180, 150, lipat * 2)} ${mix(-125, -20, lipat * 2)}`}
                {...garis(wr.aksen2, 2.5)} opacity={lipat * 2} strokeDasharray="6 8" />
            ) : null}
          </g>
        ) : (
          <PesawatKertas wr={wr} />
        )}
      </G>
      {Array.from({ length: 12 }, (_, i) => {
        const u = prog(k, tapi + 1.35, 0.7);
        if (u <= 0 || u >= 1) return null;
        const ang = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(ang) * 180 * u} cy={cy + Math.sin(ang) * 180 * u} r={5} fill={wr.aksen2} opacity={1 - u} />;
      })}
      <Debu k={k} seed="s8" o={0.6} />
    </>
  );
};

// ---------------------------------------------------------------- 9. "Klik link di bio dan siapkan bahasa Jerman anak …"
// Peta titik dunia (Natural Earth): pesawat emas terbang dari Jakarta ke Berlin di busur putus-putus,
// kontur Jerman menyala + pin berdenyut saat "Jerman".
const busur = (u: number): [number, number] => {
  const [x0, y0] = JAKARTA;
  const [x1, y1] = BERLIN;
  const kx = (x0 + x1) / 2 + 40;
  const ky = Math.min(y0, y1) - 210;
  const v = 1 - u;
  return [v * v * x0 + 2 * v * u * kx + u * u * x1, v * v * y0 + 2 * v * u * ky + u * u * y1];
};
export const Otca4Rute: React.FC<PropsAdegan> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const jerman = tk(a, "jerman", 2.2);
  const peta = prog(k, a.mulai, 0.9);
  const terbang = progE(k, a.mulai + 0.1, Math.max(0.5, jerman - a.mulai - 0.1), Easing.inOut(Easing.cubic));
  const nyala = prog(k, jerman, 0.6);
  const [jx, jy] = JAKARTA;
  const [px, py] = busur(terbang);
  const [qx, qy] = busur(Math.min(1, terbang + 0.01));
  const arahP = (Math.atan2(qy - py, qx - px) * 180) / Math.PI;
  const jejak = Array.from({ length: 40 }, (_, i) => busur((i / 39) * terbang));
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <g>
        {TITIK_DARAT.map(([x, y], i) => {
          const d = Math.hypot(x - jx, y - jy);
          const o = interpolate(peta * 1300 - d, [0, 200], [0, 1], clamp);
          return <circle key={i} cx={x} cy={y} r={2.8} fill={wr.aksen} opacity={0.45 * o} />;
        })}
      </g>
      <path d={INDONESIA} fill={wr.aksen} fillOpacity={0.18 * peta} stroke={wr.aksen} strokeWidth={1.5} strokeOpacity={0.6 * peta} />
      <G x={BERLIN[0]} y={BERLIN[1]}>
        <Cahaya r={mix(60, 200, nyala)} o={0.3 + 0.7 * nyala} />
      </G>
      <path d={JERMAN} fill="url(#o4-isi-emas)" fillOpacity={mix(0.15, 0.9, nyala)} stroke={wr.aksen2} strokeWidth={mix(1.5, 3, nyala)}
        filter="url(#sr-glow)" opacity={0.5 + 0.5 * peta} />
      <polyline points={jejak.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} {...garis(wr.aksen2, 4)} strokeDasharray="2 12" />
      <circle cx={jx} cy={jy} r={9} fill={wr.aksen2} filter="url(#sr-glow)" opacity={peta} />
      {[0, 0.4].map((d, i) => {
        const u = ((t - jerman - d) % 1.6) / 1.6;
        return t > jerman + d ? (
          <circle key={i} cx={BERLIN[0]} cy={BERLIN[1]} r={10 + 70 * u} {...garis(wr.aksen2, 4 * (1 - u))} opacity={1 - u} />
        ) : null;
      })}
      <G x={BERLIN[0]} y={BERLIN[1] - 4} s={prog(k, jerman, 0.4, "tegas")}>
        <path d="M 0 0 C -20 -26 -26 -36 -26 -50 A 26 26 0 1 1 26 -50 C 26 -36 20 -26 0 0 Z" fill="url(#o4-isi-emas)" filter="url(#sr-glow)" />
        <circle cy={-50} r={9} fill="#1A1206" />
      </G>
      {terbang < 0.99 ? (
        <G x={px} y={py} r={arahP + 90} s={0.3 * mix(1, 0.85, terbang)}>
          <PesawatKertas wr={wr} />
        </G>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 10. Kartu akhir: logo besar + benang emas + CTA
// Jejak rute meluruskan diri jadi benang emas di bawah logo (logo glow besar, kilau melintas) + "Klik link di bio".
export const Otca4Akhir: React.FC<PropsAdegan> = ({ k, wr, font }) => {
  const { a, p } = k;
  const t = detik(k);
  const m = prog(k, a.mulai, 0.7);
  const garisP = progE(k, a.mulai + 0.15, 0.8, INOUT);
  const cta = prog(k, a.mulai + 0.7, 0.5, "tegas");
  const sapu = prog(k, a.mulai + 0.4, 1.2);
  const cx = p.cx;
  const logo = a.teks?.logo ? staticFile(a.teks.logo) : "";
  const lw = 660;
  const lh = lw * (504 / 1897);
  const ly = 330;
  return (
    <>
      <EmasDefs k={k} wr={wr} />
      <defs>
        <linearGradient id="o4-sapu" gradientUnits="userSpaceOnUse" x1={mix(cx - 600, cx + 600, sapu) - 120} y1={0} x2={mix(cx - 600, cx + 600, sapu) + 120} y2={-60}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.85} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
        <mask id="o4-logo-mask">
          {logo ? <image href={logo} x={cx - lw / 2} y={ly} width={lw} height={lh} /> : null}
        </mask>
      </defs>
      <G x={cx} y={ly + lh / 2}>
        <Cahaya r={520} o={0.7 * m} />
      </G>
      {logo ? (
        <g opacity={m} transform={`translate(${cx} ${ly + lh / 2}) scale(${mix(0.92, 1, m)}) translate(${-cx} ${-(ly + lh / 2)})`}>
          <image href={logo} x={cx - lw / 2} y={ly} width={lw} height={lh} filter="url(#o4-bloom)" opacity={0.5} />
          <image href={logo} x={cx - lw / 2} y={ly} width={lw} height={lh} />
          <rect x={cx - lw / 2} y={ly} width={lw} height={lh} fill="url(#o4-sapu)" mask="url(#o4-logo-mask)" />
        </g>
      ) : null}
      {/* benang emas brand di bawah logo */}
      <rect x={cx - 330 * garisP} y={ly + lh + 44} width={660 * garisP} height={T} rx={3.5} fill="url(#o4-isi-emas)" filter="url(#sr-glow)" />
      <G x={cx} y={ly + lh + 150} s={mix(0.85, 1, cta)} o={cta}>
        <rect x={-260} y={-44} width={520} height={88} rx={44} {...garis(EMAS, 4)} fill="url(#o4-isi)" />
        <text x={-14} y={15} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill={wr.teks} letterSpacing={0.5}>
          {a.teks?.cta ?? "Klik link di bio"}
        </text>
        <G x={196} y={2 + Math.sin(t * 5) * 5}>
          <path d="M -14 -8 L 0 6 L 14 -8" {...garis(wr.aksen2, 6)} />
        </G>
      </G>
      <Debu k={k} seed="s10" o={0.8} />
    </>
  );
};

export const PUSTAKA_OTCA4: Record<string, React.FC<PropsAdegan>> = {
  "otca4-segel": Otca4Segel,
  "otca4-jembatan": Otca4Jembatan,
  "otca4-tangga": Otca4Tangga,
  "otca4-gunung-es": Otca4GunungEs,
  "otca4-kuliah": Otca4Kuliah,
  "otca4-fokus": Otca4Fokus,
  "otca4-radar": Otca4Radar,
  "otca4-origami": Otca4Origami,
  "otca4-rute": Otca4Rute,
  "otca4-akhir": Otca4Akhir,
};

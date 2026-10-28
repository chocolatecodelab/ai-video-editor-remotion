// Ikon garis untuk pustaka adegan split-layout. Koordinat lokal berpusat (0,0); warna dari token (prop `w`),
// garis tebal seragam + cahaya (filter #sr-glow) agar satu bahasa visual di semua adegan.

import React from "react";
import { Tokens, rgba, warna } from "../lib/kontrak";
import { gambar, mix } from "./alat";

export const TEBAL = 6;

export type Warna = { aksen: string; aksen2: string; teks: string; panel: string; garis: string; latar: string; bahaya: string };

export const ambilWarna = (t: Tokens): Warna => ({
  aksen: warna(t, "aksen"),
  aksen2: warna(t, "aksen-2"),
  teks: warna(t, "teks-utama"),
  panel: warna(t, "panel"),
  garis: rgba(warna(t, "garis-panel"), Number(t.warna["garis-opasitas"])),
  latar: warna(t, "latar"),
  bahaya: warna(t, "peringatan"),
});

export const garis = (stroke: string, lebar = TEBAL) => ({
  fill: "none",
  stroke,
  strokeWidth: lebar,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** Grup ber-transform: posisi, skala, rotasi (derajat), opasitas. */
export const G: React.FC<{ x?: number; y?: number; s?: number; r?: number; o?: number; children: React.ReactNode }> = ({
  x = 0, y = 0, s = 1, r = 0, o = 1, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${Math.max(s, 0.0001)})`} opacity={o}>
    {children}
  </g>
);

/** Lingkaran cahaya radial (gradien global #sr-cahaya / #sr-cahaya2). */
export const Cahaya: React.FC<{ r: number; o?: number; ungu?: boolean }> = ({ r, o = 1, ungu }) => (
  <circle r={r} fill={`url(#${ungu ? "sr-cahaya2" : "sr-cahaya"})`} opacity={o} />
);

/** Gradien kilau (light sweep) userSpaceOnUse: pita terang melintas dari kiri ke kanan selama p 0→1. */
export const KilauDef: React.FC<{ id: string; w: Warna; p: number; x0: number; x1: number; dasar?: string }> = ({
  id, w, p, x0, x1, dasar,
}) => {
  const x = mix(x0 - 160, x1 + 160, p);
  const d = dasar ?? w.aksen;
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x - 160} y1={0} x2={x + 160} y2={-60}>
      <stop offset="0" stopColor={d} />
      <stop offset="0.5" stopColor="#FFFFFF" />
      <stop offset="1" stopColor={d} />
    </linearGradient>
  );
};

/** Panel kaca (isi panel token + garis tipis + kilau tepi atas). */
export const Kaca: React.FC<{ x: number; y: number; w: number; h: number; r?: number; wr: Warna; o?: number }> = ({
  x, y, w, h, r = 28, wr, o = 0.62,
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={r} fill={wr.panel} opacity={o} />
    <rect x={x} y={y} width={w} height={h} rx={r} fill="url(#sr-kaca)" />
    <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={r} fill="none" stroke={wr.garis} strokeWidth={2} />
    <line x1={x + r} y1={y + 2} x2={x + w - r} y2={y + 2} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} />
  </g>
);

/** Sosok sederhana; kaki di (0,0), tinggi ±150. */
export const Orang: React.FC<{ wr: Warna; stroke?: string; isi?: string; p?: number; putus?: boolean }> = ({
  wr, stroke, isi, p = 1, putus,
}) => {
  const st = stroke ?? wr.aksen;
  const g = putus ? { strokeDasharray: "10 14" } : gambar(p);
  return (
    <g filter="url(#sr-glow)">
      <path d="M -46 0 L -46 -40 Q -46 -82 0 -82 Q 46 -82 46 -40 L 46 0" fillOpacity={putus ? 0 : 0.9 * p}
        {...garis(st)} fill={isi ?? wr.panel} {...g} />
      <circle cx={0} cy={-116} r={25} fillOpacity={putus ? 0 : 0.9 * p} {...garis(st)} fill={isi ?? wr.panel} {...g} />
    </g>
  );
};

/** Menara wireframe; dasar di (0,0), tinggi 470. p = dibangun dari bawah, nyala = jendela menyala. */
export const Menara: React.FC<{ wr: Warna; p: number; nyala: number; stroke?: string; id: string }> = ({
  wr, p, nyala, stroke, id,
}) => {
  const st = stroke ?? wr.aksen;
  const lantai = Array.from({ length: 7 }, (_, i) => -40 - i * 40);
  return (
    <g>
      <defs>
        <clipPath id={`${id}-klip`}>
          <rect x={-140} y={-500 * p} width={280} height={500 * p + 10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-klip)`} filter="url(#sr-glow)">
        <path d="M -110 0 V -300 L -60 -380 V -440 L 0 -470 L 60 -440 V -380 L 110 -300 V 0 Z"
          fillOpacity={0.75} {...garis(st)} fill={wr.panel} />
        {lantai.map((y, i) => (
          <line key={i} x1={-110} x2={110} y1={y} y2={y} stroke={st} strokeOpacity={0.45} strokeWidth={3} />
        ))}
        {[-55, 0, 55].map((x) => (
          <line key={x} x1={x} x2={x} y1={0} y2={-300} stroke={st} strokeOpacity={0.35} strokeWidth={3} />
        ))}
        {lantai.slice(0, 6).flatMap((y, i) =>
          [-82, -27, 27, 82].map((x, j) => {
            const k = Math.min(1, Math.max(0, nyala * 10 - ((i * 4 + j) * 7) % 10));
            return <rect key={`${i}-${j}`} x={x - 18} y={y - 30} width={36} height={22} rx={4} fill={st} opacity={0.75 * k} />;
          }),
        )}
        <line x1={0} y1={-470} x2={0} y2={-520} {...garis(st)} />
      </g>
    </g>
  );
};

/** Kerucut sorot lampu dari atas ke kolam cahaya di (0,0). */
export const Sorot: React.FC<{ o: number; lebar?: number; tinggi?: number }> = ({ o, lebar = 150, tinggi = 520 }) => (
  <g opacity={o}>
    <path d={`M -26 ${-tinggi} L 26 ${-tinggi} L ${lebar} 0 L ${-lebar} 0 Z`} fill="url(#sr-sorot)" />
    <ellipse cx={0} cy={0} rx={lebar} ry={lebar * 0.22} fill="#FFFFFF" opacity={0.18} />
  </g>
);

export const Target: React.FC<{ wr: Warna; p: number; stroke?: string }> = ({ wr, p, stroke }) => {
  const st = stroke ?? wr.aksen;
  return (
    <g filter="url(#sr-glow)">
      {[120, 80, 40].map((r, i) => (
        <circle key={r} r={r} {...garis(st, i === 0 ? TEBAL : 5)} {...gambar(Math.min(1, p * 1.6 - i * 0.25))} />
      ))}
      <circle r={12} fill={st} opacity={p} />
    </g>
  );
};

/** Ikon kecil di chip kaca: main (gamepad), pesta (balon), tidur (kasur). */
export const IkonKecil: React.FC<{ jenis: "main" | "pesta" | "tidur"; st: string }> = ({ jenis, st }) => {
  const g = garis(st, 5);
  if (jenis === "main")
    return (
      <g>
        <rect x={-42} y={-24} width={84} height={48} rx={24} {...g} />
        <path d="M -24 0 H -8 M -16 -8 V 8" {...g} />
        <circle cx={14} cy={-4} r={4} fill={st} />
        <circle cx={26} cy={6} r={4} fill={st} />
      </g>
    );
  if (jenis === "pesta")
    return (
      <g>
        <ellipse cx={0} cy={-12} rx={22} ry={28} {...g} />
        <path d="M 0 16 Q -10 30 4 44" {...g} />
      </g>
    );
  return (
    <g>
      <path d="M -44 18 V -22 M -44 6 H 44 V 22 M -34 -4 H -6 V 6" {...g} />
      <path d="M -2 -8 Q 20 -16 40 -6 V 6" {...g} />
    </g>
  );
};

export const Perisai: React.FC<{ wr: Warna; p: number; stroke?: string }> = ({ wr, p, stroke }) => (
  <g filter="url(#sr-glow)">
    <path d="M 0 -110 L 90 -75 V 0 Q 90 70 0 112 Q -90 70 -90 0 V -75 Z" fillOpacity={0.8 * p}
      {...garis(stroke ?? wr.aksen)} fill={wr.panel} {...gambar(p)} />
    <path d="M 0 -78 L 60 -54 V 0 Q 60 46 0 76" {...garis(stroke ?? wr.aksen, 4)} opacity={0.5 * p} />
  </g>
);

export const Petir: React.FC<{ warna: string; p: number }> = ({ warna: c, p }) => (
  <path d="M 14 -70 L -22 6 H 6 L -10 70 L 30 -12 H 2 Z" fill={c} opacity={p} filter="url(#sr-glow)" />
);

/** Mata; tutup 0 = terbuka, 1 = tertutup (garis lengkung + bulu mata). */
export const Mata: React.FC<{ st: string; tutup: number }> = ({ st, tutup }) => {
  const buka = 1 - tutup;
  return (
    <g filter="url(#sr-glow)">
      <g transform={`scale(1 ${Math.max(buka, 0.02)})`}>
        <path d="M -40 0 Q 0 -34 40 0 Q 0 34 -40 0 Z" {...garis(st, 5)} />
        <circle r={11} fill={st} />
      </g>
      <g opacity={tutup}>
        <path d="M -40 0 Q 0 26 40 0" {...garis(st, 5)} />
        {[-24, 0, 24].map((x) => (
          <line key={x} x1={x} y1={x === 0 ? 13 : 9} x2={x * 1.25} y2={x === 0 ? 26 : 21} {...garis(st, 4)} />
        ))}
      </g>
    </g>
  );
};

/** Lingkaran langit yang berubah: bulan 0 = matahari (dengan sinar), 1 = bulan sabit (match cut siang → malam). */
export const Langit: React.FC<{ wr: Warna; bulan: number; r?: number; sinar?: number; id: string }> = ({
  wr, bulan, r = 70, sinar = 1, id,
}) => (
  <g filter="url(#sr-glow)">
    <defs>
      <mask id={`${id}-sabit`}>
        <rect x={-r * 3} y={-r * 3} width={r * 6} height={r * 6} fill="#FFFFFF" />
        <circle cx={mix(r * 2.4, r * 0.55, bulan)} cy={mix(-r * 2, -r * 0.35, bulan)} r={r * 0.9} fill="#000000" />
      </mask>
    </defs>
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <line key={i} x1={Math.cos(a) * r * 1.3} y1={Math.sin(a) * r * 1.3} x2={Math.cos(a) * r * 1.65}
          y2={Math.sin(a) * r * 1.65} {...garis(wr.aksen, 5)} opacity={sinar * (1 - bulan)} />
      );
    })}
    <circle r={r} fill={bulan > 0.5 ? wr.teks : wr.aksen} fillOpacity={mix(0.35, 0.9, bulan)} stroke={wr.aksen}
      strokeWidth={TEBAL} mask={`url(#${id}-sabit)`} />
  </g>
);

export const Laptop: React.FC<{ wr: Warna; p: number; layar: number }> = ({ wr, p, layar }) => (
  <g filter="url(#sr-glow)">
    <rect x={-80} y={-110} width={160} height={100} rx={10} {...garis(wr.aksen)} fill={wr.panel} {...gambar(p)} />
    <rect x={-66} y={-96} width={132} height={72} rx={4} fill={wr.aksen} opacity={0.35 * layar} />
    <path d="M -104 0 H 104 L 90 -10 H -90 Z" {...garis(wr.aksen)} fill={wr.panel} {...gambar(p)} />
  </g>
);

/** Gelembung pikiran berisi tanda tanya. */
export const Tanya: React.FC<{ wr: Warna; p: number; ukuran?: number; font: string }> = ({ wr, p, ukuran = 1, font }) => (
  <g transform={`scale(${ukuran})`} filter="url(#sr-glow)">
    <path d="M -90 -40 Q -90 -100 0 -100 Q 90 -100 90 -40 Q 90 20 0 20 Q -20 20 -40 16 L -76 40 L -64 6 Q -90 -10 -90 -40 Z"
      fillOpacity={0.85} {...garis(wr.aksen2)} fill={wr.panel} {...gambar(p)} />
    <text x={0} y={-12} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={92} fill={wr.teks} opacity={p}>
      ?
    </text>
  </g>
);

/** Timbangan: tiang di (0,0)→(0,-200), balok berputar `sudut` derajat; anak kiri/kanan digantung di piring. */
export const Timbangan: React.FC<{ wr: Warna; p: number; sudut: number; kiri?: React.ReactNode; kanan?: React.ReactNode }> = ({
  wr, p, sudut, kiri, kanan,
}) => {
  const a = (sudut * Math.PI) / 180;
  const L = 190;
  const ujung = (s: number) => ({ x: Math.cos(a) * L * s, y: -200 + Math.sin(a) * L * s });
  const piring = (s: number, isi: React.ReactNode) => {
    const u = ujung(s);
    return (
      <g transform={`translate(${u.x} ${u.y})`}>
        <path d="M 0 0 L -70 110 M 0 0 L 70 110" {...garis(wr.garis, 3)} />
        <path d="M -82 110 Q 0 150 82 110 Z" {...garis(wr.aksen)} fill={wr.panel} {...gambar(p)} />
        <g transform="translate(0 112)">{isi}</g>
      </g>
    );
  };
  const k = ujung(-1);
  const n = ujung(1);
  return (
    <g filter="url(#sr-glow)">
      <path d="M -70 0 H 70 L 0 -36 Z" {...garis(wr.aksen)} fill={wr.panel} {...gambar(p)} />
      <line x1={0} y1={-36} x2={0} y2={-200} {...garis(wr.aksen)} {...gambar(p)} />
      <line x1={k.x} y1={k.y} x2={n.x} y2={n.y} {...garis(wr.aksen)} {...gambar(p)} />
      <circle cx={0} cy={-200} r={12} fill={wr.aksen} opacity={p} />
      {piring(-1, kiri)}
      {piring(1, kanan)}
    </g>
  );
};

export const Centang: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <g filter="url(#sr-glow)">
    <circle r={70} fillOpacity={0.8} {...garis(wr.aksen)} fill={wr.panel} {...gambar(Math.min(1, p * 1.5))} />
    <path d="M -32 2 L -8 26 L 36 -24" {...garis(wr.aksen, 9)} {...gambar(Math.max(0, p * 1.5 - 0.5))} />
  </g>
);

export const Bendera: React.FC<{ wr: Warna; p: number; kibar: number }> = ({ wr, p, kibar }) => (
  <g filter="url(#sr-glow)">
    <line x1={0} y1={0} x2={0} y2={-150} {...garis(wr.teks)} {...gambar(p)} />
    <path d={`M 0 -150 Q 40 ${-160 + kibar * 8} 80 -146 Q 100 -140 110 -130 Q 60 ${-118 - kibar * 8} 0 -104 Z`}
      fill={wr.aksen} opacity={Math.max(0, p * 2 - 1)} />
  </g>
);

/** Kilap bintang 4 sudut. */
export const Bintang: React.FC<{ c: string; r?: number }> = ({ c, r = 24 }) => (
  <path d={`M 0 ${-r} Q ${r * 0.18} ${-r * 0.18} ${r} 0 Q ${r * 0.18} ${r * 0.18} 0 ${r} Q ${-r * 0.18} ${r * 0.18} ${-r} 0 Q ${-r * 0.18} ${-r * 0.18} 0 ${-r} Z`}
    fill={c} filter="url(#sr-glow)" />
);

// Pustaka adegan "Accept It, Keep Moving Forward" (split-layout, konten motivasi Zar, tanpa brand).
// Bahasa visual: line art tipis bercahaya di panggung malam tinta (latar/panel token) yang perlahan menghangat jadi
// fajar amber adegan demi adegan (LangitFajar: `fajar` 0 → 1 sepanjang video); cyan (aksen-2) hanya sesekali.
// Kata kunci besar memakai font token `serif` (DM Serif Display); label kecil memakai font judul (Montserrat).
// Area konten: x 60..960, y 250..740 (pita gradasi panggung → talent mulai ±740, caption di y 895).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Bintang, Cahaya, G, Orang, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const TIPIS = 3.5;
const serif = (k: Konteks) => k.tok.font.serif?.family ?? k.tok.font.judul.family;

/** Campur dua warna hex (#RRGGBB) linear. */
const campur = (a: string, b: string, t: number) => {
  const h = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const v = [0, 1, 2].map((i) => Math.round(mix(h(a, i), h(b, i), Math.min(1, Math.max(0, t)))));
  return `#${v.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

/** Fajar adegan: naik linear dari f0 ke f1 sepanjang jendela adegan → langit menghangat terus tanpa lompatan. */
const fajarDi = (k: Konteks, f0: number, f1: number) =>
  mix(f0, f1, Math.min(1, Math.max(0, (detik(k) - k.a.mulai) / Math.max(0.1, k.a.selesai - k.a.mulai))));

/** Langit panggung malam → fajar: gradien tinta, kabut amber di cakrawala (y `hy`), bintang yang meredup saat fajar,
 *  debu cahaya ber-parallax. `tinggi` bawaan = tinggi panggung (kartu akhir layar penuh memberi 1920). */
const LangitFajar: React.FC<{ k: Konteks; wr: Warna; id: string; fajar: number; hy?: number; tinggi?: number }> = ({
  k, wr, id, fajar, hy, tinggi,
}) => {
  const { p } = k;
  const H = tinggi ?? p.tinggi;
  const y0 = hy ?? H * 0.72;
  const atas = campur(wr.latar, "#1B1A2E", fajar * 0.8);
  const t = detik(k);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={atas} />
          <stop offset="0.6" stopColor={campur(wr.panel, "#3A2A2E", fajar * 0.7)} />
          <stop offset="1" stopColor={campur(wr.panel, wr.aksen, fajar * 0.45)} />
        </linearGradient>
        <radialGradient id={`${id}-k`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={wr.bahaya} stopOpacity={0.75} />
          <stop offset="0.35" stopColor={wr.aksen} stopOpacity={0.4} />
          <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-40} y={-40} width={p.W + 80} height={H + 80} fill={`url(#${id}-l)`} />
      <ellipse cx={p.W / 2} cy={y0} rx={p.W * mix(0.5, 0.95, fajar)} ry={mix(90, 320, fajar)} fill={`url(#${id}-k)`}
        opacity={mix(0.12, 0.85, fajar)} />
      {Array.from({ length: 46 }, (_, i) => {
        const x = random(`${id}bx${i}`) * p.W;
        const y = random(`${id}by${i}`) * y0 * 0.85;
        const kedip = 0.55 + 0.45 * Math.sin(t * (1 + random(`${id}bk${i}`) * 2) + i);
        return <circle key={i} cx={x} cy={y} r={0.8 + random(`${id}br${i}`) * 1.6} fill="#FFFFFF"
          opacity={(1 - fajar) * 0.55 * kedip * (0.3 + 0.7 * random(`${id}bo${i}`))} />;
      })}
      {Array.from({ length: 22 }, (_, i) => {
        const dalam = 0.3 + random(`${id}dd${i}`) * 0.7;
        const x = ((random(`${id}dx${i}`) * p.W + t * 12 * dalam) % (p.W + 40)) - 20;
        const y = ((((random(`${id}dy${i}`) * H - t * 18 * dalam) % H) + H) % H);
        return <circle key={i} cx={x} cy={y} r={1 + dalam * 2.2} fill={campur(wr.aksen2, wr.aksen, fajar)} opacity={0.12 + 0.2 * dalam} />;
      })}
    </g>
  );
};

/** Kata besar serif: mendarat dari skala & blur (motion blur semu: dua salinan jejak) lalu diam; `kilat` 0..1 = pijar. */
const KataBesar: React.FC<{ k: Konteks; wr: Warna; t0: number; x: number; y: number; teks: string; ukuran: number;
  isi?: string; spasi?: number; o?: number }> = ({ k, wr, t0, x, y, teks, ukuran, isi, spasi = 6, o = 1 }) => {
  const u = prog(k, t0 - 0.08, 0.55, "keluar");
  const kilat = Math.exp(-Math.max(0, detik(k) - t0) / 0.35) * (u > 0 ? 1 : 0);
  const gaya = { fontFamily: serif(k), fontSize: ukuran, letterSpacing: mix(spasi + 30, spasi, u) };
  return (
    <G x={x} y={y} s={mix(1.22, 1, u)} o={u * o}>
      {[0.5, 0.25].map((a, i) => (
        <text key={i} x={0} y={(1 - u) * 60 * (i + 1)} textAnchor="middle" {...gaya} fill={wr.aksen} opacity={(1 - u) * a}>{teks}</text>
      ))}
      <text x={0} y={0} textAnchor="middle" {...gaya} fill={isi ?? wr.teks}
        style={{ filter: `drop-shadow(0 0 ${8 + 30 * kilat}px ${rgba(wr.aksen, 0.35 + 0.5 * kilat)})` }}>{teks}</text>
    </G>
  );
};

/** Label kecil berjarak huruf lebar (font judul). */
const Label: React.FC<{ x: number; y: number; teks: string; font: string; c: string; o?: number; ukuran?: number }> = ({
  x, y, teks, font, c, o = 1, ukuran = 30,
}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={ukuran} letterSpacing={8} fill={c} opacity={o}>
    {teks}
  </text>
);

/** Riak cincin (napas lega / hantaman) dari (0,0) lokal mulai `t0`. */
const Riak: React.FC<{ k: Konteks; t0: number; c: string; r1?: number; n?: number }> = ({ k, t0, c, r1 = 260, n = 2 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const u = prog(k, t0 + i * 0.18, 1.1, "keluar");
      return u > 0 && u < 1 ? <circle key={i} r={mix(24, r1, u)} {...garis(c, mix(6, 1, u))} opacity={(1 - u) * 0.85} filter="url(#sr-glow)" /> : null;
    })}
  </>
);

// S1 HOOK "peace begins when you stop wishing things": coretan gelombang gelisah (bergerak sejak frame 0) yang
//    tenang menjadi satu garis cakrawala diam; "PEACE" serif besar mendarat di kata pertama.
export const AkTenang: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const damai = tk(a, "damai", 0.8);
  const berhenti = tk(a, "berhenti", 3.1);
  const t = detik(k);
  const tenang = progE(k, berhenti - 0.4, Math.max(1, a.selesai - berhenti), INOUT);
  const cy = 580;
  const d = drift(k, 0.6);
  const N = 7;
  const garisOmbak = (i: number) => {
    const A = mix(62, 3, tenang) * (0.6 + 0.4 * Math.sin(i * 1.7));
    const off = (i - (N - 1) / 2) * 26 * (1 - tenang);
    const pts: string[] = [];
    for (let x = -20; x <= p.W + 20; x += 14) {
      const j = (random(`ak1-${i}-${Math.floor(x / 14)}-${Math.floor(t * 12)}`) - 0.5) * A * 0.5;
      const y = cy + off + A * (Math.sin(x * 0.012 + t * (2.4 + i * 0.3) + i) + 0.5 * Math.sin(x * 0.031 - t * 3.1 + i * 2)) + j;
      pts.push(`${pts.length ? "L" : "M"} ${x} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak1" fajar={fajarDi(k, 0, 0.05)} hy={cy} />
      <G x={d.x} y={d.y}>
        {Array.from({ length: N }, (_, i) => (
          <path key={i} d={garisOmbak(i)} {...garis(i === 3 ? wr.aksen : campur(wr.aksen2, wr.teks, 0.4), i === 3 ? 4 : TIPIS - 1)}
            opacity={i === 3 ? 1 : mix(0.55, 0, tenang)} filter={i === 3 ? "url(#sr-glow)" : undefined} />
        ))}
        <G x={p.W / 2} y={cy}>
          <Cahaya r={mix(120, 420, tenang)} o={0.25 + 0.6 * tenang} />
        </G>
      </G>
      <KataBesar k={k} wr={wr} t0={damai} x={p.W / 2} y={420} teks="PEACE" ukuran={190} spasi={18} />
    </>
  );
};

// S2 "were different / you can't change every situation": sosok line art mendorong batu raksasa yang tak bergeser,
//    hujan miring (cyan tipis) di dua kedalaman.
export const AkBatu: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const ubah = tk(a, "ubah", 2.6);
  const situasi = tk(a, "situasi", 3.4);
  const t = detik(k);
  const gy = 690;
  const m = prog(k, a.mulai, 0.6);
  const dorong = Math.sin(t * 9) * 0.5 + 0.5;
  const gemetar = (prog(k, ubah, 0.2) - prog(k, ubah + 0.5, 0.3)) * Math.sin(t * 60) * 3;
  const batu = Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 14) * Math.PI * 2;
    const r = 200 + (random(`ak2b${i}`) - 0.5) * 46;
    return `${i ? "L" : "M"} ${Math.cos(ang) * r * 1.08} ${Math.sin(ang) * r}`;
  }).join(" ") + " Z";
  const bx = 640;
  const d = drift(k, 0.8);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak2" fajar={fajarDi(k, 0.05, 0.1)} hy={gy} />
      {[0.4, 1].map((dl, l) => (
        <g key={l} opacity={l ? 0.5 : 0.25}>
          {Array.from({ length: 34 }, (_, i) => {
            const x0 = random(`ak2r${l}${i}`) * (p.W + 300) - 150;
            const v = 900 * (0.6 + dl);
            const y = ((random(`ak2y${l}${i}`) * 900 + t * v) % 900) - 60;
            const L = 40 + 50 * dl;
            return <line key={i} x1={x0 + y * 0.25} y1={y} x2={x0 + (y + L) * 0.25} y2={y + L} stroke={wr.aksen2} strokeWidth={1.2 + dl}
              strokeLinecap="round" />;
          })}
        </g>
      ))}
      <G x={d.x * 0.4} y={d.y * 0.4}>
        <line x1={60} x2={p.W - 60} y1={gy} y2={gy} {...garis(wr.garis, 2)} opacity={m} />
      </G>
      <G x={bx + gemetar + d.x} y={gy - 196 + d.y} o={m}>
        <path d={batu} fillOpacity={0.92} {...garis(wr.teks, TIPIS)} fill={wr.panel} {...gambar(prog(k, a.mulai, 0.9))}
          filter="url(#sr-glow)" />
        {[[-80, -60, 60, 20], [20, 40, 110, 90], [-30, 110, 40, 150]].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 12} ${(y1 + y2) / 2 - 10} ${x2} ${y2}`} {...garis(wr.teks, 2)}
            opacity={0.35 * prog(k, a.mulai + 0.4, 0.6)} />
        ))}
      </G>
      <G x={bx - 360 + d.x - dorong * 4} y={gy + d.y} r={22} s={1.55} o={prog(k, a.mulai + 0.2, 0.5)}>
        <Orang wr={wr} langkah={Math.sin(t * 4.5) * 0.6} />
      </G>
      {/* lengan mendorong: bahu sosok condong (±65, −161 dari kaki) → permukaan batu */}
      {[-10, 22].map((dy, i) => (
        <path key={i} d={`M ${bx - 295 + d.x - dorong * 4} ${gy - 161 + d.y} L ${bx - 250 + d.x} ${gy - 150 + dy + d.y} L ${bx - 214 + d.x} ${gy - 168 + dy + d.y}`}
          {...garis(wr.aksen, 8)} opacity={(i ? 0.6 : 1) * prog(k, a.mulai + 0.2, 0.5)} filter="url(#sr-glow)" />
      ))}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={bx - 520 - i * 30} x2={bx - 460 - i * 30} y1={gy - 60 - i * 34} y2={gy - 60 - i * 34}
          {...garis(wr.aksen, 3)} opacity={(0.3 + 0.5 * dorong) * prog(k, situasi - 0.6, 0.4)} />
      ))}
    </>
  );
};

// S3 "undo every mistake or make everything happen": ikon putar-mundur di kaca mencoba lalu glitch & gagal,
//    lalu simpul benang kusut mengencang.
export const AkSimpul: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const undo = tk(a, "undo", 0.15);
  const salah = tk(a, "salah", 2.1);
  const terjadi = tk(a, "terjadi", 4.7);
  const t = detik(k);
  const coba = prog(k, undo, 0.5);
  const glitch = prog(k, undo + 0.7, 0.1) * (1 - prog(k, undo + 1.5, 0.2));
  const minggir = progE(k, salah - 0.3, 0.8, INOUT);
  const ix = mix(p.W / 2, 220, minggir);
  const iy = mix(470, 330, minggir);
  const putar = Math.sin(t * 5) * 12 * (1 - glitch);
  const ikon = (c: string) => (
    <g>
      <circle r={120} fillOpacity={0.7} {...garis(c, TIPIS)} fill={wr.panel} />
      <path d="M 10 -46 L -40 0 L 10 46 Z M 62 -46 L 12 0 L 62 46 Z" fill={c} fillOpacity={0.9} transform="translate(-12 0)" />
    </g>
  );
  const kencang = progE(k, salah, Math.max(1, terjadi - salah + 0.6), INOUT);
  const gambarSimpul = prog(k, salah - 0.1, 1.4);
  const simpul = Array.from({ length: 220 }, (_, i) => {
    const u = (i / 219) * Math.PI * 6;
    const R = mix(230, 120, kencang);
    const x = Math.sin(u * 1.5 + 0.4) * R * (0.6 + 0.4 * Math.cos(u * 0.33)) + Math.sin(u * 4.1) * 26 * (1 - kencang);
    const y = Math.sin(u * 2 + t * 0.6 * (1 - kencang)) * R * 0.55 + Math.cos(u * 3.3) * 22;
    return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak3" fajar={fajarDi(k, 0.1, 0.18)} />
      <G x={ix} y={iy} s={mix(0.7, 1, coba) * mix(1, 0.6, minggir)} o={coba * mix(1, 0.45, minggir)} r={putar}>
        {glitch > 0.01 ? (
          <>
            <G x={-16 * glitch} o={0.7}>{ikon(wr.aksen2)}</G>
            <G x={14 * glitch} y={-6 * glitch} o={0.7}>{ikon(wr.aksen)}</G>
            {[0, 1, 2].map((i) => {
              const y = -100 + random(`ak3g${i}${Math.floor(t * 20)}`) * 200;
              return <rect key={i} x={-140 + (random(`ak3h${i}${Math.floor(t * 20)}`) - 0.5) * 60} y={y} width={280} height={10}
                fill={wr.teks} opacity={0.5} />;
            })}
          </>
        ) : null}
        <G o={1 - glitch * 0.6}>{ikon(wr.teks)}</G>
        <path d="M -70 -70 L 70 70" {...garis(wr.aksen, 7)} {...gambar(prog(k, undo + 1.4, 0.35))} filter="url(#sr-glow)" />
      </G>
      <G x={p.W / 2 + 90} y={540} o={prog(k, salah - 0.2, 0.5)}>
        <Cahaya r={mix(320, 180, kencang)} o={0.35} />
        <path d={simpul} {...garis(wr.aksen, mix(3, 6, kencang))} {...gambar(gambarSimpul)} filter="url(#sr-glow)" />
        <path d={`M ${-420} 40 Q -300 -20 -230 10`} {...garis(wr.aksen, 3)} opacity={0.7 * gambarSimpul} />
        <path d={`M 230 -10 Q 300 40 420 -30`} {...garis(wr.aksen, 3)} opacity={0.7 * gambarSimpul} />
      </G>
    </>
  );
};

// S4 "according to your plans, and that's okay": garis rencana lurus putus-putus membengkok menjadi jalan berliku;
//    "that's okay" = centang lembut + napas (riak) di ujung jalan.
export const AkJalur: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const rencana = tk(a, "rencana", 0.9);
  const oke = tk(a, "oke", 3.3);
  const bengkok = progE(k, rencana + 0.2, 1.4, INOUT);
  const m = prog(k, a.mulai, 0.8);
  const A = [130, 640];
  const B = [900, 330];
  const c1 = [mix(390, 520, bengkok), mix(540, 820, bengkok)];
  const c2 = [mix(650, 140, bengkok), mix(430, 150, bengkok)];
  const jalan = `M ${A[0]} ${A[1]} C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${B[0]} ${B[1]}`;
  const bez = (u: number, i: number) =>
    (1 - u) ** 3 * A[i] + 3 * (1 - u) ** 2 * u * c1[i] + 3 * (1 - u) * u * u * c2[i] + u ** 3 * B[i];
  const jalanU = progE(k, rencana + 0.6, Math.max(1, oke - rencana), INOUT) * 0.9;
  const okeU = prog(k, oke, 0.6);
  const d = drift(k, 0.7);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak4" fajar={fajarDi(k, 0.18, 0.28)} />
      <G x={d.x} y={d.y}>
        <path d={`M ${A[0]} ${A[1]} L ${B[0]} ${B[1]}`} {...garis(wr.teks, 2)} strokeDasharray="4 18" opacity={0.35 * bengkok * m} />
        <path d={jalan} {...garis(campur(wr.teks, wr.aksen, bengkok), TIPIS)} strokeDasharray="2 16" opacity={m} />
        <path d={jalan} {...garis(wr.aksen, 4)} {...gambar(jalanU / 0.9 * 0.9)} filter="url(#sr-glow)" opacity={bengkok} />
        <circle cx={A[0]} cy={A[1]} r={14} fill={wr.teks} opacity={m} />
        <G x={B[0]} y={B[1]} o={m}>
          <Cahaya r={140} o={0.4 + 0.5 * okeU} />
          <circle r={26} {...garis(wr.aksen, TIPIS)} />
          <circle r={8} fill={wr.aksen} />
        </G>
        <G x={bez(jalanU, 0)} y={bez(jalanU, 1)} o={bengkok}>
          <circle r={12} fill={wr.bahaya} filter="url(#sr-glow)" />
        </G>
        <G x={B[0] - 150} y={B[1] + 150} s={mix(0.7, 1, okeU)} o={okeU}>
          <Riak k={k} t0={oke} c={wr.bahaya} r1={220} />
          <circle r={56} fillOpacity={0.7} {...garis(wr.aksen, TIPIS)} fill={wr.panel} />
          <path d="M -24 2 L -6 20 L 26 -16" {...garis(wr.bahaya, 6)} {...gambar(prog(k, oke + 0.15, 0.5))} />
        </G>
      </G>
      <Label x={A[0] + 40} y={A[1] + 70} teks="PLAN" font={font} c={wr.teks} o={0.55 * m} ukuran={26} />
    </>
  );
};

// S5 "you (don't) have to understand everything that happens to you": tanda tanya serif melayang lalu larut
//    menjadi titik bintang yang tersambung menjadi rasi.
const RASI: [number, number][] = [[250, 360], [380, 300], [520, 380], [650, 320], [790, 400], [600, 540], [420, 560], [300, 500]];
const SAMBUNG: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 6], [6, 7], [7, 0], [2, 5], [5, 4]];
export const AkTanya: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const paham = tk(a, "paham", 1.0);
  const terjadi = tk(a, "terjadi", 2.4);
  const kadang = tk(a, "kadang", 4.4);
  const t = detik(k);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak5" fajar={fajarDi(k, 0.28, 0.38)} />
      {RASI.map(([x, y], i) => {
        const dalam = 0.4 + random(`ak5d${i}`) * 0.6;
        const muncul = prog(k, a.mulai + 0.1 + i * 0.12, 0.6);
        const larut = progE(k, terjadi - 0.2 + i * 0.1, 1.1, INOUT);
        const fx = 120 + random(`ak5x${i}`) * 820 + Math.sin(t * 0.7 + i) * 30 * dalam;
        const fy = 300 + random(`ak5y${i}`) * 380 - (t - a.mulai) * 14 * dalam + Math.cos(t * 0.9 + i) * 16;
        const ukuran = 70 + 90 * dalam;
        return (
          <G key={i}>
            <G x={mix(fx, x, larut)} y={mix(fy, y, larut)} s={mix(1, 0.15, larut)} o={muncul * (1 - larut) * (0.45 + 0.55 * dalam)}
              r={Math.sin(t + i) * 8}>
              <text x={0} y={ukuran * 0.35} textAnchor="middle" fontFamily={serif(k)} fontSize={ukuran}
                fill={i % 3 === 0 ? wr.aksen2 : wr.teks}>?</text>
            </G>
            <G x={x} y={y} o={larut}>
              <Cahaya r={40 + 30 * prog(k, kadang, 0.8)} o={0.8} />
              <Bintang c={i === 2 ? wr.bahaya : wr.aksen} r={i === 2 ? 18 : 11} />
            </G>
          </G>
        );
      })}
      {SAMBUNG.map(([i, j], n) => {
        const [x1, y1] = RASI[i];
        const [x2, y2] = RASI[j];
        const u = prog(k, terjadi + 0.9 + n * 0.12, 0.5);
        return <line key={n} x1={x1} y1={y1} x2={mix(x1, x2, u)} y2={mix(y1, y2, u)} {...garis(wr.aksen, 2)}
          opacity={0.6 + 0.3 * prog(k, kadang, 0.6)} filter="url(#sr-glow)" />;
      })}
      <G x={RASI[2][0]} y={RASI[2][1]}>
        <Riak k={k} t0={kadang} c={wr.aksen} r1={300} />
      </G>
    </>
  );
};

/** Telapak tangan terbuka line art; pusat telapak di (0,0), tinggi ±330. */
const Telapak: React.FC<{ c: string; p: number }> = ({ c, p }) => (
  <g filter="url(#sr-glow)">
    <path d="M -70 120 Q -95 40 -86 -30 L -86 -150 Q -86 -170 -68 -170 Q -50 -170 -50 -150 L -50 -60
             M -50 -60 L -50 -205 Q -50 -225 -31 -225 Q -12 -225 -12 -205 L -12 -65
             M -12 -65 L -12 -215 Q -12 -235 8 -235 Q 28 -235 28 -215 L 28 -62
             M 28 -62 L 28 -185 Q 28 -204 47 -204 Q 66 -204 66 -185 L 66 -20
             M 66 -20 Q 82 -64 110 -78 Q 132 -86 134 -66 Q 120 -20 98 30 Q 80 90 52 120"
      {...garis(c, TIPIS)} {...gambar(p)} />
    <path d="M -70 120 L 52 120" {...garis(c, TIPIS)} {...gambar(p)} />
    <path d="M -40 40 Q 0 60 40 30" {...garis(c, 2)} opacity={0.5 * p} />
  </g>
);

// S6a CLIMAX "accept it": telapak terbuka, lingkaran menutup mengelilinginya; "ACCEPT" mendarat.
export const AkTerima: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const terima = tk(a, "terima", 0.2);
  const lingkar = progE(k, terima, 0.8, INOUT);
  const d = drift(k, 0.8);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak6a" fajar={fajarDi(k, 0.42, 0.5)} />
      <G x={p.W / 2 + d.x} y={560 + d.y}>
        <Cahaya r={mix(160, 330, lingkar)} o={0.7} />
        <circle r={210} {...garis(wr.aksen, 4)} {...gambar(lingkar)} transform="rotate(-90)" filter="url(#sr-glow)" />
        <Riak k={k} t0={terima + 0.8} c={wr.bahaya} r1={340} n={1} />
        <G s={0.62} y={20}>
          <Telapak c={wr.teks} p={prog(k, a.mulai, 0.5)} />
        </G>
      </G>
      <KataBesar k={k} wr={wr} t0={terima} x={p.W / 2} y={330} teks="ACCEPT" ukuran={150} spasi={14} />
    </>
  );
};

// S6b "learn from it": buku terbuka, halaman berbalik, bohlam menyala di atasnya; "LEARN".
export const AkBelajar: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const belajar = tk(a, "belajar", 0.12);
  const balik = progE(k, belajar + 0.15, 0.7, INOUT);
  const nyala = prog(k, belajar + 0.6, 0.4);
  const cx = p.W / 2;
  const by = 640;
  const sisi = (s: number) => `M 0 0 Q ${s * 90} -26 ${s * 190} -6 L ${s * 190} -150 Q ${s * 90} -170 0 -144 Z`;
  const halaman = Math.cos(balik * Math.PI);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak6b" fajar={fajarDi(k, 0.5, 0.58)} />
      <G x={cx} y={by}>
        <path d={sisi(-1)} fillOpacity={0.85} {...garis(wr.teks, TIPIS)} fill={wr.panel} />
        <path d={sisi(1)} fillOpacity={0.85} {...garis(wr.teks, TIPIS)} fill={wr.panel} />
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <line x1={-160} x2={-40} y1={-110 + i * 30} y2={-104 + i * 30} {...garis(wr.teks, 2)} opacity={0.35} />
            <line x1={40} x2={160} y1={-104 + i * 30} y2={-110 + i * 30} {...garis(wr.teks, 2)} opacity={0.35} />
          </React.Fragment>
        ))}
        <g transform={`scale(${halaman.toFixed(3)} 1)`}>
          <path d={sisi(1)} fillOpacity={0.95} {...garis(wr.aksen, TIPIS)} fill={campur(wr.panel, wr.aksen, 0.15)} />
        </g>
      </G>
      <G x={cx} y={by - 300}>
        <Cahaya r={mix(60, 260, nyala)} o={0.9 * nyala} />
        {Array.from({ length: 8 }, (_, i) => {
          const ang = (i / 8) * Math.PI * 2;
          return <line key={i} x1={Math.cos(ang) * 95} y1={Math.sin(ang) * 95} x2={Math.cos(ang) * mix(95, 140, nyala)}
            y2={Math.sin(ang) * mix(95, 140, nyala)} {...garis(wr.bahaya, 4)} opacity={nyala} />;
        })}
        <path d="M -26 52 Q -26 26 -44 6 Q -62 -16 -62 -42 Q -62 -96 0 -96 Q 62 -96 62 -42 Q 62 -16 44 6 Q 26 26 26 52 Z"
          fillOpacity={0.85 * nyala} {...garis(nyala > 0.5 ? wr.bahaya : wr.teks, TIPIS)} fill={wr.bahaya} filter="url(#sr-glow)" />
        <path d="M -22 68 L 22 68 M -16 82 L 16 82" {...garis(wr.teks, TIPIS)} />
      </G>
      <KataBesar k={k} wr={wr} t0={belajar} x={cx} y={250} teks="LEARN" ukuran={120} spasi={14} o={1} />
    </>
  );
};

/** Titik di jalan perspektif menuju cakrawala (u 0 = depan, 1 = cakrawala). */
const titikJalan = (u: number, cx: number, bawah: number, vy: number) => {
  const e = 1 - Math.pow(1 - u, 1.6);
  return { x: cx + Math.sin(u * 3.2) * 70 * (1 - u), y: mix(bawah, vy, e), w: mix(420, 8, e) };
};

// S6c "and keep moving forward": jalan perspektif ke cahaya cakrawala, sosok berjalan menjauh (iris dari bohlam).
export const AkMaju: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const maju = tk(a, "maju", 0.6);
  const vy = 430;
  const bawah = p.tinggi + 40;
  const cx = p.W / 2;
  const N = 40;
  const sisi = (s: number) => Array.from({ length: N + 1 }, (_, i) => {
    const q = titikJalan(i / N, cx, bawah, vy);
    return `${i ? "L" : "M"} ${q.x + (s * q.w) / 2} ${q.y}`;
  }).join(" ");
  const jalan = progE(k, a.mulai, Math.max(1, a.selesai - a.mulai + 0.4), (x) => x);
  const u = mix(0.08, 0.5, jalan);
  const o = titikJalan(u, cx, bawah, vy);
  const d = drift(k, 0.6);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak6c" fajar={fajarDi(k, 0.6, 0.66)} hy={vy} />
      <G x={cx + d.x * 0.3} y={vy}>
        <Cahaya r={mix(240, 380, prog(k, maju, 1))} o={0.95} />
        <circle r={46} fill={wr.bahaya} opacity={0.9} filter="url(#sr-glow)" />
      </G>
      <line x1={0} x2={p.W} y1={vy} y2={vy} {...garis(wr.aksen, 2)} opacity={0.6} />
      <G x={d.x} y={d.y}>
        <path d={sisi(-1)} {...garis(wr.aksen, TIPIS)} filter="url(#sr-glow)" />
        <path d={sisi(1)} {...garis(wr.aksen, TIPIS)} filter="url(#sr-glow)" />
        {Array.from({ length: 9 }, (_, i) => {
          const uu = ((i / 9 + detik(k) * 0.25) % 1) * 0.9;
          const q = titikJalan(uu, cx, bawah, vy);
          return <line key={i} x1={q.x} x2={q.x} y1={q.y} y2={q.y - mix(26, 2, uu)} {...garis(wr.teks, mix(5, 1, uu))} opacity={0.4} />;
        })}
      </G>
      <G x={o.x + d.x} y={o.y + d.y} s={mix(1.15, 0.45, Math.pow(u / 0.5, 0.8))}>
        <G y={-80}>
          <Cahaya r={150} o={0.45} />
        </G>
        <Orang wr={wr} stroke={wr.teks} langkah={(detik(k) - a.mulai) * 7.5} />
      </G>
      <KataBesar k={k} wr={wr} t0={maju} x={cx} y={300} teks="MOVING FORWARD" ukuran={96} spasi={6} />
    </>
  );
};

// S7 "making peace with reality doesn't mean giving up on your dreams": balok tanah (realita) diikat benang
//    bercahaya ke bintang (mimpi); di "giving up" benang tertarik & bergetar tapi bertahan.
export const AkBenang: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const realita = tk(a, "realita", 1.4);
  const mimpi = tk(a, "mimpi", 3.5);
  const menyerah = tk(a, "menyerah", 2.6);
  const t = detik(k);
  const m = prog(k, a.mulai, 0.6);
  const benang = prog(k, Math.min(realita + 0.4, mimpi - 0.6), 1.0);
  const tegang = (prog(k, menyerah, 0.25) - prog(k, menyerah + 0.9, 0.5));
  const getar = Math.sin(t * 38) * 14 * tegang;
  const S = [800, 320 - 30 * tegang];
  const Bk = [280, 640];
  const c = [(S[0] + Bk[0]) / 2 + 40 + getar, (S[1] + Bk[1]) / 2 + 60 * (1 - tegang) + getar * 0.5];
  const jalurBenang = `M ${Bk[0]} ${Bk[1] - 80} Q ${c[0]} ${c[1]} ${S[0]} ${S[1]}`;
  const denyutU = ((t - mimpi) / 1.2) % 1;
  const qb = (u: number, i: number) => (1 - u) ** 2 * [Bk[0], Bk[1] - 80][i] + 2 * (1 - u) * u * c[i] + u * u * S[i];
  const d = drift(k, 0.7);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak7" fajar={fajarDi(k, 0.68, 0.76)} />
      <G x={d.x} y={d.y}>
        <G x={S[0]} y={S[1]} s={mix(0.6, 1, prog(k, a.mulai + 0.3, 0.6))}>
          <Cahaya r={mix(120, 230, prog(k, mimpi, 0.8))} o={0.9} />
          <G r={t * 12}>
            <Bintang c={wr.bahaya} r={46} />
          </G>
        </G>
        <path d={jalurBenang} {...garis(wr.aksen, mix(3, 5, tegang))} {...gambar(benang)} filter="url(#sr-glow)" />
        {t > mimpi && denyutU >= 0 ? (
          <circle cx={qb(denyutU, 0)} cy={qb(denyutU, 1)} r={9} fill={wr.bahaya} filter="url(#sr-glow)" opacity={benang} />
        ) : null}
        <G x={Bk[0]} y={Bk[1]} o={m}>
          <path d="M -150 0 L -120 -80 L 130 -90 L 160 0 Z" fillOpacity={0.92} {...garis(wr.teks, TIPIS)} fill={wr.panel} />
          <path d="M -150 0 L -130 50 L 140 52 L 160 0" {...garis(wr.teks, TIPIS)} fill={campur(wr.panel, wr.latar, 0.5)} />
          <path d="M -60 -40 L -20 -55 M 40 -30 L 90 -46" {...garis(wr.teks, 2)} opacity={0.4} />
        </G>
      </G>
      <Label x={Bk[0]} y={Bk[1] + 110} teks="REALITY" font={font} c={wr.teks} o={0.6 * prog(k, realita, 0.5)} ukuran={26} />
      <Label x={S[0]} y={S[1] + 110} teks="DREAM" font={font} c={wr.bahaya} o={0.8 * prog(k, mimpi, 0.5)} ukuran={26} />
    </>
  );
};

// S8 "accepting where you are while still believing in where you could be": pin "YOU ARE HERE" → jalan titik-titik
//    ke titik cahaya jauh; garis kontur peta tipis di latar.
export const AkPin: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const terima = tk(a, "menerima", 1.6);
  const percaya = tk(a, "percaya", 4.4);
  const bisa = tk(a, "bisa", 5.8);
  const P = [250, 640];
  const T = [830, 320];
  const jalan = `M ${P[0]} ${P[1] - 30} C 520 720 420 380 620 420 S 760 300 ${T[0]} ${T[1]}`;
  const gb = prog(k, percaya - 0.2, 1.6);
  const pin = prog(k, a.mulai + 0.1, 0.5, "keluar");
  const flare = prog(k, bisa, 0.5);
  const d = drift(k, 0.6);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak8" fajar={fajarDi(k, 0.76, 0.86)} />
      <G x={d.x * 0.4} y={d.y * 0.4} o={0.18}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={560} cy={500} rx={120 + i * 85} ry={60 + i * 45} transform={`rotate(-12 560 500)`}
            {...garis(wr.teks, 1.5)} strokeDasharray={i % 2 ? "6 10" : undefined} />
        ))}
      </G>
      <G x={d.x} y={d.y}>
        <path d={jalan} {...garis(wr.teks, 2)} strokeDasharray="2 20" opacity={0.25} />
        <G x={T[0]} y={T[1]}>
          <Cahaya r={mix(110, 300, flare)} o={0.4 + 0.5 * prog(k, percaya, 0.8)} />
          <circle r={mix(10, 20, flare)} fill={wr.bahaya} filter="url(#sr-glow)" opacity={0.5 + 0.5 * prog(k, percaya, 0.6)} />
          <Riak k={k} t0={bisa} c={wr.bahaya} r1={200} />
        </G>
        <G x={P[0]} y={P[1] - mix(60, 0, pin)} o={pin}>
          <ellipse cx={0} cy={0} rx={mix(20, 46, prog(k, terima, 0.6))} ry={12} {...garis(wr.aksen, 2)} opacity={0.7} />
          <path d="M 0 0 C -22 -40 -52 -62 -52 -100 A 52 52 0 1 1 52 -100 C 52 -62 22 -40 0 0 Z"
            fillOpacity={0.9} {...garis(wr.aksen, TIPIS)} fill={wr.panel} filter="url(#sr-glow)" />
          <circle cx={0} cy={-100} r={18} fill={wr.aksen} />
        </G>
      </G>
      <TutupJalan k={k} wr={wr} d={jalan} p={gb} />
      <G x={P[0] + d.x} y={P[1] + 70 + d.y} o={prog(k, terima, 0.5)}>
        <rect x={-150} y={-30} width={300} height={56} rx={28} fill={wr.panel} fillOpacity={0.8} stroke={wr.garis} strokeWidth={2} />
        <Label x={0} y={8} teks="YOU ARE HERE" font={font} c={wr.teks} ukuran={24} />
      </G>
    </>
  );
};

/** Jalan titik-titik yang "tergambar" 0→p: titik-titik muncul berurutan sepanjang path (mask garis gambar). */
const TutupJalan: React.FC<{ k: Konteks; wr: Warna; d: string; p: number }> = ({ k, wr, d, p }) => {
  const id = `ak8-m-${k.a.modul}`;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={k.p.W} height={k.p.tinggi}>
          <path d={d} {...garis("#FFFFFF", 30)} {...gambar(p)} />
        </mask>
      </defs>
      <g mask={`url(#${id})`} transform={`translate(${drift(k, 0.6).x} ${drift(k, 0.6).y})`}>
        <path d={d} {...garis(wr.aksen, 7)} strokeDasharray="0.1 22" filter="url(#sr-glow)" />
      </g>
    </g>
  );
};

// S9 "accept your present without giving up on your future": cakrawala terbelah PRESENT / FUTURE, matahari mulai terbit.
export const AkCakrawala: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const kini = tk(a, "kini", 1.5);
  const depan = tk(a, "masa_depan", 5.3);
  const hy = 600;
  const terbit = progE(k, Math.min(depan - 1.2, a.mulai + 2.5), Math.max(1.5, a.selesai - depan + 1.6), INOUT);
  const sy = mix(hy + 110, hy - 70, terbit);
  const garisH = prog(k, a.mulai, 0.8);
  const kiri = prog(k, kini, 0.5);
  const kanan = prog(k, depan - 0.15, 0.5);
  const d = drift(k, 0.5);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak9" fajar={fajarDi(k, 0.86, 0.96)} hy={hy} />
      <defs>
        <clipPath id="ak9-klip">
          <rect x={0} y={0} width={p.W} height={hy} />
        </clipPath>
        <linearGradient id="ak9-kiri" x1="0" x2="1">
          <stop offset="0" stopColor={wr.latar} stopOpacity={0.55} />
          <stop offset="1" stopColor={wr.latar} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={p.W / 2} height={p.tinggi} fill="url(#ak9-kiri)" opacity={kiri} />
      <G x={d.x * 0.3}>
        <g clipPath="url(#ak9-klip)">
          <G x={p.W / 2 + 160} y={sy}>
            <Cahaya r={mix(200, 420, terbit)} o={0.95} />
            <circle r={92} fill={wr.bahaya} opacity={0.95} filter="url(#sr-glow)" />
            {Array.from({ length: 12 }, (_, i) => {
              const ang = Math.PI + (i / 11) * Math.PI;
              return <line key={i} x1={Math.cos(ang) * 120} y1={Math.sin(ang) * 120} x2={Math.cos(ang) * mix(120, 220, terbit)}
                y2={Math.sin(ang) * mix(120, 220, terbit)} {...garis(wr.bahaya, 3)} opacity={0.6 * terbit} />;
            })}
          </G>
        </g>
        {/* garis lurus horizontal: kotak filter setinggi 0 → glow ditiru dengan garis lebar redup (bukan #sr-glow) */}
        <line x1={60} x2={mix(60, p.W - 60, garisH)} y1={hy} y2={hy} {...garis(wr.aksen, 14)} opacity={0.25} />
        <line x1={60} x2={mix(60, p.W - 60, garisH)} y1={hy} y2={hy} {...garis(wr.aksen, 4)} />
        <line x1={p.W / 2} x2={p.W / 2} y1={hy - mix(0, 240, kiri)} y2={hy + mix(0, 90, kiri)} {...garis(wr.teks, 2)}
          strokeDasharray="4 10" opacity={0.6} />
      </G>
      <Label x={p.W / 4} y={hy + 70} teks="PRESENT" font={font} c={wr.teks} o={0.85 * kiri} ukuran={34} />
      <Label x={(p.W * 3) / 4} y={hy + 70} teks="FUTURE" font={font} c={wr.bahaya} o={kanan} ukuran={34} />
    </>
  );
};

// S10 Kartu akhir LAYAR PENUH (adegan `penuh`): matahari terbit penuh, "ACCEPT IT." / "KEEP MOVING FORWARD.", tanpa logo.
export const AkKartu: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const H = p.tinggi;
  const hy = H * 0.56;
  const m = prog(k, a.mulai, 0.6);
  const naik = progE(k, a.mulai, 2.2, INOUT);
  const sy = mix(hy - 40, hy - 170, naik);
  const b2 = prog(k, a.mulai + 0.45, 0.6);
  return (
    <>
      <LangitFajar k={k} wr={wr} id="ak10" fajar={1} hy={hy} tinggi={H} />
      <defs>
        <clipPath id="ak10-klip">
          <rect x={0} y={0} width={p.W} height={hy} />
        </clipPath>
        <linearGradient id="ak10-tanah" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={campur(wr.panel, wr.aksen, 0.25)} />
          <stop offset="1" stopColor={wr.latar} />
        </linearGradient>
      </defs>
      <g clipPath="url(#ak10-klip)">
        <G x={p.W / 2} y={sy}>
          <Cahaya r={620} o={0.95} />
          <circle r={130} fill={wr.bahaya} filter="url(#sr-glow)" />
          {Array.from({ length: 16 }, (_, i) => {
            const ang = Math.PI + (i / 15) * Math.PI + detik(k) * 0.05;
            return <line key={i} x1={Math.cos(ang) * 170} y1={Math.sin(ang) * 170} x2={Math.cos(ang) * 420} y2={Math.sin(ang) * 420}
              {...garis(wr.bahaya, 3)} opacity={0.35 * m} />;
          })}
        </G>
      </g>
      <rect x={0} y={hy} width={p.W} height={H - hy} fill="url(#ak10-tanah)" opacity={0.97} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={p.W / 2 - mix(160, 40, i / 6)} x2={p.W / 2 + mix(160, 40, i / 6)} y1={hy + 24 + i * 26} y2={hy + 24 + i * 26}
          {...garis(wr.bahaya, 4)} opacity={0.5 * (1 - i / 7) * m} />
      ))}
      <line x1={0} x2={p.W} y1={hy} y2={hy} {...garis(wr.aksen, 12)} opacity={0.25} />
      <line x1={0} x2={p.W} y1={hy} y2={hy} {...garis(wr.aksen, 3)} />
      <KataBesar k={k} wr={wr} t0={a.mulai + 0.1} x={p.W / 2} y={H * 0.33} teks="ACCEPT IT." ukuran={150} spasi={6} />
      <text x={p.W / 2} y={H * 0.33 + 110} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={54} letterSpacing={mix(30, 12, b2)}
        fill={wr.bahaya} opacity={b2}>KEEP MOVING FORWARD.</text>
    </>
  );
};

// Pustaka adegan Info Jerman by OTCA (split-layout): "warm professionalism" — panggung charcoal #25272B, kartu krem #F7F1E2,
// aksen kuning #F3CF45 (fokus/tombol, teks charcoal di atasnya — tidak pernah putih di atas kuning), merah logo #D95347 hemat.
// Bahasa visual: kartu krem datar ber-bayangan lembut (key visual brand), dua gelembung logo (merah + kuning) sebagai motif,
// tiga jalur berkode warna: Ausbildung = kuning, FSJ = merah, Kerja Profesional = krem. Label teks hanya nama jalur / nomor.
// Area konten adegan: x 108..972, y 400..830 (caption ±905, talent mulai ±1050; logo permanen di slot atas SplitReel, y ±330).

import React from "react";
import { Easing, random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Bintang, G, Orang, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const CY = 615;
const POP = Easing.out(Easing.back(1.7));
const pop = (k: Konteks, t: number, d = 0.45) => progE(k, t, d, POP);

/** Warna jalur: Ausbildung kuning, FSJ merah logo, Kerja Profesional krem. */
const jalur = (wr: Warna) => [wr.aksen, wr.aksen2, wr.teks];

/** Bayangan lembut kartu (brand: datar, bukan glow). Id unik per adegan agar tidak bentrok antar-Wadah. */
const Bayang: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={id} x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx={0} dy={14} stdDeviation={16} floodColor="#000000" floodOpacity={0.45} />
    </filter>
  </defs>
);

/** Kartu krem; pusat (0,0). */
const Kartu: React.FC<{ wr: Warna; w: number; h: number; bayang: string; isi?: string; r?: number }> = ({ wr, w, h, bayang, isi, r = 28 }) => (
  <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={isi ?? wr.teks} filter={`url(#${bayang})`} />
);

/** Lencana nomor bagian: pil kuning "01" (teks charcoal) + nama jalur krem; sudut kiri (0,0) = tengah-kiri lencana. */
const Lencana: React.FC<{ wr: Warna; p: number; no: string; label: string; font: string; warna?: string }> = ({ wr, p, no, label, font, warna }) => (
  <g opacity={Math.min(1, p * 2)}>
    <G x={mix(-30, 0, p)}>
      <rect x={0} y={-36} width={110} height={72} rx={36} fill={warna ?? wr.aksen} />
      <text x={55} y={17} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={44} fill={wr.latar}>
        {no}
      </text>
    </G>
    <text x={136} y={18} fontFamily={font} fontWeight={900} fontSize={54} fill={wr.teks} opacity={p}>
      {label}
    </text>
    <rect x={136} y={38} width={mix(0, 120, prog1(p))} height={8} rx={4} fill={warna ?? wr.aksen} />
  </g>
);
const prog1 = (p: number) => Math.max(0, Math.min(1, p * 1.4 - 0.4));

/** Dua gelembung logo (merah belakang, kuning depan) — motif brand; p 0→1 muncul bergantian. */
const DuaGelembung: React.FC<{ wr: Warna; p: number; s?: number }> = ({ wr, p, s = 1 }) => {
  const a = Math.min(1, p * 1.6);
  const b = Math.max(0, Math.min(1, p * 1.6 - 0.6));
  return (
    <G s={s}>
      <G x={-26} y={-20} s={mix(0.4, 1, a)} o={a}>
        <rect x={-55} y={-38} width={110} height={76} rx={16} fill={wr.aksen2} />
      </G>
      <G x={26} y={20} s={mix(0.4, 1, b)} o={b}>
        <rect x={-55} y={-38} width={110} height={76} rx={16} fill={wr.aksen} />
      </G>
    </G>
  );
};

/** Gerbang Brandenburg (siluet garis); dasar tengah (0,0), lebar ±300, tinggi ±210. p = digambar. */
const Gerbang: React.FC<{ wr: Warna; p: number; c?: string }> = ({ wr, p, c }) => {
  const st = c ?? wr.teks;
  const kolom = [-130, -82, -34, 34, 82, 130];
  return (
    <g>
      <path d="M -150 0 H 150" {...garis(st, 6)} {...gambar(p)} />
      {kolom.map((x, i) => (
        <path key={i} d={`M ${x} -4 V -128`} {...garis(st, 9)} {...gambar(Math.max(0, Math.min(1, p * 1.5 - i * 0.06)))} />
      ))}
      <path d="M -156 -132 H 156 V -160 H -156 Z" {...garis(st, 6)} fill={rgba(st, 0.12)} {...gambar(p)} />
      <path d="M -110 -160 V -180 H 110 V -160" {...garis(st, 6)} {...gambar(p)} />
      {/* quadriga disederhanakan: kereta + dua kuda */}
      <g opacity={Math.max(0, p * 2 - 1)}>
        <path d="M -26 -180 L -20 -204 H 20 L 26 -180 Z" fill={st} />
        <path d="M -54 -180 Q -60 -200 -44 -210 L -36 -196 Z M 54 -180 Q 60 -200 44 -210 L 36 -196 Z" fill={st} />
        <circle cx={0} cy={-214} r={7} fill={wr.aksen} />
      </g>
    </g>
  );
};

/** Ikon garis bersama (pusat 0,0, ±60). */
const Buku: React.FC<{ c: string; p: number }> = ({ c, p }) => (
  <g>
    <path d="M 0 -34 Q -30 -50 -64 -40 V 40 Q -30 30 0 46 Q 30 30 64 40 V -40 Q 30 -50 0 -34 Z" {...garis(c, 6)} {...gambar(p)} />
    <path d="M 0 -34 V 46" {...garis(c, 6)} {...gambar(p)} />
    <path d="M -48 -18 Q -28 -24 -14 -16 M -48 2 Q -28 -4 -14 4 M 14 -16 Q 28 -24 48 -18 M 14 4 Q 28 -4 48 2" {...garis(c, 4)}
      opacity={Math.max(0, p * 2 - 1)} />
  </g>
);

const Gir: React.FC<{ c: string; p: number; putar: number; r?: number }> = ({ c, p, putar, r = 46 }) => {
  const gigi = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `M ${Math.cos(a) * r} ${Math.sin(a) * r} L ${Math.cos(a) * (r + 16)} ${Math.sin(a) * (r + 16)}`;
  }).join(" ");
  return (
    <g transform={`rotate(${putar})`}>
      <circle r={r} {...garis(c, 7)} {...gambar(p)} />
      <path d={gigi} {...garis(c, 14)} strokeLinecap="butt" opacity={Math.max(0, p * 2 - 1)} />
      <circle r={r * 0.36} {...garis(c, 6)} opacity={p} />
    </g>
  );
};

const Toga: React.FC<{ c: string; p: number }> = ({ c, p }) => (
  <g>
    <path d="M -70 -10 L 0 -42 L 70 -10 L 0 22 Z" {...garis(c, 6)} fill={rgba(c, 0.18)} {...gambar(p)} />
    <path d="M -40 4 V 34 Q 0 54 40 34 V 4" {...garis(c, 6)} {...gambar(p)} />
    <path d="M 70 -10 V 30" {...garis(c, 5)} opacity={p} />
    <circle cx={70} cy={34} r={6} fill={c} opacity={p} />
  </g>
);

const Hati: React.FC<{ c: string; p: number; isi?: boolean; s?: number }> = ({ c, p, isi, s = 1 }) => (
  <G s={s}>
    <path d="M 0 40 C -70 -6 -54 -62 -16 -54 Q -4 -52 0 -36 Q 4 -52 16 -54 C 54 -62 70 -6 0 40 Z"
      {...garis(c, 7)} fill={isi ? c : "none"} fillOpacity={isi ? p : 0} {...gambar(p)} />
  </G>
);

/** Dua tangan menangkup (sukarela) — terbuka ke atas di bawah (0,0). */
const Tangan: React.FC<{ c: string; p: number }> = ({ c, p }) => (
  <g>
    <path d="M -120 10 Q -96 66 -30 70 L 0 70 M 120 10 Q 96 66 30 70 L 0 70" {...garis(c, 7)} {...gambar(p)} />
    <path d="M -120 10 Q -126 -4 -112 -8 Q -96 -10 -86 18 M 120 10 Q 126 -4 112 -8 Q 96 -10 86 18" {...garis(c, 7)} {...gambar(p)} />
    <path d="M -56 70 V 110 M 56 70 V 110" {...garis(c, 7)} {...gambar(p)} />
  </g>
);

const Koper: React.FC<{ c: string; p: number; isi?: string }> = ({ c, p, isi }) => (
  <g>
    <rect x={-74} y={-44} width={148} height={100} rx={16} {...garis(c, 7)} fill={isi ?? "none"} {...gambar(p)} />
    <path d="M -26 -44 V -62 Q -26 -70 -18 -70 H 18 Q 26 -70 26 -62 V -44" {...garis(c, 7)} {...gambar(p)} />
    <path d="M -74 2 H 74" {...garis(c, 5)} opacity={Math.max(0, p * 2 - 1)} />
    <rect x={-12} y={-6} width={24} height={18} rx={4} fill={c} opacity={Math.max(0, p * 2 - 1)} />
  </g>
);

/** Gedung layanan kesehatan: kotak + palang. */
const Klinik: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <g>
    <path d="M -80 60 V -40 L 0 -84 L 80 -40 V 60 Z" {...garis(wr.teks, 6)} fill={rgba(wr.teks, 0.06)} {...gambar(p)} />
    <G y={-6} s={pPalang(p)}>
      <rect x={-30} y={-30} width={60} height={60} rx={14} fill={wr.aksen2} />
      <path d="M 0 -16 V 16 M -16 0 H 16" {...garis(wr.teks, 8)} />
    </G>
    <rect x={-18} y={30} width={36} height={30} rx={4} {...garis(wr.teks, 5)} opacity={p} />
  </g>
);
const pPalang = (p: number) => Math.max(0.0001, Math.min(1, p * 2 - 0.8));

/** Rumah komunitas (layanan sosial): rumah + tiga kepala. */
const Komunitas: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <g>
    <path d="M -84 60 V -20 L 0 -80 L 84 -20 V 60 Z" {...garis(wr.teks, 6)} fill={rgba(wr.teks, 0.06)} {...gambar(p)} />
    {[-36, 0, 36].map((x, i) => {
      const u = Math.max(0, Math.min(1, p * 2 - 0.8 - i * 0.12));
      return (
        <G key={i} x={x} y={44} s={Math.max(0.001, u)} o={u}>
          <circle cy={-34} r={12} fill={i === 1 ? wr.aksen : wr.teks} />
          <path d="M -18 0 Q -18 -20 0 -20 Q 18 -20 18 0 Z" fill={i === 1 ? wr.aksen : wr.teks} />
        </G>
      );
    })}
  </g>
);

/** Bintang 5 sudut (keahlian); isi 0..1. */
const Bintang5: React.FC<{ wr: Warna; isi: number; r?: number }> = ({ wr, isi, r = 34 }) => {
  const d = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"} ${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
  }).join(" ") + " Z";
  return (
    <g>
      <path d={d} {...garis(wr.teks, 5)} />
      <G s={Math.max(0.001, isi)}>
        <path d={d} fill={wr.aksen} />
      </G>
    </g>
  );
};

/** Centang kuning di lingkaran (cap "sesuai"). */
const CapCentang: React.FC<{ wr: Warna; p: number; r?: number }> = ({ wr, p, r = 46 }) => (
  <G s={mix(1.8, 1, Math.min(1, p))} o={Math.min(1, p * 2.5)} r={-8}>
    <circle r={r} fill={wr.aksen} />
    <path d={`M ${-r * 0.42} 0 L ${-r * 0.1} ${r * 0.32} L ${r * 0.46} ${-r * 0.3}`} {...garis(wr.latar, 9)} />
  </G>
);

/** Riak cincin dari (0,0) mulai t0. */
const Riak: React.FC<{ k: Konteks; t0: number; c: string; r1?: number }> = ({ k, t0, c, r1 = 200 }) => {
  const u = prog(k, t0, 0.8, "keluar");
  return u > 0 && u < 1 ? <circle r={mix(20, r1, u)} {...garis(c, mix(7, 1, u))} opacity={(1 - u) * 0.8} /> : null;
};

/** Debu cahaya hangat melayang (latar hidup, deterministik). */
const Debu: React.FC<{ k: Konteks; wr: Warna; n?: number; o?: number }> = ({ k, wr, n = 14, o = 1 }) => {
  const t = detik(k);
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const x = 130 + random(`ijx${i}`) * 820;
        const y = 420 + ((random(`ijy${i}`) * 420 - t * (8 + random(`ijv${i}`) * 14)) % 420 + 420) % 420;
        return <circle key={i} cx={x} cy={y} r={2 + random(`ijr${i}`) * 3} fill={i % 4 ? wr.teks : wr.aksen} opacity={0.12 + 0.2 * random(`ijo${i}`)} />;
      })}
    </g>
  );
};

/** Jalan perspektif ke titik hilang (vx, vy) dari dasar lebar `w` di y `by`; garis tengah putus-putus mengalir. */
const Jalan: React.FC<{ k: Konteks; wr: Warna; vx: number; vy: number; by: number; w: number; p: number; c?: string }> = ({ k, wr, vx, vy, by, w, p, c }) => {
  const t = detik(k);
  const st = c ?? wr.teks;
  return (
    <g>
      <path d={`M ${vx - 10} ${vy} L ${vx - w / 2} ${by} L ${vx + w / 2} ${by} L ${vx + 10} ${vy} Z`} fill={rgba(st, 0.07)} opacity={p} />
      <path d={`M ${vx - 10} ${vy} L ${vx - w / 2} ${by}`} {...garis(st, 6)} {...gambar(p)} />
      <path d={`M ${vx + 10} ${vy} L ${vx + w / 2} ${by}`} {...garis(st, 6)} {...gambar(p)} />
      <path d={`M ${vx} ${by} L ${vx} ${vy + 6}`} {...garis(wr.aksen, 6)} strokeDasharray="26 30" strokeDashoffset={t * 70} opacity={p} />
    </g>
  );
};

// 1. HOOK "Mau kerja ke Jerman, tapi masih mikir satu-satunya jalan cuma lewat Ausbildung?":
// frame 0 sudah penuh: jalan perspektif menuju Gerbang Brandenburg (Jerman) di cakrawala, kamera mendorong pelan;
// "satu-satunya jalan" → papan petunjuk tunggal "AUSBILDUNG" tertancap; "Ausbildung?" → gelembung tanya kuning.
export const IjJalan: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const satu = tk(a, "satu", 2.0);
  const ausb = tk(a, "ausb", 3.6);
  const t = detik(k);
  const dorong = progE(k, a.mulai, a.selesai - a.mulai, Easing.inOut(Easing.quad));
  const papan = pop(k, satu, 0.5);
  const tanya = pop(k, ausb + 0.1, 0.45);
  const d = drift(k, 1);
  return (
    <>
      <Bayang id="ij-b1" />
      <G x={p.cx} y={CY} s={mix(1, 1.08, dorong)}>
        <G x={-p.cx} y={-CY}>
          <circle cx={p.cx} cy={545} r={230} fill="url(#sr-cahaya)" opacity={0.7} />
          <path d={`M 120 560 H 960`} {...garis(wr.teks, 3)} opacity={0.25} />
          <G x={p.cx + d.x * 0.3} y={560} s={0.56}>
            <Gerbang wr={wr} p={1} />
          </G>
          <Jalan k={k} wr={wr} vx={p.cx} vy={562} by={830} w={620} p={1} />
          <Debu k={k} wr={wr} />
          {/* papan petunjuk satu arah */}
          <G x={p.cx + 210 + d.x} y={800} s={Math.max(0.001, papan)} o={Math.min(1, papan * 2)}>
            <path d="M 0 0 V -190" {...garis(wr.teks, 8)} />
            <G y={-200} r={-4 + Math.sin(t * 2.2) * 1.5}>
              <path d="M -150 -40 H 120 L 158 0 L 120 40 H -150 Z" fill={wr.aksen} filter="url(#ij-b1)" />
              <text x={-10} y={15} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={wr.latar} letterSpacing={1}>
                AUSBILDUNG
              </text>
            </G>
          </G>
          <G x={p.cx + 120} y={500} s={Math.max(0.001, tanya)} o={Math.min(1, tanya * 2)}>
            <rect x={-46} y={-46} width={92} height={92} rx={22} fill={wr.teks} filter="url(#ij-b1)" />
            <text x={0} y={24} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={70} fill={wr.latar}>
              ?
            </text>
          </G>
        </G>
      </G>
    </>
  );
};

// 2. "Eits, ternyata nggak loh, soalnya ada 3 jalur ini…": papan Ausbildung bergoyang & mengecil, jalan tunggal
// membelah jadi tiga (kuning/merah/krem) menuju gerbang yang sama; "3" → lencana angka kuning meletup + riak.
export const IjCabang: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const tidak = tk(a, "nggak", 0.9);
  const tiga = tk(a, "tiga", 2.4);
  const t = detik(k);
  const belah = progE(k, tidak, 1.1, INOUT);
  const angka = pop(k, tiga - 0.05, 0.5);
  const goyang = t > tidak - 0.4 ? Math.sin((t - tidak + 0.4) * 22) * Math.exp(-(t - tidak + 0.4) * 4) * 8 : 0;
  const c = jalur(wr);
  const ujung = [p.cx - 300, p.cx, p.cx + 300];
  const d = drift(k, 1);
  return (
    <>
      <Bayang id="ij-b2" />
      <circle cx={p.cx} cy={545} r={230} fill="url(#sr-cahaya)" opacity={0.7} />
      <path d={`M 120 560 H 960`} {...garis(wr.teks, 3)} opacity={0.25} />
      <G x={p.cx + d.x * 0.3} y={560} s={0.56}>
        <Gerbang wr={wr} p={1} />
      </G>
      {/* tiga jalur dari bawah tengah, melengkung ke gerbang */}
      {c.map((w, i) => {
        const bx = mix(p.cx, ujung[i], belah);
        return (
          <g key={i}>
            <path d={`M ${bx} 830 C ${bx} 700 ${mix(bx, p.cx, 0.6)} 600 ${p.cx + (i - 1) * 14} 566`} {...garis(w, 10)}
              opacity={i === 1 ? 1 : belah} />
            <path d={`M ${bx} 830 C ${bx} 700 ${mix(bx, p.cx, 0.6)} 600 ${p.cx + (i - 1) * 14} 566`} {...garis(wr.latar, 3)}
              strokeDasharray="14 20" strokeDashoffset={t * 60} opacity={0.6 * (i === 1 ? 1 : belah)} />
            <G x={bx} y={800} s={Math.max(0.001, pop(k, tidak + 0.5 + i * 0.12, 0.4))}>
              <circle r={22} fill={w} />
              <circle r={8} fill={wr.latar} />
            </G>
          </g>
        );
      })}
      {/* papan lama: goyang lalu menyusut keluar */}
      <G x={p.cx + 210} y={600} s={Math.max(0.001, 1 - belah)} o={1 - belah} r={goyang}>
        <path d="M -150 -40 H 120 L 158 0 L 120 40 H -150 Z" fill={wr.aksen} />
        <text x={-10} y={15} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={40} fill={wr.latar}>
          AUSBILDUNG
        </text>
      </G>
      <G x={p.cx} y={700}>
        <Riak k={k} t0={tiga} c={wr.aksen} r1={220} />
        <G s={Math.max(0.001, angka)} o={Math.min(1, angka * 2)}>
          <circle r={74} fill={wr.aksen} filter="url(#ij-b2)" />
          <text x={0} y={34} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={104} fill={wr.latar}>
            3
          </text>
        </G>
      </G>
    </>
  );
};

/** Isi ikon tiap jalur (dipakai kartu ringkas & tabel). */
const IkonJalur: React.FC<{ wr: Warna; i: number; p: number; t: number }> = ({ wr, i, p, t }) =>
  i === 0 ? (
    <g>
      <G x={-22} y={-8} s={0.75}>
        <Toga c={wr.latar} p={p} />
      </G>
      <G x={40} y={30} s={0.42}>
        <Gir c={wr.latar} p={p} putar={t * 40} />
      </G>
    </g>
  ) : i === 1 ? (
    <G y={4} s={0.9}>
      <Hati c={wr.teks} p={p} isi />
    </G>
  ) : (
    <G y={6} s={0.8}>
      <Koper c={wr.latar} p={p} />
    </G>
  );

const NAMA = ["Ausbildung", "FSJ", "Kerja Profesional"];

// 3. "Yaitu Ausbildung, FSJ, dan Kerja Profesional": tiga kartu brand naik bergiliran tepat saat namanya diucapkan —
// kepala kartu berwarna jalur + ikon (toga+gir / hati / koper), nama di badan krem.
export const IjTigaJalur: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const tt = [tk(a, "a1", 0.4), tk(a, "a2", 1.3), tk(a, "a3", 2.2)];
  const t = detik(k);
  const c = jalur(wr);
  const d = drift(k, 1);
  return (
    <>
      <Bayang id="ij-b3" />
      <Debu k={k} wr={wr} n={10} />
      {c.map((w, i) => {
        const u = pop(k, tt[i], 0.55);
        const x = p.cx + (i - 1) * 280;
        const y = CY + 10 + mix(120, 0, u) + d.y * (0.6 + i * 0.2);
        return (
          <G key={i} x={x + d.x * (0.5 + i * 0.2)} y={y} o={Math.min(1, u * 2)} r={mix(8, (i - 1) * -2, u)}>
            <Kartu wr={wr} w={250} h={330} bayang="ij-b3" />
            <path d="M -125 -137 Q -125 -165 -97 -165 H 97 Q 125 -165 125 -137 V -20 H -125 Z" fill={w} />
            <G y={-92}>
              <IkonJalur wr={wr} i={i} p={u} t={t} />
            </G>
            <text x={0} y={i === 2 ? 52 : 70} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={i === 1 ? 64 : 38} fill={wr.latar}>
              {i === 2 ? "Kerja" : NAMA[i]}
            </text>
            {i === 2 ? (
              <text x={0} y={98} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={wr.latar}>
                Profesional
              </text>
            ) : null}
            <rect x={-40} y={128} width={80} height={8} rx={4} fill={i === 2 ? wr.latar : w} opacity={0.85} />
          </G>
        );
      })}
    </>
  );
};

// 4. "Tapi apa sih bedanya?": ketiga kartu mengecil sejajar, di antaranya muncul tanda "≠" kuning; kaca pembesar
// menyapu dari kiri ke kanan memeriksa tiap kartu.
export const IjBeda: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const beda = tk(a, "beda", 1.0);
  const t = detik(k);
  const kecil = progE(k, a.mulai, 0.5, INOUT);
  const lup = progE(k, beda - 0.5, 1.4, INOUT);
  const c = jalur(wr);
  return (
    <>
      <Bayang id="ij-b4" />
      {c.map((w, i) => {
        const x = p.cx + (i - 1) * mix(280, 300, kecil);
        const dekat = Math.max(0, 1 - Math.abs(mix(p.cx - 360, p.cx + 360, lup) - x) / 160);
        return (
          <G key={i} x={x} y={CY + 20 - dekat * 18} s={mix(1, 0.72, kecil) * (1 + dekat * 0.08)}>
            <Kartu wr={wr} w={250} h={330} bayang="ij-b4" />
            <path d="M -125 -137 Q -125 -165 -97 -165 H 97 Q 125 -165 125 -137 V -20 H -125 Z" fill={w} />
            <G y={-92}>
              <IkonJalur wr={wr} i={i} p={1} t={t} />
            </G>
            <text x={0} y={80} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={110} fill={wr.latar} opacity={0.9}>
              ?
            </text>
          </G>
        );
      })}
      {[0, 1].map((i) => {
        const u = pop(k, beda - 0.1 + i * 0.12, 0.4);
        return (
          <G key={i} x={p.cx + (i - 0.5) * 300} y={CY + 20} s={Math.max(0.001, u)}>
            <circle r={32} fill={wr.aksen} />
            <path d="M -14 -7 H 14 M -14 7 H 14 M 8 -18 L -8 18" {...garis(wr.latar, 6)} />
          </G>
        );
      })}
      <G x={mix(p.cx - 360, p.cx + 360, lup)} y={CY - 60} o={lup > 0 && lup < 1 ? 1 : 0}>
        <circle r={58} {...garis(wr.aksen, 10)} fill={rgba(wr.teks, 0.12)} />
        <path d="M 42 42 L 92 92" {...garis(wr.aksen, 16)} />
      </G>
    </>
  );
};

// 5. "Yang pertama ada Ausbildung. Ini jalur pendidikan vokasi yang menggabungkan belajar teori dan praktik kerja":
// lencana 01 Ausbildung; "vokasi" → kartu sekolah vokasi (toga); "teori" → buku masuk dari kiri; "praktik" → gir
// berputar dari kanan; keduanya bertemu di tengah dan menyatu (riak kuning) — teori + praktik dalam satu jalur.
export const IjAusbildung: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const vok = tk(a, "vokasi", 3.2);
  const teori = tk(a, "teori", 5.4);
  const prak = tk(a, "praktik", 6.4);
  const t = detik(k);
  const lenc = prog(k, a.mulai + 0.15, 0.6);
  const toga = pop(k, vok - 0.1, 0.5);
  const kiri = progE(k, teori - 0.2, 0.6, Easing.out(Easing.cubic));
  const kanan = progE(k, prak - 0.2, 0.6, Easing.out(Easing.cubic));
  const satu = progE(k, prak + 0.5, 0.6, INOUT);
  const d = drift(k, 1);
  const y0 = CY + 70;
  return (
    <>
      <Bayang id="ij-b5" />
      <G x={140} y={455}>
        <Lencana wr={wr} p={lenc} no="01" label="Ausbildung" font={font} />
      </G>
      <G x={p.cx + d.x} y={y0 - 30 + d.y} s={Math.max(0.001, toga) * mix(1, 0.8, satu)} o={Math.min(1, toga * 2)}>
        <circle r={110} fill="url(#sr-cahaya)" />
        <Kartu wr={wr} w={180} h={180} bayang="ij-b5" r={40} />
        <G y={-6}>
          <Toga c={wr.latar} p={toga} />
        </G>
      </G>
      <G x={mix(130, p.cx - 210 + satu * 40, kiri)} y={y0 + 20} o={kiri} r={mix(-20, 0, kiri)}>
        <Kartu wr={wr} w={170} h={150} bayang="ij-b5" isi={wr.panel} />
        <Buku c={wr.teks} p={kiri} />
      </G>
      <G x={mix(950, p.cx + 210 - satu * 40, kanan)} y={y0 + 20} o={kanan}>
        <Kartu wr={wr} w={170} h={150} bayang="ij-b5" isi={wr.panel} />
        <Gir c={wr.aksen} p={kanan} putar={t * 90} r={38} />
      </G>
      {/* tanda + penghubung */}
      {[-1, 1].map((s) => (
        <G key={s} x={p.cx + s * 118} y={y0 + 20} s={Math.max(0.001, pop(k, (s < 0 ? teori : prak) + 0.25, 0.35))}>
          <path d="M -14 0 H 14 M 0 -14 V 14" {...garis(wr.aksen, 7)} />
        </G>
      ))}
      <G x={p.cx} y={y0 - 30}>
        <Riak k={k} t0={prak + 0.9} c={wr.aksen} r1={260} />
      </G>
    </>
  );
};

// 6. "Cocok buat kamu yang ingin belajar profesi, sekaligus mendapatkan pengalaman kerja": sosok berjalan menaiki
// tangga tiga anak (buku → gir → koper); "pengalaman kerja" → bilah pengalaman kuning terisi + kilau bintang.
export const IjTangga: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const prof = tk(a, "profesi", 1.6);
  const peng = tk(a, "pengalaman", 3.4);
  const t = detik(k);
  const naik = progE(k, a.mulai + 0.3, a.selesai - a.mulai - 0.6, Easing.inOut(Easing.sin));
  const bilah = progE(k, peng - 0.1, 1.2, INOUT);
  const anak = [
    { x: 330, y: 770 },
    { x: 540, y: 690 },
    { x: 750, y: 610 },
  ];
  const posisi = naik * 3;
  const i0 = Math.min(2, Math.floor(posisi));
  const u = posisi - i0;
  const dari = i0 === 0 ? { x: 150, y: 830 } : anak[i0 - 1];
  const ke = anak[i0];
  const ox = mix(dari.x, ke.x, u);
  const oy = mix(dari.y, ke.y, u) - Math.sin(u * Math.PI) * 26;
  const ik = [prof - 0.8, prof, peng];
  return (
    <>
      <Bayang id="ij-b6" />
      <Debu k={k} wr={wr} n={10} />
      {anak.map((s, i) => {
        const m = pop(k, a.mulai + 0.1 + i * 0.15, 0.45);
        const ic = pop(k, ik[i], 0.45);
        return (
          <G key={i} x={s.x} y={s.y + mix(40, 0, m)} o={Math.min(1, m * 2)}>
            <rect x={-102} y={0} width={204} height={840 - s.y} rx={18} fill={i === 2 ? wr.aksen : wr.teks} filter="url(#ij-b6)" />
            <G y={Math.min(70, (840 - s.y) / 2)} s={Math.max(0.001, ic) * 0.62}>
              {i === 0 ? <Buku c={wr.latar} p={1} /> : i === 1 ? <Gir c={wr.latar} p={1} putar={t * 60} /> : <Koper c={wr.latar} p={1} />}
            </G>
          </G>
        );
      })}
      <G x={ox} y={oy}>
        <Orang wr={wr} stroke={wr.teks} isi={wr.panel} langkah={naik < 0.999 ? t * 9 : undefined} />
      </G>
      {/* bilah pengalaman */}
      <G x={p.cx} y={445} o={Math.min(1, bilah * 3)}>
        <rect x={-260} y={-20} width={520} height={40} rx={20} fill={wr.panel} stroke={wr.garis} strokeWidth={2} />
        <rect x={-255} y={-15} width={Math.max(30, 510 * bilah)} height={30} rx={15} fill={wr.aksen} />
        <G x={-255 + 510 * bilah} y={0} o={bilah > 0.98 ? 1 : 0.6}>
          <Bintang c={wr.teks} r={20 + 6 * Math.sin(t * 8)} />
        </G>
      </G>
    </>
  );
};

// 7. "Yang kedua ada FSJ … program sukarela di bidang sosial, misalnya membantu di fasilitas kesehatan atau layanan sosial":
// lencana 02 FSJ (merah); "sukarela" → dua tangan menangkup hati merah berdenyut; "kesehatan" → gedung klinik kiri,
// "layanan sosial" → rumah komunitas kanan, garis putus-putus dari hati ke keduanya.
export const IjFsj: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const suka = tk(a, "sukarela", 4.0);
  const sehat = tk(a, "kesehatan", 7.6);
  const sosial = tk(a, "layanan", 9.1);
  const t = detik(k);
  const lenc = prog(k, a.mulai + 0.15, 0.6);
  const tangan = prog(k, suka - 0.3, 0.8);
  const hati = pop(k, suka + 0.15, 0.5);
  const dn = 1 + 0.06 * Math.max(0, Math.sin(t * 7)) * hati;
  const kl = prog(k, sehat - 0.2, 0.8);
  const km = prog(k, sosial - 0.2, 0.8);
  const geser = progE(k, sehat - 0.4, 0.6, INOUT);
  const d = drift(k, 1);
  const hx = p.cx + d.x;
  const hy = mix(CY + 40, CY - 10, geser) + d.y;
  return (
    <>
      <Bayang id="ij-b7" />
      <G x={140} y={455}>
        <Lencana wr={wr} p={lenc} no="02" label="FSJ" font={font} warna={wr.aksen2} />
      </G>
      <G x={hx} y={hy} s={mix(1, 0.78, geser)}>
        <circle r={150} fill="url(#sr-cahaya2)" opacity={hati} />
        <G y={60}>
          <Tangan c={wr.teks} p={tangan} />
        </G>
        <G y={10} s={Math.max(0.001, hati) * dn}>
          <Hati c={wr.aksen2} p={1} isi s={1.3} />
        </G>
      </G>
      {[
        { x: 235, u: kl, el: <Klinik wr={wr} p={kl} /> },
        { x: 845, u: km, el: <Komunitas wr={wr} p={km} /> },
      ].map((o, i) =>
        o.u > 0 ? (
          <g key={i}>
            <path d={`M ${hx + (i ? 70 : -70)} ${hy} Q ${mix(hx, o.x, 0.5)} ${hy - 90} ${o.x} ${CY + 40}`} {...garis(wr.aksen2, 4)}
              strokeDasharray="6 16" strokeDashoffset={-t * 50} opacity={o.u * 0.9} />
            <G x={o.x} y={CY + 90} s={mix(0.6, 0.95, o.u)} o={Math.min(1, o.u * 2)}>
              {o.el}
            </G>
          </g>
        ) : null,
      )}
    </>
  );
};

// 8. "Jadi fokusnya bukan bekerja sebagai tenaga kerja profesional, tapi mendapatkan pengalaman dan berkontribusi di
// bidang sosial": koper kiri diberi garis silang merah tipis & memudar ("bukan"); hati tengah tumbuh, bintang pengalaman
// berkumpul, tiga sosok tersambung ke hati ("berkontribusi").
export const IjKontribusi: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const bukan = tk(a, "bukan", 1.0);
  const peng = tk(a, "pengalaman", 4.8);
  const kontr = tk(a, "kontribusi", 5.7);
  const t = detik(k);
  const koper = pop(k, a.mulai + 0.1, 0.5);
  const silang = prog(k, bukan + 0.2, 0.5);
  const pudar = progE(k, peng - 0.6, 0.6, INOUT);
  const hati = pop(k, peng - 0.4, 0.6);
  const sambung = prog(k, kontr, 0.9);
  const sosok = [-1, 0, 1];
  const hx = mix(p.cx + 150, p.cx, pudar);
  return (
    <>
      <Bayang id="ij-b8" />
      <G x={mix(p.cx - 170, 200, pudar)} y={CY + 30} s={Math.max(0.001, koper) * mix(1, 0.7, pudar)} o={mix(1, 0.35, pudar)}>
        <Kartu wr={wr} w={220} h={190} bayang="ij-b8" isi={wr.panel} />
        <Koper c={wr.teks} p={1} />
        <g>
          <path d="M -70 -60 L 70 70" {...garis(wr.aksen2, 10)} {...gambar(silang)} />
          <path d="M 70 -60 L -70 70" {...garis(wr.aksen2, 10)} {...gambar(Math.max(0, silang * 2 - 1))} />
        </g>
      </G>
      <G x={hx} y={CY - 10}>
        <circle r={160} fill="url(#sr-cahaya2)" opacity={hati * 0.9} />
        <G s={Math.max(0.001, hati) * (1 + 0.05 * Math.sin(t * 6))}>
          <Hati c={wr.aksen2} p={1} isi s={1.5} />
        </G>
        {Array.from({ length: 7 }, (_, i) => {
          const u = prog(k, peng + i * 0.08, 0.7, "keluar");
          const ang = (i / 7) * Math.PI * 2 + 0.3;
          const r = mix(240, 110, u);
          return u > 0 ? (
            <G key={i} x={Math.cos(ang) * r} y={Math.sin(ang) * r * 0.7} o={Math.sin(u * Math.PI) * 0.9}>
              <Bintang c={i % 2 ? wr.aksen : wr.teks} r={14} />
            </G>
          ) : null;
        })}
      </G>
      {sosok.map((s, i) => {
        const u = pop(k, kontr + i * 0.12, 0.45);
        const x = p.cx + s * 260;
        const y = s === 0 ? 815 : 780;
        return u > 0 ? (
          <g key={i}>
            <path d={`M ${hx} ${CY + 50} L ${x} ${y - 140}`} {...garis(wr.aksen2, 4)} strokeDasharray="6 14"
              strokeDashoffset={-t * 40} opacity={sambung * 0.8} />
            <G x={x} y={y} s={0.8 * Math.max(0.001, u)}>
              <Orang wr={wr} stroke={wr.teks} isi={s === 0 ? wr.aksen2 : wr.panel} />
            </G>
          </g>
        ) : null;
      })}
    </>
  );
};

// 9. "Yang ketiga ada Kerja Profesional. Ini cocok banget untuk kamu yang sudah punya kualifikasi dan keahlian yang sesuai":
// lencana 03 (krem); kartu profil/CV krem; "kualifikasi" → baris ijazah tergambar + toga kecil; "keahlian" → tiga bintang
// terisi berurutan; "sesuai" → cap centang kuning jatuh di sudut kartu.
export const IjProfesional: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const kual = tk(a, "kualifikasi", 5.2);
  const ahli = tk(a, "keahlian", 6.4);
  const sesuai = tk(a, "sesuai", 7.0);
  const lenc = prog(k, a.mulai + 0.15, 0.6);
  const kartu = pop(k, a.mulai + 0.9, 0.6);
  const baris = prog(k, kual - 0.1, 0.9);
  const cap = prog(k, sesuai, 0.3, "keluar");
  const d = drift(k, 1);
  const kx = p.cx + d.x;
  const ky = CY + 70 + d.y;
  return (
    <>
      <Bayang id="ij-b9" />
      <G x={140} y={455}>
        <Lencana wr={wr} p={lenc} no="03" label="Kerja Profesional" font={font} warna={wr.teks} />
      </G>
      <G x={kx} y={ky} s={Math.max(0.001, kartu)} o={Math.min(1, kartu * 2)} r={mix(-6, -2, kartu)}>
        <Kartu wr={wr} w={520} h={290} bayang="ij-b9" />
        <G x={-170} y={-40}>
          <circle r={62} fill={wr.latar} />
          <circle cy={-14} r={22} fill={wr.teks} />
          <path d="M -36 38 Q -36 6 0 6 Q 36 6 36 38 Z" fill={wr.teks} />
        </G>
        <G x={-170} y={86} s={0.55}>
          <Koper c={wr.latar} p={1} />
        </G>
        {/* baris kualifikasi */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <G x={-50} y={-82 + i * 50} s={0.32} o={Math.min(1, baris * 3 - i)}>
              <Toga c={wr.latar} p={1} />
            </G>
            <rect x={-14} y={-90 + i * 50} width={Math.max(0, (i === 2 ? 150 : 230) * Math.min(1, Math.max(0, baris * 3 - i)))} height={16} rx={8}
              fill={wr.latar} opacity={0.75} />
          </g>
        ))}
        {/* bintang keahlian */}
        {[0, 1, 2].map((i) => (
          <G key={i} x={-20 + i * 82} y={92}>
            <Bintang5 wr={{ ...wr, teks: wr.latar }} isi={pop(k, ahli + i * 0.18, 0.4)} r={30} />
          </G>
        ))}
        <G x={220} y={-110}>
          <CapCentang wr={wr} p={cap} r={50} />
        </G>
      </G>
    </>
  );
};

// 10. "Jadi kamu bisa mempertimbangkan jalur kerja profesional ini": koper meluncur di jalur krem menuju gerbang
// Brandenburg (match visual dengan hook), jejak putus-putus kuning; gerbang menyala saat koper tiba.
export const IjKoper: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const timb = tk(a, "timbang", 1.0);
  const jalan = progE(k, timb - 0.3, a.selesai - timb, Easing.inOut(Easing.cubic));
  const tiba = prog(k, a.selesai - 0.7, 0.6);
  const t = detik(k);
  const kx = mix(200, p.cx, jalan);
  const ky = mix(800, 600, jalan);
  return (
    <>
      <circle cx={p.cx} cy={545} r={mix(200, 280, tiba)} fill="url(#sr-cahaya)" opacity={mix(0.5, 1, tiba)} />
      <path d="M 120 560 H 960" {...garis(wr.teks, 3)} opacity={0.25} />
      <G x={p.cx} y={560} s={0.56}>
        <Gerbang wr={wr} p={1} />
      </G>
      <path d={`M 200 800 Q 330 640 ${p.cx} 590`} {...garis(wr.teks, 10)} opacity={0.9} />
      <path d={`M 200 800 Q 330 640 ${p.cx} 590`} {...garis(wr.aksen, 5)} strokeDasharray="10 18" strokeDashoffset={-t * 60} opacity={0.9} />
      <Debu k={k} wr={wr} n={10} />
      <G x={kx} y={ky - 40} s={mix(1.1, 0.55, jalan)} r={Math.sin(t * 9) * 3 * (1 - tiba)}>
        <Koper c={wr.latar} p={1} isi={wr.teks} />
      </G>
    </>
  );
};

// 11. "Tapi ingat, ketiga jalur ini punya tujuan, persyaratan dan kemampuan bahasa yang berbeda-beda":
// tabel 3 kolom (kepala warna jalur) × 3 baris ikon (target = tujuan, daftar = persyaratan, gelembung DE = bahasa) muncul
// per kata; "berbeda-beda" → tanda ≠ kuning meletup di antara kolom. Tanpa angka/level — tidak mengklaim syarat spesifik.
export const IjBanding: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const tuj = tk(a, "tujuan", 2.5);
  const syarat = tk(a, "syarat", 3.4);
  const bhs = tk(a, "bahasa", 4.8);
  const beda = tk(a, "beda", 5.4);
  const t = detik(k);
  const c = jalur(wr);
  const kol = pop(k, a.mulai + 0.2, 0.5);
  const rowT = [tuj, syarat, bhs];
  const X0 = p.cx - 110;
  const LK = 220;
  return (
    <>
      <Bayang id="ij-b11" />
      {/* kepala kolom */}
      {c.map((w, i) => {
        const u = pop(k, a.mulai + 0.15 + i * 0.1, 0.45);
        return (
          <G key={i} x={X0 + i * LK} y={445} s={Math.max(0.001, u)}>
            <rect x={-100} y={-34} width={200} height={68} rx={20} fill={w} filter="url(#ij-b11)" />
            <G s={0.48}>
              <IkonJalur wr={wr} i={i} p={1} t={t} />
            </G>
          </G>
        );
      })}
      {/* baris */}
      {[0, 1, 2].map((r) => {
        const u = prog(k, rowT[r] - 0.1, 0.5);
        const y = 545 + r * 100;
        return (
          <g key={r} opacity={Math.min(1, u * 2) * kol}>
            <G x={195} y={y} s={mix(0.6, 1, u)}>
              <circle r={36} fill={wr.panel} stroke={wr.garis} strokeWidth={2} />
              {r === 0 ? (
                <g>
                  <circle r={20} {...garis(wr.aksen, 5)} />
                  <circle r={7} fill={wr.aksen} />
                </g>
              ) : r === 1 ? (
                <path d="M -14 -14 L -8 -8 L 2 -18 M -14 4 L -8 10 L 2 0 M 8 -12 H 18 M 8 6 H 18" {...garis(wr.aksen, 4)} />
              ) : (
                <text x={0} y={11} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={28} fill={wr.aksen}>
                  DE
                </text>
              )}
            </G>
            {c.map((w, i) => (
              <G key={i} x={X0 + i * LK} y={y} s={mix(0.7, 1, prog(k, rowT[r] + i * 0.08, 0.4))}>
                <rect x={-100} y={-34} width={200} height={68} rx={18} fill={wr.teks} opacity={0.96} filter="url(#ij-b11)" />
                {/* pola berbeda per kolom: bentuk, bukan nilai */}
                {i === 0 ? (
                  <rect x={-60} y={-8} width={120} height={16} rx={8} fill={w} />
                ) : i === 1 ? (
                  <g>
                    <circle cx={-34} r={10} fill={w} />
                    <circle cx={0} r={10} fill={w} />
                    <circle cx={34} r={10} fill={w} />
                  </g>
                ) : (
                  <path d="M -50 8 L -16 -10 L 16 8 L 50 -10" {...garis(wr.latar, 7)} />
                )}
              </G>
            ))}
          </g>
        );
      })}
      {[0, 1].map((i) => {
        const u = pop(k, beda + i * 0.12, 0.4);
        return (
          <G key={i} x={X0 + LK * (i + 0.5)} y={645} s={Math.max(0.001, u)}>
            <circle r={26} fill={wr.aksen} />
            <path d="M -11 -6 H 11 M -11 6 H 11 M 6 -15 L -6 15" {...garis(wr.latar, 5)} />
          </G>
        );
      })}
    </>
  );
};

// 12. "Jadi jangan asal pilih jalur karena lagi rame dibicarakan": kerumunan sosok berjalan ikut-ikutan ke satu jalur,
// gelembung obrolan & api "rame" di atasnya; "jangan" → satu sosok kuning berhenti, kompas kuning muncul & jarumnya mencari arah.
export const IjTren: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const jangan = tk(a, "jangan", 0.4);
  const rame = tk(a, "rame", 2.2);
  const t = detik(k);
  const henti = prog(k, jangan + 0.2, 0.5);
  const kompas = pop(k, jangan + 0.5, 0.5);
  const ramai = pop(k, rame - 0.2, 0.5);
  const n = 6;
  return (
    <>
      <Bayang id="ij-b12" />
      <path d="M 120 800 H 960" {...garis(wr.teks, 4)} opacity={0.3} />
      {Array.from({ length: n }, (_, i) => {
        const x = ((180 + i * 150 + (t - a.mulai) * 120) % 960) + 60;
        return (
          <G key={i} x={x} y={800} s={0.55} o={Math.min(1, Math.min(x - 60, 1020 - x) / 80)}>
            <Orang wr={wr} stroke={wr.teks} isi={wr.panel} langkah={t * 9 + i} />
          </G>
        );
      })}
      {/* gelembung obrolan + api tren di atas kerumunan */}
      {[0, 1, 2].map((i) => {
        const u = pop(k, rame - 0.3 + i * 0.12, 0.4);
        const x = 620 + i * 110;
        const y = 520 + (i % 2) * 50 + Math.sin(t * 3 + i) * 6;
        return (
          <G key={i} x={x} y={y} s={Math.max(0.001, u) * 0.9}>
            <path d="M -40 -26 H 40 Q 52 -26 52 -14 V 12 Q 52 24 40 24 H -6 L -22 40 L -18 24 H -40 Q -52 24 -52 12 V -14 Q -52 -26 -40 -26 Z"
              fill={i === 1 ? wr.aksen2 : wr.teks} />
            <circle cx={-18} r={5} fill={wr.latar} />
            <circle cx={0} r={5} fill={wr.latar} />
            <circle cx={18} r={5} fill={wr.latar} />
          </G>
        );
      })}
      <G x={760} y={450} s={Math.max(0.001, ramai) * (1 + 0.06 * Math.sin(t * 12))}>
        <path d="M 0 -50 Q 34 -16 26 14 Q 22 38 0 44 Q -22 38 -26 14 Q -30 -8 -10 -24 Q -8 -6 4 -2 Q 8 -26 0 -50 Z" fill={wr.aksen2} />
        <path d="M 0 0 Q 14 14 8 30 Q 0 38 -8 30 Q -12 16 0 0 Z" fill={wr.aksen} />
      </G>
      {/* sosok kita berhenti + kompas */}
      <G x={300} y={800} s={0.72}>
        <Orang wr={wr} stroke={wr.aksen} isi={wr.panel} langkah={henti < 1 ? t * 9 * (1 - henti) : undefined} />
      </G>
      <G x={300} y={560} s={Math.max(0.001, kompas)}>
        <circle r={70} fill={wr.teks} filter="url(#ij-b12)" />
        <circle r={56} {...garis(wr.latar, 4)} />
        <G r={Math.sin((t - jangan) * 3) * 50 * Math.exp(-(t - jangan) * 0.8)}>
          <path d="M 0 -46 L 12 0 L 0 46 L -12 0 Z" fill={wr.latar} />
          <path d="M 0 -46 L 12 0 H -12 Z" fill={wr.aksen2} />
        </G>
        <circle r={7} fill={wr.aksen} />
      </G>
    </>
  );
};

// 13. "Tapi kalau kamu sendiri lebih tertarik Ausbildung, FSJ atau langsung kerja profesional, coba tulis di kolom komentar ya":
// kartu kolom komentar krem; tiga chip jalur muncul saat namanya diucapkan, kursor mengetik, "komentar" → tombol kirim
// kuning ditekan + dua gelembung logo melayang naik.
export const IjKomentar: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const tt = [tk(a, "a1", 3.0), tk(a, "a2", 3.9), tk(a, "a3", 5.2)];
  const kom = tk(a, "komentar", 7.0);
  const t = detik(k);
  const kartu = pop(k, a.mulai + 0.1, 0.6);
  const kirim = prog(k, kom, 0.3, "keluar");
  const tekan = kirim > 0 && kirim < 1 ? 1 - Math.sin(kirim * Math.PI) * 0.12 : 1;
  const terbang = prog(k, kom + 0.2, 1.2);
  const c = jalur(wr);
  const d = drift(k, 1);
  return (
    <>
      <Bayang id="ij-b13" />
      <G x={p.cx + d.x} y={CY + 30 + d.y} s={Math.max(0.001, kartu)} o={Math.min(1, kartu * 2)}>
        <Kartu wr={wr} w={760} h={330} bayang="ij-b13" />
        {/* kepala: avatar + garis nama */}
        <circle cx={-320} cy={-110} r={26} fill={wr.latar} />
        <rect x={-280} y={-122} width={160} height={14} rx={7} fill={wr.latar} opacity={0.7} />
        <rect x={-280} y={-100} width={100} height={10} rx={5} fill={wr.latar} opacity={0.35} />
        <G x={290} y={-110}>
          <Hati c={wr.aksen2} p={1} isi={kirim > 0} s={0.38} />
        </G>
        {/* chip jalur */}
        {c.map((w, i) => {
          const u = pop(k, tt[i], 0.45);
          const x = [-230, -40, 200][i];
          const lebar = [220, 120, 300][i];
          return (
            <G key={i} x={x} y={-14} s={Math.max(0.001, u)} o={Math.min(1, u * 2)}>
              <rect x={-lebar / 2} y={-34} width={lebar} height={68} rx={34} fill={i === 2 ? wr.latar : w} />
              <text x={0} y={13} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={34} fill={i === 2 ? wr.teks : wr.latar}>
                {NAMA[i]}
              </text>
            </G>
          );
        })}
        {/* kolom ketik + tombol kirim */}
        <rect x={-340} y={60} width={560} height={76} rx={38} fill="#FFFFFF" stroke={rgba(wr.latar, 0.25)} strokeWidth={3} />
        <rect x={-300} y={84} width={Math.max(0, Math.min(380, (t - tt[0]) * 110))} height={28} rx={14}
          fill={wr.latar} opacity={0.18} />
        <rect x={-296 + Math.max(0, Math.min(380, (t - tt[0]) * 110))} y={80} width={5} height={36} rx={2} fill={wr.latar}
          opacity={Math.round(t * 2.5) % 2 ? 1 : 0.15} />
        <G x={290} y={98} s={tekan}>
          <circle r={44} fill={wr.aksen} />
          <path d="M -16 -16 L 20 0 L -16 16 L -8 0 Z" fill={wr.latar} />
        </G>
      </G>
      {terbang > 0 && terbang < 1 ? (
        <G x={p.cx + 420 + terbang * 40} y={CY + 150 - terbang * 320} o={Math.sin(terbang * Math.PI)}>
          <DuaGelembung wr={wr} p={1} s={0.5} />
        </G>
      ) : null}
    </>
  );
};

// 14. Penutup: logo Info Jerman membesar ke tengah (SplitReel LogoKlien, modul *-kartu); dua gelembung logo jadi bingkai
// halus, garis kuning brand tergambar di bawah logo. Tanpa CTA tambahan (CTA = ucapan talent).
export const IjKartu: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const f = prog(k, a.mulai + 0.3, 0.7);
  return (
    <>
      <circle cx={p.cx} cy={560} r={300} fill="url(#sr-cahaya)" opacity={f} />
      <rect x={p.cx - mix(0, 150, f)} y={720} width={mix(0, 300, f)} height={12} rx={6} fill={wr.aksen} />
    </>
  );
};

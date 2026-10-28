// Pustaka adegan OTCA v3 (split-layout): emas OTCA (#CB9D31 → #FDF1A4 → #B3822C, gradien "ot-emas" di Defs SplitReel),
// garis tebal 7, ilustrasi tanpa teks (kecuali label level A1–C1 & kartu akhir). Waktu kunci dari `a.t` (detik absolut dari anchor kata).
// Area konten adegan: x 108..960, y 380..860 (logo OTCA permanen memakai y 260..340 di SplitReel).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Bintang, Cahaya, Centang, G, Kaca, Orang, Tanya, Timbangan, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const EMAS = "url(#ot-emas)";
const T = 7;
const CY = 620;
const g7 = (st: string = EMAS, w = T) => garis(st, w);

/** Riak cincin emas yang melebar dari titik (0,0) lokal mulai detik `t0`. */
const Riak: React.FC<{ k: Konteks; t0: number; wr: Warna; r1?: number; n?: number }> = ({ k, t0, wr, r1 = 260, n = 2 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const u = prog(k, t0 + i * 0.22, 0.9);
      return u > 0 && u < 1 ? (
        <circle key={i} r={mix(30, r1, u)} {...garis(wr.aksen2, 6 * (1 - u))} opacity={1 - u} filter="url(#sr-glow)" />
      ) : null;
    })}
  </>
);

const Sertifikat: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <g filter="url(#sr-glow)">
    <rect x={-150} y={-105} width={300} height={210} rx={14} {...g7()} fill={wr.panel} fillOpacity={0.88 * p} {...gambar(p)} />
    <rect x={-132} y={-87} width={264} height={174} rx={8} {...garis(wr.aksen, 2.5)} opacity={0.5 * p} />
    <path d="M -100 -52 H 100 M -100 -22 H 60 M -100 8 H 10" {...garis(wr.aksen, 5)} opacity={0.75 * p} />
    <circle cx={96} cy={52} r={27} {...garis(wr.aksen2, 5)} fill={wr.aksen} fillOpacity={0.35 * p} />
    <path d="M 84 76 L 80 106 L 96 96 L 112 106 L 108 76" {...garis(wr.aksen, 4)} opacity={p} />
  </g>
);

const Kampus: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <g filter="url(#sr-glow)">
    <path d="M -120 -34 L 0 -98 L 120 -34 Z" {...g7()} fill={wr.panel} fillOpacity={0.7 * p} {...gambar(p)} />
    {[-84, -42, 0, 42, 84].map((x) => (
      <line key={x} x1={x} x2={x} y1={-24} y2={58} {...garis(wr.aksen, 6)} {...gambar(p)} />
    ))}
    <path d="M -130 66 H 130 M -142 84 H 142" {...g7()} {...gambar(p)} />
    <circle cy={-50} r={9} {...garis(wr.aksen2, 4)} opacity={p} />
  </g>
);

const Telinga: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M -12 44 C -42 32 -52 -10 -30 -40 C -10 -70 40 -60 44 -20 C 46 8 20 18 20 40 C 20 62 -6 72 -24 58" />
    <path d="M -6 -20 C 6 -34 26 -22 16 -4 C 10 8 -2 6 -4 22" />
  </g>
);
const Buku: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M 0 -30 C -20 -42 -50 -42 -64 -34 V 34 C -50 26 -20 26 0 38 C 20 26 50 26 64 34 V -34 C 50 -42 20 -42 0 -30 M 0 -30 V 38" />
  </g>
);
const Mulut: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M -46 0 Q -24 -28 0 -14 Q 24 -28 46 0 Q 24 36 0 36 Q -24 36 -46 0 Z M -46 0 Q 0 12 46 0" />
  </g>
);
const Pena: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M -34 40 L -28 18 L 30 -40 L 46 -24 L -12 34 Z M 18 -28 L 34 -12 M -34 40 L -12 34" />
  </g>
);
const Mic: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <rect x={-15} y={-48} width={30} height={56} rx={15} />
    <path d="M -28 -6 Q -28 28 0 28 Q 28 28 28 -6 M 0 28 V 48 M -16 48 H 16" />
  </g>
);
const TanganAcung: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M -26 -10 H 26 V 18 Q 26 46 0 46 Q -26 46 -26 18 Z" />
    <path d="M -18 -10 V -50 M -6 -10 V -60 M 6 -10 V -56 M 18 -10 V -46 M -26 10 L -46 -8" />
  </g>
);
const Diskusi: React.FC = () => (
  <g {...garis(EMAS, 6)}>
    <path d="M -58 -38 H 6 Q 16 -38 16 -28 V -2 Q 16 8 6 8 H -20 L -38 24 V 8 H -58 Q -68 8 -68 -2 V -28 Q -68 -38 -58 -38 Z" />
    <path d="M 12 -12 H 52 Q 62 -12 62 -2 V 24 Q 62 34 52 34 H 44 V 50 L 28 34 H 12 Q 2 34 2 24" />
  </g>
);
const Dosen: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g>
    <rect x={-64} y={-56} width={64} height={46} rx={4} {...garis(wr.aksen, 4)} />
    <g transform="translate(26 54) scale(0.46)">
      <Orang wr={wr} stroke={EMAS} />
    </g>
    <path d="M 36 -10 L -8 -34" {...garis(EMAS, 5)} />
  </g>
);
const Gelembung: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g {...garis(EMAS, 6)}>
    <path d="M -40 -26 H 40 Q 52 -26 52 -14 V 14 Q 52 26 40 26 H 8 L -14 46 V 26 H -40 Q -52 26 -52 14 V -14 Q -52 -26 -40 -26 Z" fill={wr.panel} />
    {[-18, 0, 18].map((x) => (
      <circle key={x} cx={x} cy={0} r={4} fill={wr.aksen2} stroke="none" />
    ))}
  </g>
);
const Toko: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g {...garis(EMAS, 6)}>
    <path d="M -52 -8 L -42 -46 H 42 L 52 -8 Z M -44 -8 V 44 H 44 V -8 M -12 44 V 12 H 14 V 44" fill={wr.panel} />
    {[-26, 0, 26].map((x) => (
      <path key={x} d={`M ${x - 13} -8 Q ${x} 8 ${x + 13} -8`} />
    ))}
  </g>
);
const BukuTumpuk: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g {...garis(EMAS, 6)} fill={wr.panel}>
    <rect x={-60} y={14} width={120} height={28} rx={5} />
    <rect x={-50} y={-14} width={104} height={28} rx={5} />
    <rect x={-58} y={-42} width={112} height={28} rx={5} />
  </g>
);

/** Lencana kaca bergerigi ikon: muncul di detik `t` dengan pop + riak. */
const Lencana: React.FC<{ k: Konteks; wr: Warna; t: number; x: number; y: number; u?: number; children: React.ReactNode }> = ({
  k, wr, t, x, y, u = 150, children,
}) => {
  const m = prog(k, t, 0.5);
  if (m <= 0) return null;
  const d = drift(k, 0.6);
  return (
    <G x={x + d.x} y={y + d.y} s={mix(0.6, 1, m)} o={m}>
      <Cahaya r={u * 0.9} o={0.5 * m} />
      <Kaca x={-u / 2} y={-u * 0.43} w={u} h={u * 0.86} r={26} wr={wr} />
      <G s={u / 190}>{children}</G>
      <Riak k={k} t0={t} wr={wr} r1={u * 0.9} n={1} />
    </G>
  );
};

// 1. HOOK + "Halo parents! Hati-hati ya!": segitiga peringatan emas bertanda seru (logo besar & cincin hook ada di SplitReel).
export const OtcaSapa: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const sapa = tk(a, "sapa", 1.0);
  const hati = tk(a, "hati", 2.0);
  const t = detik(k);
  const awal = prog(k, a.mulai, 0.8);
  const gb = prog(k, sapa + 0.2, 0.7);
  const getar = t > hati ? Math.sin((t - hati) * 40) * Math.exp(-(t - hati) * 6) * 7 : 0;
  const denyutSeru = prog(k, hati, 0.35);
  const d = drift(k, 1);
  return (
    <>
      <G x={p.cx} y={CY}>
        <Cahaya r={mix(120, 470, awal)} o={0.55 * awal + 0.4 * denyutSeru} />
      </G>
      <G x={p.cx + d.x} y={CY + 30 + d.y} s={mix(0.55, 1, gb)} o={gb} r={getar}>
        <path d="M 0 -176 L 176 126 H -176 Z" {...g7()} fill={wr.panel} fillOpacity={0.88} strokeLinejoin="round" {...gambar(gb)} filter="url(#sr-glow)" />
        <path d="M 0 -118 L 124 100 H -124 Z" {...garis(wr.aksen, 3)} opacity={0.4 * gb} strokeLinejoin="round" />
        <g filter="url(#sr-glow)" opacity={mix(0.5, 1, denyutSeru)}>
          <rect x={-12} y={-78} width={24} height={118} rx={12} fill={EMAS} />
          <circle cy={76} r={15} fill={EMAS} />
        </g>
        <Riak k={k} t0={hati} wr={wr} r1={320} n={2} />
      </G>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const u = prog(k, hati + i * 0.05, 0.8);
        const ang = (i / 6) * Math.PI * 2 + 0.4;
        return u > 0 && u < 1 ? (
          <G key={i} x={p.cx + Math.cos(ang) * mix(120, 330, u)} y={CY + 10 + Math.sin(ang) * mix(120, 300, u)} o={1 - u}>
            <Bintang c={wr.aksen2} r={18} />
          </G>
        ) : null;
      })}
    </>
  );
};

// 2. Sertifikat bercentang (kiri) vs kampus Jerman pudar bertanda tanya (kanan).
export const OtcaSertifikatKampus: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const serti = tk(a, "sertifikat", 0.6);
  const centang = tk(a, "centang", 1.8);
  const belum = tk(a, "belum", 2.8);
  const siap = tk(a, "siap", 5.0);
  const s = prog(k, serti, 0.7);
  const c = prog(k, centang, 0.5);
  const kp = prog(k, belum, 0.8);
  const q = prog(k, siap, 0.5);
  const d = drift(k, 1);
  const lx = p.cx - 185;
  const rx = p.cx + 195;
  return (
    <>
      <G x={lx + d.x} y={CY + d.y} s={mix(0.8, 1, s)} o={Math.max(0.0001, s)}>
        <Cahaya r={290} o={0.45 * s} />
        <Sertifikat wr={wr} p={s} />
        <G x={92} y={46} s={mix(1.5, 0.62, c)} o={c}>
          <Centang wr={wr} p={c} />
        </G>
        <Riak k={k} t0={centang} wr={wr} r1={230} n={1} />
      </G>
      <line x1={p.cx + 6} x2={p.cx + 6} y1={CY - 140} y2={CY + 140} {...garis(wr.garis, 3)} strokeDasharray="4 14" opacity={kp} />
      <G x={rx + d.x * 0.6} y={CY + 10 + d.y * 0.6} s={mix(0.85, 1, kp)} o={0.3 * kp + 0.15 * q}>
        <Kampus wr={wr} p={kp} />
      </G>
      <G x={rx} y={CY - 150 + Math.sin(detik(k) * 2.2) * 5} s={mix(0.6, 0.9, q)} o={q}>
        <Tanya wr={wr} p={q} font={font} />
      </G>
    </>
  );
};

// 3. Tangga level A1 → C1 menyala berurutan (sesuai "level yang berhasil dicapai"), bendera di anak tangga tertinggi tercapai.
export const OtcaTangga: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const naik = tk(a, "naik", 1.2);
  const puncak = tk(a, "puncak", 4.0);
  const label = ["A1", "A2", "B1", "B2", "C1"];
  const lebar = 124;
  const x0 = p.cx - (lebar * 5) / 2;
  const dasar = CY + 215;
  const d = drift(k, 0.8);
  const waktu = (i: number) => mix(naik, puncak, Math.min(i, 3) / 3);
  const pendaki = progE(k, naik - 0.2, puncak - naik + 0.4, INOUT);
  const px = mix(x0 + lebar * 0.5, x0 + lebar * 3.5, pendaki);
  const idxP = Math.min(3, pendaki * 3.4);
  const py = dasar - (70 + Math.min(3, Math.floor(idxP + 0.0)) * 52) - 26;
  const bendera = prog(k, puncak, 0.7);
  return (
    <G x={d.x} y={d.y}>
      {label.map((l, i) => {
        const h = 70 + i * 52;
        const nyala = i < 4 ? prog(k, waktu(i), 0.5) : 0;
        const muncul = prog(k, a.mulai + i * 0.06, 0.45);
        const x = x0 + i * lebar;
        return (
          <g key={l} opacity={muncul}>
            <rect x={x + 4} y={dasar - h} width={lebar - 8} height={h} rx={10}
              {...g7(nyala > 0.5 ? EMAS : wr.garis)} fill={rgba(wr.aksen, 0.08 + 0.45 * nyala)} strokeDasharray={i === 4 ? "10 12" : undefined}
              filter={nyala > 0.5 ? "url(#sr-glow)" : undefined} />
            <text x={x + lebar / 2} y={dasar - h + 50} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={42}
              fill={nyala > 0.5 ? wr.aksen2 : wr.teks} opacity={mix(0.45, 1, nyala)}>
              {l}
            </text>
          </g>
        );
      })}
      <G x={px} y={py} o={prog(k, naik - 0.2, 0.3)}>
        <circle r={13} fill={EMAS} filter="url(#sr-glow)" />
      </G>
      <G x={x0 + lebar * 3.5} y={dasar - 70 - 3 * 52} s={0.85 * bendera} o={bendera}>
        <line x1={0} y1={0} x2={0} y2={-120} {...garis(wr.teks, 5)} />
        <path d="M 0 -120 L 72 -102 L 0 -84 Z" fill={EMAS} filter="url(#sr-glow)" />
        <Riak k={k} t0={puncak} wr={wr} r1={200} n={1} />
      </G>
    </G>
  );
};

// 4. Timbangan: sertifikat (ringan) vs buku + gelembung chat + toko (kemampuan akademik & sehari-hari makin berat).
export const OtcaTimbangan: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const timb = tk(a, "timbangan", 0.8);
  const serti = tk(a, "sertifikat", 1.2);
  const akad = tk(a, "akademik", 6.2);
  const harian = tk(a, "harian", 7.3);
  const m = prog(k, timb, 0.7);
  const s = prog(k, serti, 0.5);
  const b = prog(k, akad, 0.5);
  const h = prog(k, harian, 0.5);
  const goyang = Math.sin((detik(k) - a.mulai) * 1.4) * 1.1;
  const sudut = progE(k, akad, 0.9, INOUT) * 9 + progE(k, harian, 0.9, INOUT) * 9 + goyang;
  const d = drift(k, 0.7);
  return (
    <G x={k.p.cx + d.x} y={CY + 135 + d.y} s={0.88 * mix(0.9, 1, m)} o={m}>
      <Cahaya r={330} o={0.35} />
      <Timbangan wr={wr} p={m} sudut={sudut}
        kiri={
          <G y={-52} s={0.5} o={s}>
            <Sertifikat wr={wr} p={s} />
          </G>
        }
        kanan={
          <>
            <G y={-34} s={0.5 * mix(0.7, 1, b)} o={b}>
              <BukuTumpuk wr={wr} />
            </G>
            <G x={-34} y={-104} s={0.46 * mix(0.6, 1, h)} o={h}>
              <Gelembung wr={wr} />
            </G>
            <G x={40} y={-96} s={0.44 * mix(0.6, 1, h)} o={h}>
              <Toko wr={wr} />
            </G>
          </>
        } />
    </G>
  );
};

// 5. Ruang kuliah: papan tulis + enam lencana kemampuan muncul per kata (dosen, telinga, buku, diskusi, tangan, mikrofon).
export const OtcaRuangKuliah: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const ruang = prog(k, a.mulai, 0.8);
  const d = drift(k, 0.8);
  const grid: { n: string; x: number; y: number; ikon: React.ReactNode }[] = [
    { n: "telinga", x: -200, y: 622, ikon: <Telinga /> },
    { n: "dosen", x: 0, y: 622, ikon: <Dosen wr={wr} /> },
    { n: "buku", x: 200, y: 622, ikon: <Buku /> },
    { n: "diskusi", x: -200, y: 772, ikon: <Diskusi /> },
    { n: "tangan", x: 0, y: 772, ikon: <TanganAcung /> },
    { n: "mic", x: 200, y: 772, ikon: <Mic /> },
  ];
  const fallback = [1.5, 2.6, 4.6, 5.8, 7.2, 9.4];
  return (
    <>
      <G x={d.x * 0.5} y={d.y * 0.5} o={ruang}>
        <rect x={p.cx - 290} y={402} width={580} height={124} rx={12} {...garis(EMAS, 5)} fill={wr.panel} fillOpacity={0.55} {...gambar(ruang)} />
        <path d={`M ${p.cx - 240} 440 q 40 -22 80 0 t 80 0 M ${p.cx - 240} 478 h 150 M ${p.cx + 20} 440 h 150 M ${p.cx + 20} 478 q 40 -22 80 0`}
          {...garis(wr.aksen2, 4)} opacity={0.55 * prog(k, a.mulai + 0.5, 0.9)} {...gambar(prog(k, a.mulai + 0.5, 1.1))} />
        <line x1={p.cx - 290} x2={p.cx + 290} y1={540} y2={540} {...garis(wr.garis, 3)} opacity={ruang} />
      </G>
      {grid.map((g, i) => (
        <Lencana key={g.n} k={k} wr={wr} t={tk(a, g.n, fallback[i])} x={p.cx + g.x} y={g.y} u={150}>
          {g.ikon}
        </Lencana>
      ))}
    </>
  );
};

// 6. Sertifikat besar dicoret emas ("jangan hanya fokus pada level sertifikat").
export const OtcaCoret: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const muncul = prog(k, a.mulai, 0.6);
  const coret = tk(a, "coret", 0.9);
  const c1 = progE(k, coret, 0.4, INOUT);
  const c2 = progE(k, coret + 0.25, 0.4, INOUT);
  const redup = prog(k, coret + 0.4, 0.5);
  const d = drift(k, 1);
  const getar = detik(k) > coret + 0.05 ? Math.sin((detik(k) - coret) * 50) * Math.exp(-(detik(k) - coret) * 7) * 6 : 0;
  return (
    <G x={p.cx + d.x + getar} y={CY + d.y} s={1.55 * mix(0.85, 1, muncul)} o={muncul}>
      <Cahaya r={330} o={0.4 * (1 - redup)} />
      <G o={mix(1, 0.45, redup)}>
        <Sertifikat wr={wr} p={muncul} />
      </G>
      <g filter="url(#sr-glow)">
        <path d="M -190 -120 L 190 130" {...garis(EMAS, 15)} {...gambar(c1)} />
        <path d="M 190 -120 L -190 130" {...garis(EMAS, 15)} {...gambar(c2)} />
      </g>
      <Riak k={k} t0={coret + 0.5} wr={wr} r1={240} n={1} />
    </G>
  );
};

// 7. Radar empat kemampuan (telinga, mulut, pena, buku): tak seimbang → seimbang tepat di kata "seimbang".
export const OtcaRadar: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const R = 125;
  const cy = 580;
  const sumbu = [
    { n: "dengar", ang: -90, v: 0.95, ikon: <Telinga />, f: 2.2 },
    { n: "bicara", ang: 0, v: 0.42, ikon: <Mulut />, f: 3.2 },
    { n: "tulis", ang: 90, v: 0.55, ikon: <Pena />, f: 4.3 },
    { n: "baca", ang: 180, v: 0.82, ikon: <Buku />, f: 5.1 },
  ];
  const seimbang = tk(a, "seimbang", 6.3);
  const guna = tk(a, "guna", 7.7);
  const bal = progE(k, seimbang, 0.9, INOUT);
  const rangka = prog(k, a.mulai, 0.6);
  const d = drift(k, 0.7);
  const pts = sumbu.map((s) => {
    const tumbuh = prog(k, tk(a, s.n, s.f), 0.7);
    const v = mix(s.v, 0.86, bal) * tumbuh;
    const r = (s.ang * Math.PI) / 180;
    return { x: Math.cos(r) * R * v, y: Math.sin(r) * R * v };
  });
  const poligon = `M ${pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L ")} Z`;
  const c = prog(k, guna, 0.5);
  return (
    <G x={p.cx + d.x} y={cy + d.y}>
      <Cahaya r={mix(220, 330, bal)} o={0.35 + 0.35 * bal} />
      {[0.34, 0.67, 1].map((f) => (
        <path key={f} d={`M 0 ${-R * f} L ${R * f} 0 L 0 ${R * f} L ${-R * f} 0 Z`} {...garis(wr.garis, 3)} opacity={rangka} />
      ))}
      <path d={`M 0 ${-R} V ${R} M ${-R} 0 H ${R}`} {...garis(wr.garis, 3)} opacity={rangka} />
      <path d={poligon} {...g7()} fill={rgba(wr.aksen, 0.18 + 0.2 * bal)} strokeLinejoin="round" filter="url(#sr-glow)" />
      {pts.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={10} fill={wr.aksen2} filter="url(#sr-glow)" />
      ))}
      {sumbu.map((s) => {
        const r = (s.ang * Math.PI) / 180;
        return (
          <Lencana key={s.n} k={k} wr={wr} t={tk(a, s.n, s.f)} x={Math.cos(r) * (R + 58)} y={Math.sin(r) * (R + 58)} u={92}>
            {s.ikon}
          </Lencana>
        );
      })}
      <G s={0.55 * c} o={c}>
        <Centang wr={wr} p={c} />
      </G>
      <Riak k={k} t0={seimbang} wr={wr} r1={300} n={2} />
    </G>
  );
};

const gigi = (R: number, r: number, n: number) => {
  const st = (Math.PI * 2) / n;
  const P = (rad: number, ang: number) => `${(Math.cos(ang) * rad).toFixed(1)} ${(Math.sin(ang) * rad).toFixed(1)}`;
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = i * st;
    d += `${i ? "L" : "M"} ${P(r, a0 - st * 0.3)} L ${P(R, a0 - st * 0.16)} L ${P(R, a0 + st * 0.16)} L ${P(r, a0 + st * 0.3)} `;
  }
  return d + "Z";
};

// 8. Lembar bukti level meredup; roda gigi emas berputar makin cepat ("kemampuan yang benar-benar terpakai").
export const OtcaBuktiGear: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const bukti = tk(a, "bukti", 2.6);
  const tapi = tk(a, "tapi", 4.2);
  const pakai = tk(a, "terpakai", 5.9);
  const t = detik(k);
  const s = prog(k, a.mulai, 0.7);
  const redup = prog(k, bukti, 0.6);
  const g = prog(k, tapi, 0.7);
  const rot = t > tapi ? Math.pow(t - tapi, 1.55) * 38 : 0;
  const d = drift(k, 0.8);
  const ledak = prog(k, pakai, 0.35);
  return (
    <>
      <G x={p.cx - 205 + d.x} y={CY + d.y} s={mix(0.85, 0.95, s)} o={s * mix(1, 0.32, redup)}>
        <Cahaya r={250} o={0.4 * (1 - redup)} />
        <Sertifikat wr={wr} p={s} />
      </G>
      <G x={p.cx + 150 + d.x} y={CY - 10 + d.y} s={mix(0.6, 1, g)} o={g}>
        <Cahaya r={mix(220, 380, ledak)} o={0.4 + 0.5 * ledak} />
        <g transform={`rotate(${rot})`} filter="url(#sr-glow)">
          <path d={gigi(124, 100, 12)} {...g7()} fill={wr.panel} fillOpacity={0.85} strokeLinejoin="round" />
          <circle r={44} {...garis(wr.aksen2, 6)} />
          <circle r={14} fill={EMAS} />
        </g>
        <G x={152} y={96}>
          <g transform={`rotate(${-rot * 2 + 15})`} filter="url(#sr-glow)">
            <path d={gigi(62, 48, 6)} {...g7()} fill={wr.panel} fillOpacity={0.85} strokeLinejoin="round" />
            <circle r={14} {...garis(wr.aksen2, 5)} />
          </g>
        </G>
        <Riak k={k} t0={pakai} wr={wr} r1={300} n={2} />
      </G>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const u = prog(k, pakai + i * 0.04, 0.8);
        const ang = (i / 7) * Math.PI * 2;
        return u > 0 && u < 1 ? (
          <G key={i} x={p.cx + 150 + Math.cos(ang) * mix(130, 300, u)} y={CY - 10 + Math.sin(ang) * mix(130, 260, u)} o={1 - u}>
            <Bintang c={wr.aksen2} r={20} />
          </G>
        ) : null;
      })}
    </>
  );
};

// 9. Pesawat emas terbang di atas peta Jerman (kontur bergaris putus + kota) menuju Berlin.
const KONTUR: [number, number][] = [
  [6.7, 53.6], [8.0, 53.7], [8.6, 54.0], [8.9, 54.9], [9.9, 54.8], [10.9, 54.0], [12.0, 54.2], [13.5, 54.6], [14.2, 53.9],
  [14.6, 52.9], [14.7, 51.5], [15.0, 51.0], [14.3, 50.9], [12.1, 50.3], [12.5, 49.5], [13.8, 48.8], [13.0, 47.9], [12.1, 47.6],
  [10.4, 47.5], [9.6, 47.6], [7.6, 47.6], [7.8, 48.9], [8.2, 49.0], [6.4, 49.5], [6.2, 50.1], [6.0, 50.8], [6.0, 51.8], [7.0, 52.2],
  [7.0, 53.3],
];
const KOTA: { n: string; ll: [number, number] }[] = [
  { n: "hamburg", ll: [10.0, 53.55] },
  { n: "koln", ll: [6.96, 50.94] },
  { n: "frankfurt", ll: [8.7, 50.1] },
  { n: "munchen", ll: [11.6, 48.1] },
];
const BERLIN: [number, number] = [13.4, 52.5];

export const OtcaPesawatPeta: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const sk = 41;
  const proj = ([lon, lat]: [number, number]) => ({ x: (lon - 10.4) * sk, y: -(lat - 51.2) * sk * 1.58 });
  const peta = prog(k, a.mulai, 1.0);
  const terbang = tk(a, "terbang", 0.5);
  const durasi = Math.max(1.5, a.selesai - terbang - 0.15);
  const u = progE(k, terbang, durasi, INOUT);
  const b = proj(BERLIN);
  const s0 = { x: -330, y: 230 };
  const c0 = { x: -60, y: -330 };
  const titik = (v: number) => ({
    x: (1 - v) * (1 - v) * s0.x + 2 * (1 - v) * v * c0.x + v * v * b.x,
    y: (1 - v) * (1 - v) * s0.y + 2 * (1 - v) * v * c0.y + v * v * b.y,
  });
  const q = titik(u);
  const q2 = titik(Math.min(1, u + 0.02));
  const sudut = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
  const tiba = prog(k, terbang + durasi, 0.5);
  const d = drift(k, 0.6);
  const kontur = `M ${KONTUR.map((l) => {
    const c = proj(l);
    return `${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }).join(" L ")} Z`;
  return (
    <G x={p.cx + d.x} y={CY + 10 + d.y}>
      <Cahaya r={380} o={0.4 * peta} />
      <path d={kontur} {...garis(EMAS, 5)} strokeDasharray="14 12" strokeLinejoin="round" fill={rgba(wr.aksen, 0.1)} opacity={peta}
        filter="url(#sr-glow)" />
      {KOTA.map((c) => {
        const o = proj(c.ll);
        return <circle key={c.n} cx={o.x} cy={o.y} r={7} fill={wr.aksen} opacity={0.7 * peta} />;
      })}
      {Array.from({ length: 36 }, (_, i) => {
        const v = (i / 36) * u;
        const o = titik(v);
        return <circle key={i} cx={o.x} cy={o.y} r={4} fill={wr.aksen2} opacity={0.2 + 0.7 * (i / 36)} />;
      })}
      <G x={b.x} y={b.y}>
        <circle r={12} fill={EMAS} filter="url(#sr-glow)" opacity={peta} />
        <Riak k={k} t0={terbang + durasi - 0.1} wr={wr} r1={170} n={2} />
      </G>
      <G x={q.x} y={q.y} r={sudut} s={mix(1.1, 0.8, tiba)} o={1 - 0.6 * tiba}>
        <path d="M 62 0 L -8 -14 L -28 -54 L -46 -54 L -34 -12 L -62 -8 L -68 -26 L -78 -26 L -74 0 L -78 26 L -68 26 L -62 8 L -34 12 L -46 54 L -28 54 L -8 14 Z"
          fill={EMAS} stroke={wr.aksen2} strokeWidth={2} strokeLinejoin="round" filter="url(#sr-glow)" />
      </G>
    </G>
  );
};

// 10. Kartu akhir: logo OTCA besar (digeser SplitReel) + pil "Klik link di bio" + riak emas.
export const OtcaKartu: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const m = prog(k, a.mulai + 0.25, 0.6);
  const sapu = prog(k, a.mulai + 0.5, 1.0);
  return (
    <>
      <G x={p.cx} y={556}>
        <Cahaya r={mix(300, 480, m)} o={0.7} />
        <Riak k={k} t0={a.mulai + 0.2} wr={wr} r1={380} n={3} />
      </G>
      <G x={p.cx} y={790} s={mix(0.92, 1, m)} o={m}>
        <Kaca x={-300} y={-52} w={600} h={104} r={52} wr={wr} o={0.8} />
        <rect x={-299} y={-51} width={598} height={102} rx={51} {...g7()} strokeWidth={3} />
        <defs>
          <linearGradient id="ok-kilau" gradientUnits="userSpaceOnUse" x1={mix(-420, 420, sapu) - 120} y1={0} x2={mix(-420, 420, sapu) + 120} y2={-30}>
            <stop offset="0" stopColor={wr.aksen} />
            <stop offset="0.5" stopColor="#FFFFFF" />
            <stop offset="1" stopColor={wr.aksen} />
          </linearGradient>
        </defs>
        <text x={0} y={17} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={58} fill="url(#ok-kilau)">
          Klik link di bio
        </text>
      </G>
      {Array.from({ length: 10 }, (_, i) => {
        const x = p.cx - 330 + random(`ok${i}`) * 660;
        const y = 420 + random(`oy${i}`) * 400;
        const o = 0.2 + 0.6 * Math.abs(Math.sin(detik(k) * 2 + i));
        return (
          <G key={i} x={x} y={y} o={o * m} s={0.4 + random(`os${i}`) * 0.5}>
            <Bintang c={wr.aksen2} r={14} />
          </G>
        );
      })}
    </>
  );
};

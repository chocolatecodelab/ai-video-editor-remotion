// Pustaka adegan "Life Uncertain" (split-layout, konten motivasi Zar, tanpa brand). Palet "kabut → jernih": tinta
// hijau-gelap (latar/panel token), emas pucat (aksen) untuk cahaya & jalur, sage kabut (aksen-2) untuk kabut & air.
// Bahasa gerak: kabut drift ber-parallax (menipis adegan demi adegan), garis tipis bercahaya, fisika tali (melengkung,
// bergetar meluruh, putus memantul). Kata kunci serif (token `serif`, Playfair Display) muncul DARI kabut (blur → tajam).
// Adegan `depan`: grafis turun ke belakang kepala talent (puncak kepala ±950 px layar, pusat x ±525); TalentDepan di
// SplitReel menutupinya. Adegan `penuh`: kanvas 1080×1920, pita caption y 1430–1570 dibiarkan kosong dari figur (§10).

import React from "react";
import { Easing, random, spring } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Cahaya, G, Orang, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const TIPIS = 3;
const serif = (k: Konteks) => k.tok.font.serif?.family ?? k.tok.font.judul.family;
const bungkus = (v: number, lo: number, hi: number) => ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo)) + lo;

/** Campur dua warna hex (#RRGGBB) linear. */
const campur = (a: string, b: string, t: number) => {
  const h = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const v = [0, 1, 2].map((i) => Math.round(mix(h(a, i), h(b, i), Math.min(1, Math.max(0, t)))));
  return `#${v.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

/** Pegas 0→1 mulai detik t0 (boleh overshoot bila redaman kecil). */
const pegas = (k: Konteks, t0: number, redam = 12, kaku = 120) =>
  spring({ frame: k.f - t0 * k.fps, fps: k.fps, config: { damping: redam, stiffness: kaku, mass: 0.8 } });

/** Kabut drift: gumpalan elips bergradien yang hanyut horizontal, kecepatan & opasitas per kedalaman (parallax). */
const Kabut: React.FC<{ k: Konteks; wr: Warna; id: string; n?: number; kuat: number; y0: number; y1: number; laju?: number }> = ({
  k, wr, id, n = 14, kuat, y0, y1, laju = 1,
}) => {
  const t = detik(k);
  const W = k.p.W;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-kb`}>
          <stop offset="0" stopColor={campur(wr.aksen2, "#FFFFFF", 0.25)} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={wr.aksen2} stopOpacity={0.16} />
          <stop offset="1" stopColor={wr.aksen2} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => {
        const d = 0.25 + random(`${id}kd${i}`) * 0.75;
        const rx = 240 + random(`${id}kr${i}`) * 420 * (0.6 + d);
        const ry = 50 + random(`${id}ky${i}`) * 120;
        const arah = random(`${id}ka${i}`) > 0.35 ? 1 : -1;
        const x = bungkus(random(`${id}kx${i}`) * (W + 2 * rx) + arah * t * (10 + 34 * d) * laju, -rx, W + rx);
        const y = mix(y0, y1, random(`${id}kz${i}`)) + Math.sin(t * 0.35 + i * 1.7) * 12 * d;
        return <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-kb)`} opacity={Math.min(1, kuat * (0.2 + 0.55 * d))} />;
      })}
    </g>
  );
};

/** Latar adegan: gradien tinta → panel, cahaya `jernih` (emas pucat, makin terang menuju akhir video), kabut, debu
 *  cahaya ber-parallax. `penuh` = setinggi frame; selain itu memudar sendiri di bawah panggung (adegan depan). */
const LatarLu: React.FC<{ k: Konteks; wr: Warna; id: string; jernih: number; kabut: number; penuh?: boolean; cy?: number }> = ({
  k, wr, id, jernih, kabut, penuh, cy,
}) => {
  const { p } = k;
  const t = detik(k);
  const pudar = !penuh;
  // adegan depan: latar turun menutupi ruangan di belakang kepala (talent cutout di atasnya), pudar di bawah dada
  const H = p.tinggi + (k.a.depan ? 440 : 0);
  const yc = cy ?? H * 0.42;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={wr.latar} />
          <stop offset={k.a.depan ? 0.5 : 0.65} stopColor={campur(wr.panel, wr.aksen2, 0.06)} />
          <stop offset="1" stopColor={campur(wr.panel, wr.aksen, 0.1 * jernih)} />
        </linearGradient>
        <radialGradient id={`${id}-c`}>
          <stop offset="0" stopColor={campur(wr.aksen, "#FFFFFF", 0.35)} stopOpacity={0.55} />
          <stop offset="0.4" stopColor={wr.aksen} stopOpacity={0.18} />
          <stop offset="1" stopColor={wr.aksen} stopOpacity={0} />
        </radialGradient>
        {pudar ? (
          <>
            <linearGradient id={`${id}-pg`} gradientUnits="userSpaceOnUse" x1="0" y1={H - 300} x2="0" y2={H + 20}>
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#000000" />
            </linearGradient>
            <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="-50" y="-50" width={p.W + 100} height={H + 120}>
              <rect x={-50} y={-50} width={p.W + 100} height={H + 120} fill={`url(#${id}-pg)`} />
            </mask>
          </>
        ) : null}
      </defs>
      <g mask={pudar ? `url(#${id}-m)` : undefined}>
        <rect x={-40} y={-40} width={p.W + 80} height={H + 80} fill={`url(#${id}-l)`} />
        <ellipse cx={p.W / 2} cy={yc} rx={p.W * mix(0.35, 0.9, jernih)} ry={H * mix(0.18, 0.4, jernih)} fill={`url(#${id}-c)`}
          opacity={mix(0.25, 0.9, jernih)} />
        <Kabut k={k} wr={wr} id={id} kuat={kabut} y0={H * 0.1} y1={H * 0.95} n={penuh ? 20 : 14} />
        {Array.from({ length: penuh ? 40 : 26 }, (_, i) => {
          const d = 0.3 + random(`${id}dd${i}`) * 0.7;
          const x = bungkus(random(`${id}dx${i}`) * p.W + t * 9 * d, -10, p.W + 10);
          const y = bungkus(random(`${id}dy${i}`) * H - t * 14 * d, 0, H);
          return <circle key={i} cx={x} cy={y} r={0.8 + d * 2} fill={campur(wr.aksen2, wr.aksen, jernih)} opacity={0.1 + 0.25 * d} />;
        })}
      </g>
    </g>
  );
};

/** Kata serif yang muncul DARI kabut: blur 18 → 0, jarak huruf merapat, pijar emas meluruh; `larut` = detik mulai
 *  memudar kembali ke kabut. */
const KataKabut: React.FC<{ k: Konteks; wr: Warna; t0: number; x: number; y: number; teks: string; ukuran: number;
  miring?: boolean; isi?: string; spasi?: number; larut?: number; anchor?: "middle" | "start" | "end" }> = ({
  k, wr, t0, x, y, teks, ukuran, miring, isi, spasi = 4, larut, anchor = "middle",
}) => {
  const u = prog(k, t0 - 0.12, 0.9, "keluar");
  const l = larut === undefined ? 0 : prog(k, larut, 0.7);
  if (u <= 0 || l >= 1) return null;
  const kilat = Math.exp(-Math.max(0, detik(k) - t0) / 0.5);
  const blur = (1 - u) * 18 + l * 14;
  return (
    <text x={x} y={y + (1 - u) * 18} textAnchor={anchor} fontFamily={serif(k)} fontSize={ukuran} fontStyle={miring ? "italic" : undefined}
      letterSpacing={mix(spasi + 26, spasi, u) + l * 20} fill={isi ?? wr.teks} opacity={u * (1 - l)}
      style={{ filter: `blur(${blur.toFixed(2)}px) drop-shadow(0 0 ${10 + 26 * kilat}px ${rgba(wr.aksen, 0.3 + 0.45 * kilat)})` }}>
      {teks}
    </text>
  );
};

/** Riak cincin dari (0,0) lokal. */
const Riak: React.FC<{ k: Konteks; t0: number; c: string; r1?: number; n?: number }> = ({ k, t0, c, r1 = 220, n = 2 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const u = prog(k, t0 + i * 0.16, 1, "keluar");
      return u > 0 && u < 1 ? <circle key={i} r={mix(14, r1, u)} {...garis(c, mix(5, 1, u))} opacity={(1 - u) * 0.85} filter="url(#sr-glow)" /> : null;
    })}
  </>
);

// ---------- S1 HOOK (penuh) "Sometimes life doesn't go the way you planned" ----------
// Rencana = jalur garis lurus + titik berjalan melewati tonggak; di "planned" garis patah, sisa jalur jatuh berputar,
// jalur baru berbelok masuk kabut; "PLANNED" serif ditekuk di sambungan PLAN|NED.
const RA: [number, number] = [130, 1240];
const RB: [number, number] = [950, 690];
const PATAH = 0.62;
const diRencana = (u: number): [number, number] => [mix(RA[0], RB[0], u), mix(RA[1], RB[1], u)];

export const LuRencana: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const t = detik(k);
  const rencana = tk(a, "rencana", 3.8);
  const hidup = tk(a, "hidup", 1.8);
  const tampil = mix(0.55, 1, prog(k, 0, 0.6, "keluar")); // frame 0 sudah bergaris (hook)
  const tekuk = pegas(k, rencana, 9, 140);
  const belok = progE(k, rencana + 0.08, 1.3, INOUT);
  const kabut = mix(0.55, 1.15, prog(k, rencana, 1.2));
  const uTitik = t < rencana ? mix(0.12, PATAH - 0.02, t / rencana) : PATAH - 0.02;
  const ragu = t > rencana ? Math.sin(t * 38) * 5 * Math.exp(-(t - rencana) / 0.5) : 0;
  const [px, py] = diRencana(PATAH);
  const jalurBaru = `M ${px} ${py} C ${px + 120} ${py - 30} ${px + 40} ${py - 230} ${px + 170} ${py - 300} S ${px + 330} ${py - 420} ${px + 230} ${py - 560} S ${px + 140} ${py - 700} ${px + 290} ${py - 820}`;
  const sudut = Math.atan2(RB[1] - RA[1], RB[0] - RA[0]) * (180 / Math.PI);
  const d = drift(k, 0.5);
  const tonggak = [0.1, 0.26, 0.42, 0.58, 0.74, 0.9];
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu1" jernih={0.1} kabut={0.45} penuh cy={820} />
      <G x={d.x} y={d.y}>
        <text x={RA[0] + 10} y={RA[1] + 70} fontFamily={font} fontWeight={700} fontSize={26} letterSpacing={9} fill={wr.aksen2}
          opacity={0.7 * tampil}>THE PLAN</text>
        <path d={`M ${RA[0]} ${RA[1]} L ${px} ${py}`} {...garis(wr.teks, TIPIS)} {...gambar(Math.min(1, tampil / PATAH))} filter="url(#sr-glow)" />
        {/* sisa rencana: patah & jatuh berputar di titik patah */}
        <g transform={`rotate(${tekuk * 34} ${px} ${py})`} opacity={mix(1, 0.3, prog(k, rencana, 0.8))}>
          <path d={`M ${px} ${py} L ${RB[0]} ${RB[1]}`} {...garis(wr.teks, TIPIS)} strokeDasharray={t > rencana ? "16 18" : undefined}
            opacity={tampil > PATAH ? 1 : 0} />
          <G x={RB[0]} y={RB[1]}>
            <circle r={26} {...garis(wr.aksen2, 2.5)} opacity={0.8} />
            <circle r={8} fill={wr.aksen2} opacity={0.8} />
          </G>
        </g>
        {tonggak.map((u, i) => {
          const [x, y] = diRencana(u);
          const lewat = uTitik > u;
          const jatuh = u > PATAH ? tekuk : 0;
          return (
            <g key={i} transform={u > PATAH ? `rotate(${jatuh * 34} ${px} ${py})` : undefined} opacity={u > PATAH ? mix(1, 0.3, prog(k, rencana, 0.8)) : 1}>
              <circle cx={x} cy={y} r={11} {...(lewat ? {} : garis(wr.teks, 2.5))} fill={lewat ? wr.aksen : wr.latar} />
              <line x1={x} x2={x} y1={y - 24} y2={y - 46} {...garis(wr.teks, 2)} opacity={0.5} />
            </g>
          );
        })}
        {/* jalur baru: berbelok masuk kabut */}
        <path d={jalurBaru} {...garis(wr.aksen, 3.5)} {...gambar(belok)} filter="url(#sr-glow)" />
        <G x={px} y={py}>
          <Riak k={k} t0={rencana} c={wr.aksen} r1={200} />
        </G>
        <G x={diRencana(uTitik)[0] + ragu} y={diRencana(uTitik)[1]}>
          <Cahaya r={70} o={0.9} />
          <circle r={14} fill={campur(wr.aksen, "#FFFFFF", 0.4)} filter="url(#sr-glow)" />
        </G>
      </G>
      <Kabut k={k} wr={wr} id="lu1f" kuat={kabut} y0={140} y1={760} n={10} laju={1.4} />
      {/* PLANNED: PLAN | NED berengsel di sambungan, NED tertekuk turun saat rencana patah */}
      <g transform={`rotate(${sudut * 0.12} 540 470)`}>
        <KataKabut k={k} wr={wr} t0={hidup + 0.7} x={572} y={470} teks="PLAN" ukuran={150} spasi={6} anchor="end" />
        <g transform={`rotate(${tekuk * 26} 572 470) translate(0 ${tekuk * 6})`}>
          <KataKabut k={k} wr={wr} t0={hidup + 0.7} x={578} y={470} teks="NED" ukuran={150} spasi={6} anchor="start"
            isi={campur(wr.teks, wr.aksen, tekuk)} />
        </g>
        <line x1={575} x2={575} y1={350} y2={490} {...garis(wr.aksen, 3)} opacity={Math.exp(-Math.max(0, t - rencana) / 0.25) * (t > rencana ? 1 : 0)}
          filter="url(#sr-glow)" />
      </g>
      <text x={540} y={560} textAnchor="middle" fontFamily={font} fontWeight={600} fontSize={24} letterSpacing={10} fill={wr.aksen2}
        opacity={0.6 * prog(k, hidup + 1.2, 0.6)}>THE WAY YOU</text>
    </>
  );
};

// ---------- tali marionet (S2 tegang, S5 putus — match cut bentuk sama) ----------
const BAR: [number, number] = [540, 560];
/** [ujung di palang (relatif pusat palang), titik di tubuh (px layar)] — kepala/bahu talent (±950 / ±1330 px). */
const TALI: [[number, number], [number, number]][] = [
  [[-172, 0], [255, 1335]],
  [[172, 0], [800, 1335]],
  [[0, 112], [528, 990]],
  [[-92, 0], [345, 1075]],
  [[92, 0], [712, 1075]],
];

const Palang: React.FC<{ wr: Warna }> = ({ wr }) => (
  <g filter="url(#sr-glow)">
    <line x1={0} y1={-60} x2={0} y2={-1200} {...garis(wr.teks, 1.5)} opacity={0.45} />
    <circle cy={-62} r={10} {...garis(wr.teks, 2.5)} />
    <rect x={-185} y={-12} width={370} height={24} rx={12} {...garis(campur(wr.aksen, wr.teks, 0.4), TIPIS)} fill={wr.panel} />
    <rect x={-12} y={-52} width={24} height={176} rx={12} {...garis(campur(wr.aksen, wr.teks, 0.4), TIPIS)} fill={wr.panel} />
    {[-172, 172, -92, 92].map((x) => <circle key={x} cx={x} cy={0} r={5} fill={wr.aksen} />)}
    <circle cx={0} cy={112} r={5} fill={wr.aksen} />
  </g>
);

/** Tali sebagai kurva kuadrat: lendut `kendur` px + getar (mode dasar, meluruh dari tiap hentakan). `putus` 0..1: dua
 *  potongan memantul — atas tertarik ke palang, bawah jatuh & memudar. */
const Tali: React.FC<{ k: Konteks; wr: Warna; x0: number; y0: number; x1: number; y1: number; kendur: number; getar: number;
  fase: number; putus?: number }> = ({ k, wr, x0, y0, x1, y1, kendur, getar, fase, putus = 0 }) => {
  const t = detik(k);
  const g = getar * Math.sin(t * 46 + fase);
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + kendur;
  const nx = -(y1 - y0);
  const ny = x1 - x0;
  const L = Math.hypot(nx, ny) || 1;
  const cx = mx + (nx / L) * g;
  const cy = my + (ny / L) * g;
  if (putus <= 0) return <path d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`} {...garis(campur(wr.teks, wr.aksen, 0.35), 2.2)} filter="url(#sr-glow)" />;
  const pul = 1 - putus;
  const ikal = Math.sin(t * 20 + fase) * 30 * pul;
  const ax = mix(mx, x0, 0.25 + 0.65 * putus);
  const ay = mix(my, y0, 0.25 + 0.65 * putus);
  const bx = mix(mx, x1, 0.4 * putus) + ikal * 0.4;
  const by = mix(my, y1, 0.4 * putus) + putus * 140;
  return (
    <g filter="url(#sr-glow)">
      <path d={`M ${x0} ${y0} Q ${(x0 + ax) / 2 + ikal} ${(y0 + ay) / 2} ${ax} ${ay}`} {...garis(campur(wr.teks, wr.aksen, 0.35), 2.2)} />
      <path d={`M ${x1} ${y1} Q ${(x1 + bx) / 2 - ikal} ${(y1 + by) / 2 + 20} ${bx} ${by}`} {...garis(campur(wr.teks, wr.aksen, 0.35), 2.2)}
        opacity={1 - putus} />
      <circle cx={ax} cy={ay} r={mix(9, 2, putus)} fill={wr.aksen} opacity={pul} />
    </g>
  );
};

// S2 (depan) "You try to control everything": palang marionet di atas kepala talent, tali turun ke kepala & bahu,
//    menegang di "control" (palang tersentak naik) dan bergetar tegang di "everything".
export const LuMarionet: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const kontrol = tk(a, "kontrol", 0.7);
  const semua = tk(a, "semua", 1.3);
  const tegang = progE(k, kontrol - 0.1, 0.35, Easing.out(Easing.cubic));
  const sentak = pegas(k, kontrol, 7, 180) - pegas(k, semua + 0.5, 14, 80) * 0.4;
  const hentak = (t0: number) => (t > t0 ? Math.exp(-(t - t0) / 0.45) : 0);
  const getar = 9 * hentak(kontrol) + 12 * hentak(semua) + 1.6 * tegang;
  const ayun = Math.sin(t * 1.3) * 4 * (1 - tegang) + Math.sin(t * 31) * 1.4 * hentak(semua);
  const bx = BAR[0];
  const by = BAR[1] - 26 * sentak;
  const m = prog(k, a.mulai, 0.5);
  const rad = (ayun * Math.PI) / 180;
  const ujung = (dx: number, dy: number): [number, number] => [bx + dx * Math.cos(rad) - dy * Math.sin(rad), by + dx * Math.sin(rad) + dy * Math.cos(rad)];
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu2" jernih={0.15} kabut={0.6} cy={420} />
      <G x={bx} y={by - 40}>
        <Cahaya r={mix(220, 300, tegang)} o={0.55} />
      </G>
      <g opacity={m}>
        {TALI.map(([[dx, dy], [x1, y1]], i) => {
          const [x0, y0] = ujung(dx, dy);
          return <Tali key={i} k={k} wr={wr} x0={x0} y0={y0} x1={x1} y1={y1} kendur={mix(60, 4, tegang)} getar={getar * (0.7 + 0.3 * random(`lu2g${i}`))}
            fase={i * 1.9} />;
        })}
        <G x={bx} y={by} r={ayun}>
          <Palang wr={wr} />
        </G>
      </g>
    </>
  );
};

// ---------- S3 (depan) "worry about the future … keep asking why … the way they do" ----------
// Cincin orbit di belakang/atas kepala: "?" & "WHY" serif + jam kecil berputar; jam besar berdetak; "WHY" muncul dari kabut.
const JamKecil: React.FC<{ wr: Warna; r: number; detikJarum: number }> = ({ wr, r, detikJarum }) => (
  <g>
    <circle r={r} {...garis(wr.teks, 2.5)} fill={wr.panel} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-r + 5} x2={0} y2={-r + (i % 3 ? 10 : 16)} {...garis(wr.teks, 2)} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-r * 0.55} {...garis(wr.teks, 3)} transform={`rotate(${detikJarum * 0.5 + 300})`} />
    <line x1={0} y1={8} x2={0} y2={-r * 0.82} {...garis(wr.aksen, 2)} transform={`rotate(${detikJarum * 6})`} />
    <circle r={4} fill={wr.aksen} />
  </g>
);

export const LuOrbitTanya: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const masa = tk(a, "masa", 1);
  const why = tk(a, "why", 2.8);
  const terjadi = tk(a, "terjadi", 3.8);
  const m = prog(k, a.mulai, 0.7);
  // detik jarum: lompat tiap 1 s dengan sedikit pantulan (berdetak), dari awal adegan
  const s0 = t - a.mulai;
  const n = Math.floor(s0);
  const detikJarum = (n + Math.min(1, spring({ frame: (s0 - n) * k.fps, fps: k.fps, config: { damping: 10, stiffness: 300 } }))) + 18;
  const putar = (t - a.mulai) * 0.55 + 1.6 * progE(k, terjadi, 1.6, INOUT);
  const cx = 525;
  const cy = 790;
  const rx = 430;
  const ry = 118;
  const isi = ["?", "WHY", "?", "jam", "?", "WHY", "?"];
  const benda = isi.map((jenis, i) => {
    const th = putar + (i / isi.length) * Math.PI * 2;
    const dalam = (Math.sin(th) + 1) / 2;
    const muncul = jenis === "WHY" ? prog(k, why - 0.1 + (i === 5 ? 0.25 : 0), 0.5, "keluar") : prog(k, a.mulai + 0.15 * i, 0.5, "keluar");
    return { jenis, i, x: cx + rx * Math.cos(th), y: cy + ry * Math.sin(th), dalam, muncul };
  }).sort((p1, p2) => p1.dalam - p2.dalam);
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu3" jernih={0.2} kabut={0.55} cy={500} />
      <g transform={`rotate(-6 ${cx} ${cy})`} opacity={m}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...garis(wr.aksen, 2)} opacity={0.75} {...gambar(prog(k, a.mulai, 1.1))} filter="url(#sr-glow)" />
        <ellipse cx={cx} cy={cy - 30} rx={rx * 0.72} ry={ry * 0.6} {...garis(wr.aksen2, 1.5)} strokeDasharray="4 22"
          strokeDashoffset={-(t - a.mulai) * 60} opacity={0.7 * prog(k, masa, 0.6)} />
        {benda.map((b) => (
          <G key={b.i} x={b.x} y={b.y} s={mix(0.55, 1.1, b.dalam) * b.muncul} o={mix(0.35, 1, b.dalam) * b.muncul}>
            {b.jenis === "jam" ? <JamKecil wr={wr} r={34} detikJarum={detikJarum * 4} />
              : <text x={0} y={b.jenis === "?" ? 26 : 18} textAnchor="middle" fontFamily={serif(k)} fontStyle="italic"
                fontSize={b.jenis === "?" ? 78 : 54} letterSpacing={4} fill={b.jenis === "?" ? wr.teks : wr.aksen}>{b.jenis}</text>}
          </G>
        ))}
      </g>
      <G x={190} y={400} o={m}>
        <Cahaya r={110} o={0.4} ungu />
        <JamKecil wr={wr} r={64} detikJarum={detikJarum} />
      </G>
      <text x={190} y={510} textAnchor="middle" fontFamily={k.tok.font.judul.family} fontWeight={700} fontSize={22} letterSpacing={8}
        fill={wr.aksen2} opacity={0.7 * prog(k, masa, 0.6)}>FUTURE</text>
      <KataKabut k={k} wr={wr} t0={why} x={600} y={470} teks="why?" ukuran={190} miring spasi={2} />
    </>
  );
};

// ---------- S4 (penuh) "But the truth is, not everything is in your hands" ----------
// Dua telapak menyangga (dilihat dari samping, jari saling bertemu), pasir cahaya lolos dari sela jari.
const TELAPAK =
  "M -70 120 Q -95 40 -86 -30 L -86 -150 Q -86 -170 -68 -170 Q -50 -170 -50 -150 L -50 -60 M -50 -60 L -50 -205 Q -50 -225 -31 -225 Q -12 -225 -12 -205 L -12 -65 M -12 -65 L -12 -215 Q -12 -235 8 -235 Q 28 -235 28 -215 L 28 -62 M 28 -62 L 28 -185 Q 28 -204 47 -204 Q 66 -204 66 -185 L 66 -20 M 66 -20 Q 82 -64 110 -78 Q 132 -86 134 -66 Q 120 -20 98 30 Q 80 90 52 120 M -70 120 L 52 120";

export const LuTangan: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const tidak = tk(a, "tidak", 1.6);
  const tangan = tk(a, "tangan", 3.1);
  const m = prog(k, a.mulai, 0.8);
  const alir = prog(k, tidak - 0.4, 0.6) * mix(0.55, 1, prog(k, tangan, 0.5));
  const gundukan = mix(1, 0.35, progE(k, tidak, Math.max(1, a.selesai - tidak), INOUT));
  const d = drift(k, 0.4);
  const yH = 1080;
  const sumber = [478, 540, 604];
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu4" jernih={0.35} kabut={0.5} penuh cy={950} />
      <G x={540 + d.x} y={yH - 30 + d.y}>
        <Cahaya r={360} o={0.55} />
      </G>
      {/* gundukan pasir cahaya di atas telapak */}
      {Array.from({ length: 90 }, (_, i) => {
        const u = random(`lu4g${i}`);
        const v = random(`lu4h${i}`);
        const x = 540 + (u - 0.5) * 300;
        const y = yH + 70 - Math.sqrt(Math.max(0, 1 - ((u - 0.5) * 2) ** 2)) * 70 * gundukan * v;
        return <circle key={i} cx={x + d.x} cy={y + d.y} r={1.4 + random(`lu4r${i}`) * 1.8} fill={campur(wr.aksen, "#FFFFFF", 0.3 * v)}
          opacity={m * (0.4 + 0.5 * v)} />;
      })}
      <g opacity={m}>
        <G x={430 + d.x} y={yH + 120 + d.y} r={-16} s={1.25}>
          <g transform="scale(-1 1)" filter="url(#sr-glow)">
            <path d={TELAPAK} {...garis(wr.teks, TIPIS)} fill={rgba(wr.panel, 0.85)} {...gambar(prog(k, a.mulai, 0.9))} />
          </g>
        </G>
        <G x={650 + d.x} y={yH + 120 + d.y} r={16} s={1.25}>
          <g filter="url(#sr-glow)">
            <path d={TELAPAK} {...garis(wr.teks, TIPIS)} fill={rgba(wr.panel, 0.85)} {...gambar(prog(k, a.mulai + 0.1, 0.9))} />
          </g>
        </G>
      </g>
      {/* aliran pasir: butir jatuh bebas (gravitasi) dari sela jari, memudar sebelum pita caption */}
      {sumber.flatMap((sx, s) =>
        Array.from({ length: 46 }, (_, i) => {
          const fase = random(`lu4f${s}-${i}`);
          const umur = bungkus((t - tidak) * 1.3 + fase, 0, 1);
          const jalan = umur * 0.78;
          const y = yH - 230 + 0.5 * 1900 * jalan * jalan;
          const x = sx + (random(`lu4x${s}-${i}`) - 0.5) * 12 + Math.sin(i + t * 3) * 2 + d.x;
          const o = alir * (y < 1400 ? 1 : Math.max(0, 1 - (y - 1400) / 30)) * (1 - umur * 0.4);
          return o > 0.02 ? <circle key={`${s}-${i}`} cx={x} cy={y + d.y} r={1.2 + random(`lu4z${s}-${i}`) * 1.8}
            fill={campur(wr.aksen, "#FFFFFF", random(`lu4c${s}-${i}`) * 0.4)} opacity={o} /> : null;
        }),
      )}
      <KataKabut k={k} wr={wr} t0={tidak} x={540} y={430} teks="not everything" ukuran={104} miring />
      <KataKabut k={k} wr={wr} t0={tangan - 0.15} x={540} y={560} teks="is in your hands" ukuran={88} spasi={2} isi={campur(wr.teks, wr.aksen, 0.7)} />
    </>
  );
};

// ---------- S5 (depan) "So, let go of what you cannot control" ----------
// Match cut dengan S2: palang & tali yang sama, lalu tali putus satu per satu di "let"; palang naik larut ke cahaya,
// burung kertas emas lepas naik dari atas kepala talent.
const BurungKertas: React.FC<{ wr: Warna; kepak: number }> = ({ wr, kepak }) => (
  <g filter="url(#sr-glow)">
    <path d={`M -34 0 L 0 -6 L 30 4 L 0 10 Z`} {...garis(campur(wr.aksen, "#FFFFFF", 0.3), 2)} fill={rgba(wr.aksen, 0.35)} />
    <path d={`M -6 -4 L ${-4 + 6 * kepak} ${-40 * kepak} L 14 0 Z`} {...garis(campur(wr.aksen, "#FFFFFF", 0.3), 2)} fill={rgba(wr.aksen, 0.55)} />
    <path d={`M -2 2 L ${10 * kepak} ${-26 * kepak + 2} L 18 4 Z`} {...garis(wr.aksen, 1.5)} fill={rgba(wr.aksen, 0.25)} />
  </g>
);

export const LuLepas: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const lepas = tk(a, "lepas", 1.3);
  const kendali = tk(a, "kendali", 2.9);
  const naik = progE(k, lepas + 0.75, 1.6, Easing.in(Easing.quad));
  const bx = BAR[0];
  const by = BAR[1] - 360 * naik;
  const getar = t < lepas ? 1.6 + 7 * Math.exp(-(t - a.mulai) / 0.4) : 0;
  const jernih = mix(0.25, 0.6, prog(k, lepas, Math.max(1, kendali - lepas + 0.8)));
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu5" jernih={jernih} kabut={mix(0.6, 0.3, jernih)} cy={360} />
      <G x={bx} y={by - 40}>
        <Cahaya r={mix(300, 520, naik)} o={0.55 + 0.35 * naik} />
      </G>
      {TALI.map(([[dx, dy], [x1, y1]], i) => (
        <Tali key={i} k={k} wr={wr} x0={bx + dx} y0={by + dy} x1={x1} y1={y1} kendur={4} getar={getar} fase={i * 1.9}
          putus={prog(k, lepas + [0.1, 0.22, 0, 0.32, 0.4][i], 0.55, "keluar")} />
      ))}
      <G x={bx} y={by} o={1 - prog(k, lepas + 1.4, 0.9)}>
        <Palang wr={wr} />
      </G>
      {Array.from({ length: 9 }, (_, i) => {
        const t0 = lepas + 0.35 + i * 0.16;
        const u = progE(k, t0, 2.6, Easing.out(Easing.quad));
        if (u <= 0) return null;
        const arah = (random(`lu5a${i}`) - 0.5) * 2;
        const x = 525 + arah * mix(30, 420, u) + Math.sin(t * 2 + i) * 18;
        const y = mix(950, 180 + random(`lu5y${i}`) * 220, u);
        const kepak = 0.35 + 0.65 * Math.abs(Math.sin(t * (7 + i % 3) + i));
        return (
          <G key={i} x={x} y={y} s={mix(0.6, 1.25, random(`lu5s${i}`)) * mix(0.6, 1, u)} r={-arah * 18} o={Math.min(1, u * 4) * (1 - prog(k, t0 + 2.3, 0.6))}>
            <BurungKertas wr={wr} kepak={kepak} />
          </G>
        );
      })}
      {Array.from({ length: 30 }, (_, i) => {
        const u = bungkus((t - lepas) * 0.4 + random(`lu5m${i}`), 0, 1);
        return t > lepas ? <circle key={i} cx={360 + random(`lu5x${i}`) * 330} cy={mix(960, 200, u)} r={1.5 + random(`lu5r${i}`) * 2}
          fill={wr.aksen} opacity={(1 - u) * 0.7 * prog(k, lepas, 0.5)} /> : null;
      })}
    </>
  );
};

// ---------- S6 (split) "accept what you cannot change" ----------
// Remix ak-batu: batu diam di tengah sungai (tampak atas), garis arus mengalir mengitarinya, daun hanyut ikut arus.
const BATU = Array.from({ length: 13 }, (_, i) => {
  const ang = (i / 13) * Math.PI * 2;
  const r = 1 + (random(`lu6b${i}`) - 0.5) * 0.22;
  return `${i ? "L" : "M"} ${(Math.cos(ang) * 118 * r).toFixed(1)} ${(Math.sin(ang) * 84 * r).toFixed(1)}`;
}).join(" ") + " Z";
const ARUS = [-176, -140, -104, -70, -40, -14, 14, 40, 70, 104, 140, 176];
const yArus = (x: number, dy: number, cx: number, cy: number) =>
  cy + dy + Math.sign(dy) * Math.max(0, 128 - Math.abs(dy) * 0.72) * Math.exp(-(((x - cx) / 175) ** 2));

export const LuSungai: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const t = detik(k);
  const terima = tk(a, "terima", 0.2);
  const ubah = tk(a, "ubah", 1.8);
  const cx = 540;
  const cy = 575;
  const m = prog(k, a.mulai, 0.6);
  const garisArus = (dy: number) => {
    const pts: string[] = [];
    for (let x = -40; x <= p.W + 40; x += 24) pts.push(`${pts.length ? "L" : "M"} ${x} ${yArus(x, dy, cx, cy).toFixed(1)}`);
    return pts.join(" ");
  };
  const xDaun = mix(-60, p.W + 60, bungkus((t - a.mulai) / 3.2 + 0.1, 0, 1));
  const kilau = prog(k, ubah - 0.1, 0.8);
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu6" jernih={0.5} kabut={0.3} cy={575} />
      <g opacity={m}>
        {[cy - 215, cy + 215].map((y, i) => (
          <path key={i} d={`M -20 ${y + (i ? 6 : -6)} C 300 ${y + (i ? -14 : 14)} 700 ${y + (i ? 18 : -18)} 1100 ${y}`} {...garis(wr.garis, 2)} opacity={0.8} />
        ))}
        {ARUS.map((dy, i) => (
          <path key={i} d={garisArus(dy)} {...garis(i % 4 === 1 ? wr.aksen : wr.aksen2, i % 4 === 1 ? 2.4 : 1.8)}
            strokeDasharray={`${40 + (i % 3) * 18} ${24 + (i % 2) * 20}`} strokeDashoffset={-(t * (150 + (i % 3) * 30)) - i * 37}
            opacity={0.35 + 0.45 * (1 - Math.abs(dy) / 200)} />
        ))}
        {/* pusaran di belakang batu */}
        {[0, 1, 2].map((i) => (
          <path key={i} d="M -18 0 A 18 12 0 1 1 18 0" {...garis(wr.aksen2, 1.6)} opacity={0.5}
            transform={`translate(${cx + 170 + i * 70} ${cy + (i % 2 ? 26 : -24)}) rotate(${t * 140 * (i % 2 ? -1 : 1)})`} />
        ))}
        <G x={cx - 120} y={cy}>
          <Riak k={k} t0={terima + 0.1} c={wr.aksen2} r1={120} />
        </G>
        <G x={cx} y={cy}>
          <defs>
            <linearGradient id="lu6-k" gradientUnits="userSpaceOnUse" x1={mix(-260, 260, kilau)} y1={-100} x2={mix(-140, 380, kilau)} y2={60}>
              <stop offset="0" stopColor={wr.panel} />
              <stop offset="0.5" stopColor={campur(wr.panel, wr.aksen, 0.55 * Math.sin(kilau * Math.PI))} />
              <stop offset="1" stopColor={wr.panel} />
            </linearGradient>
          </defs>
          <ellipse cx={8} cy={14} rx={130} ry={92} fill={rgba(wr.latar, 0.6)} />
          <path d={BATU} {...garis(wr.teks, TIPIS)} fill="url(#lu6-k)" filter="url(#sr-glow)" />
          <path d="M -60 -30 Q -20 -52 30 -40" {...garis(wr.teks, 2)} opacity={0.35} />
          <path d="M -30 30 Q 10 44 60 26" {...garis(wr.teks, 2)} opacity={0.25} />
          <Riak k={k} t0={ubah} c={wr.aksen} r1={230} n={1} />
        </G>
        <G x={xDaun} y={yArus(xDaun, -70, cx, cy)} r={Math.sin(t * 2) * 25 + 15}>
          <path d="M -22 0 Q 0 -14 22 0 Q 0 14 -22 0 Z M -22 0 L 22 0" {...garis(wr.aksen, 2)} fill={rgba(wr.aksen, 0.4)} />
        </G>
      </g>
    </>
  );
};

// ---------- S7 (penuh) "embrace life as it unfolds" ----------
// Peta terlipat (lipatan akordeon 4 panel) membuka panel demi panel; isi peta berubah dari garis kontur kertas jadi
// lanskap fajar (matahari naik, bukit berlapis, jalan setapak ke cakrawala).
const PW = 210;
const PH = 900;
const Lanskap: React.FC<{ k: Konteks; wr: Warna; jadi: number }> = ({ k, wr, jadi }) => {
  const W = PW * 4;
  const hy = 560;
  const t = detik(k);
  return (
    <g>
      <defs>
        <linearGradient id="lu7-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={campur(campur(wr.panel, wr.teks, 0.08), wr.latar, jadi)} />
          <stop offset={hy / PH} stopColor={campur(campur(wr.panel, wr.teks, 0.1), campur(wr.aksen, "#FFFFFF", 0.2), jadi * 0.85)} />
          <stop offset="1" stopColor={campur(campur(wr.panel, wr.teks, 0.08), wr.panel, jadi)} />
        </linearGradient>
      </defs>
      <rect width={W} height={PH} fill="url(#lu7-l)" />
      {/* lapisan kertas peta: grid + kontur + rute putus-putus */}
      <g opacity={1 - jadi * 0.85}>
        {Array.from({ length: 12 }, (_, i) => <line key={`g${i}`} x1={i * 70 + 35} x2={i * 70 + 35} y1={0} y2={PH} {...garis(wr.aksen2, 1)} opacity={0.3} />)}
        {Array.from({ length: 13 }, (_, i) => <line key={`h${i}`} y1={i * 70 + 30} y2={i * 70 + 30} x1={0} x2={W} {...garis(wr.aksen2, 1)} opacity={0.3} />)}
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={260} cy={300} rx={60 + i * 45} ry={40 + i * 32} {...garis(wr.aksen2, 1.5)} opacity={0.5} />)}
        {[0, 1, 2].map((i) => <ellipse key={i} cx={620} cy={680} rx={50 + i * 40} ry={36 + i * 26} {...garis(wr.aksen2, 1.5)} opacity={0.5} />)}
        <path d="M 120 820 C 240 640 520 760 600 520 S 700 220 760 140" {...garis(wr.aksen, 2.5)} strokeDasharray="10 14" />
        <path d="M 745 125 l 30 30 m 0 -30 l -30 30" {...garis(wr.aksen, 3)} />
      </g>
      {/* lanskap fajar */}
      <g opacity={jadi}>
        <circle cx={W / 2} cy={hy + 40 - 110 * jadi} r={78} fill={campur(wr.aksen, "#FFFFFF", 0.35)} filter="url(#sr-glow)" />
        <circle cx={W / 2} cy={hy - 70 * jadi} r={260} fill="url(#sr-cahaya)" />
        {[0, 1, 2].map((l) => {
          const y0 = hy + l * 70;
          const pts: string[] = [];
          for (let x = 0; x <= W; x += 30) pts.push(`L ${x} ${(y0 - 40 * Math.sin(x * 0.009 + l * 2) - 22 * Math.sin(x * 0.023 + l)).toFixed(1)}`);
          return <path key={l} d={`M 0 ${PH} ${pts.join(" ")} L ${W} ${PH} Z`}
            {...garis(campur(wr.aksen, wr.teks, 0.3 + l * 0.2), 2)} fill={campur(wr.latar, wr.panel, 0.4 + l * 0.3)} />;
        })}
        <path d={`M ${W / 2 - 140} ${PH} C ${W / 2 - 40} 800 ${W / 2 + 70} 720 ${W / 2} ${hy + 30}`} {...garis(wr.aksen, 3)}
          strokeDasharray="2 14" strokeDashoffset={-t * 30} filter="url(#sr-glow)" />
      </g>
    </g>
  );
};

export const LuPeta: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const hidup = tk(a, "hidup", 0.6);
  const buka = tk(a, "buka", 1.9);
  const m = prog(k, a.mulai, 0.6);
  const th = [0, 1, 2, 3].map((i) => (i === 0 ? 0 : 88 * (1 - progE(k, hidup - 0.45 + (i - 1) * 0.42, 0.8, INOUT))));
  const lebar = th.map((x) => PW * Math.cos((x * Math.PI) / 180));
  const total = lebar.reduce((s, x) => s + x, 0);
  const jadi = progE(k, buka - 0.2, 1.2, INOUT);
  const y0 = 470;
  let xk = 540 - total / 2;
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu7" jernih={mix(0.5, 0.75, jadi)} kabut={0.35} penuh cy={1000} />
      <g opacity={m}>
        <rect x={540 - total / 2 + 16} y={y0 + 22} width={total} height={PH} fill={rgba("#000000", 0.35)} style={{ filter: "blur(14px)" }} />
        {th.map((sudut, i) => {
          const x = xk;
          xk += lebar[i];
          const gelap = Math.sin((sudut * Math.PI) / 180) * (i % 2 ? 0.55 : 0.2);
          return (
            <g key={i} transform={`translate(${x} ${y0}) scale(${Math.max(0.001, lebar[i] / PW)} 1)`}>
              <clipPath id={`lu7-c${i}`}>
                <rect width={PW} height={PH} />
              </clipPath>
              <g clipPath={`url(#lu7-c${i})`}>
                <g transform={`translate(${-i * PW} 0)`}>
                  <Lanskap k={k} wr={wr} jadi={jadi} />
                </g>
                <rect width={PW} height={PH} fill="#000000" opacity={gelap} />
              </g>
              <rect width={PW} height={PH} {...garis(campur(wr.aksen, wr.teks, 0.5), 1.5)} opacity={0.6} />
            </g>
          );
        })}
      </g>
      <text x={540} y={y0 - 40} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={24} letterSpacing={12} fill={wr.aksen2}
        opacity={0.75 * prog(k, buka - 0.1, 0.6)}>AS IT UNFOLDS</text>
    </>
  );
};

// ---------- S8 (depan) "You don't have to understand everything … figured out" ----------
// Kepingan puzzle melayang di belakang/atas kepala; sebagian mengunci ke papan (pegas + kilat), sisanya tetap terbuka.
const KP = 128;
const KOLOM = 4;
const BARIS = 3;
const PAPAN: [number, number] = [540 - (KOLOM * KP) / 2, 330];
const tonjol = (kunci: string) => (random(kunci) > 0.5 ? 1 : -1);
/** Tepi keping dari p0 ke p1 dengan tonjolan `arah` (+1 keluar, −1 masuk, 0 rata). */
const tepiKeping = (x0: number, y0: number, x1: number, y1: number, arah: number) => {
  if (!arah) return `L ${x1} ${y1}`;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const ox = dy / KP;
  const oy = -dx / KP; // normal keluar untuk jalur searah jarum jam
  const b = arah * KP * 0.26;
  const a1 = [x0 + dx * 0.37, y0 + dy * 0.37];
  const a2 = [x0 + dx * 0.63, y0 + dy * 0.63];
  return `L ${a1[0]} ${a1[1]} C ${a1[0] - dx * 0.12 + ox * b * 1.3} ${a1[1] - dy * 0.12 + oy * b * 1.3} ${a2[0] + dx * 0.12 + ox * b * 1.3} ${a2[1] + dy * 0.12 + oy * b * 1.3} ${a2[0]} ${a2[1]} L ${x1} ${y1}`;
};
const jalurKeping = (c: number, r: number) => {
  const h = KP / 2;
  const atas = r === 0 ? 0 : -tonjol(`lu8h${c}-${r}`);
  const bawah = r === BARIS - 1 ? 0 : tonjol(`lu8h${c}-${r + 1}`);
  const kiri = c === 0 ? 0 : -tonjol(`lu8v${c}-${r}`);
  const kanan = c === KOLOM - 1 ? 0 : tonjol(`lu8v${c + 1}-${r}`);
  return `M ${-h} ${-h} ${tepiKeping(-h, -h, h, -h, atas)} ${tepiKeping(h, -h, h, h, kanan)} ${tepiKeping(h, h, -h, h, bawah)} ${tepiKeping(-h, h, -h, -h, kiri)} Z`;
};
const RUMAH: [number, number][] = [
  [130, 420], [930, 360], [210, 760], [880, 720], [120, 1080], [960, 1060], [330, 1010], [740, 1000], [250, 300], [820, 250], [600, 1080], [440, 1060],
];

export const LuPuzzle: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const paham = tk(a, "paham", 1.1);
  const figured = tk(a, "figured", 5.3);
  const kunci: Record<number, number> = { 5: paham, 6: paham + 0.22, 1: paham + 0.44, 2: figured, 9: figured + 0.2, 10: figured + 0.4 };
  const m = prog(k, a.mulai, 0.7);
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu8" jernih={0.6} kabut={0.3} cy={560} />
      <g opacity={m}>
        <rect x={PAPAN[0]} y={PAPAN[1]} width={KOLOM * KP} height={BARIS * KP} rx={6} {...garis(wr.aksen2, 1.6)} strokeDasharray="6 10" opacity={0.6} />
        <rect x={PAPAN[0]} y={PAPAN[1]} width={KOLOM * KP} height={BARIS * KP} fill="url(#sr-cahaya)"
          opacity={0.3 + 0.5 * prog(k, figured, 0.8)} />
      </g>
      {Array.from({ length: KOLOM * BARIS }, (_, i) => {
        const c = i % KOLOM;
        const r = Math.floor(i / KOLOM);
        const [hx, hy] = RUMAH[i];
        const fx = hx + Math.sin(t * 0.55 + i * 1.3) * 26;
        const fy = hy + Math.cos(t * 0.45 + i * 2.1) * 22;
        const fr = Math.sin(t * 0.6 + i) * 22 + (random(`lu8r${i}`) - 0.5) * 70;
        const tk0 = kunci[i];
        const u = tk0 === undefined ? 0 : pegas(k, tk0, 13, 150);
        const sx = PAPAN[0] + c * KP + KP / 2;
        const sy = PAPAN[1] + r * KP + KP / 2;
        const terkunci = tk0 !== undefined && detik(k) > tk0 + 0.25;
        const kilat = tk0 === undefined ? 0 : Math.exp(-Math.max(0, t - tk0 - 0.25) / 0.3) * (terkunci ? 1 : 0);
        return (
          <G key={i} x={mix(fx, sx, u)} y={mix(fy, sy, u)} r={fr * (1 - Math.min(1, u))} s={mix(0.82, 1, Math.min(1, u))}
            o={m * prog(k, a.mulai + i * 0.06, 0.5)}>
            <path d={jalurKeping(c, r)}
              {...garis(terkunci ? wr.aksen : campur(wr.teks, wr.aksen2, 0.4), terkunci ? 3 : 2.2)} fill={terkunci ? campur(wr.panel, wr.aksen, 0.35) : rgba(wr.panel, 0.92)} filter="url(#sr-glow)" />
            {kilat > 0.02 ? <path d={jalurKeping(c, r)} fill="#FFFFFF" opacity={kilat * 0.6} /> : null}
          </G>
        );
      })}
    </>
  );
};

// ---------- S9 (depan) "Sometimes you just need to trust yourself enough to keep moving forward" ----------
// Kompas di atas kepala: jarum gelisah, di "trust" mantap (pegas teredam) menunjuk ke depan; jalur cahaya tumbuh dari
// ujung jarum ke cakrawala yang menghangat.
export const LuKompas: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const t = detik(k);
  const percaya = tk(a, "percaya", 3.2);
  const gerak = tk(a, "gerak", 6.2);
  const maju = tk(a, "maju", 6.8);
  const m = prog(k, a.mulai, 0.6);
  const gelisah = 70 * Math.sin(t * 2.1) + 38 * Math.sin(t * 4.7 + 1) + 14 * Math.sin(t * 11.3 + 2);
  const mantap = pegas(k, percaya, 6, 90);
  const sudut = gelisah * (1 - mantap) + Math.sin(t * 9) * 1.2 * (1 - Math.min(1, mantap));
  const tumbuh = progE(k, gerak - 0.3, 1.6, INOUT);
  const cx = 540;
  const cy = 640;
  const R = 150;
  const jernih = mix(0.6, 0.9, prog(k, maju, 1));
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu9" jernih={jernih} kabut={mix(0.35, 0.12, tumbuh)} cy={300} />
      <line x1={-20} x2={1100} y1={300} y2={300} {...garis(campur(wr.aksen, "#FFFFFF", 0.2), 1.6)} opacity={0.4 + 0.5 * tumbuh} filter="url(#sr-glow)" />
      <path d={`M ${cx} ${cy - R + 22} C ${cx + 10} ${cy - R - 120} ${cx + 90} ${cy - R - 150} ${cx + 70} 300`} {...garis(wr.aksen, 4)}
        {...gambar(tumbuh)} filter="url(#sr-glow)" />
      <G x={cx + 70} y={300} o={prog(k, maju - 0.1, 0.6)}>
        <Cahaya r={160} o={0.9} />
        <circle r={7} fill="#FFFFFF" filter="url(#sr-glow)" />
      </G>
      <G x={cx} y={cy} o={m} s={mix(0.85, 1, m)}>
        <Cahaya r={R * 1.8} o={0.35 + 0.4 * mantap} />
        <circle r={R} {...garis(campur(wr.aksen, wr.teks, 0.4), TIPIS)} fill={rgba(wr.panel, 0.92)} filter="url(#sr-glow)" />
        <circle r={R - 26} {...garis(wr.garis, 1.5)} />
        {Array.from({ length: 72 }, (_, i) => (
          <line key={i} x1={0} y1={-R + 8} x2={0} y2={-R + (i % 18 === 0 ? 24 : i % 6 === 0 ? 17 : 12)} {...garis(wr.teks, i % 6 === 0 ? 2 : 1)}
            opacity={0.7} transform={`rotate(${i * 5})`} />
        ))}
        {["N", "E", "S", "W"].map((h, i) => (
          <text key={h} x={Math.sin((i * Math.PI) / 2) * (R - 48)} y={-Math.cos((i * Math.PI) / 2) * (R - 48) + 9} textAnchor="middle" fontFamily={font}
            fontWeight={700} fontSize={24} fill={i === 0 ? wr.aksen : wr.teks} opacity={0.85}>{h}</text>
        ))}
        <g transform={`rotate(${sudut})`}>
          <path d={`M 0 ${-R + 30} L 13 0 L -13 0 Z`} fill={wr.aksen} filter="url(#sr-glow)" />
          <path d={`M 0 ${R - 30} L 13 0 L -13 0 Z`} {...garis(wr.teks, 2)} fill="none" />
        </g>
        <circle r={9} {...garis(wr.aksen, 2.5)} fill={wr.panel} />
        <Riak k={k} t0={percaya + 0.35} c={wr.aksen} r1={R + 120} n={1} />
      </G>
    </>
  );
};

// ---------- S10 (penuh) "even when life feels uncertain" — penutup, tanpa logo ----------
// Kabut menggulung tebal; satu jalur terang terus masuk kabut, sosok kecil berjalan menjauh; "UNCERTAIN" serif muncul
// dari kabut lalu larut jadi partikel yang hanyut bersama kabut.
export const LuKabut: React.FC<PA> = ({ k, wr }) => {
  const { a } = k;
  const t = detik(k);
  const takPasti = tk(a, "tak_pasti", 1.8);
  const larut = takPasti + 1.15;
  const s0 = t - a.mulai;
  const vy = 820;
  const jalan = progE(k, a.mulai, Math.max(1, a.selesai - a.mulai), (x) => x);
  const kaki = mix(1390, 1060, jalan);
  const skala = mix(1.15, 0.5, jalan);
  const xJalur = (y: number, sisi: number) => 540 + sisi * mix(14, 330, (y - vy) / (1920 - vy));
  return (
    <>
      <LatarLu k={k} wr={wr} id="lu10" jernih={0.55} kabut={0.9} penuh cy={vy} />
      <defs>
        <linearGradient id="lu10-j" gradientUnits="userSpaceOnUse" x1="0" y1={vy} x2="0" y2={1920}>
          <stop offset="0" stopColor={wr.aksen} stopOpacity={0} />
          <stop offset="0.25" stopColor={wr.aksen} stopOpacity={0.7} />
          <stop offset="1" stopColor={campur(wr.aksen, "#FFFFFF", 0.3)} stopOpacity={1} />
        </linearGradient>
      </defs>
      <path d={`M ${xJalur(1920, -1)} 1920 L ${xJalur(vy, -1)} ${vy} L ${xJalur(vy, 1)} ${vy} L ${xJalur(1920, 1)} 1920 Z`} fill="url(#lu10-j)" opacity={0.18} />
      {[-1, 1].map((sisi) => (
        <line key={sisi} x1={xJalur(1920, sisi)} y1={1920} x2={xJalur(vy, sisi)} y2={vy} stroke="url(#lu10-j)" strokeWidth={3} filter="url(#sr-glow)" />
      ))}
      <line x1={540} y1={1920} x2={540} y2={vy} stroke="url(#lu10-j)" strokeWidth={4} strokeDasharray="30 40" strokeDashoffset={s0 * 60} filter="url(#sr-glow)" />
      <G x={540 + Math.sin(s0 * 3) * 3} y={kaki} s={skala} o={prog(k, a.mulai + 0.2, 0.6)}>
        <Cahaya r={90} o={0.5} />
        <Orang wr={wr} langkah={Math.sin(s0 * 6.5) * 0.7} />
      </G>
      <Kabut k={k} wr={wr} id="lu10f" kuat={1.1} y0={560} y1={1150} n={16} laju={1.8} />
      <Kabut k={k} wr={wr} id="lu10g" kuat={0.55} y0={1150} y1={1800} n={8} laju={2.4} />
      <KataKabut k={k} wr={wr} t0={takPasti} x={540} y={640} teks="UNCERTAIN" ukuran={132} spasi={10} larut={larut} />
      {Array.from({ length: 160 }, (_, i) => {
        const u = prog(k, larut + random(`lu10t${i}`) * 0.35, 1.6, "keluar");
        if (u <= 0 || u >= 1) return null;
        const x0 = 150 + random(`lu10x${i}`) * 780;
        const y0 = 560 + random(`lu10y${i}`) * 100;
        return <circle key={i} cx={x0 + u * (60 + random(`lu10v${i}`) * 140)} cy={y0 - u * (40 + random(`lu10w${i}`) * 120)}
          r={1 + random(`lu10r${i}`) * 2.4} fill={i % 3 ? wr.teks : wr.aksen} opacity={Math.sin(u * Math.PI) * 0.9} />;
      })}
    </>
  );
};

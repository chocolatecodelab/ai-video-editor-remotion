// Pustaka adegan "Fahrplan" — Info Jerman, 3 jalur kerja ke Jerman (talent mbak Indah, November 2026, tema terang).
// Satu metafora menjahit seluruh video: papan keberangkatan split-flap (pilihan) → peta U-Bahn (rute) → tiap jalur
// dinaiki keretanya sendiri. Jalur 1 Ausbildung kuning, 2 FSJ merah logo, 3 Kerja Profesional charcoal.
// Area konten split: y 390..850 (logo kecil di slot atas ±300, caption ±905). Adegan `depan` boleh turun ke belakang
// kepala talent (cutout di atasnya); adegan `penuh` memakai kanvas 1920.

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { Konteks, detik, gambar, mix, tk } from "./alat";
import {
  BarisFlap, BayangDef, GarisJalur, IN_OUT, IkonBalon, IkonBendera, IkonBuku, IkonDokumen, IkonGir, IkonHati, IkonIjazah,
  IkonKoper, IkonOrang, IkonPalang, Kartu, Kereta, Lencana, OUT, OUT_BACK, Stasiun, Teks, clamp01, jalur, pe, titikJalur,
} from "./FahrplanIj";
import { G, Warna } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const CY = 620;

// ---------- papan keberangkatan (S1–S2): satu komponen, dua adegan (match → kontinu) ----------

/** Papan "ABFAHRT": tiga baris (lencana jalur + nama split-flap). `isi[i]` = detik baris i mulai berputar (null = kosong),
 *  `sorot` = baris yang disorot kuning, `getar` 0..1 = papan tersentak. */
const Papan: React.FC<{ k: Konteks; wr: Warna; font: string; isi: (number | null)[]; sorot: number; sorotP: number; getar: number;
  judul: string; tJudul: number; masuk: number }> = ({ k, wr, font, isi, sorot, sorotP, getar, judul, tJudul, masuk }) => {
  const { p } = k;
  const W = 860;
  const H = 430;
  const t = detik(k);
  const gx = Math.sin(t * 70) * 14 * getar;
  const rot = Math.sin(t * 55) * 1.6 * getar;
  return (
    <G x={p.cx + gx} y={CY + mix(60, 0, masuk)} r={rot} o={clamp01(masuk * 1.5)}>
      <BayangDef id="ijf-papan" o={0.28} />
      {/* tiang gantung */}
      <path d={`M -260 ${-H / 2} V ${-H / 2 - 60} M 260 ${-H / 2} V ${-H / 2 - 60}`} stroke={wr.teks} strokeWidth={10} strokeLinecap="round" />
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={30} fill={wr.teks} filter="url(#ijf-papan)" />
      {/* kepala papan: jam + judul flap */}
      <g transform={`translate(${-W / 2 + 44} ${-H / 2 + 62})`}>
        <circle r={26} fill={wr.latar} />
        <path d={`M 0 0 V -16 M 0 0 L ${Math.cos(t * 2) * 12} ${Math.sin(t * 2) * 12}`} stroke={wr.teks} strokeWidth={5} strokeLinecap="round" />
      </g>
      <g transform={`translate(${-W / 2 + 96} ${-H / 2 + 62})`}>
        <BarisFlap k={k} teks={judul} t0={tJudul} w={36} h={50} gap={4} font={font} wr={wr} seed={`jdl${judul}`} warnaSel="#3A3D44"
          warnaTeks={wr.aksen} panjang={10} />
      </g>
      <rect x={-W / 2 + 30} y={-H / 2 + 110} width={W - 60} height={4} rx={2} fill={rgba(wr.latar, 0.18)} />
      {[0, 1, 2].map((i) => {
        const y = -H / 2 + 175 + i * 98;
        const t0 = isi[i];
        const disorot = sorot === i;
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            {disorot ? (
              <rect x={-W / 2 + 22} y={-44} width={(W - 44) * sorotP} height={88} rx={18} fill={rgba(wr.aksen, 0.22)} />
            ) : null}
            <g transform={`translate(${-W / 2 + 70} 0)`} opacity={t0 === null ? 0.25 : 1}>
              {t0 === null ? <rect x={-34} y={-34} width={68} height={68} rx={16} fill="#3A3D44" />
                : <G s={OUT_BACK(clamp01((t - t0) / 0.35))}><Lencana wr={wr} i={i} font={font} /></G>}
            </g>
            <g transform={`translate(${-W / 2 + 128} 0)`}>
              <BarisFlap k={k} teks={t0 === null ? "" : jalur(wr)[i].nama} t0={t0 ?? 1e9} w={36} h={58} gap={4} font={font} wr={wr}
                seed={`r${i}`} panjang={17} warnaTeks={disorot ? wr.aksen : wr.latar} />
            </g>
          </g>
        );
      })}
    </G>
  );
};

/** Kereta jalur 1 melesat di belakang kepala talent (adegan depan) — hook gerak terkuat di detik pertama. */
const KeretaLewat: React.FC<{ k: Konteks; wr: Warna; t0: number; y: number }> = ({ k, wr, t0, y }) => {
  const u = pe(k, t0, 1.3, (x) => x);
  if (u <= 0 || u >= 1) return null;
  const x = mix(-500, 1580, u);
  const c = wr.aksen;
  return (
    <g>
      {/* rel */}
      <path d={`M -40 ${y + 40} H 1120`} stroke={wr.teks} strokeWidth={8} opacity={0.35 * Math.sin(u * Math.PI)} strokeDasharray="34 18" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${x - i * 300} ${y})`}>
          <rect x={-140} y={-62} width={280} height={124} rx={i === 0 ? 62 : 24} fill={c} stroke={wr.teks} strokeWidth={8} />
          {[-80, -10, 60].map((wx) => <rect key={wx} x={wx - 26} y={-34} width={52} height={36} rx={8} fill="#FFFFFF" />)}
          <rect x={-140} y={26} width={280} height={12} fill={rgba(wr.teks, 0.25)} />
        </g>
      ))}
      {/* garis kecepatan */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${x - 940 - i * 60} ${y - 50 + i * 34} h ${-220 + i * 30}`} stroke={wr.teks} strokeWidth={6} strokeLinecap="round"
          opacity={0.35} />
      ))}
    </g>
  );
};

/** S1 HOOK (depan): papan muncul dengan satu tujuan — AUSBILDUNG — sementara kereta kuning melesat di belakang talent. */
export const IjfPapan: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const m0 = tk(a, "awal", 0);
  const satu = tk(a, "satu", 1.2);
  const ausb = tk(a, "ausb", 2.0);
  return (
    <g>
      <KeretaLewat k={k} wr={wr} t0={m0 - 0.35} y={1130} />
      <Papan k={k} wr={wr} font={font} isi={[ausb - 0.25, null, null]} sorot={0} sorotP={pe(k, ausb + 0.2, 0.5)}
        getar={0} judul="ABFAHRT" tJudul={m0} masuk={pe(k, m0, 0.45, OUT_BACK)} />
      {/* "satu-satunya": angka 1 besar mengetuk pojok papan */}
      <G x={k.p.cx + 300} y={CY - 262} s={OUT_BACK(pe(k, satu, 0.35))} r={-8}>
        <circle r={58} fill={wr.aksen} stroke={wr.teks} strokeWidth={8} />
        <Teks y={26} s={74} font={font} c={wr.teks}>1</Teks>
      </G>
    </g>
  );
};

/** S2 "Eits, nggak!": papan tersentak, judul berputar jadi "3 JALUR", baris 2 & 3 terisi tepat saat namanya diucapkan. */
export const IjfPapanTiga: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const eits = a.mulai + 0.1;
  const tiga = tk(a, "tiga", 1.2);
  const a1 = tk(a, "a1", 2.4);
  const a2 = tk(a, "a2", 3.2);
  const a3 = tk(a, "a3", 4.0);
  const t = detik(k);
  const getar = Math.exp(-Math.max(0, t - eits) / 0.18) * (t >= eits ? 1 : 0);
  const sorot = t >= a3 ? 2 : t >= a2 ? 1 : 0;
  const tS = [a1, a2, a3][sorot];
  // "1" di pojok tersapu jatuh saat "eits" (bukan satu-satunya lagi)
  const jatuh = pe(k, eits, 0.6, IN_OUT);
  return (
    <g>
      <Papan k={k} wr={wr} font={font} isi={[a.mulai - 5, t >= a2 - 0.25 ? a2 - 0.25 : null, t >= a3 - 0.25 ? a3 - 0.25 : null]}
        sorot={sorot} sorotP={pe(k, tS - 0.05, 0.45)} getar={getar} judul={t >= tiga - 0.2 ? "3 JALUR" : "ABFAHRT"}
        tJudul={t >= tiga - 0.2 ? tiga - 0.2 : -10} masuk={1} />
      <G x={k.p.cx + 300 + 60 * jatuh} y={CY - 262 + 500 * jatuh * jatuh} r={-8 + 140 * jatuh} o={1 - jatuh}>
        <circle r={58} fill={wr.aksen} stroke={wr.teks} strokeWidth={8} />
        <Teks y={26} s={74} font={font} c={wr.teks}>1</Teks>
      </G>
      {/* "3": cap kuning mendarat di pojok, bobot berat (overshoot kecil + debu garis) */}
      <G x={k.p.cx + 300} y={CY - 262} s={mix(1.8, 1, pe(k, tiga, 0.28, OUT))} o={clamp01((t - tiga) / 0.08)}>
        <circle r={62} fill={wr.aksen} stroke={wr.teks} strokeWidth={8} />
        <Teks y={28} s={80} font={font} c={wr.teks}>3</Teks>
      </G>
      {t >= tiga ? [0, 1, 2, 3, 4, 5].map((i) => {
        const u = pe(k, tiga + 0.05, 0.4);
        const sd = (i / 6) * Math.PI * 2;
        return <path key={i} d={`M ${Math.cos(sd) * (70 + 30 * u)} ${Math.sin(sd) * (70 + 30 * u)} l ${Math.cos(sd) * 22} ${Math.sin(sd) * 22}`}
          transform={`translate(${k.p.cx + 300} ${CY - 262})`} stroke={wr.teks} strokeWidth={6} strokeLinecap="round" opacity={1 - u} />;
      }) : null}
    </g>
  );
};

// ---------- peta U-Bahn (S3, layar penuh) ----------

/** Rute tiga jalur dari stasiun "kamu" (bawah) ke tiga terminal (atas). Koordinat kanvas 1080×1920. */
const RUTE: [number, number][][] = [
  [[540, 1360], [540, 1120], [300, 880], [300, 640]],
  [[540, 1360], [540, 1080], [540, 600]],
  [[540, 1360], [540, 1120], [780, 880], [780, 640]],
];

/** S3 "Tapi bedanya apa?" (penuh): tiga garis tumbuh dari satu titik, kamera mundur, tanda tanya di persimpangan. */
export const IjfPeta: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const beda = tk(a, "beda", 0.6);
  const pilih = tk(a, "pilih", 3.0);
  const t = detik(k);
  const mundur = mix(1.18, 1, pe(k, a.mulai, Math.max(1.2, a.selesai - a.mulai), IN_OUT));
  const J = jalur(wr);
  return (
    <g transform={`translate(540 980) scale(${mundur}) translate(-540 -980)`}>
      <rect x={-200} y={-200} width={1480} height={2400} fill={wr.latar} />
      <BayangDef id="ijf-peta" o={0.08} />
      {/* blok kota putih (peta) + sungai tipis: konteks kota tanpa mengalahkan jalur */}
      {Array.from({ length: 18 }, (_, i) => {
        const bx = 60 + (i % 3) * 330 + (random(`bx${i}`) - 0.5) * 60;
        const by = 420 + Math.floor(i / 3) * 190 + (random(`by${i}`) - 0.5) * 40;
        const u = pe(k, a.mulai + random(`bt${i}`) * 0.5, 0.5);
        return <rect key={i} x={bx} y={by + 20 * (1 - u)} width={200 + random(`bw${i}`) * 60} height={120} rx={18} fill="#FFFFFF"
          opacity={0.75 * u} filter="url(#ijf-peta)" />;
      })}
      <path d="M -60 1250 C 200 1180 380 1300 600 1230 S 980 1150 1160 1210" fill="none" stroke="#C9D6DF" strokeWidth={46}
        strokeLinecap="round" opacity={0.7} />
      {RUTE.map((r, i) => (
        <g key={i} opacity={i === 0 ? 1 : mix(1, 0.22, pe(k, pilih - 0.1, 0.4))}>
          <GarisJalur pts={r} c={J[i].garis} p={pe(k, a.mulai + i * 0.12, 0.9, IN_OUT)} lebar={26} latar={wr.latar} />
        </g>
      ))}
      <G x={540} y={1360}><Stasiun wr={wr} p={pe(k, a.mulai, 0.3)} r={34} /></G>
      <G x={540} y={1440}><Teks s={44} font={font} c={wr.teks}>KAMU</Teks></G>
      {RUTE.map((r, i) => {
        const [x, y] = r[r.length - 1];
        const u = pe(k, a.mulai + 0.7 + i * 0.12, 0.4, OUT_BACK);
        return (
          <g key={i}>
            <G x={x} y={y}><Stasiun wr={wr} p={u} r={30} /></G>
            <G x={x} y={y - 92} s={u}><Lencana wr={wr} i={i} font={font} s={1.15} /></G>
            <Teks x={x} y={y - 150} s={i === 2 ? 30 : 34} font={font} c={wr.teks} o={u * (i === 0 ? 1 : mix(1, 0.3, pe(k, pilih - 0.1, 0.4)))}>
              {i === 2 ? "KERJA PROF." : J[i].nama}
            </Teks>
          </g>
        );
      })}
      {/* "pertama ada Ausbildung": kereta kuning menempuh jalur 1 ke terminalnya (titik iris ke adegan berikut) */}
      {t >= pilih - 0.3 ? (() => {
        const u = pe(k, pilih - 0.3, Math.max(0.6, a.selesai - pilih + 0.2), IN_OUT);
        const ps = titikJalur(RUTE[0], u);
        return <G x={ps.x} y={ps.y}><Kereta wr={wr} c={wr.aksen} s={0.9} sudut={ps.sudut} /></G>;
      })() : null}
      {/* tanda tanya di persimpangan: mengayun seperti rambu digantung */}
      <G x={540} y={1150} s={OUT_BACK(pe(k, beda - 0.1, 0.4)) * (1 - pe(k, pilih - 0.3, 0.3))} r={Math.sin((t - beda) * 5) * 8 * Math.exp(-Math.max(0, t - beda) / 0.8)}>
        <circle r={70} fill={wr.aksen} stroke={wr.teks} strokeWidth={8} />
        <Teks y={34} s={96} font={font} c={wr.teks}>?</Teks>
      </G>
    </g>
  );
};

// ---------- jalur 1: Ausbildung (S4–S5) ----------

/** Header jalur: lencana + nama, menempel kiri atas area konten. */
const KepalaJalur: React.FC<{ k: Konteks; wr: Warna; font: string; i: number; t0: number }> = ({ k, wr, font, i, t0 }) => {
  const u = pe(k, t0, 0.45, OUT_BACK);
  return (
    <G x={150} y={420} o={clamp01(u * 1.5)}>
      <G s={u}><Lencana wr={wr} i={i} font={font} /></G>
      <Teks x={58} y={16} s={48} font={font} c={wr.teks} anchor="start" o={clamp01(u)}>{jalur(wr)[i].nama}</Teks>
    </G>
  );
};

/** S4 Ausbildung = sistem ganda: kereta kuning berpindah rel antara SEKOLAH (buku) dan TEMPAT KERJA (gir) —
 *  "vokasi" menyalakan jalur, "teori" membuka buku, "praktik" memutar gir; rel bergantian terus = belajar sambil kerja. */
export const IjfAusbildung: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const vokasi = tk(a, "vokasi", 0.8);
  const teori = tk(a, "teori", 1.8);
  const praktik = tk(a, "praktik", 2.6);
  const t = detik(k);
  const yA = 540;
  const yB = 790;
  const x0 = 170;
  const x1 = 930;
  // lintasan zig-zag antar dua rel: 4 perpindahan
  const pts: [number, number][] = [[x0 + 70, yA], [330, yA], [420, yB], [560, yB], [650, yA], [790, yA], [880, yB], [x1, yB]];
  const jalan = pe(k, vokasi, Math.max(1.5, a.selesai - vokasi - 0.2), IN_OUT);
  const pos = titikJalur(pts, jalan);
  return (
    <g>
      <BayangDef id="ijf-aus" />
      <KepalaJalur k={k} wr={wr} font={font} i={0} t0={a.mulai} />
      {/* dua rel sejajar */}
      {[yA, yB].map((y, i) => (
        <path key={i} d={`M ${x0} ${y} H ${x1}`} stroke={wr.teks} strokeWidth={6} opacity={0.18} strokeDasharray="22 14" {...(i ? {} : {})} />
      ))}
      <GarisJalur pts={pts} c={wr.aksen} p={pe(k, vokasi - 0.2, 1.0, IN_OUT)} lebar={18} latar={wr.latar} />
      {/* stasiun sekolah (buku) & kerja (gir) di ujung kiri rel */}
      <G x={x0 - 20} y={yA} s={1 + 0.12 * Math.exp(-Math.max(0, t - teori) / 0.25) * (t >= teori ? 1 : 0)}>
        <Kartu w={170} h={150} bayang="ijf-aus" isi={t >= teori ? wr.aksen : "#FFFFFF"} />
        <G s={0.85}><IkonBuku wr={wr} buka={mix(0.35, 1, pe(k, teori - 0.1, 0.5, OUT_BACK))} /></G>
      </G>
      <G x={x0 - 20} y={yB} s={1 + 0.12 * Math.exp(-Math.max(0, t - praktik) / 0.25) * (t >= praktik ? 1 : 0)}>
        <Kartu w={170} h={150} bayang="ijf-aus" isi={t >= praktik ? wr.aksen : "#FFFFFF"} />
        <G s={0.9}><IkonGir wr={wr} putar={(t - praktik) * 140 * clamp01((t - praktik) * 4)} /></G>
      </G>
      {/* label di bawah kartu ikon */}
      <Teks x={x1} y={yA - 34} s={34} font={font} c={wr.teks} anchor="end" o={pe(k, teori - 0.1, 0.4)}>TEORI</Teks>
      <Teks x={x1} y={yB + 62} s={34} font={font} c={wr.teks} anchor="end" o={pe(k, praktik - 0.1, 0.4)}>PRAKTIK</Teks>
      <G x={pos.x} y={pos.y}><Kereta wr={wr} c={wr.aksen} s={0.95} sudut={pos.sudut} /></G>
    </g>
  );
};

/** S5 "cocok untuk profesi & pengalaman": jalur kuning menanjak seperti tangga; tiap stasiun yang dilewati menambah
 *  satu bintang pengalaman ke koper di puncak (koper = profesi). */
export const IjfTangga: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const profesi = tk(a, "profesi", 1.0);
  const pengalaman = tk(a, "pengalaman", 2.0);
  const pts: [number, number][] = [[150, 830], [310, 830], [310, 720], [470, 720], [470, 610], [630, 610], [630, 510], [760, 510]];
  const u = pe(k, a.mulai + 0.2, Math.max(1.6, pengalaman - a.mulai + 0.4), IN_OUT);
  const pos = titikJalur(pts, u);
  const st = [[310, 830], [470, 720], [630, 610]] as const;
  const lewat = st.filter(([x]) => pos.x >= x - 2).length;
  const t = detik(k);
  return (
    <g>
      <BayangDef id="ijf-tg" />
      <KepalaJalur k={k} wr={wr} font={font} i={0} t0={a.mulai - 1} />
      <GarisJalur pts={pts} c={wr.aksen} p={pe(k, a.mulai, 0.7, IN_OUT)} lebar={18} latar={wr.latar} />
      {st.map(([x, y], i) => (
        <G key={i} x={x} y={y}><Stasiun wr={wr} p={1} r={16} nyala={clamp01((pos.x - x) / 120)} /></G>
      ))}
      <G x={pos.x} y={pos.y - 34}><Kereta wr={wr} c={wr.aksen} s={0.6} sudut={pos.sudut} /></G>
      {/* koper profesi di puncak, terisi bintang pengalaman */}
      <G x={870} y={500} s={OUT_BACK(pe(k, profesi - 0.15, 0.45))}>
        <Kartu w={190} h={170} bayang="ijf-tg" />
        <G y={10} s={1.05}><IkonKoper wr={wr} isi={t >= profesi ? wr.aksen : "#FFFFFF"} /></G>
      </G>
      {Array.from({ length: 3 }, (_, i) => {
        const muncul = i < lewat && t >= pengalaman - 0.6;
        const v = muncul ? pe(k, Math.max(pengalaman - 0.6, a.mulai) + i * 0.15, 0.35, OUT_BACK) : 0;
        return (
          <G key={i} x={810 + i * 60} y={625} s={v}>
            <path d="M 0 -24 L 7 -8 L 24 -7 L 11 4 L 15 21 L 0 12 L -15 21 L -11 4 L -24 -7 L -7 -8 Z" fill={wr.aksen} stroke={wr.teks}
              strokeWidth={5} strokeLinejoin="round" />
          </G>
        );
      })}
    </g>
  );
};

// ---------- jalur 2: FSJ (S6–S7) ----------

/** S6 FSJ: kereta merah berhenti di tiga stasiun; tiap kedatangan membuka kartu ikon (sukarela, kesehatan, sosial). */
export const IjfFsj: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const tt = [tk(a, "sukarela", 1.0), tk(a, "kesehatan", 2.2), tk(a, "layanan", 3.2)];
  const xs = [270, 540, 810];
  const y = 760;
  const t = detik(k);
  // kereta bergerak antar stasiun: tiba di stasiun i sedikit sebelum kata ke-i (ease-in-out, berhenti tegas)
  let x = 120;
  for (let i = 0; i < 3; i++) {
    const dari = i === 0 ? 120 : xs[i - 1];
    const mulai = i === 0 ? a.mulai : tt[i - 1] + 0.15;
    const tiba = tt[i] - 0.1;
    if (t >= mulai) x = mix(dari, xs[i], pe(k, mulai, Math.max(0.35, tiba - mulai), IN_OUT));
  }
  const red = wr.aksen2;
  return (
    <g>
      <BayangDef id="ijf-fsj" />
      <KepalaJalur k={k} wr={wr} font={font} i={1} t0={a.mulai} />
      <GarisJalur pts={[[110, y], [970, y]]} c={red} p={pe(k, a.mulai, 0.6, IN_OUT)} lebar={18} latar={wr.latar} />
      {xs.map((sx, i) => {
        const buka = pe(k, tt[i] - 0.05, 0.45, OUT_BACK);
        return (
          <g key={i}>
            <G x={sx} y={y}><Stasiun wr={wr} p={1} r={16} nyala={clamp01((t - tt[i] + 0.1) / 0.5)} c={red} /></G>
            {/* tiang + kartu ikon tumbuh dari stasiun */}
            <path d={`M ${sx} ${y - 20} V ${y - 20 - 66 * buka}`} stroke={wr.teks} strokeWidth={6} strokeLinecap="round" />
            <G x={sx} y={y - 190} s={buka * 1.2} o={clamp01(buka * 2)}>
              <Kartu w={190} h={180} bayang="ijf-fsj" />
              {i === 0 ? <G s={0.95}><IkonHati c={red} garisC={wr.teks} s={1.0 + 0.06 * Math.sin((t - tt[0]) * 7)} /></G> : null}
              {i === 1 ? <G s={0.95}><IkonPalang wr={wr} c={red} /></G> : null}
              {i === 2 ? (
                <g>
                  <G x={-40} y={8} s={0.75}><IkonOrang wr={wr} /></G>
                  <G x={40} y={8} s={0.75}><IkonOrang wr={wr} /></G>
                  <G x={0} y={0} s={0.9}><IkonOrang wr={wr} isi={red} /></G>
                </g>
              ) : null}
            </G>
          </g>
        );
      })}
      <G x={x} y={y - 2}><Kereta wr={wr} c={red} s={0.7} /></G>
    </g>
  );
};

/** S7 "bukan cari pengalaman kerja, tapi berkontribusi": jungkat-jungkit — koper (pengalaman) di kiri, lalu hati
 *  jatuh ke kanan dan membalik balok; koper terangkat dan memudar. Bobot: hati jatuh dipercepat, balok memantul pelan. */
export const IjfKontribusi: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const bukan = tk(a, "bukan", 0.4);
  const kontri = tk(a, "kontribusi", 2.0);
  const t = detik(k);
  const cx = k.p.cx;
  const cy = 740;
  // kiri turun dulu (koper berat), lalu hati mendarat → kanan turun dengan pantulan teredam
  const awal = mix(0, -12, pe(k, a.mulai + 0.1, 0.6, OUT));
  const dt = t - kontri;
  const balik = dt > 0 ? 24 * (1 - Math.exp(-dt / 0.12) * Math.cos(dt * 14)) : 0;
  const sudut = awal + (dt > 0 ? 26 * clamp01(balik / 24) : 0);
  const rad = (sudut * Math.PI) / 180;
  const L = 340;
  const kiri = { x: cx - Math.cos(rad) * L, y: cy - Math.sin(rad) * L };
  const kanan = { x: cx + Math.cos(rad) * L, y: cy + Math.sin(rad) * L };
  const jatuhU = clamp01((t - (kontri - 0.45)) / 0.45);
  const hatiY = mix(400, kanan.y - 84, jatuhU * jatuhU);
  const coret = pe(k, bukan + 0.1, 0.4, IN_OUT);
  return (
    <g>
      <BayangDef id="ijf-kt" />
      <KepalaJalur k={k} wr={wr} font={font} i={1} t0={a.mulai - 1} />
      <path d={`M ${cx} ${cy + 10} L ${cx - 50} ${cy + 110} H ${cx + 50} Z`} fill={wr.teks} />
      <G x={cx} y={cy} r={sudut}>
        <rect x={-L - 30} y={-10} width={2 * L + 60} height={20} rx={10} fill={wr.teks} />
      </G>
      {/* koper pengalaman kerja + coretan */}
      <G x={kiri.x} y={kiri.y - 80} s={1.3} o={1 - 0.6 * clamp01(dt / 0.6)}>
        <IkonKoper wr={wr} />
        <path d="M -70 -60 L 70 50" stroke={wr.aksen2} strokeWidth={12} strokeLinecap="round" {...gambar(coret)} />
      </G>
      {t >= kontri - 0.45 ? (
        <G x={kanan.x} y={hatiY} s={1 + 0.15 * Math.exp(-Math.max(0, dt) / 0.15) * (dt > 0 ? 1 : 0)}>
          <IkonHati c={wr.aksen2} garisC={wr.teks} s={1.45} />
        </G>
      ) : null}
      {/* riak kontribusi menyebar dari hati setelah mendarat */}
      {dt > 0 ? [0, 1].map((i) => {
        const v = clamp01((dt - i * 0.25) / 0.9);
        return <circle key={i} cx={kanan.x} cy={kanan.y - 84} r={60 + 140 * v} fill="none" stroke={wr.aksen2} strokeWidth={5} opacity={(1 - v) * 0.7} />;
      }) : null}
      <Teks x={cx + 220} y={560} s={40} font={font} c={wr.aksen2} o={pe(k, tk(a, "label", kontri), 0.4)}>KONTRIBUSI</Teks>
    </g>
  );
};

// ---------- jalur 3: Kerja Profesional (S8) ----------

/** S8 Kerja profesional: ijazah (kualifikasi) + gir (keahlian) meluncur ke slot kartu pekerjaan; di "sesuai" bentuk
 *  takik pas → klik, lampu kuning menyala. */
export const IjfProfesional: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const kual = tk(a, "kualifikasi", 0.8);
  const keahlian = tk(a, "keahlian", 1.8);
  const sesuai = tk(a, "sesuai", 2.8);
  const t = detik(k);
  const cx = k.p.cx;
  const slotY = 610;
  const masuk = pe(k, sesuai - 0.45, 0.45, IN_OUT);
  const klik = clamp01((t - sesuai) / 0.3);
  const ijX = mix(mix(-200, 260, pe(k, kual - 0.2, 0.5, OUT)), cx - 120, masuk);
  // kereta jalur 3 tiba (pelan, berhenti tegas) → kartu pekerjaan terbuka dari stasiunnya; setelah klik kereta berangkat
  const tiba = pe(k, a.mulai + 0.2, 1.8, IN_OUT);
  const berangkat = pe(k, sesuai + 1.6, 1.4, IN_OUT);
  const keretaX = mix(mix(-120, cx, tiba), 1300, berangkat);
  const kartuP = pe(k, a.mulai + 1.9, 0.6, OUT_BACK);
  const girX = mix(mix(1280, 820, pe(k, keahlian - 0.2, 0.5, OUT)), cx + 150, masuk);
  return (
    <g>
      <BayangDef id="ijf-pr" />
      <KepalaJalur k={k} wr={wr} font={font} i={2} t0={a.mulai} />
      <GarisJalur pts={[[100, 830], [980, 830]]} c={wr.teks} p={pe(k, a.mulai, 0.6, IN_OUT)} lebar={16} latar={wr.latar} />
      <G x={cx} y={830}><Stasiun wr={wr} p={pe(k, a.mulai + 0.3, 0.4)} r={16} nyala={clamp01((detik(k) - a.mulai - 1.9) / 0.5)} c={wr.teks} /></G>
      <path d={`M ${cx} 812 V ${mix(812, slotY + 150, kartuP)}`} stroke={wr.teks} strokeWidth={6} strokeLinecap="round" />
      <G x={keretaX} y={828}><Kereta wr={wr} c={wr.teks} s={0.65} /></G>
      {/* kartu pekerjaan dengan dua takik */}
      <G x={cx} y={slotY} s={kartuP * (1 + 0.04 * Math.sin(klik * Math.PI))} o={clamp01(kartuP * 2)}>
        <Kartu w={720} h={300} bayang="ijf-pr" />
        <g opacity={1 - klik}>
          <rect x={-330} y={-120} width={140} height={20} rx={10} fill={wr.teks} />
          <rect x={-330} y={-86} width={90} height={14} rx={7} fill={rgba(wr.teks, 0.3)} />
        </g>
        <Teks x={-330} y={-92} s={40} font={font} c={wr.teks} anchor="start" o={klik}>SESUAI KEAHLIAN</Teks>
        <rect x={-260} y={-40} width={280} height={150} rx={18} fill={rgba(wr.teks, 0.08)} stroke={wr.teks} strokeWidth={4} strokeDasharray="14 10" />
        <circle cx={150} cy={35} r={74} fill={rgba(wr.teks, 0.08)} stroke={wr.teks} strokeWidth={4} strokeDasharray="14 10" />
        {/* lampu */}
        <circle cx={300} cy={-110} r={22} fill={klik > 0 ? wr.aksen : "#D9D4C7"} stroke={wr.teks} strokeWidth={5} />
        {klik > 0 ? <circle cx={300} cy={-110} r={22 + 40 * klik} fill="none" stroke={wr.aksen} strokeWidth={5} opacity={1 - klik} /> : null}
      </G>
      <G x={ijX} y={slotY + 35 + mix(-180, 0, masuk)} r={mix(-10, 0, masuk)} s={1.1}><IkonIjazah wr={wr} pita={wr.aksen} /></G>
      <G x={girX} y={slotY + 35 + mix(-180, 0, masuk)} s={1.2}>
        <IkonGir wr={wr} putar={t * 40 * (1 - masuk) + klik * 45} isi={klik > 0 ? wr.aksen : "#FFFFFF"} />
      </G>
    </g>
  );
};

// ---------- pertimbangan (S9) ----------

/** S9 "pertimbangkan tujuan, persyaratan, bahasa — berbeda-beda": kartu perencana rute tiga baris; kolom ikon
 *  menyala per kata, sel terisi batang berpanjang beda per jalur (tanpa angka — hanya menunjukkan perbedaan). */
export const IjfBanding: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const tt = [tk(a, "tujuan", 0.8), tk(a, "syarat", 1.6), tk(a, "bahasa", 2.4)];
  const beda = tk(a, "beda", 3.2);
  const cx = k.p.cx;
  const PJ = [[0.9, 0.55, 0.7], [0.5, 0.35, 0.6], [0.75, 0.95, 0.85]];
  const t = detik(k);
  return (
    <g>
      <BayangDef id="ijf-bd" />
      <G x={cx} y={CY + 10} s={OUT_BACK(pe(k, a.mulai, 0.5))}>
        <Kartu w={860} h={460} bayang="ijf-bd" />
        {/* kepala kolom */}
        {[0, 1, 2].map((c) => {
          const u = pe(k, tt[c] - 0.1, 0.4, OUT_BACK);
          const x = -110 + c * 210;
          return (
            <G key={c} x={x} y={-160} s={0.55 + 0.1 * u}>
              <circle r={70} fill={t >= tt[c] ? wr.aksen : rgba(wr.teks, 0.06)} />
              {c === 0 ? <IkonBendera wr={wr} kibar={Math.sin(t * 6)} c={wr.aksen2} /> : null}
              {c === 1 ? <IkonDokumen wr={wr} /> : null}
              {c === 2 ? <G s={0.8}><IkonBalon wr={wr} /></G> : null}
            </G>
          );
        })}
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(0 ${-50 + r * 105})`}>
            <G x={-350}><Lencana wr={wr} i={r} font={font} s={0.95} /></G>
            {[0, 1, 2].map((c) => {
              const u = pe(k, tt[c] + r * 0.08, 0.5, OUT);
              const w = 170 * PJ[r][c] * u;
              return (
                <g key={c} transform={`translate(${-195 + c * 210} 0)`}>
                  <rect x={0} y={-14} width={170} height={28} rx={14} fill={rgba(wr.teks, 0.07)} />
                  <rect x={0} y={-14} width={w} height={28} rx={14} fill={jalur(wr)[r].garis} />
                </g>
              );
            })}
          </g>
        ))}
        {/* "berbeda-beda": baris bergeser tidak serempak sesaat */}
        <rect x={-430} y={-230} width={860} height={460} rx={26} fill="none" stroke={wr.aksen} strokeWidth={6}
          opacity={pe(k, beda, 0.3) * (1 - pe(k, beda + 0.6, 0.5))} />
      </G>
    </g>
  );
};

// ---------- jangan ikut ramai (S10, depan) ----------

/** S10 "jangan asal pilih karena lagi ramai dibicarakan" (depan): balon obrolan naik dari belakang kepala talent
 *  (cutout di depannya) dan berkerumun ke peron 1 yang sedang ramai; satu penumpang kuning keluar dari antrean,
 *  menimbang tiga jalur (balon pikiran) — memilih sendiri, bukan ikut arus. */
export const IjfRamai: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const jangan = tk(a, "jangan", 0.3);
  const rame = tk(a, "rame", 1.2);
  const m0 = tk(a, "awal", 0);
  const t = detik(k);
  const peron = { x: 820, y: 650 };
  const N = 9;
  const keluar = pe(k, jangan + 0.2, 0.6, IN_OUT);
  const pikir = pe(k, rame - 0.2, 0.45, OUT_BACK);
  return (
    <g>
      <BayangDef id="ijf-rm" />
      {/* balon obrolan dari belakang kepala → berkumpul di atas peron ramai */}
      {Array.from({ length: N }, (_, i) => {
        const r1 = random(`bl${i}`);
        const mulai = m0 + i * 0.12;
        const u = clamp01((t - mulai) / 1.5);
        if (u <= 0) return null;
        const e = OUT(u);
        const x0 = 330 + r1 * 420;
        const x = mix(x0, peron.x - 120 + (i % 3) * 110, e);
        const y = mix(1180, peron.y - 135 - (i % 2) * 60, e) + Math.sin(t * 4 + i) * 6;
        return (
          <G key={i} x={x} y={y} s={mix(0.5, 0.62, e)} r={(r1 - 0.5) * 16} o={clamp01(u * 4)}>
            <IkonBalon wr={wr} isi={i % 3 === 0 ? wr.aksen : "#FFFFFF"} />
            {[0, 1, 2].map((d) => <circle key={d} cx={-30 + d * 30} cy={-2} r={8} fill={wr.teks} opacity={0.7} />)}
          </G>
        );
      })}
      {/* peron 1 yang ramai */}
      <G x={peron.x} y={peron.y} s={OUT_BACK(pe(k, m0, 0.4))}>
        <Kartu w={210} h={110} bayang="ijf-rm" isi={wr.teks} />
        <G x={-55}><Lencana wr={wr} i={0} font={font} s={0.95} /></G>
        <G x={45} y={2} s={0.5}><IkonOrang wr={wr} isi={wr.latar} /></G>
        <G x={80} y={6} s={0.42}><IkonOrang wr={wr} isi={wr.latar} /></G>
      </G>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = mix(200, 690, i / 5) + Math.sin(t * 6 + i) * 3;
        const kuning = i === 2;
        const kx = kuning ? mix(x, 300, keluar) : x;
        const ky = kuning ? mix(760, 640, keluar) : 760 - Math.abs(Math.sin(t * 7 + i)) * 6;
        return (
          <G key={i} x={kx} y={ky} s={1.1} o={kuning ? 1 : mix(1, 0.45, keluar)}>
            <IkonOrang wr={wr} isi={kuning ? wr.aksen : "#FFFFFF"} />
          </G>
        );
      })}
      {/* balon pikiran: tiga jalur ditimbang bergantian */}
      <G x={300} y={470} s={pikir} o={clamp01(pikir * 2)}>
        <circle cx={-10} cy={120} r={9} fill="#FFFFFF" stroke={wr.teks} strokeWidth={4} />
        <circle cx={-2} cy={90} r={14} fill="#FFFFFF" stroke={wr.teks} strokeWidth={4} />
        <rect x={-150} y={-55} width={300} height={110} rx={55} fill="#FFFFFF" stroke={wr.teks} strokeWidth={6} />
        {[0, 1, 2].map((i) => (
          <G key={i} x={-85 + i * 85} s={0.8 + 0.12 * Math.max(0, Math.sin((t - rame) * 4 - i * 1.2))}>
            <Lencana wr={wr} i={i} font={font} s={0.9} />
          </G>
        ))}
      </G>
    </g>
  );
};

// ---------- ajakan komentar (S11) ----------

/** S11 "komentar jalur pilihanmu": kartu kolom komentar; tiga cip jalur, jari mengetuk satu, balon mengetik. */
export const IjfKomentar: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const tt = [tk(a, "a1", 0.6), tk(a, "a2", 1.2), tk(a, "a3", 1.8)];
  const kom = tk(a, "komentar", 2.6);
  const t = detik(k);
  const cx = k.p.cx;
  const ketuk = pe(k, kom + 0.1, 0.3);
  const pilih = t >= kom + 0.25 ? 2 : -1;
  return (
    <g>
      <BayangDef id="ijf-km" />
      <G x={cx} y={CY} s={OUT_BACK(pe(k, a.mulai, 0.5))}>
        <Kartu w={820} h={420} bayang="ijf-km" />
        {/* baris komentar */}
        <G x={-330} y={-130}><circle r={34} fill={wr.aksen} stroke={wr.teks} strokeWidth={5} /></G>
        <rect x={-280} y={-152} width={220} height={18} rx={9} fill={wr.teks} />
        <rect x={-280} y={-122} width={140} height={14} rx={7} fill={rgba(wr.teks, 0.3)} />
        {[0, 1, 2].map((i) => {
          const u = pe(k, tt[i] - 0.1, 0.4, OUT_BACK);
          const y = -30 + i * 82;
          const aktif = pilih === i;
          return (
            <G key={i} x={-90} y={y} s={u}>
              <rect x={-260} y={-32} width={540} height={64} rx={32} fill={aktif ? wr.aksen : rgba(wr.teks, 0.06)}
                stroke={wr.teks} strokeWidth={aktif ? 5 : 3} />
              <G x={-210}><Lencana wr={wr} i={i} font={font} s={0.7} /></G>
              <Teks x={-166} y={11} s={28} font={font} c={wr.teks} anchor="start">{jalur(wr)[i].nama}</Teks>
            </G>
          );
        })}
        {/* balon mengetik */}
        <G x={310} y={-40} s={OUT_BACK(pe(k, kom, 0.4))}>
          <IkonBalon wr={wr} isi={wr.teks} w={150} h={100} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-34 + i * 34} cy={-4} r={9} fill={wr.latar} opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 8 - i))} />
          ))}
        </G>
        {/* jari */}
        <G x={mix(330, 150, pe(k, kom - 0.3, 0.4, IN_OUT))} y={mix(260, 170 - 8 * Math.sin(ketuk * Math.PI), pe(k, kom - 0.3, 0.4, IN_OUT))}
          o={pe(k, kom - 0.35, 0.2)}>
          <path d="M -14 -50 Q -14 -64 0 -64 Q 14 -64 14 -50 V -4 L 40 0 Q 56 4 52 22 L 44 60 H -18 L -40 12 Q -46 0 -32 -2 L -14 6 Z"
            fill="#FFFFFF" stroke={wr.teks} strokeWidth={6} strokeLinejoin="round" />
        </G>
      </G>
    </g>
  );
};

// ---------- kartu akhir (S12, penuh) ----------

/** S12 kartu akhir (penuh): tiga lencana jalur meluncur ke tengah dan berkumpul di bawah logo (logo besar oleh
 *  SplitReel saat modul "*-kartu"). */
export const IjfKartu: React.FC<PA> = ({ k, wr, font }) => {
  const { a } = k;
  const t = detik(k);
  return (
    <g>
      <rect x={-50} y={-50} width={1180} height={2020} fill={wr.latar} opacity={pe(k, a.mulai, 0.5)} />
      {[0, 1, 2].map((i) => {
        const u = pe(k, a.mulai + 0.3 + i * 0.1, 0.6, OUT_BACK);
        const x = mix([-200, 540, 1280][i], 400 + i * 140, u);
        return <G key={i} x={x} y={mix(1500, 900, pe(k, a.mulai + 0.3 + i * 0.1, 0.6, OUT))}><Lencana wr={wr} i={i} font={font} s={1.2} /></G>;
      })}
      <G x={540} y={1050}>
        <path d={`M -260 0 H 260`} stroke={wr.teks} strokeWidth={6} strokeLinecap="round" {...gambar(pe(k, a.mulai + 0.7, 0.6, IN_OUT))} />
      </G>
      <Teks x={540} y={1140} s={40} font={font} c={wr.teks} w={400} o={pe(k, a.mulai + 0.9, 0.5)}>Pilih jalur yang sesuai tujuanmu</Teks>
      {t < 0 ? <IkonDokumen wr={wr} /> : null}
    </g>
  );
};

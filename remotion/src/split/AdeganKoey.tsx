// Pustaka adegan Jepang Koey (split-layout): merah Koey #D40000 + putih + hitam (brand guideline Jepang Koey by OTCA).
// Bahasa visual: matahari hinomaru (lingkaran merah) sebagai motif & titik match cut iris, ikon garis putih tebal 6,
// isi merah untuk yang "benar/penting", stempel merah untuk yang "gagal". Label teks hanya kode (EN, N4, A2, あ).
// Area konten adegan: x 108..972, y 400..780 (fade panggung mulai ±790) (logo Koey permanen di slot atas SplitReel, y ±330).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Bintang, Cahaya, Centang, G, Kaca, Laptop, Orang, Target, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const CY = 580;
const JP = "'Noto Sans JP','Yu Gothic','Meiryo','IPAGothic',sans-serif";

/** Riak cincin merah yang melebar dari (0,0) lokal mulai detik `t0`. */
const Riak: React.FC<{ k: Konteks; t0: number; wr: Warna; r1?: number; n?: number }> = ({ k, t0, wr, r1 = 260, n = 2 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const u = prog(k, t0 + i * 0.16, 0.9, "keluar");
      return u > 0 && u < 1 ? (
        <circle key={i} r={mix(30, r1, u)} {...garis(wr.aksen, mix(8, 1, u))} opacity={(1 - u) * 0.9} filter="url(#sr-glow)" />
      ) : null;
    })}
  </>
);

/** Matahari hinomaru: cakram merah + cahaya; `cincin` = hanya garis (untuk di belakang logo). */
const Matahari: React.FC<{ wr: Warna; r: number; o?: number; cincin?: boolean }> = ({ wr, r, o = 1, cincin }) => (
  <g opacity={o}>
    <circle r={r * 1.7} fill="url(#sr-cahaya)" />
    {cincin ? <circle r={r} {...garis(wr.aksen, 6)} filter="url(#sr-glow)" /> : <circle r={r} fill={wr.aksen} filter="url(#sr-glow)" />}
  </g>
);

/** Stempel "ditolak": persegi bulat merah bersilang, jatuh dari skala besar (p 0→1) dengan sedikit miring. */
const Stempel: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) =>
  p <= 0 ? null : (
    <G s={mix(1.9, 1, p)} o={Math.min(1, p * 2.5)} r={-12}>
      <rect x={-92} y={-92} width={184} height={184} rx={26} {...garis(wr.aksen, 10)} fill={rgba(wr.aksen, 0.16)} filter="url(#sr-glow)" />
      <path d="M -46 -46 L 46 46 M 46 -46 L -46 46" {...garis(wr.aksen, 16)} filter="url(#sr-glow)" />
    </G>
  );

/** Silang merah yang digores (p 0→1). */
const Coret: React.FC<{ wr: Warna; p: number; r?: number }> = ({ wr, p, r = 120 }) => (
  <g filter="url(#sr-glow)">
    <path d={`M ${-r} ${-r} L ${r} ${r}`} {...garis(wr.aksen, 16)} {...gambar(Math.min(1, p * 2))} />
    <path d={`M ${r} ${-r} L ${-r} ${r}`} {...garis(wr.aksen, 16)} {...gambar(Math.max(0, p * 2 - 1))} />
  </g>
);

/** Gelembung bicara berlabel; ekor kiri/kanan. */
const Gelembung: React.FC<{ wr: Warna; p: number; label: string; font: string; w?: number; isi?: boolean; ekor?: 1 | -1; jp?: boolean }> = ({
  wr, p, label, font, w = 170, isi, ekor = -1, jp,
}) => {
  const h = 116;
  const x0 = -w / 2;
  const tx = ekor * (w / 2 - 34);
  return (
    <G s={mix(0.5, 1, p)} o={Math.min(1, p * 1.6)}>
      <path d={`M ${x0 + 30} ${-h / 2} H ${-x0 - 30} Q ${-x0} ${-h / 2} ${-x0} ${-h / 2 + 30} V ${h / 2 - 30} Q ${-x0} ${h / 2} ${-x0 - 30} ${h / 2}
        H ${tx + 18 * ekor} L ${tx + 6 * ekor} ${h / 2 + 30} L ${tx - 16 * ekor} ${h / 2} H ${x0 + 30} Q ${x0} ${h / 2} ${x0} ${h / 2 - 30}
        V ${-h / 2 + 30} Q ${x0} ${-h / 2} ${x0 + 30} ${-h / 2} Z`}
        {...garis(isi ? wr.aksen : wr.teks)} fill={isi ? wr.aksen : wr.panel} fillOpacity={isi ? 1 : 0.9} filter="url(#sr-glow)" />
      <text x={0} y={jp ? 20 : 22} textAnchor="middle" fontFamily={jp ? JP : font} fontWeight={800} fontSize={jp ? 62 : 64} fill={wr.teks}>
        {label}
      </text>
    </G>
  );
};

/** Kartu visa/paspor Jepang: panel + hinomaru + baris data + chip. Pusat (0,0), 250x330. */
const KartuVisa: React.FC<{ wr: Warna; p: number; font: string }> = ({ wr, p, font }) => (
  <g>
    <rect x={-125} y={-165} width={250} height={330} rx={22}  fillOpacity={0.94} {...garis(wr.teks)} fill={wr.panel} strokeOpacity={0.9}
      {...gambar(p)} filter="url(#sr-glow)" />
    <g opacity={Math.max(0, p * 2 - 1)}>
      <rect x={-125} y={-165} width={250} height={64} rx={22} fill={wr.aksen} />
      <rect x={-125} y={-125} width={250} height={24} fill={wr.aksen} />
      <text x={0} y={-121} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={34} letterSpacing={8} fill={wr.teks}>
        VISA
      </text>
      <circle cx={0} cy={-18} r={52} fill={wr.teks} />
      <circle cx={0} cy={-18} r={30} fill={wr.aksen} />
      {[66, 98, 130].map((y, i) => (
        <rect key={y} x={-88} y={y - 7} width={i === 2 ? 110 : 176} height={14} rx={7} fill={wr.teks} opacity={0.32} />
      ))}
    </g>
  </g>
);

// 1. HOOK "Sampai sekarang belum ada pelamar IT yang lolos visa kerja Jepang kalau masih ngandelin bahasa Inggris aja":
// frame 0 kartu visa besar di depan matahari → bergeser kanan, laptop IT masuk kiri, gelembung EN, panah putus-putus ke visa,
// stempel merah "ditolak" jatuh di kartu (getar + riak), panah patah.
export const KoeyVisa: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const it = tk(a, "it", 1.4);
  const visa = tk(a, "visa", 2.5);
  const en = tk(a, "inggris", 4.4);
  const tolak = tk(a, "tolak", 4.85);
  const t = detik(k);
  const geser = progE(k, it - 0.1, 0.7, INOUT);
  const lap = prog(k, it, 0.6);
  const kilau = prog(k, visa, 0.6);
  const g = prog(k, en, 0.45);
  const panah = prog(k, en + 0.1, 0.5);
  const st = prog(k, tolak, 0.28, "keluar");
  const getar = t > tolak ? Math.sin((t - tolak) * 46) * Math.exp(-(t - tolak) * 7) * 10 : 0;
  const d = drift(k, 1);
  const vx = mix(p.cx, p.cx + 190, geser);
  const lx = p.cx - 200;
  return (
    <>
      <G x={mix(p.cx, p.cx + 190, geser)} y={CY + 10}>
        <Matahari wr={wr} r={mix(205, 165, geser)} o={mix(0.95, 0.55, geser) * (1 - 0.35 * st)} />
      </G>
      <G x={lx + d.x * 0.7} y={CY + 95 + d.y * 0.7} s={mix(0.7, 1.25, lap)} o={lap}>
        <Laptop wr={{ ...wr, aksen: wr.teks }} p={lap} layar={0.6} />
        <text x={0} y={-46} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={44} fill={wr.teks} opacity={lap}>
          {"</>"}
        </text>
      </G>
      <G x={lx - 30} y={CY - 150}>
        <Gelembung wr={wr} p={g} label="EN" font={font} w={150} ekor={1} />
      </G>
      {panah > 0 ? (
        <g opacity={1 - st * 0.4}>
          <path d={`M ${lx + 110} ${CY + 40} Q ${p.cx} ${CY - 60} ${vx - 140} ${CY}`} {...garis(wr.teks, 5)} strokeDasharray="4 16"
            strokeDashoffset={-t * 40} opacity={panah} />
          <G x={p.cx - 5} y={CY - 18} s={st} o={st}>
            <path d="M -20 -20 L 20 20 M 20 -20 L -20 20" {...garis(wr.aksen, 9)} filter="url(#sr-glow)" />
          </G>
        </g>
      ) : null}
      <G x={vx + d.x + getar} y={CY + 25 + d.y} s={mix(1.0, 0.92, geser)} r={mix(0, 6, geser) + getar * 0.3}>
        <KartuVisa wr={wr} p={1} font={font} />
        {kilau > 0 && kilau < 1 ? (
          <rect x={-125} y={-165} width={250} height={330} rx={22} fill="url(#kv-kilau)" opacity={Math.sin(kilau * Math.PI)} />
        ) : null}
        <defs>
          <linearGradient id="kv-kilau" gradientUnits="userSpaceOnUse" x1={mix(-300, 300, kilau) - 80} y1={-200} x2={mix(-300, 300, kilau) + 80} y2={200}>
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.5} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <G y={20}>
          <Stempel wr={wr} p={st} />
          <Riak k={k} t0={tolak} wr={wr} r1={300} n={2} />
        </G>
      </G>
    </>
  );
};

// 2. "Bahasa Inggris cuma nilai plus": lencana EN besar → mengecil jadi lencana kecil "+" di pojok matahari Jepang yang tumbuh.
export const KoeyNilaiPlus: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const plus = tk(a, "plus", 1.8);
  const m = prog(k, a.mulai, 0.5);
  const u = progE(k, plus - 0.25, 0.7, INOUT);
  const jp = prog(k, plus - 0.1, 0.8);
  const d = drift(k, 1);
  const ex = mix(p.cx, p.cx + 190, u);
  const ey = mix(CY, CY - 150, u);
  return (
    <>
      <G x={p.cx + d.x * 0.5} y={CY + d.y * 0.5} s={mix(0.4, 1, jp)} o={jp}>
        <Matahari wr={wr} r={170} />
        <text x={0} y={30} textAnchor="middle" fontFamily={JP} fontWeight={700} fontSize={92} fill={wr.teks}>
          日本語
        </text>
      </G>
      <G x={ex + d.x} y={ey + d.y} s={mix(1, 0.42, u) * mix(0.7, 1, m)} o={m}>
        <circle r={150}  fillOpacity={0.92} {...garis(wr.teks, 8)} fill={wr.panel} filter="url(#sr-glow)" />
        <text x={0} y={42} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={124} fill={wr.teks}>
          EN
        </text>
      </G>
      <G x={ex + 96} y={ey - 60} s={mix(0.3, 1, u)} o={u}>
        <circle r={34} fill={wr.teks} filter="url(#sr-glow)" />
        <path d="M -16 0 H 16 M 0 -16 V 16" {...garis(wr.aksen, 8)} />
      </G>
      <G x={ex} y={ey}>
        <Riak k={k} t0={plus} wr={wr} r1={150} n={1} />
      </G>
    </>
  );
};

// 3. "Interview kerja dan omotenashi": meja wawancara, pewawancara (merah) & kandidat (putih) bergantian bicara "あ",
// lalu keduanya membungkuk (ojigi) — kilau bintang.
export const KoeyInterview: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const omo = tk(a, "omotenashi", 1.1);
  const t = detik(k);
  const m = prog(k, a.mulai, 0.6);
  const b1 = prog(k, a.mulai + 0.35, 0.4);
  const b2 = prog(k, a.mulai + 0.85, 0.4);
  const bow = Math.sin(Math.min(1, Math.max(0, (t - omo) / 0.9)) * Math.PI) * 28;
  const d = drift(k, 1);
  const kx = p.cx - 220;
  const kn = p.cx + 220;
  return (
    <>
      <G x={p.cx} y={CY}>
        <Matahari wr={wr} r={110} o={0.35 * m} cincin />
      </G>
      <G x={d.x} y={d.y}>
        <line x1={p.cx - 330} x2={p.cx + 330} y1={CY + 130} y2={CY + 130} {...garis(wr.teks, 6)} {...gambar(m)} opacity={0.85} />
        <path d={`M ${p.cx - 120} ${CY + 150} V ${CY + 180} M ${p.cx + 120} ${CY + 130} V ${CY + 180}`} {...garis(wr.teks, 6)} opacity={0.5 * m} />
        <G x={kx} y={CY + 130} s={1.3} o={m}>
          <g transform={`rotate(${bow} 0 -40)`}>
            <Orang wr={wr} stroke={wr.aksen} p={m} />
          </g>
        </G>
        <G x={kn} y={CY + 130} s={1.3} o={m}>
          <g transform={`rotate(${-bow} 0 -40)`}>
            <Orang wr={wr} stroke={wr.teks} p={m} />
          </g>
        </G>
        <G x={kx + 40} y={CY - 150}>
          <Gelembung wr={wr} p={b1} label="あ" font={font} w={140} isi ekor={-1} jp />
        </G>
        <G x={kn - 40} y={CY - 150}>
          <Gelembung wr={wr} p={b2} label="はい" font={font} w={170} ekor={1} jp />
        </G>
      </G>
      {[0, 1, 2, 3, 4].map((i) => {
        const u = prog(k, omo + 0.3 + i * 0.07, 0.8);
        const ang = -Math.PI / 2 + (i - 2) * 0.5;
        return u > 0 && u < 1 ? (
          <G key={i} x={p.cx + Math.cos(ang) * mix(40, 230, u)} y={CY + 20 + Math.sin(ang) * mix(40, 200, u)} o={1 - u}>
            <Bintang c={i % 2 ? wr.aksen2 : wr.teks} r={18} />
          </G>
        ) : null;
      })}
    </>
  );
};

// 4. "Tetap pakai bahasa Jepang level N4 atau A2": tangga N5→N1 tergambar, N4 menyala merah + bendera, kartu JFT A2 bercentang.
export const KoeyLevel: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const jp = tk(a, "jepang", 0.7);
  const n4 = tk(a, "n4", 1.35);
  const a2 = tk(a, "a2", 2.3);
  const label = ["N5", "N4", "N3", "N2", "N1"];
  const lebar = 118;
  const x0 = p.cx - 360;
  const dasar = CY + 175;
  const nyala = prog(k, n4, 0.4);
  const kartu = prog(k, a2 - 0.05, 0.5);
  const d = drift(k, 1);
  return (
    <G x={d.x} y={d.y}>
      {label.map((l, i) => {
        const u = prog(k, a.mulai + 0.05 + i * 0.12, 0.5);
        const h = 80 + i * 62;
        const x = x0 + i * (lebar + 10);
        const aktif = i === 1;
        const redup = i > 1 ? mix(1, 0.4, nyala) : 1;
        return (
          <g key={l} opacity={u * redup}>
            <rect x={x} y={dasar - h * u} width={lebar} height={h * u} rx={14}  fillOpacity={aktif ? 0.25 + 0.75 * nyala : 0.9}
              {...garis(aktif ? wr.aksen : wr.teks, 5)} fill={aktif ? wr.aksen : wr.panel} filter={aktif ? "url(#sr-glow)" : undefined} />
            <text x={x + lebar / 2} y={dasar - h * u + 50} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={40} fill={wr.teks}>
              {l}
            </text>
          </g>
        );
      })}
      <G x={x0 + lebar + 10 + lebar / 2} y={dasar - 142}>
        <G y={-20} s={mix(0.4, 1, nyala)} o={nyala}>
          <line x1={0} y1={0} x2={0} y2={-120} {...garis(wr.teks, 5)} />
          <rect x={0} y={-120} width={84} height={56} rx={6} fill={wr.teks} />
          <circle cx={42} cy={-92} r={16} fill={wr.aksen} />
        </G>
        <Riak k={k} t0={n4} wr={wr} r1={170} n={2} />
      </G>
      <G x={p.cx + 290} y={CY - 70 + Math.sin(detik(k) * 2) * 4} s={mix(0.6, 1, kartu)} o={kartu} r={mix(-10, 4, kartu)}>
        <Kaca x={-108} y={-80} w={216} h={160} r={22} wr={wr} o={0.92} />
        <rect x={-108} y={-80} width={216} height={160} rx={22} {...garis(wr.aksen, 5)} />
        <text x={0} y={-22} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={30} letterSpacing={4} fill={wr.teks} opacity={0.8}>
          JFT
        </text>
        <text x={0} y={52} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={74} fill={wr.teks}>
          A2
        </text>
        <G x={98} y={-74} s={0.55}>
          <Centang wr={wr} p={prog(k, a2 + 0.25, 0.5)} />
        </G>
      </G>
    </G>
  );
};

// 5. "Belajar ke guru dan di sela kerja": papan tulis "あいう" ditulis guru (merah) untuk murid (putih); jam & tas kerja muncul.
export const KoeyGuru: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const guru = tk(a, "guru", 0.6);
  const sela = tk(a, "sela", 1.25);
  const t = detik(k);
  const papan = prog(k, a.mulai, 0.7);
  const tulis = progE(k, guru, 1.2, INOUT);
  const jam = prog(k, sela, 0.5);
  const d = drift(k, 1);
  const bx = p.cx - 70;
  return (
    <G x={d.x} y={d.y}>
      <G x={bx} y={CY - 40} s={mix(0.85, 1, papan)} o={papan}>
        <rect x={-250} y={-150} width={500} height={270} rx={18}  fillOpacity={0.94} {...garis(wr.teks)} fill={wr.panel} {...gambar(papan)} />
        <line x1={-210} x2={210} y1={140} y2={140} {...garis(wr.teks, 6)} opacity={0.5} />
        {["あ", "い", "う"].map((c, i) => {
          const u = Math.min(1, Math.max(0, tulis * 3 - i));
          return (
            <text key={c} x={-140 + i * 140} y={40} textAnchor="middle" fontFamily={JP} fontWeight={700} fontSize={130}
              fill={i === 0 ? wr.aksen : wr.teks} opacity={u} transform={`translate(0 ${mix(14, 0, u)})`}>
              {c}
            </text>
          );
        })}
      </G>
      <G x={bx - 330} y={CY + 185} s={1.0} o={papan}>
        <Orang wr={wr} stroke={wr.aksen} langkah={0} p={papan} />
        <line x1={14} y1={-112} x2={70} y2={-170} {...garis(wr.aksen, 7)} opacity={papan} />
      </G>
      <G x={bx + 40} y={CY + 200} s={0.85} o={prog(k, a.mulai + 0.3, 0.5)}>
        <Orang wr={wr} stroke={wr.teks} />
      </G>
      <G x={p.cx + 300} y={CY + 40} s={mix(0.5, 1, jam)} o={jam}>
        <circle r={78}  {...garis(wr.teks, 6)} fill={wr.panel} filter="url(#sr-glow)" />
        <line x1={0} y1={0} x2={0} y2={-52} {...garis(wr.aksen, 7)} transform={`rotate(${(t - sela) * 260})`} />
        <line x1={0} y1={0} x2={34} y2={0} {...garis(wr.teks, 7)} transform={`rotate(${(t - sela) * 22})`} />
        <circle r={8} fill={wr.aksen} />
        <G y={128} s={0.75}>
          <rect x={-62} y={-40} width={124} height={84} rx={12}  {...garis(wr.teks, 6)} fill={wr.panel} />
          <path d="M -24 -40 V -58 H 24 V -40" {...garis(wr.teks, 6)} />
          <line x1={-62} x2={62} y1={-4} y2={-4} {...garis(wr.aksen, 5)} />
        </G>
      </G>
    </G>
  );
};

// 6. "Nggak bisa cuma nonton anime, butuh latihan kaiwa yang terarah": layar anime (mata berkilau) dicoret & menyingkir,
// dua gelembung kaiwa bergantian, jalur putus-putus menggambar ke target merah.
export const KoeyKaiwa: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const anime = tk(a, "anime", 0.5);
  const kaiwa = tk(a, "kaiwa", 1.65);
  const arah = tk(a, "arah", 2.15);
  const t = detik(k);
  const tv = prog(k, a.mulai, 0.5);
  const cor = prog(k, anime + 0.1, 0.4);
  const pergi = progE(k, kaiwa - 0.6, 0.6, INOUT);
  const g1 = prog(k, kaiwa - 0.3, 0.4);
  const g2 = prog(k, kaiwa + 0.05, 0.4);
  const jalur = progE(k, arah - 0.1, 0.6, INOUT);
  const tg = prog(k, arah - 0.2, 0.5);
  const d = drift(k, 1);
  const kedip = Math.abs(Math.sin(t * 3)) > 0.96 ? 0.15 : 1;
  return (
    <G x={d.x} y={d.y}>
      <G x={mix(p.cx, p.cx - 520, pergi)} y={CY} s={mix(0.8, 1, tv) * mix(1, 0.6, pergi)} o={tv * (1 - pergi)}>
        <rect x={-210} y={-140} width={420} height={260} rx={24}  fillOpacity={0.94} {...garis(wr.teks)} fill={wr.panel} filter="url(#sr-glow)" />
        <path d="M -60 150 L 0 120 L 60 150" {...garis(wr.teks, 6)} />
        {[-70, 70].map((x) => (
          <g key={x} transform={`translate(${x} -10) scale(1 ${kedip})`}>
            <ellipse rx={46} ry={58} fill={wr.teks} />
            <ellipse rx={30} ry={42} cy={8} fill={wr.aksen} />
            <circle cx={-12} cy={-14} r={12} fill={wr.teks} />
            <circle cx={12} cy={20} r={5} fill={wr.teks} />
          </g>
        ))}
        <G x={150} y={-90}>
          <Bintang c={wr.teks} r={20 + 6 * Math.sin(t * 6)} />
        </G>
        <Coret wr={wr} p={cor} r={150} />
      </G>
      <G x={p.cx - 230} y={CY - 90}>
        <Gelembung wr={wr} p={g1} label="会話" font={font} w={200} ekor={-1} jp />
      </G>
      <G x={p.cx - 70} y={CY + 70}>
        <Gelembung wr={wr} p={g2} label="はい!" font={font} w={190} isi ekor={1} jp />
      </G>
      {jalur > 0 ? (
        <path d={`M ${p.cx + 40} ${CY - 20} C ${p.cx + 120} ${CY - 200}, ${p.cx + 200} ${CY + 160}, ${p.cx + 290} ${CY - 10}`}
          {...garis(wr.teks, 5)} strokeDasharray="2 14" pathLength={1} style={{ strokeDasharray: `${jalur} 1` }} opacity={0.9} />
      ) : null}
      <G x={p.cx + 300} y={CY - 10} s={mix(0.5, 0.95, tg)} o={tg}>
        <Target wr={wr} p={tg} />
        <Riak k={k} t0={arah + 0.4} wr={wr} r1={190} n={2} />
      </G>
    </G>
  );
};

// 7. "Simpan video ini biar nggak lupa": bookmark besar tergambar → terisi merah (pop), centang & kilau.
export const KoeySimpan: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const simpan = tk(a, "simpan", 0.2);
  const lupa = tk(a, "lupa", 2.0);
  const gb = prog(k, a.mulai, 0.7);
  const isi = prog(k, simpan + 0.45, 0.45, "keluar");
  const c = prog(k, lupa, 0.5);
  const d = drift(k, 1);
  const pop = 1 + 0.12 * Math.sin(Math.min(1, isi) * Math.PI);
  return (
    <>
      <G x={p.cx} y={CY}>
        <Matahari wr={wr} r={mix(120, 210, isi)} o={0.3 + 0.25 * isi} cincin />
      </G>
      <G x={p.cx + d.x} y={CY + d.y} s={mix(0.7, 1, gb) * pop}>
        <defs>
          <clipPath id="ks-isi">
            <rect x={-120} y={mix(170, -170, isi)} width={240} height={360} />
          </clipPath>
        </defs>
        <path d="M -100 -160 H 100 Q 112 -160 112 -148 V 170 L 0 92 L -112 170 V -148 Q -112 -160 -100 -160 Z" 
          fillOpacity={0.9} {...garis(wr.teks, 8)} fill={wr.panel} {...gambar(gb)} filter="url(#sr-glow)" />
        <path d="M -100 -160 H 100 Q 112 -160 112 -148 V 170 L 0 92 L -112 170 V -148 Q -112 -160 -100 -160 Z" fill={wr.aksen}
          clipPath="url(#ks-isi)" />
        <G y={-20} s={0.95} o={c}>
          <path d="M -40 0 L -10 30 L 46 -30" {...garis(wr.teks, 14)} {...gambar(c)} />
        </G>
        <Riak k={k} t0={simpan + 0.5} wr={wr} r1={260} n={2} />
      </G>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const u = prog(k, lupa + i * 0.05, 0.8);
        const ang = (i / 6) * Math.PI * 2 + 0.3;
        return u > 0 && u < 1 ? (
          <G key={i} x={p.cx + Math.cos(ang) * mix(100, 300, u)} y={CY + Math.sin(ang) * mix(100, 250, u)} o={1 - u}>
            <Bintang c={i % 2 ? wr.aksen2 : wr.teks} r={16} />
          </G>
        ) : null;
      })}
    </>
  );
};

// 8. "Share ke temen kamu yang masih ngandelin bahasa Inggris aja": pesawat kertas terbang dari ikon share ke teman,
// teman bergelembung "EN" → gelembung dicoret merah tipis.
export const KoeyShare: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const temen = tk(a, "temen", 0.55);
  const en = tk(a, "inggris", 2.4);
  const m = prog(k, a.mulai, 0.5);
  const u = progE(k, a.mulai + 0.2, Math.max(0.6, temen + 0.35 - a.mulai), INOUT);
  const tm = prog(k, temen, 0.5);
  const g = prog(k, en - 0.2, 0.4);
  const cor = prog(k, en + 0.35, 0.35);
  const d = drift(k, 1);
  const sx = p.cx - 250;
  const fx = p.cx + 250;
  const titik = (v: number) => ({ x: mix(sx + 60, fx - 60, v), y: CY - 40 - Math.sin(v * Math.PI) * 170 });
  const q = titik(u);
  const q2 = titik(Math.min(1, u + 0.02));
  const sudut = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
  return (
    <G x={d.x} y={d.y}>
      <G x={sx} y={CY + 20} s={mix(0.6, 1, m)} o={m}>
        <circle r={120}  fillOpacity={0.9} {...garis(wr.teks, 6)} fill={wr.panel} filter="url(#sr-glow)" />
        {[[-38, 0], [34, -40], [34, 40]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={20} fill={wr.aksen} />
        ))}
        <path d="M -38 0 L 34 -40 M -38 0 L 34 40" {...garis(wr.teks, 6)} />
      </G>
      {Array.from({ length: 22 }, (_, i) => {
        const v = (i / 22) * u;
        const o = titik(v);
        return <circle key={i} cx={o.x} cy={o.y} r={4} fill={wr.teks} opacity={(0.15 + 0.6 * (i / 22)) * (1 - tm * 0.5)} />;
      })}
      {u < 1 ? (
        <G x={q.x} y={q.y} r={sudut} s={1.1}>
          <path d="M 46 0 L -40 -34 L -22 0 L -40 34 Z" fill={wr.teks} stroke={wr.teks} strokeWidth={3} strokeLinejoin="round" filter="url(#sr-glow)" />
          <path d="M 46 0 L -22 0 L -40 34 Z" fill={wr.aksen} />
        </G>
      ) : null}
      <G x={fx} y={CY + 175} s={mix(0.8, 1.25, tm)} o={tm}>
        <Orang wr={wr} stroke={wr.teks} />
      </G>
      <G x={fx} y={CY + 175}>
        <Riak k={k} t0={temen + 0.2} wr={wr} r1={170} n={1} />
      </G>
      <G x={fx + 40} y={CY - 150}>
        <Gelembung wr={wr} p={g} label="EN" font={font} w={150} ekor={-1} />
        <G s={0.5}>
          <Coret wr={wr} p={cor} r={110} />
        </G>
      </G>
    </G>
  );
};

// 9. Kartu akhir "…buat ke Jepang": siluet Fuji tergambar, matahari cincin naik, logo Koey besar (digeser SplitReel).
export const KoeyKartu: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const f = prog(k, a.mulai, 0.9);
  const naik = progE(k, a.mulai + 0.1, 1.0, INOUT);
  return (
    <>
      <G x={p.cx} y={mix(760, 530, naik)}>
        <Matahari wr={wr} r={260} o={0.55 * naik} cincin />
      </G>
      <G x={p.cx} y={CY + 215} s={0.72}>
        <path d="M -430 0 L -150 -190 Q -120 -212 -96 -206 L -60 -186 L -30 -204 L 0 -186 L 34 -206 L 70 -190 Q 96 -206 122 -188 L 430 0"
          {...garis(wr.teks, 6)} {...gambar(f)} opacity={0.9} filter="url(#sr-glow)" />
        <path d="M -150 -190 Q -120 -212 -96 -206 L -60 -186 L -30 -204 L 0 -186 L 34 -206 L 70 -190 Q 96 -206 122 -188 L 70 -150 L 30 -170 L 0 -146 L -36 -168 L -76 -146 Z"
          fill={wr.teks} opacity={0.85 * Math.max(0, f * 2 - 1)} />
      </G>
      {Array.from({ length: 12 }, (_, i) => {
        const x = p.cx - 360 + random(`kk${i}`) * 720;
        const y = 440 + random(`ky${i}`) * 360;
        const o = 0.15 + 0.5 * Math.abs(Math.sin(detik(k) * 2 + i));
        return (
          <G key={i} x={x} y={y} o={o * f} s={0.4 + random(`ks${i}`) * 0.5}>
            <Bintang c={i % 3 ? wr.teks : wr.aksen2} r={12} />
          </G>
        );
      })}
    </>
  );
};

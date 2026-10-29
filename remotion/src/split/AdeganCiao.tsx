// Pustaka adegan Ciao Manda (split-layout): merah #D40000 + putih + hitam (brand guideline Ciao Manda by OTCA).
// Topik: "Kerja di perusahaan China di Indonesia — ekspektasi vs realita" (3 poin).
// Bahasa visual: atap pagoda (motif logo) sebagai atap gedung & garis akhir, ikon garis putih tebal 6, merah = penting/realita.
// Struktur poin: label "01/02/03" + pil EKSPEKTASI (putih) / REALITA (merah, highlight style brand) di kiri atas panggung.
// Area konten: x 108..972, y 470..820 (logo Ciao Manda permanen di slot atas SplitReel, fade panggung mulai ±800).

import React from "react";
import { random } from "remotion";
import { rgba } from "../lib/kontrak";
import { INOUT, Konteks, detik, drift, gambar, mix, prog, progE, tk } from "./alat";
import { Bintang, G, Laptop, Orang, Petir, Timbangan, Warna, garis } from "./Ikon";

type PA = { k: Konteks; wr: Warna; font: string };

const CY = 650;
const HZ = "'Noto Sans SC','Noto Sans CJK SC','Microsoft YaHei','SimHei','WenQuanYi Zen Hei',sans-serif";

/** Riak cincin merah yang melebar dari (0,0) lokal mulai detik `t0`. */
const Riak: React.FC<{ k: Konteks; t0: number; wr: Warna; r1?: number; n?: number; c?: string }> = ({ k, t0, wr, r1 = 240, n = 2, c }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const u = prog(k, t0 + i * 0.16, 0.9, "keluar");
      return u > 0 && u < 1 ? (
        <circle key={i} r={mix(30, r1, u)} {...garis(c ?? wr.aksen, mix(8, 1, u))} opacity={(1 - u) * 0.9} filter="url(#sr-glow)" />
      ) : null;
    })}
  </>
);

/** Atap pagoda (motif logo Ciao Manda): lebar w, tinggi h, ujung melengkung ke atas; dasar di y 0. */
const Atap: React.FC<{ wr: Warna; w: number; h?: number; p: number; isi?: boolean; c?: string; tebal?: number }> = ({
  wr, w, h = w * 0.26, p, isi, c, tebal = 7,
}) => {
  const x = w / 2;
  const d = `M ${-x} ${-h * 0.16} Q ${-x * 0.86} ${h * 0.06} ${-x * 0.62} ${-h * 0.04} Q ${-x * 0.24} ${-h * 0.5} 0 ${-h}
    Q ${x * 0.24} ${-h * 0.5} ${x * 0.62} ${-h * 0.04} Q ${x * 0.86} ${h * 0.06} ${x} ${-h * 0.16}`;
  return (
    <g filter="url(#sr-glow)">
      {isi ? <path d={`${d} Q ${x * 0.6} ${h * 0.12} 0 ${h * 0.12} Q ${-x * 0.6} ${h * 0.12} ${-x} ${-h * 0.16} Z`} fill={c ?? wr.aksen} opacity={Math.max(0, p * 2 - 1)} /> : null}
      <path d={d} {...garis(c ?? wr.aksen, tebal)} {...gambar(p)} />
      <circle cx={0} cy={-h - 12} r={9} fill={c ?? wr.aksen} opacity={p} />
    </g>
  );
};

/** Gedung kantor beratap pagoda; dasar (0,0), lebar 240. p = dibangun, nyala = jendela menyala (0→1). */
const Gedung: React.FC<{ wr: Warna; p: number; nyala: number; tinggi?: number }> = ({ wr, p, nyala, tinggi = 250 }) => {
  const w = 200;
  const baris = Math.floor(tinggi / 52);
  return (
    <g>
      <rect x={-w / 2} y={-tinggi} width={w} height={tinggi} rx={8} {...garis(wr.teks)} fill={wr.panel} fillOpacity={0.9}
        {...gambar(p)} filter="url(#sr-glow)" />
      {Array.from({ length: baris * 3 }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const on = nyala * baris * 3 > (baris * 3 - 1 - i) + 0.01 ? 1 : 0;
        return (
          <rect key={i} x={-72 + c * 52} y={-tinggi + 22 + r * 52} width={40} height={30} rx={5}
            fill={on && (i * 7) % 5 === 0 ? wr.aksen : wr.teks} opacity={Math.max(0, p * 2 - 1) * (0.14 + 0.66 * on)} />
        );
      })}
      <G y={-tinggi - 4}>
        <Atap wr={wr} w={290} p={Math.max(0, p * 1.6 - 0.6)} isi />
      </G>
    </g>
  );
};

/** Label poin: angka besar bergaris + pil jenis (EKSPEKTASI putih / REALITA merah). Kiri atas panggung. */
const Label: React.FC<{ k: Konteks; wr: Warna; font: string; no: string; jenis: "eks" | "real"; t0?: number }> = ({
  k, wr, font, no, jenis, t0,
}) => {
  const s0 = t0 ?? k.a.mulai;
  const u = prog(k, s0, 0.55, "keluar");
  const v = prog(k, s0 + 0.12, 0.5, "keluar");
  const real = jenis === "real";
  const label = real ? "REALITA" : "EKSPEKTASI";
  const lw = real ? 230 : 300;
  return (
    <g>
      <G x={mix(60, 112, u)} y={500} o={u}>
        <text x={0} y={0} fontFamily={font} fontWeight={800} fontSize={104} fill="none" stroke={real ? wr.aksen : wr.teks}
          strokeWidth={3} letterSpacing={-2} filter="url(#sr-glow)">
          {no}
        </text>
      </G>
      <G x={mix(170, 252, v)} y={436} o={v}>
        <rect x={0} y={0} width={lw} height={56} rx={28} fill={real ? wr.aksen : wr.teks} filter="url(#sr-glow)" />
        <text x={lw / 2} y={39} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={30} letterSpacing={2}
          fill={real ? wr.teks : "#000000"}>
          {label}
        </text>
      </G>
    </g>
  );
};

/** Gelembung bicara berlabel; ekor kiri/kanan; `isi` = merah penuh; `hz` = teks hanzi. */
const Gelembung: React.FC<{ wr: Warna; p: number; label: string; font: string; w?: number; h?: number; isi?: boolean; ekor?: 1 | -1; hz?: boolean; fs?: number }> = ({
  wr, p, label, font, w = 180, h = 120, isi, ekor = -1, hz, fs,
}) => {
  const x0 = -w / 2;
  const tx = ekor * (w / 2 - 36);
  const r = Math.min(34, h / 3);
  return (
    <G s={mix(0.5, 1, p)} o={Math.min(1, p * 1.6)}>
      <path d={`M ${x0 + r} ${-h / 2} H ${-x0 - r} Q ${-x0} ${-h / 2} ${-x0} ${-h / 2 + r} V ${h / 2 - r} Q ${-x0} ${h / 2} ${-x0 - r} ${h / 2}
        H ${tx + 18 * ekor} L ${tx + 6 * ekor} ${h / 2 + 32} L ${tx - 16 * ekor} ${h / 2} H ${x0 + r} Q ${x0} ${h / 2} ${x0} ${h / 2 - r}
        V ${-h / 2 + r} Q ${x0} ${-h / 2} ${x0 + r} ${-h / 2} Z`}
        {...garis(isi ? wr.aksen : wr.teks)} fill={isi ? wr.aksen : wr.panel} fillOpacity={isi ? 1 : 0.92} filter="url(#sr-glow)" />
      <text x={0} y={(fs ?? (hz ? 70 : 64)) * 0.35} textAnchor="middle" fontFamily={hz ? HZ : font} fontWeight={800}
        fontSize={fs ?? (hz ? 70 : 64)} fill={wr.teks}>
        {label}
      </text>
    </G>
  );
};

/** Silang merah stempel (p 0→1), jatuh dari skala besar. */
const Silang: React.FC<{ wr: Warna; p: number; r?: number }> = ({ wr, p, r = 60 }) =>
  p <= 0 ? null : (
    <G s={mix(1.8, 1, p)} o={Math.min(1, p * 2.5)} r={-10}>
      <circle r={r * 1.45} {...garis(wr.aksen, 9)} fill={rgba(wr.aksen, 0.16)} filter="url(#sr-glow)" />
      <path d={`M ${-r * 0.6} ${-r * 0.6} L ${r * 0.6} ${r * 0.6} M ${r * 0.6} ${-r * 0.6} L ${-r * 0.6} ${r * 0.6}`} {...garis(wr.aksen, 14)} filter="url(#sr-glow)" />
    </G>
  );

/** Centang kecil di lingkaran merah penuh. */
const Cek: React.FC<{ wr: Warna; p: number; r?: number }> = ({ wr, p, r = 30 }) =>
  p <= 0 ? null : (
    <G s={mix(0.3, 1, p)} o={Math.min(1, p * 2)}>
      <circle r={r} fill={wr.aksen} filter="url(#sr-glow)" />
      <path d={`M ${-r * 0.45} 0 L ${-r * 0.1} ${r * 0.35} L ${r * 0.5} ${-r * 0.35}`} {...garis(wr.teks, 7)} {...gambar(p)} />
    </G>
  );

/** Hati (pusat 0,0, lebar ±2r). */
const Hati: React.FC<{ c: string; r?: number; isi?: boolean; p?: number }> = ({ c, r = 50, isi = true, p = 1 }) => {
  const d = `M 0 ${r * 0.9} C ${-r * 1.6} ${-r * 0.1} ${-r * 0.9} ${-r * 1.25} 0 ${-r * 0.45} C ${r * 0.9} ${-r * 1.25} ${r * 1.6} ${-r * 0.1} 0 ${r * 0.9} Z`;
  return <path d={d} {...garis(c, 6)} fill={isi ? c : "none"} {...(isi ? {} : gambar(p))} filter="url(#sr-glow)" />;
};

/** Pin peta bendera Indonesia (merah-putih). Ujung di (0,0). */
const PinID: React.FC<{ wr: Warna; p: number }> = ({ wr, p }) => (
  <G s={mix(0.3, 1, p)} o={Math.min(1, p * 2)} y={mix(-40, 0, p)}>
    <path d="M 0 0 C -20 -40 -56 -64 -56 -104 A 56 56 0 1 1 56 -104 C 56 -64 20 -40 0 0 Z" {...garis(wr.teks)} fill={wr.panel} filter="url(#sr-glow)" />
    <clipPath id="ci-pin"><circle cx={0} cy={-104} r={34} /></clipPath>
    <g clipPath="url(#ci-pin)">
      <rect x={-34} y={-138} width={68} height={34} fill={wr.aksen} />
      <rect x={-34} y={-104} width={68} height={34} fill="#FFFFFF" />
    </g>
  </G>
);

// 1. HOOK "Kerja di perusahaan China di Indonesia tuh enak gak sih?": gedung beratap pagoda tumbuh, pin Indonesia jatuh,
// gelembung "?" besar bergoyang di "enak".
export const CiaoTanya: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const kantor = tk(a, "perusahaan", 1.45);
  const id = tk(a, "indonesia", 2.43);
  const enak = tk(a, "enak", 3.57);
  const t = detik(k);
  const g = prog(k, 0, 0.28, "keluar");
  const nyala = progE(k, Math.min(kantor - 0.2, 0.6), 1.0, INOUT);
  const pin = prog(k, id, 0.45, "keluar");
  const q = prog(k, enak - 0.1, 0.45, "keluar");
  const goyang = t > enak ? Math.sin((t - enak) * 9) * 8 * Math.exp(-(t - enak) * 1.6) : 0;
  const d = drift(k, 1);
  return (
    <>
      <G x={p.cx - 90 + d.x * 0.6} y={CY + 175 + d.y * 0.6} s={mix(1.25, 1.08, g)}>
        <circle cx={0} cy={-170} r={260} fill="url(#sr-cahaya)" opacity={0.6 * g} />
        <Gedung wr={wr} p={g} nyala={nyala} />
      </G>
      <G x={p.cx + 110} y={CY - 10}>
        <PinID wr={wr} p={pin} />
        <G y={-104}>
          <Riak k={k} t0={id + 0.1} wr={wr} r1={150} n={1} />
        </G>
      </G>
      <G x={p.cx + 250 + d.x} y={CY - 60 + d.y} r={goyang} s={mix(0.4, 1.15, q)} o={q}>
        <path d="M -95 -40 Q -95 -110 0 -110 Q 95 -110 95 -40 Q 95 26 0 26 Q -20 26 -42 20 L -80 46 L -66 8 Q -95 -8 -95 -40 Z"
          {...garis(wr.aksen, 7)} fill={wr.aksen} filter="url(#sr-glow)" />
        <text x={0} y={-8} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={104} fill={wr.teks}>
          ?
        </text>
      </G>
    </>
  );
};

// 2. "Mari kita cek ekspektasi dan realita": dua kartu membalik masuk — EKSPEKTASI (awan pikiran, putih) vs REALITA (mata, merah),
// lencana "VS" menghentak di tengah.
export const CiaoVs: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const eks = tk(a, "ekspektasi", 1.3);
  const real = tk(a, "realita", 2.3);
  const vs = tk(a, "kerja", 2.9);
  const t = detik(k);
  const u1 = prog(k, eks - 0.15, 0.55, "keluar");
  const u2 = prog(k, real - 0.15, 0.55, "keluar");
  const v = prog(k, vs, 0.35, "keluar");
  const getar = t > vs ? Math.sin((t - vs) * 40) * Math.exp(-(t - vs) * 8) * 6 : 0;
  const d = drift(k, 1);
  const kartu = (x: number, u: number, merah: boolean, judul: string, ikon: React.ReactNode) => (
    <g transform={`translate(${x + getar} ${CY + 10}) scale(${Math.max(0.001, u)} 1) rotate(${merah ? 3 : -3})`} opacity={Math.min(1, u * 2)}>
      <rect x={-155} y={-170} width={310} height={330} rx={28} fillOpacity={merah ? 1 : 0.94}
        {...garis(merah ? wr.aksen : wr.teks, 5)} fill={merah ? wr.aksen : wr.panel} filter="url(#sr-glow)" />
      <g transform="translate(0 -30)">{ikon}</g>
      <rect x={-120} y={92} width={240} height={46} rx={23} fill={merah ? wr.teks : wr.teks} />
      <text x={0} y={124} textAnchor="middle" fontFamily={font} fontWeight={700} fontSize={merah ? 27 : 24} letterSpacing={2}
        fill={merah ? wr.aksen : "#000000"}>
        {judul}
      </text>
    </g>
  );
  const awan = (
    <g filter="url(#sr-glow)">
      <path d="M -70 30 Q -110 30 -104 -6 Q -100 -40 -62 -38 Q -52 -82 -4 -78 Q 40 -76 50 -40 Q 96 -46 100 -4 Q 102 30 64 30 Z"
        {...garis(wr.teks, 7)} fill="none" />
      <circle cx={-64} cy={58} r={11} {...garis(wr.teks, 5)} />
      <circle cx={-84} cy={84} r={6} {...garis(wr.teks, 4)} />
      <G y={-16} s={0.8}>
        <Bintang c={wr.aksen2} r={22} />
      </G>
    </g>
  );
  const mata = (
    <g filter="url(#sr-glow)">
      <path d="M -100 0 Q 0 -86 100 0 Q 0 86 -100 0 Z" {...garis(wr.teks, 7)} fill="none" />
      <circle r={34} fill={wr.teks} />
      <circle r={14} fill={wr.aksen} />
    </g>
  );
  return (
    <>
      <G x={d.x * 0.5} y={d.y * 0.5}>
        {kartu(p.cx - 190, u1, false, "EKSPEKTASI", awan)}
        {kartu(p.cx + 190, u2, true, "REALITA", mata)}
      </G>
      <G x={p.cx} y={CY - 20} s={mix(2.2, 1, v)} o={v}>
        <circle r={62} {...garis(wr.teks, 6)} fill="#000000" filter="url(#sr-glow)" />
        <text x={0} y={18} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={52} fill={wr.teks} fontStyle="italic">
          VS
        </text>
        <Riak k={k} t0={vs} wr={wr} r1={220} n={2} c={wr.teks} />
      </G>
    </>
  );
};

// 3. Poin 01 EKSPEKTASI "Harus jago bahasa Mandarin": gelembung 中文 besar + meter kefasihan melonjak ke 100% (merah berdenyut).
export const CiaoMandarin: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const harus = tk(a, "harus", 2.2);
  const jago = tk(a, "jago", 2.5);
  const t = detik(k);
  const b = prog(k, harus - 0.2, 0.5, "keluar");
  const m = progE(k, jago, 0.9, INOUT);
  const kecil = (i: number) => prog(k, jago + 0.15 + i * 0.18, 0.4, "keluar");
  const denyut = m >= 1 ? 1 + Math.sin(t * 9) * 0.03 : 1;
  const d = drift(k, 1);
  const bx = p.cx + 40;
  return (
    <>
      <Label k={k} wr={wr} font={font} no="01" jenis="eks" />
      <G x={bx + d.x} y={CY - 10 + d.y}>
        <Gelembung wr={wr} p={b} label="中文" font={font} w={280} h={150} hz fs={96} isi />
      </G>
      {[["你好", -250, 40, 1], ["谢谢", 260, 70, -1]].map(([s, x, y, e], i) => (
        <G key={i} x={bx + (x as number) + d.x * 1.4} y={CY + (y as number) + d.y * 1.4} r={i ? 6 : -6}>
          <Gelembung wr={wr} p={kecil(i)} label={s as string} font={font} w={150} h={88} hz fs={48} ekor={e as 1 | -1} />
        </G>
      ))}
      <G x={bx - 30} y={CY + 175} o={prog(k, jago - 0.15, 0.4)} s={denyut}>
        <rect x={-210} y={-18} width={420} height={36} rx={18} {...garis(wr.teks, 4)} fill={wr.panel} />
        <rect x={-204} y={-12} width={mix(0, 408, m)} height={24} rx={12} fill={wr.aksen} filter="url(#sr-glow)" />
        <text x={226} y={14} fontFamily={font} fontWeight={800} fontSize={40} fill={wr.teks}>
          {`${Math.round(m * 100)}%`}
        </text>
      </G>
    </>
  );
};

// 4. Poin 01 REALITA "Gak selalu, bahasa pengantar tetap Indonesia & Inggris": 中文 mengecil ke pojok + stempel silang,
// gelembung ID (merah-putih) & EN muncul dengan centang.
export const CiaoPengantar: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const selalu = tk(a, "selalu", 1.4);
  const id = tk(a, "indonesia", 6.0);
  const en = tk(a, "inggris", 6.9);
  const u = progE(k, a.mulai, 0.8, INOUT);
  const st = prog(k, selalu, 0.3, "keluar");
  const g1 = prog(k, id - 0.25, 0.45, "keluar");
  const g2 = prog(k, en - 0.25, 0.45, "keluar");
  const c1 = prog(k, id + 0.3, 0.4, "keluar");
  const c2 = prog(k, en + 0.3, 0.4, "keluar");
  const peng = tk(a, "pengantar", 4.0);
  const meja = prog(k, peng - 0.3, 0.8);
  const s1 = prog(k, peng - 0.1, 0.5, "keluar");
  const s2 = prog(k, peng + 0.15, 0.5, "keluar");
  const d = drift(k, 1);
  const zx = mix(p.cx + 40, p.cx + 290, u);
  const zy = mix(CY - 10, CY - 150, u);
  return (
    <>
      <Label k={k} wr={wr} font={font} no="01" jenis="real" />
      <G x={zx} y={zy} s={mix(1, 0.62, u)} o={mix(1, 0.6, st)}>
        <Gelembung wr={wr} p={1} label="中文" font={font} w={280} h={150} hz fs={96} isi />
        <Silang wr={wr} p={st} r={70} />
      </G>
      <G x={p.cx} y={CY + 170} o={meja}>
        <path d="M -340 0 H 340" {...garis(wr.teks, 5)} {...gambar(meja)} opacity={0.6} />
        <G x={-300} y={-4} s={0.8} o={s1}><Orang wr={wr} stroke={wr.teks} p={s1} /></G>
        <G x={300} y={-4} s={0.8} o={s2}><Orang wr={wr} stroke={wr.teks} p={s2} /></G>
      </G>
      <G x={p.cx - 110 + d.x} y={CY - 10 + d.y} r={-4}>
        <G s={mix(0.5, 1, g1)} o={Math.min(1, g1 * 1.6)}>
          <Gelembung wr={wr} p={1} label="" font={font} w={230} h={140} ekor={1} />
          <clipPath id="ci-id"><rect x={-70} y={-40} width={140} height={80} rx={12} /></clipPath>
          <g clipPath="url(#ci-id)">
            <rect x={-70} y={-40} width={140} height={40} fill={wr.aksen} />
            <rect x={-70} y={0} width={140} height={40} fill="#FFFFFF" />
          </g>
          <rect x={-70} y={-40} width={140} height={80} rx={12} {...garis(wr.teks, 3)} />
        </G>
        <G x={100} y={-70}>
          <Cek wr={wr} p={c1} />
        </G>
      </G>
      <G x={p.cx + 110 - d.x} y={CY + 10 + d.y} r={4}>
        <Gelembung wr={wr} p={g2} label="EN" font={font} w={230} h={140} ekor={-1} fs={76} />
        <G x={100} y={-70}>
          <Cek wr={wr} p={c2} />
        </G>
      </G>
    </>
  );
};

// 5. "Namun Mandarin jadi nilai tambah kamu": lencana 中 di tengah + badge "+", grafik batang naik (batang ketiga merah) & kilau.
export const CiaoNilaiTambah: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const mand = tk(a, "mandarin", 0.8);
  const tambah = tk(a, "tambah", 3.0);
  const t = detik(k);
  const b = prog(k, mand - 0.2, 0.55, "keluar");
  const plus = prog(k, tambah - 0.15, 0.4, "keluar");
  const naik = progE(k, mand + 0.2, 1.6, INOUT);
  const d = drift(k, 1);
  const tinggi = [110, 170, 300];
  return (
    <>
      <G x={p.cx} y={CY + 170}>
        {tinggi.map((h, i) => {
          const hh = h * Math.min(1, Math.max(0, naik * 1.4 - i * 0.2));
          return (
            <rect key={i} x={-250 + i * 190 + 120} y={-hh} width={120} height={hh} rx={14}
              fillOpacity={i === 2 ? 1 : 0.9} {...garis(i === 2 ? wr.aksen : wr.teks, 4)} fill={i === 2 ? wr.aksen : wr.panel} filter="url(#sr-glow)" />
          );
        })}
        <path d={`M -200 -60 Q 0 -120 ${mix(-200, 230, naik)} ${mix(-60, -330, naik)}`} {...garis(wr.teks, 6)} strokeDasharray="4 16"
          strokeDashoffset={-t * 40} opacity={naik} />
      </G>
      <G x={p.cx - 160 + d.x} y={CY - 70 + d.y} s={mix(0.4, 1, b)} o={b}>
        <circle r={110} fill={wr.aksen} filter="url(#sr-glow)" />
        <circle r={124} {...garis(wr.teks, 4)} opacity={0.7} />
        <text x={0} y={36} textAnchor="middle" fontFamily={HZ} fontWeight={800} fontSize={110} fill={wr.teks}>
          中
        </text>
        <G x={88} y={-80} s={mix(0.2, 1, plus)} o={plus}>
          <circle r={42} fill={wr.teks} filter="url(#sr-glow)" />
          <path d="M -20 0 H 20 M 0 -20 V 20" {...garis(wr.aksen, 10)} />
        </G>
        <Riak k={k} t0={tambah} wr={wr} r1={240} n={2} c={wr.teks} />
      </G>
      {Array.from({ length: 7 }, (_, i) => {
        const o = plus * (0.2 + 0.6 * Math.abs(Math.sin(t * 2.2 + i)));
        return (
          <G key={i} x={p.cx - 330 + random(`cn${i}`) * 660} y={CY - 170 + random(`cy${i}`) * 300} o={o} s={0.4 + random(`cs${i}`) * 0.5}>
            <Bintang c={i % 2 ? wr.teks : wr.aksen2} r={14} />
          </G>
        );
      })}
    </>
  );
};

// 6. Poin 02 EKSPEKTASI "Kerjanya gak work-life balance": timbangan — laptop (kerja) berat jatuh, hati (hidup) terangkat;
// jam di atas berputar cepat (lembur).
export const CiaoWlb: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const bal = tk(a, "balance", 1.6);
  const t = detik(k);
  const m = prog(k, a.mulai + 0.1, 0.7);
  const miring = progE(k, bal - 0.3, 0.6, INOUT);
  const getar = t > bal ? Math.sin((t - bal) * 30) * Math.exp(-(t - bal) * 5) * 3 : 0;
  const jam = t * 720;
  return (
    <>
      <Label k={k} wr={wr} font={font} no="02" jenis="eks" />
      <G x={p.cx + 40} y={CY + 230} s={0.95}>
        <Timbangan wr={{ ...wr, aksen: wr.teks }} p={m} sudut={mix(0, 17, miring) + getar}
          kiri={<G y={-10} s={0.8} o={m}><Hati c={wr.aksen} r={46} /></G>}
          kanan={<G y={-4} s={0.85} o={m}><Laptop wr={{ ...wr, aksen: wr.teks }} p={m} layar={1} /></G>} />
      </G>
      <G x={p.cx + 300} y={CY - 110} o={m} s={0.9}>
        <circle r={58} {...garis(wr.teks, 6)} fill={wr.panel} filter="url(#sr-glow)" />
        <line x1={0} y1={0} x2={0} y2={-36} {...garis(wr.aksen, 6)} transform={`rotate(${jam})`} />
        <line x1={0} y1={0} x2={24} y2={0} {...garis(wr.teks, 6)} transform={`rotate(${jam / 12})`} />
        <circle r={7} fill={wr.aksen} />
      </G>
    </>
  );
};

// 7. Poin 02 REALITA "Tergantung budaya kerja masing-masing perusahaan": tiga gedung pagoda berbeda tinggi, masing-masing lencana
// berbeda (jam 9-5, bulan lembur, hati) — muncul bergiliran.
export const CiaoBudaya: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const tg = tk(a, "tergantung", 1.6);
  const bd = tk(a, "budaya", 2.5);
  const ms = tk(a, "masing-masing", 3.2);
  const d = drift(k, 1);
  const data: { x: number; h: number; t0: number; badge: (u: number) => React.ReactNode }[] = [
    { x: -270, h: 180, t0: tg - 0.3, badge: () => (
      <g><circle r={40} {...garis(wr.teks, 5)} fill={wr.panel} /><path d="M 0 -22 V 0 L 16 10" {...garis(wr.aksen, 6)} /></g>) },
    { x: 0, h: 250, t0: bd - 0.3, badge: () => (
      <g><circle r={40} {...garis(wr.teks, 5)} fill={wr.panel} /><path d="M 8 -24 A 24 24 0 1 0 22 10 A 18 18 0 1 1 8 -24 Z" fill={wr.teks} /></g>) },
    { x: 270, h: 210, t0: ms - 0.3, badge: () => (
      <g><circle r={40} fill={wr.aksen} /><G y={4} s={0.42}><Hati c={wr.teks} r={46} /></G></g>) },
  ];
  return (
    <>
      <Label k={k} wr={wr} font={font} no="02" jenis="real" />
      {data.map((g, i) => {
        const u = prog(k, g.t0, 0.7, "keluar");
        const b = prog(k, g.t0 + 0.35, 0.4, "keluar");
        return (
          <G key={i} x={p.cx + g.x + d.x * (0.6 + i * 0.3)} y={CY + 200 + d.y * 0.6} s={0.72} o={Math.min(1, u * 2)}>
            <Gedung wr={wr} p={u} nyala={u} tinggi={g.h} />
            <G y={-g.h - 150} s={mix(0.3, 1.3, b)} o={b}>
              {g.badge(b)}
            </G>
          </G>
        );
      })}
    </>
  );
};

// 8. "Kuncinya riset sebelum apply": kartu profil perusahaan, kaca pembesar menyapu, 3 centang beruntun, tombol APPLY ditekan.
export const CiaoRiset: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const riset = tk(a, "riset", 0.7);
  const apply = tk(a, "apply", 1.4);
  const t = detik(k);
  const m = prog(k, a.mulai, 0.55, "keluar");
  const sapu = progE(k, riset - 0.1, 1.3, INOUT);
  const tekan = t > apply + 0.6 ? Math.max(0.9, 1 - Math.sin(Math.min(1, (t - apply - 0.6) / 0.25) * Math.PI) * 0.1) : 1;
  const tb = prog(k, apply, 0.45, "keluar");
  const d = drift(k, 1);
  const kx = p.cx - 70;
  return (
    <>
      <G x={kx + d.x * 0.5} y={CY + d.y * 0.5} s={mix(0.8, 1, m)} o={m}>
        <rect x={-210} y={-170} width={420} height={330} rx={26} fillOpacity={0.94} {...garis(wr.teks, 5)} fill={wr.panel} filter="url(#sr-glow)" />
        <G x={-120} y={-80} s={0.5}>
          <Atap wr={wr} w={220} p={1} isi />
        </G>
        <rect x={-60} y={-122} width={210} height={20} rx={10} fill={wr.teks} opacity={0.9} />
        <rect x={-60} y={-88} width={150} height={14} rx={7} fill={wr.teks} opacity={0.4} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={-150} y={-20 + i * 52} width={260} height={14} rx={7} fill={wr.teks} opacity={0.35} />
            <G x={150} y={-13 + i * 52}>
              <Cek wr={wr} p={prog(k, riset + 0.3 + i * 0.3, 0.35, "keluar")} r={20} />
            </G>
          </g>
        ))}
      </G>
      <G x={kx + mix(-180, 160, sapu) + d.x} y={CY + mix(-60, 80, Math.sin(sapu * Math.PI)) + d.y} o={prog(k, riset - 0.2, 0.3)} r={-20}>
        <circle r={70} {...garis(wr.teks, 9)} fill={rgba("#FFFFFF", 0.08)} filter="url(#sr-glow)" />
        <path d="M 52 52 L 110 110" {...garis(wr.teks, 16)} filter="url(#sr-glow)" />
      </G>
      <G x={p.cx + 250} y={CY + 200} s={mix(0.4, 1, tb) * tekan} o={tb}>
        <rect x={-110} y={-36} width={220} height={72} rx={36} fill={wr.aksen} filter="url(#sr-glow)" />
        <text x={0} y={13} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={36} letterSpacing={2} fill={wr.teks}>
          APPLY
        </text>
        <Riak k={k} t0={apply + 0.65} wr={wr} r1={180} n={1} c={wr.teks} />
      </G>
    </>
  );
};

// 9. Poin 03 EKSPEKTASI "Bos perusahaan China sulit diajak komunikasi": staf (putih) bicara, gelembung memantul di dinding kaca,
// petir di sisi bos (merah).
export const CiaoBos: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const bos = tk(a, "bos", 2.3);
  const sulit = tk(a, "sulit", 3.5);
  const kom = tk(a, "komunikasi", 4.4);
  const t = detik(k);
  const o1 = prog(k, a.mulai + 0.3, 0.5);
  const o2 = prog(k, bos - 0.1, 0.5, "keluar");
  const dinding = prog(k, sulit - 0.1, 0.5, "keluar");
  const pantul = (i: number) => {
    const s0 = kom - 0.1 + i * 0.5;
    const u = Math.max(0, Math.min(1, (t - s0) / 0.7));
    const x = u < 0.5 ? mix(0, 150, u * 2) : mix(150, 40, (u - 0.5) * 2);
    return { x, o: u > 0 && u < 1 ? 1 - Math.max(0, u - 0.7) / 0.3 : 0, r: u < 0.5 ? 0 : -25 * (u - 0.5) * 2 };
  };
  const getar = t > sulit ? Math.sin((t - sulit) * 40) * Math.exp(-(t - sulit) * 6) * 6 : 0;
  return (
    <>
      <Label k={k} wr={wr} font={font} no="03" jenis="eks" />
      <G x={p.cx - 230} y={CY + 200} s={1.15} o={o1}>
        <Orang wr={wr} stroke={wr.teks} p={o1} />
      </G>
      <G x={p.cx + 230 + getar} y={CY + 200} s={1.25} o={o2}>
        <Orang wr={wr} stroke={wr.aksen} isi={wr.aksen} p={o2} />
        <path d="M -8 -66 L 0 -40 L 8 -66 Z" fill={wr.teks} opacity={o2} />
        <G x={70} y={-190} s={0.7} o={dinding}>
          <Petir warna={wr.aksen2} p={dinding} />
        </G>
      </G>
      <G x={p.cx + 40} y={CY + 40} o={dinding}>
        <rect x={-10} y={-mix(0, 200, dinding)} width={20} height={mix(0, 360, dinding)} rx={10}           {...garis(wr.teks, 3)} fill={rgba("#FFFFFF", 0.25)} filter="url(#sr-glow)" />
      </G>
      {[0, 1].map((i) => {
        const b = pantul(i);
        return (
          <G key={i} x={p.cx - 150 + b.x} y={CY - 60 + i * 60} r={b.r} o={b.o}>
            <Gelembung wr={wr} p={1} label={i ? "?" : "…"} font={font} w={120} h={80} ekor={-1} fs={52} />
          </G>
        );
      })}
      <G x={p.cx - 120} y={CY - 70} o={prog(k, a.mulai + 0.6, 0.4) * (1 - prog(k, kom - 0.3, 0.3))}>
        <Gelembung wr={wr} p={prog(k, a.mulai + 0.6, 0.4, "keluar")} label="…" font={font} w={120} h={80} ekor={-1} fs={52} />
      </G>
    </>
  );
};

// 10. Poin 03 REALITA "Menambah pengalaman kerja budaya global": dinding pecah jadi bola dunia berputar, busur menghubungkan
// titik Indonesia ke titik-titik dunia, orbit + kilau di "global".
export const CiaoGlobal: React.FC<PA> = ({ k, wr, font }) => {
  const { a, p } = k;
  const pg = tk(a, "pengalaman", 3.0);
  const gl = tk(a, "global", 5.0);
  const t = detik(k);
  const m = prog(k, a.mulai + 0.2, 0.8, "keluar");
  const arc = progE(k, pg - 0.3, 1.4, INOUT);
  const orb = prog(k, gl - 0.2, 0.6, "keluar");
  const R = 175;
  const rot = t * 18;
  const gx = p.cx + 40;
  const gy = CY + 20;
  const titik: [number, number][] = [[-70, -95], [95, -60], [120, 60], [-120, 40], [20, 130]];
  const asal: [number, number] = [40, 40];
  return (
    <>
      <Label k={k} wr={wr} font={font} no="03" jenis="real" />
      <G x={gx} y={gy} s={mix(0.5, 1, m)} o={m}>
        <circle r={R * 1.6} fill="url(#sr-cahaya)" opacity={0.7} />
        <circle r={R} fillOpacity={0.9} {...garis(wr.teks, 6)} fill={wr.panel} filter="url(#sr-glow)" />
        <clipPath id="ci-bola"><circle r={R - 3} /></clipPath>
        <g clipPath="url(#ci-bola)" opacity={0.5}>
          {[-0.6, 0, 0.6].map((y, i) => <ellipse key={i} cx={0} cy={y * R} rx={R * Math.sqrt(1 - y * y)} ry={14} {...garis(wr.teks, 2)} />)}
          {[0, 1, 2, 3].map((i) => {
            const ph = ((rot + i * 45) % 180) / 180;
            return <ellipse key={i} cx={0} cy={0} rx={Math.abs(Math.cos(ph * Math.PI)) * R} ry={R} {...garis(wr.teks, 2)} />;
          })}
        </g>
        {titik.map(([x, y], i) => {
          const u = Math.max(0, Math.min(1, arc * 1.6 - i * 0.15));
          const mx = (asal[0] + x) / 2;
          const my = (asal[1] + y) / 2 - 90;
          return (
            <g key={i}>
              <path d={`M ${asal[0]} ${asal[1]} Q ${mx} ${my} ${x} ${y}`} {...garis(wr.aksen2, 4)} {...gambar(u)} filter="url(#sr-glow)" />
              <circle cx={x} cy={y} r={mix(0, 11, u)} fill={wr.teks} filter="url(#sr-glow)" />
            </g>
          );
        })}
        <circle cx={asal[0]} cy={asal[1]} r={16} {...garis(wr.teks, 4)} fill={wr.aksen} filter="url(#sr-glow)" />
        <ellipse rx={R * 1.35} ry={R * 0.38} {...garis(wr.aksen, 5)} transform="rotate(-18)" {...gambar(orb)} filter="url(#sr-glow)" />
        {orb > 0 ? (
          <G x={Math.cos(t * 2.4) * R * 1.35} y={Math.sin(t * 2.4) * R * 0.38} r={0}>
            <g transform="rotate(-18)">
              <Bintang c={wr.teks} r={20} />
            </g>
          </G>
        ) : null}
        <Riak k={k} t0={gl} wr={wr} r1={300} n={2} />
      </G>
    </>
  );
};

// 11. "Gak semua atasan kayak gitu — pandai-pandai ambil hati atasan": tiga atasan (garis putih) tersenyum, staf mengirim hati merah
// yang melayang ke atasan tengah → atasan menyala merah.
export const CiaoHati: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const semua = tk(a, "semua", 0.3);
  const pandai = tk(a, "pandai-pandai", 3.0);
  const hati = tk(a, "hati", 4.1);
  const t = detik(k);
  const senyum = (i: number) => prog(k, semua + i * 0.18, 0.4, "keluar");
  const staf = prog(k, pandai - 0.3, 0.5, "keluar");
  const terbang = progE(k, hati - 0.5, 0.9, INOUT);
  const nyala = prog(k, hati + 0.4, 0.5, "keluar");
  const sx = p.cx - 300;
  const tx = p.cx + 60;
  return (
    <>
      {[-1, 0, 1].map((i) => {
        const u = senyum(i + 1);
        const tengah = i === 0;
        return (
          <G key={i} x={tx + i * 200} y={CY + 150 - (tengah ? 20 : 0)} s={tengah ? 1.2 : 0.95} o={Math.min(1, 0.3 + u)}>
            <Orang wr={wr} stroke={tengah && nyala > 0 ? wr.aksen : wr.teks} isi={tengah ? rgba(wr.aksen, 0.35 * nyala) : undefined} p={1} />
            <path d="M -12 -112 Q 0 -100 12 -112" {...garis(wr.teks, 4)} {...gambar(u)} />
          </G>
        );
      })}
      <G x={sx} y={CY + 170} s={1.05} o={staf}>
        <Orang wr={wr} stroke={wr.teks} p={staf} />
      </G>
      {terbang > 0 ? (
        <G x={mix(sx + 30, tx, terbang)} y={mix(CY + 20, CY - 175, terbang) - Math.sin(terbang * Math.PI) * 110}
          s={mix(0.6, 1, terbang) * (1 + Math.sin(t * 10) * 0.04)} o={1 - nyala * 0.3}>
          <Hati c={wr.aksen} r={40} />
        </G>
      ) : null}
      <G x={tx} y={CY - 175}>
        <Riak k={k} t0={hati + 0.4} wr={wr} r1={220} n={2} />
      </G>
      {nyala > 0
        ? Array.from({ length: 6 }, (_, i) => {
            const ang = (i / 6) * Math.PI * 2 + t;
            return (
              <G key={i} x={tx + Math.cos(ang) * 140} y={CY - 40 + Math.sin(ang) * 90} o={nyala * 0.8} s={0.6}>
                <Hati c={i % 2 ? wr.teks : wr.aksen} r={16} />
              </G>
            );
          })
        : null}
    </>
  );
};

// 12. Kartu akhir: footage memudar (split.json footage.tutup), logo Ciao Manda membesar ke tengah frame (SplitReel, modul *-kartu),\n// atap pagoda besar tergambar di atasnya + kilau.
export const CiaoKartu: React.FC<PA> = ({ k, wr }) => {
  const { a, p } = k;
  const f = prog(k, a.mulai + 0.3, 1.0);
  const naik = progE(k, a.mulai + 0.2, 1.0, INOUT);
  return (
    <>
      <G x={p.cx} y={mix(720, 660, naik)} o={naik}>
        <Atap wr={wr} w={720} p={f} tebal={6} />
      </G>
      {Array.from({ length: 12 }, (_, i) => {
        const x = p.cx - 380 + random(`ck${i}`) * 760;
        const y = 380 + random(`cky${i}`) * 320;
        const o = 0.15 + 0.5 * Math.abs(Math.sin(detik(k) * 2 + i));
        return (
          <G key={i} x={x} y={y} o={o * f} s={0.4 + random(`cks${i}`) * 0.5}>
            <Bintang c={i % 3 ? wr.teks : wr.aksen2} r={12} />
          </G>
        );
      })}
    </>
  );
};

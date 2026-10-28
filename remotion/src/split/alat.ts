// Alat bersama modul split-layout (SplitReel): waktu absolut dalam DETIK (sudah di-resolve Python dari anchor kata),
// easing & warna dari token gaya (props.tokens) — tidak ada angka gaya di adegan.

import { Easing, interpolate } from "remotion";
import { Tokens, kurva } from "../lib/kontrak";

/** Batas panggung atas (px) — separuh atas frame untuk ilustrasi, talent di bawahnya. */
export type Panggung = { W: number; tinggi: number; cx: number; atas: number; bawah: number };

/** Satu adegan di pustaka: modul + jendela waktu + titik-titik waktu kunci (detik absolut) + teks opsional. */
export type Adegan = {
  modul: string;
  mulai: number;
  selesai: number;
  t: Record<string, number>;
  masuk?: Transisi;
  keluar?: Transisi;
  teks?: Record<string, string>;
  /** Titik fokus (px panggung) untuk match cut "iris": lingkaran menyempit/membuka di titik ini. Bawaan tengah panggung. */
  titik?: [number, number];
};

/** blur-zoom = potong bawaan (motif glass-tech); match = silang pudar tanpa zoom (bentuk sama di dua adegan);
 *  iris = shape match cut: adegan lama menyempit jadi lingkaran di `titik`, adegan baru membuka dari lingkaran yang sama. */
export type Transisi = "blur-zoom" | "match" | "iris";

export type Konteks = { f: number; fps: number; tok: Tokens; p: Panggung; a: Adegan };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 dari detik `s` selama `d` detik dengan easing token (bawaan "standar"). */
export const prog = (k: Konteks, s: number, d = 0.5, nama = "standar") =>
  interpolate(k.f, [s * k.fps, (s + d) * k.fps], [0, 1], { ...clamp, easing: kurva(k.tok, nama) });

/** Seperti prog tapi easing bebas (mis. inOut untuk garis panjang). */
export const progE = (k: Konteks, s: number, d: number, easing: (t: number) => number) =>
  interpolate(k.f, [s * k.fps, (s + d) * k.fps], [0, 1], { ...clamp, easing });

export const INOUT = Easing.inOut(Easing.cubic);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Detik sekarang. */
export const detik = (k: Konteks) => k.f / k.fps;

/** Properti animasi "menggambar" garis; p 0→1. */
export const gambar = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p });

/** Waktu kunci adegan dengan cadangan relatif ke mulai adegan (agar modul tetap jalan bila anchor tidak diisi). */
export const tk = (a: Adegan, nama: string, relatif: number) => a.t[nama] ?? a.mulai + relatif;

/** Drift kamera 2.5D: lapisan ber-kedalaman `d` (0 = jauh, 1 = dekat) bergeser lebih jauh → parallax.
 *  Gerak sinus pelan disengaja (gerak diam latar/kamera, bukan elemen UI). */
export const drift = (k: Konteks, d: number) => {
  const t = detik(k) - k.a.mulai;
  return { x: Math.sin(t * 0.45) * 14 * d, y: Math.cos(t * 0.35) * 8 * d };
};

/** Denyut ketukan 0..1 pada detik `t`: naik cepat (serangan 50 ms) di tiap ketukan lalu meluruh eksponensial.
 *  Ketukan ke-1 tiap bar (tiap 4) penuh, sisanya lebih lemah — grafis "bernapas" bersama musik tanpa berkedip. */
export const denyut = (t: number, titik: number[] | undefined, luruh = 0.22) => {
  if (!titik?.length) return 0;
  let lo = 0;
  let hi = titik.length - 1;
  let i = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (titik[m] <= t) {
      i = m;
      lo = m + 1;
    } else hi = m - 1;
  }
  if (i < 0) return 0;
  const dt = t - titik[i];
  const serang = 0.05;
  const kuat = i % 4 === 0 ? 1 : 0.55;
  return kuat * (dt < serang ? dt / serang : Math.exp(-(dt - serang) / luruh));
};

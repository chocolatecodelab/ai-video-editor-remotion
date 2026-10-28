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
  masuk?: "blur-zoom" | "match";
  keluar?: "blur-zoom" | "match";
  teks?: Record<string, string>;
};

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

// Kontrak props antara pipeline Python (render.py → remotion_jembatan.py) dan semua Composition.
// Python mengirim token GABUNGAN proyek (platform + gaya dari manifest), jadi ganti gaya = ganti tampilan
// tanpa mengubah kode di sini. Semua waktu di `elemen` sudah di-resolve Python (detik).

import { Easing, interpolate } from "remotion";

export type Tokens = {
  warna: Record<string, string | number>;
  font: Record<string, { family: string; weight: number }>;
  ukuran: Record<string, number>;
  spasi: Record<string, number>;
  radius: Record<string, number>;
  bayangan: { offset: [number, number]; blur: number };
  easing: Record<string, [number, number, number, number]>;
  gerak: Record<string, number | string>;
  [k: string]: unknown;
};

export type PropsDasar<E> = {
  W: number;
  H: number;
  fps: number;
  durasiFrame: number;
  skala: number; // px token → px output (1 pada 1080×1920)
  zona: [number, number, number, number]; // x0, y0, x1, y1 area aman (px output)
  tokens: Tokens;
  elemen: E & {
    posisi?: "atas" | "tengah" | "bawah";
    lebar?: number; // 0–1 dari lebar zona aman
    durasi_masuk: number;
    durasi_keluar: number;
    easing?: string;
    easing_keluar?: string;
    /** Jenis gerak masuk/keluar — sama dengan Animator Python (render_dasar.py); bawaan dari token gerak.*-default. */
    masuk?: JenisMasuk;
    keluar?: JenisKeluar;
  };
};

export type JenisMasuk = "fade" | "naik" | "turun" | "geser" | "pop" | "tidak";
export type JenisKeluar = "fade" | "naik" | "pop" | "tidak";

export const kurva = (t: Tokens, nama = "standar") => {
  const [a, b, c, d] = t.easing[nama] ?? t.easing.standar;
  return Easing.bezier(a, b, c, d);
};

/** Skala dari progres `p` (0–1, boleh lewat 1 untuk overshoot spring): perceptual-scale (skill remotion-markup, timing)
 *  agar membesar terasa merata — skala linear terlihat melambat makin besar ukurannya. */
export const skalaPersepsi = (p: number, dari: number, ke = 1) =>
  interpolate(p, [0, 1], [dari, ke], { output: "perceptual-scale" });

export const rgba = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

export const warna = (t: Tokens, nama: string) => String(t.warna[nama]);

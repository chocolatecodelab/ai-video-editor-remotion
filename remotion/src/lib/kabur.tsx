import React, { useId } from "react";

// Motion blur arah (K05.4) untuk gerak cepat di dalam komposisi. Overlay Remotion dirender ber-alpha lalu
// dikomposit Python, jadi blur sampel-waktu (CameraMotionBlur) tidak dipakai: ia menumpuk salinan semi-transparan
// (alpha jadi pudar, warna rusak). Di sini blur Gaussian searah gerak, sebesar perpindahan per frame dengan
// shutter 180° (jejak = ½ perpindahan; sigma ≈ jejak / 2,5). Gerak lambat (< ±1,5 px/frame) tidak di-blur.

const SIGMA_MAKS = 28;

/** Perpindahan per frame (px) → sigma Gaussian (px). */
export const sigmaGerak = (perpindahan: number) => {
  const s = (Math.abs(perpindahan) * 0.5) / 2.5;
  return s < 0.3 ? 0 : Math.min(SIGMA_MAKS, s);
};

/** Filter SVG blur arah. Pakai `filter={url}` di elemen SVG atau `style.filter` di elemen HTML (aktif = false → tanpa
 *  filter, tidak ada biaya render). `dx`/`dy` = perpindahan per frame pada sumbu x/y lokal elemen. */
export const useKaburGerak = (dx: number, dy: number) => {
  const id = `kabur${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sx = sigmaGerak(dx), sy = sigmaGerak(dy);
  const aktif = sx > 0 || sy > 0;
  const def = aktif ? (
    <filter id={id} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
    </filter>
  ) : null;
  return { aktif, url: aktif ? `url(#${id})` : undefined, def };
};

/** Definisi filter untuk dipakai elemen HTML (SVG kosong, tidak memengaruhi tata letak). */
export const DefKabur: React.FC<{ def: React.ReactNode }> = ({ def }) =>
  def ? (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      {def}
    </svg>
  ) : null;
